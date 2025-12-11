import { useState, useEffect } from 'react';
import { useSearchStore } from '@/stores/searchStore';
import { supabase, Hotel } from '@/lib/supabase';
import SearchCard from '@/components/features/SearchCard';
import HotelCard from '@/components/features/HotelCard';
import { Loader2 } from 'lucide-react';
import { getCityImageUrl } from '@/lib/utils';

export default function SearchPage() {
  const { filters, results, loading, setResults, setLoading } = useSearchStore();
  const [cities, setCities] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Fetch available cities
  useEffect(() => {
    async function fetchCities() {
      const { data } = await supabase
        .from('hotels_india')
        .select('city')
        .order('city');

      if (data) {
        const uniqueCities = [...new Set(data.map((h) => h.city))].sort();
        setCities(uniqueCities);
      }
    }
    fetchCities();
  }, []);

  const handleSearch = async () => {
    if (!filters.city) return;

    setLoading(true);
    setHasSearched(true);

    try {
      let query = supabase
        .from('hotels_india')
        .select('*')
        .eq('city', filters.city);

      // Apply budget filter
      if (filters.budgetMin > 0) {
        query = query.gte('price_per_night', filters.budgetMin);
      }
      if (filters.budgetMax < 50000) {
        query = query.lte('price_per_night', filters.budgetMax);
      }

      // Apply segment filter
      if (filters.segment !== 'all') {
        if (filters.segment === 'budget') {
          query = query.lte('price_per_night', 3000);
        } else if (filters.segment === 'mid') {
          query = query.gte('price_per_night', 3000).lte('price_per_night', 10000);
        } else if (filters.segment === 'luxury') {
          query = query.gte('price_per_night', 10000);
        }
      }

      // Order by rating
      query = query.order('rating', { ascending: false, nullsFirst: false });

      const { data, error } = await query;

      if (error) throw error;

      setResults(data || []);
    } catch (error: any) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section with Search */}
        <div
          className="relative h-[400px] rounded-3xl overflow-hidden mb-12 gradient-overlay-strong"
          style={{
            backgroundImage: filters.city
              ? `url(${getCityImageUrl(filters.city)})`
              : 'linear-gradient(135deg, #2AA6A0 0%, #1A6460 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="relative z-20 h-full flex flex-col items-center justify-center px-4">
            <h1 className="font-display text-display-md text-white mb-2 text-center">
              Find Your Perfect Stay
            </h1>
            <p className="text-xl text-white/90 mb-8 text-center">
              {filters.city || 'Search hotels across India with AI-powered insights'}
            </p>

            <div className="w-full max-w-4xl">
              <SearchCard cities={cities} onSearch={handleSearch} />
            </div>
          </div>
        </div>

        {/* Results Section */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : hasSearched ? (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display text-3xl font-semibold">
                  {results.length > 0
                    ? `${results.length} Hotels in ${filters.city}`
                    : 'No Hotels Found'}
                </h2>
                {results.length > 0 && (
                  <p className="text-muted-foreground mt-2">
                    Showing results for {filters.checkIn} to {filters.checkOut}
                  </p>
                )}
              </div>
            </div>

            {results.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((hotel) => (
                  <HotelCard key={hotel.id} hotel={hotel} />
                ))}
              </div>
            ) : (
              <div className="glass p-12 rounded-2xl text-center">
                <p className="text-xl text-muted-foreground">
                  No hotels found matching your criteria. Try adjusting your filters.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="glass p-12 rounded-2xl text-center">
            <p className="text-xl text-muted-foreground">
              Select a city and dates to start searching for hotels
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
