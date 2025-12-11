import { create } from 'zustand';
import { Hotel } from '@/lib/supabase';

export interface SearchFilters {
  city: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  budgetMin: number;
  budgetMax: number;
  segment: 'budget' | 'mid' | 'luxury' | 'all';
}

interface SearchState {
  filters: SearchFilters;
  results: Hotel[];
  loading: boolean;
  setFilters: (filters: Partial<SearchFilters>) => void;
  setResults: (results: Hotel[]) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

const getDefaultDates = () => {
  const checkIn = new Date();
  checkIn.setDate(checkIn.getDate() + 7);
  const checkOut = new Date(checkIn);
  checkOut.setDate(checkOut.getDate() + 2);
  
  return {
    checkIn: checkIn.toISOString().split('T')[0],
    checkOut: checkOut.toISOString().split('T')[0],
  };
};

const defaultDates = getDefaultDates();

const defaultFilters: SearchFilters = {
  city: '',
  checkIn: defaultDates.checkIn,
  checkOut: defaultDates.checkOut,
  guests: 2,
  budgetMin: 0,
  budgetMax: 50000,
  segment: 'all',
};

export const useSearchStore = create<SearchState>((set) => ({
  filters: defaultFilters,
  results: [],
  loading: false,
  
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),
  
  setResults: (results) => set({ results }),
  
  setLoading: (loading) => set({ loading }),
  
  reset: () =>
    set({
      filters: { ...defaultFilters, ...getDefaultDates() },
      results: [],
      loading: false,
    }),
}));
