import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Types
export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: 'user' | 'admin';
  preferred_city: string | null;
  preferred_budget_min: number | null;
  preferred_budget_max: number | null;
  created_at: string;
}

export interface Hotel {
  id: number;
  hotel_name: string;
  city: string;
  state: string | null;
  rating: number | null;
  number_of_reviews: number | null;
  feature_1: string | null;
  feature_2: string | null;
  feature_3: string | null;
  feature_4: string | null;
  feature_5: string | null;
  price_per_night: number;
  latitude: number | null;
  longitude: number | null;
  amenities: string | null;
  source_dataset: string | null;
  created_at: string;
}

export interface CityDemand {
  id: number;
  city: string;
  peak_months: string | null;
  events: string | null;
  created_at: string;
}

export interface Booking {
  id: number;
  user_id: string;
  hotel_id: number;
  check_in: string;
  check_out: string;
  guests: number;
  final_price_per_night: number;
  total_price: number;
  ai_suggestion: any;
  photo_url: string | null;
  status: 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
  hotel?: Hotel;
}

export interface PricePrediction {
  id: number;
  user_id: string | null;
  hotel_id: number | null;
  city: string;
  check_in: string;
  check_out: string;
  nights: number;
  calculated_min: number | null;
  calculated_max: number | null;
  gemini_response: {
    recommended_min_price: number;
    recommended_max_price: number;
    fairness_label: 'cheap' | 'fair' | 'expensive';
    confidence_score: number;
    short_explanation: string;
  } | null;
  created_at: string;
}

export interface CityPriceStats {
  city: string;
  min_price: number;
  avg_price: number;
  max_price: number;
  hotel_count: number;
}
