import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, Hotel } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchStore } from '@/stores/searchStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Star, MapPin, ArrowLeft } from 'lucide-react';
import { getCityImageUrl, formatPrice, formatRating, getRatingColor } from '@/lib/utils';
import PriceInsightPanel from '@/components/features/PriceInsightPanel';
import BookingForm from '@/components/features/BookingForm';

export default function HotelDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { filters } = useSearchStore();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHotel() {
      if (!id) return;

      setLoading(true);
      const { data, error } = await supabase
        .from('hotels_india')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching hotel:', error);
      } else {
        setHotel(data);
      }
      setLoading(false);
    }

    fetchHotel();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display text-2xl mb-4">Hotel not found</h2>
          <Button onClick={() => navigate('/search')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Search
          </Button>
        </div>
      </div>
    );
  }

  const features = [
    hotel.feature_1,
    hotel.feature_2,
    hotel.feature_3,
    hotel.feature_4,
    hotel.feature_5,
  ].filter(Boolean);

  return (
    <div className="min-h-screen">
      {/* Hero Image */}
      <div
        className="relative h-[500px]"
        style={{
          backgroundImage: `url(${getCityImageUrl(hotel.city)})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark gradient overlay for text visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/60 z-10" />

        <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-8">
            <Button
              variant="outline"
              onClick={() => navigate('/search')}
              className="bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Search
            </Button>
          </div>

          <div className="absolute bottom-8 left-4 right-4 sm:left-6 sm:right-6 lg:left-8 lg:right-8">
            <div className="bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl border border-white/20 p-8 rounded-2xl max-w-2xl shadow-2xl">
              <h1 className="font-display text-display-sm text-white mb-4 drop-shadow-lg">
                {hotel.hotel_name}
              </h1>
              <div className="flex items-center gap-4 text-white mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="w-5 h-5" />
                  <span className="font-medium">{hotel.city}{hotel.state ? `, ${hotel.state}` : ''}</span>
                </div>
                {hotel.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold">{formatRating(hotel.rating)}</span>
                    {hotel.number_of_reviews && (
                      <span className="text-sm text-white/80">
                        ({hotel.number_of_reviews} reviews)
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {features.map((feature, index) => (
                  <Badge key={index} variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Booking Form (Priority) */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="sticky top-24">
              <BookingForm hotel={hotel} />
            </div>
          </div>

          {/* Right Column - Hotel Details */}
          <div className="lg:col-span-2 space-y-8 order-2 lg:order-1">
            {/* Base Price */}
            <div className="glass p-8 rounded-2xl">
              <h2 className="font-display text-2xl font-semibold mb-4">Base Pricing</h2>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-primary-600">
                  {formatPrice(hotel.price_per_night)}
                </span>
                <span className="text-muted-foreground mb-1">per night</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                This is the base price. Use AI Price Insights to get demand-adjusted recommendations.
              </p>
            </div>

            {/* Smart Price Insight Panel */}
            <PriceInsightPanel hotel={hotel} />

            {/* Amenities */}
            {hotel.amenities && (
              <div className="glass p-8 rounded-2xl">
                <h2 className="font-display text-2xl font-semibold mb-4">Amenities</h2>
                <p className="text-muted-foreground">{hotel.amenities}</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
