import { useState } from 'react';
import { Hotel } from '@/lib/supabase';
import { useSearchStore } from '@/stores/searchStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import { formatPrice, calculateNights } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { FunctionsHttpError } from '@supabase/supabase-js';

interface PriceInsightPanelProps {
  hotel: Hotel;
}

interface PredictionResult {
  base_city_prices: {
    min: number;
    avg: number;
    max: number;
  };
  adjusted_prices: {
    min: number;
    avg: number;
    max: number;
    multiplier: number;
  };
  ai_recommendation: {
    recommended_min_price: number;
    recommended_max_price: number;
    fairness_label: 'cheap' | 'fair' | 'expensive';
    confidence_score: number;
    explanation: string;
  };
  demand_context: {
    is_peak_month: boolean;
    event_active: boolean;
    event_name: string | null;
    demand_multiplier: number;
  };
}

export default function PriceInsightPanel({ hotel }: PriceInsightPanelProps) {
  const { filters } = useSearchStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [lastRequestTime, setLastRequestTime] = useState<number>(0);
  const DEBOUNCE_MS = 2000; // ✅ Prevent spam clicking

  const handleGetPrediction = async () => {
    if (!filters.checkIn || !filters.checkOut) {
      toast({
        title: 'Missing dates',
        description: 'Please select check-in and check-out dates from the search.',
        variant: 'destructive',
      });
      return;
    }

    // ✅ DEBOUNCE CHECK
    const now = Date.now();
    if (now - lastRequestTime < DEBOUNCE_MS) {
      toast({
        title: 'Please wait',
        description: 'Please wait a moment before requesting another prediction.',
        variant: 'destructive',
      });
      return;
    }
    setLastRequestTime(now);

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('predict-price', {
        body: {
          hotel_id: hotel.id,
          city: hotel.city,
          check_in: filters.checkIn,
          check_out: filters.checkOut,
          guests: filters.guests,
          budget_min: filters.budgetMin,
          budget_max: filters.budgetMax,
        },
      });

      if (error) {
        let errorMessage = error.message;
        let isRateLimit = false;
        
        if (error instanceof FunctionsHttpError) {
          try {
            const statusCode = error.context?.status ?? 500;
            const textContent = await error.context?.text();
            
            // ✅ Parse error response
            try {
              const errorJson = JSON.parse(textContent);
              errorMessage = errorJson.error || errorMessage;
              isRateLimit = statusCode === 429 || errorJson.code === 429;
            } catch {
              errorMessage = textContent || error.message || 'Unknown error';
              isRateLimit = statusCode === 429;
            }
          } catch {
            errorMessage = error.message || 'Failed to read response';
          }
        }
        
        // ✅ FRIENDLY 429 HANDLING
        if (isRateLimit) {
          throw new Error('AI_BUSY: Our AI service is currently busy. Please try again in 1-2 minutes.');
        }
        
        throw new Error(errorMessage);
      }

      setPrediction(data);
      
      // ✅ Show cache status
      toast({
        title: data.cached ? 'Cached Insights Retrieved ⚡' : 'Smart Insights Generated ✨',
        description: data.cached 
          ? 'Using previously calculated insights (refreshes every 24 hours).'
          : 'Fresh price prediction completed successfully.',
      });
    } catch (error: any) {
      console.error('Prediction error:', error);
      
      // ✅ FRIENDLY ERROR MESSAGES
      let title = 'Prediction Failed';
      let description = error.message || 'Failed to generate price insights. Please try again.';
      
      if (error.message.startsWith('AI_BUSY:')) {
        title = '⏳ AI Service Busy';
        description = error.message.replace('AI_BUSY: ', '');
      }
      
      toast({
        title,
        description,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getFairnessColor = (label: string) => {
    switch (label) {
      case 'cheap':
        return 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400 border-green-300 dark:border-green-700';
      case 'fair':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700';
      case 'expensive':
        return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 border-red-300 dark:border-red-700';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const nights = filters.checkIn && filters.checkOut ? calculateNights(filters.checkIn, filters.checkOut) : 0;

  return (
    <div className="glass p-8 rounded-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/30">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-semibold">Smart Price Insights</h2>
          <p className="text-sm text-muted-foreground">
            Demand-aware pricing analysis
          </p>
        </div>
      </div>

      {!prediction ? (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Get intelligent price recommendations based on peak seasons, local events, and demand patterns. Our system analyzes market data to provide fair pricing guidance.
          </p>
          <Button
            onClick={handleGetPrediction}
            disabled={loading || !filters.checkIn || !filters.checkOut}
            className="w-full btn-premium"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyzing Market Data...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Get Smart Price Insights
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Demand Indicator */}
          <div className="bg-primary-50 dark:bg-primary-950 p-4 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary-600" />
                <span className="font-semibold">Demand Analysis</span>
              </div>
              <Badge variant="outline" className="font-semibold">
                +{Math.round((prediction.demand_context.demand_multiplier - 1) * 100)}% adjustment
              </Badge>
            </div>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${prediction.demand_context.is_peak_month ? 'bg-orange-500' : 'bg-gray-300'}`} />
                <span className={prediction.demand_context.is_peak_month ? 'font-medium' : 'text-muted-foreground'}>
                  Peak Season
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${prediction.demand_context.event_active ? 'bg-purple-500' : 'bg-gray-300'}`} />
                <span className={prediction.demand_context.event_active ? 'font-medium' : 'text-muted-foreground'}>
                  Local Event
                </span>
              </div>
            </div>
            {prediction.demand_context.event_name && (
              <div className="mt-3 pt-3 border-t border-primary-200 dark:border-primary-800">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-primary-600" />
                  <span className="font-medium">{prediction.demand_context.event_name}</span>
                </div>
              </div>
            )}
          </div>

          {/* Price Layers */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">PRICING BREAKDOWN</h3>

            {/* Layer 1: Base City Prices */}
            <div className="glass-subtle p-4 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Base City Prices</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground/70">Min</span>
                <span className="font-semibold">{formatPrice(prediction.base_city_prices.min)}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-foreground/70">Avg</span>
                <span className="font-semibold">{formatPrice(prediction.base_city_prices.avg)}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-foreground/70">Max</span>
                <span className="font-semibold">{formatPrice(prediction.base_city_prices.max)}</span>
              </div>
            </div>

            {/* Layer 2: Adjusted for Demand */}
            <div className="glass-subtle p-4 rounded-xl border-2 border-primary-200 dark:border-primary-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Adjusted for Demand</span>
                <Badge variant="secondary" className="text-xs">
                  {Math.round((prediction.demand_context.demand_multiplier - 1) * 100)}% higher
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-primary-600">
                  {formatPrice(prediction.adjusted_prices.min)}
                </span>
                <span className="text-muted-foreground">–</span>
                <span className="text-lg font-bold text-primary-600">
                  {formatPrice(prediction.adjusted_prices.max)}
                </span>
              </div>
            </div>

            {/* Layer 3: AI Recommended */}
            <div className="bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-950 dark:to-accent-950 p-6 rounded-xl border-2 border-primary-300 dark:border-primary-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary-600" />
                  <h3 className="font-semibold">AI Recommended Range</h3>
                </div>
                <Badge className={getFairnessColor(prediction.ai_recommendation.fairness_label)}>
                  {prediction.ai_recommendation.fairness_label.toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-end gap-4 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Per Night</p>
                  <p className="text-3xl font-bold text-primary-600">
                    {formatPrice(prediction.ai_recommendation.recommended_min_price)}
                    <span className="text-xl mx-2">–</span>
                    {formatPrice(prediction.ai_recommendation.recommended_max_price)}
                  </p>
                </div>
              </div>
              {nights > 0 && (
                <p className="text-sm text-muted-foreground mb-4">
                  Total for {nights} nights: {formatPrice(prediction.ai_recommendation.recommended_min_price * nights)} – {formatPrice(prediction.ai_recommendation.recommended_max_price * nights)}
                </p>
              )}
              
              {/* Confidence Score */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">Confidence</span>
                  <span className="text-xs font-semibold">
                    {Math.round(prediction.ai_recommendation.confidence_score * 100)}%
                  </span>
                </div>
                <Progress value={prediction.ai_recommendation.confidence_score * 100} className="h-2" />
              </div>

              {/* Explanation */}
              <div className="bg-white/50 dark:bg-black/20 p-3 rounded-lg">
                <p className="text-sm text-foreground/90">
                  {prediction.ai_recommendation.explanation}
                </p>
              </div>
            </div>
          </div>

          {/* Visual Comparison */}
          <div className="pt-6 border-t border-border/50">
            <h3 className="font-semibold mb-4 text-sm">Price Range Comparison</h3>
            <div className="space-y-3">
              {/* Base Price Bar */}
              <div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Base Range</span>
                  <span>{formatPrice(prediction.base_city_prices.min)} – {formatPrice(prediction.base_city_prices.max)}</span>
                </div>
                <div className="h-8 bg-muted rounded-lg relative overflow-hidden">
                  <div
                    className="absolute h-full bg-muted-foreground/30"
                    style={{
                      width: '100%',
                    }}
                  />
                </div>
              </div>

              {/* Adjusted Price Bar */}
              <div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Demand Adjusted</span>
                  <span>{formatPrice(prediction.adjusted_prices.min)} – {formatPrice(prediction.adjusted_prices.max)}</span>
                </div>
                <div className="h-8 bg-muted rounded-lg relative overflow-hidden">
                  <div
                    className="absolute h-full bg-primary-400/50"
                    style={{
                      width: '100%',
                    }}
                  />
                </div>
              </div>

              {/* AI Recommended Bar */}
              <div>
                <div className="flex items-center justify-between text-xs font-medium mb-1">
                  <span>AI Recommended</span>
                  <span className="text-primary-600">
                    {formatPrice(prediction.ai_recommendation.recommended_min_price)} – {formatPrice(prediction.ai_recommendation.recommended_max_price)}
                  </span>
                </div>
                <div className="h-8 bg-muted rounded-lg relative overflow-hidden">
                  <div
                    className="absolute h-full bg-gradient-to-r from-primary-500 to-primary-600 shadow-lg"
                    style={{
                      width: '100%',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Refresh Button */}
          <Button
            onClick={handleGetPrediction}
            variant="outline"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Refreshing...
              </>
            ) : (
              'Refresh Insights'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
