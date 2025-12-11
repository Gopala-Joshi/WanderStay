import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ✅ Use stable model instead of experimental
const GEMINI_MODEL = 'gemini-2.5-flash';
const CACHE_DURATION_HOURS = 24;

interface PriceInsightPayload {
  hotel: {
    hotel_name: string;
    city: string;
    rating: number;
    reviews: number;
  };
  base_city_prices: {
    min_price: number;
    avg_price: number;
    max_price: number;
  };
  hotel_base_price: {
    price_per_night: number;
  };
  stay_details: {
    check_in: string;
    check_out: string;
    nights: number;
    guests: number;
  };
  demand_context: {
    is_peak_month: boolean;
    peak_months: string;
    event_active: boolean;
    event_name: string | null;
  };
  user_budget: {
    min: number | null;
    max: number | null;
  };
  calculated_range: {
    min: number;
    max: number;
  };
}

interface PriceInsightResponse {
  recommended_min_price: number;
  recommended_max_price: number;
  fairness_label: 'cheap' | 'fair' | 'expensive';
  confidence_score: number;
  explanation: string;
}

/**
 * ✅ SINGLE HELPER FUNCTION FOR GEMINI
 * Handles all Gemini API communication with proper error handling
 */
async function getPriceInsightFromGemini(
  payload: PriceInsightPayload,
  apiKey: string
): Promise<PriceInsightResponse> {
  const prompt = `You are a hotel pricing assistant for WanderStay. Analyze the data below and provide ONLY a JSON response.

INPUT DATA:
${JSON.stringify(payload, null, 2)}

INSTRUCTIONS:
- Base your recommendation on the calculated_range (which already includes demand adjustments)
- If is_peak_month is true or event_active is true, the calculated_range already reflects this
- Use hotel rating and reviews to adjust confidence
- Consider user_budget if provided
- Fairness label rules:
  * "cheap": recommended < city avg_price * 0.8
  * "fair": recommended between city avg_price * 0.8 and * 1.3
  * "expensive": recommended > city avg_price * 1.3
- Confidence should reflect data quality (higher if more reviews, peak context is clear)
- Explanation MUST mention:
  * Peak season status if applicable
  * Active events if any
  * Whether price is above/below city average

RETURN ONLY THIS EXACT JSON (no markdown, no extra text):
{
  "recommended_min_price": <number in INR>,
  "recommended_max_price": <number in INR>,
  "fairness_label": "cheap" | "fair" | "expensive",
  "confidence_score": <0.0 to 1.0>,
  "explanation": "<1-2 sentences>"
}`;

  const geminiPayload = {
    contents: [
      {
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 500,
      responseMimeType: 'application/json', // ✅ Force JSON response
    },
  };

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(geminiPayload),
    }
  );

  // ✅ IMPROVED ERROR HANDLING
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API Error Details:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText,
    });

    // ✅ Handle 429 specifically
    if (response.status === 429) {
      throw new Error(
        'RATE_LIMIT: Our AI service is currently busy. Please wait a minute and try again.'
      );
    }

    // ✅ Handle other errors
    throw new Error(`Gemini API returned ${response.status}: ${errorText.substring(0, 200)}`);
  }

  const data = await response.json();
  console.log('Gemini raw response:', JSON.stringify(data, null, 2));

  // ✅ ROBUST JSON PARSING
  try {
    let aiResponse: PriceInsightResponse;
    
    // Try direct JSON parse first (with responseMimeType, this should work)
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) {
      throw new Error('No content in Gemini response');
    }

    // Try parsing as JSON directly
    try {
      aiResponse = JSON.parse(content);
    } catch {
      // Fallback: extract JSON from markdown
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      aiResponse = JSON.parse(jsonMatch[0]);
    }

    // ✅ VALIDATE RESPONSE STRUCTURE
    if (
      typeof aiResponse.recommended_min_price !== 'number' ||
      typeof aiResponse.recommended_max_price !== 'number' ||
      !['cheap', 'fair', 'expensive'].includes(aiResponse.fairness_label) ||
      typeof aiResponse.confidence_score !== 'number' ||
      aiResponse.confidence_score < 0 ||
      aiResponse.confidence_score > 1 ||
      !aiResponse.explanation
    ) {
      throw new Error('Invalid response structure');
    }

    return aiResponse;
  } catch (parseError) {
    console.error('Failed to parse Gemini response:', parseError);
    
    // ✅ INTELLIGENT FALLBACK
    // Use calculated range as recommendation with conservative confidence
    const { calculated_range, base_city_prices, hotel_base_price } = payload;
    
    let fairness: 'cheap' | 'fair' | 'expensive' = 'fair';
    const avgRecommended = (calculated_range.min + calculated_range.max) / 2;
    const cityAvg = base_city_prices.avg_price;
    
    if (avgRecommended < cityAvg * 0.8) fairness = 'cheap';
    else if (avgRecommended > cityAvg * 1.3) fairness = 'expensive';

    return {
      recommended_min_price: Math.round(calculated_range.min),
      recommended_max_price: Math.round(calculated_range.max),
      fairness_label: fairness,
      confidence_score: 0.6,
      explanation: `Price recommendation based on demand analysis. ${
        payload.demand_context.is_peak_month ? 'Peak season pricing applies. ' : ''
      }${
        payload.demand_context.event_active
          ? `${payload.demand_context.event_name} is happening during your dates. `
          : ''
      }This is a calculated estimate.`,
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { hotel_id, city, check_in, check_out, guests, budget_min, budget_max } = await req.json();

    const authHeader = req.headers.get('Authorization')!;
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // ✅ CHECK CACHE FIRST
    const cacheExpiryTime = new Date();
    cacheExpiryTime.setHours(cacheExpiryTime.getHours() - CACHE_DURATION_HOURS);

    const { data: cachedPrediction } = await supabaseClient
      .from('price_predictions')
      .select('*')
      .eq('hotel_id', hotel_id)
      .eq('city', city)
      .eq('check_in', check_in)
      .eq('check_out', check_out)
      .gte('created_at', cacheExpiryTime.toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // ✅ RETURN CACHED RESULT IF FOUND
    if (cachedPrediction) {
      console.log('✅ Using cached prediction from:', cachedPrediction.created_at);
      
      const nights = cachedPrediction.nights;
      const demandMultiplier = cachedPrediction.gemini_response?.demand_multiplier || 1.0;

      return new Response(
        JSON.stringify({
          cached: true,
          base_city_prices: {
            min: Math.round(cachedPrediction.calculated_min / demandMultiplier),
            avg: Math.round(((cachedPrediction.calculated_min + cachedPrediction.calculated_max) / 2) / demandMultiplier),
            max: Math.round(cachedPrediction.calculated_max / demandMultiplier),
          },
          adjusted_prices: {
            min: cachedPrediction.calculated_min,
            avg: Math.round((cachedPrediction.calculated_min + cachedPrediction.calculated_max) / 2),
            max: cachedPrediction.calculated_max,
            multiplier: demandMultiplier,
          },
          ai_recommendation: cachedPrediction.gemini_response,
          demand_context: {
            is_peak_month: cachedPrediction.gemini_response?.is_peak_month || false,
            event_active: cachedPrediction.gemini_response?.event_active || false,
            event_name: cachedPrediction.gemini_response?.event_name || null,
            demand_multiplier: demandMultiplier,
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ✅ NO CACHE - FETCH FRESH DATA
    console.log('🔄 No cache found, calling Gemini...');

    // Fetch hotel data
    const { data: hotel } = await supabaseClient
      .from('hotels_india')
      .select('*')
      .eq('id', hotel_id)
      .single();

    // Fetch city stats
    const { data: cityStats } = await supabaseClient
      .from('city_price_stats')
      .select('*')
      .eq('city', city)
      .single();

    // Fetch city demand
    const { data: cityDemand } = await supabaseClient
      .from('city_demand')
      .select('*')
      .eq('city', city)
      .maybeSingle();

    // Calculate demand context
    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    const checkInMonth = checkInDate.getMonth() + 1;

    const peakMonths = cityDemand?.peak_months?.split(',').map((m: string) => parseInt(m.trim())) || [];
    const isPeakMonth = peakMonths.includes(checkInMonth);

    // Parse events
    let eventActive = false;
    let eventName: string | null = null;
    if (cityDemand?.events) {
      const eventParts = cityDemand.events.split(';');
      for (const eventStr of eventParts) {
        const match = eventStr.match(/(.+?)\s*\((\d{4}-\d{2}-\d{2})–(\d{4}-\d{2}-\d{2})\)/);
        if (match) {
          const [, name, start, end] = match;
          const eventStart = new Date(start);
          const eventEnd = new Date(end);
          if (checkInDate >= eventStart && checkInDate <= eventEnd) {
            eventActive = true;
            eventName = name.trim();
            break;
          }
        }
      }
    }

    // ✅ APPLY DEMAND ADJUSTMENT FORMULA
    let demandMultiplier = 1.0;
    if (isPeakMonth) demandMultiplier += 0.20; // +20%
    if (eventActive) demandMultiplier += 0.30; // +30%

    // Base city prices
    const baseCityMin = cityStats?.min_price || hotel.price_per_night * 0.8;
    const baseCityAvg = cityStats?.avg_price || hotel.price_per_night;
    const baseCityMax = cityStats?.max_price || hotel.price_per_night * 1.5;

    // Adjusted prices with demand multiplier
    const adjustedMin = Math.round(baseCityMin * demandMultiplier);
    const adjustedAvg = Math.round(baseCityAvg * demandMultiplier);
    const adjustedMax = Math.round(baseCityMax * demandMultiplier);

    // ✅ BUILD PAYLOAD FOR GEMINI
    const payload: PriceInsightPayload = {
      hotel: {
        hotel_name: hotel.hotel_name,
        city: hotel.city,
        rating: hotel.rating || 0,
        reviews: hotel.number_of_reviews || 0,
      },
      base_city_prices: {
        min_price: baseCityMin,
        avg_price: baseCityAvg,
        max_price: baseCityMax,
      },
      hotel_base_price: {
        price_per_night: hotel.price_per_night,
      },
      stay_details: {
        check_in,
        check_out,
        nights,
        guests,
      },
      demand_context: {
        is_peak_month: isPeakMonth,
        peak_months: cityDemand?.peak_months || '',
        event_active: eventActive,
        event_name: eventName,
      },
      user_budget: {
        min: budget_min || null,
        max: budget_max || null,
      },
      calculated_range: {
        min: adjustedMin,
        max: adjustedMax,
      },
    };

    // ✅ CALL GEMINI (ONCE)
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    const aiRecommendation = await getPriceInsightFromGemini(payload, geminiApiKey);

    // ✅ STORE PREDICTION WITH CONTEXT
    await supabaseClient.from('price_predictions').insert({
      hotel_id,
      city,
      check_in,
      check_out,
      nights,
      calculated_min: adjustedMin,
      calculated_max: adjustedMax,
      gemini_response: {
        ...aiRecommendation,
        is_peak_month: isPeakMonth,
        event_active: eventActive,
        event_name: eventName,
        demand_multiplier: demandMultiplier,
      },
    });

    // ✅ RETURN ALL THREE PRICE LAYERS
    return new Response(
      JSON.stringify({
        cached: false,
        base_city_prices: {
          min: baseCityMin,
          avg: baseCityAvg,
          max: baseCityMax,
        },
        adjusted_prices: {
          min: adjustedMin,
          avg: adjustedAvg,
          max: adjustedMax,
          multiplier: demandMultiplier,
        },
        ai_recommendation: aiRecommendation,
        demand_context: {
          is_peak_month: isPeakMonth,
          event_active: eventActive,
          event_name: eventName,
          demand_multiplier: demandMultiplier,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error:', error);
    
    // ✅ FRIENDLY ERROR MESSAGES
    let errorMessage = error.message;
    let statusCode = 500;

    if (error.message.startsWith('RATE_LIMIT:')) {
      errorMessage = error.message.replace('RATE_LIMIT: ', '');
      statusCode = 429;
    }

    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        code: statusCode,
        timestamp: new Date().toISOString(),
      }), 
      {
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
