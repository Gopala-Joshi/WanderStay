import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hotel } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchStore } from '@/stores/searchStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Calendar, Users, DollarSign } from 'lucide-react';
import { formatPrice, calculateNights, formatDate } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface BookingFormProps {
  hotel: Hotel;
}

export default function BookingForm({ hotel }: BookingFormProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { filters } = useSearchStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const nights = filters.checkIn && filters.checkOut ? calculateNights(filters.checkIn, filters.checkOut) : 0;
  const totalPrice = hotel.price_per_night * nights;

  const handleBooking = async () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to make a booking.',
      });
      navigate('/auth');
      return;
    }

    if (!filters.checkIn || !filters.checkOut) {
      toast({
        title: 'Missing dates',
        description: 'Please select check-in and check-out dates.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.from('bookings').insert({
        user_id: user.id,
        hotel_id: hotel.id,
        check_in: filters.checkIn,
        check_out: filters.checkOut,
        guests: filters.guests,
        final_price_per_night: hotel.price_per_night,
        total_price: totalPrice,
        status: 'confirmed',
      }).select().single();

      if (error) throw error;

      toast({
        title: 'Booking Confirmed! 🎉',
        description: `Your reservation at ${hotel.hotel_name} has been confirmed.`,
      });

      // Navigate to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error: any) {
      console.error('Booking error:', error);
      toast({
        title: 'Booking Failed',
        description: error.message || 'Failed to create booking. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-strong p-8 rounded-2xl">
      <h2 className="font-display text-2xl font-semibold mb-6">Book Your Stay</h2>

      <div className="space-y-6">
        {/* Check-in / Check-out */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">
              Check-in
            </Label>
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {filters.checkIn ? formatDate(filters.checkIn) : 'Select date'}
              </span>
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">
              Check-out
            </Label>
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {filters.checkOut ? formatDate(filters.checkOut) : 'Select date'}
              </span>
            </div>
          </div>
        </div>

        {/* Guests */}
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">
            Guests
          </Label>
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">{filters.guests} guest{filters.guests > 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Price Summary */}
        <div className="pt-6 border-t border-border/50 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {formatPrice(hotel.price_per_night)} × {nights} night{nights > 1 ? 's' : ''}
            </span>
            <span className="font-medium">{formatPrice(totalPrice)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold pt-3 border-t border-border/30">
            <span>Total</span>
            <span className="text-2xl text-primary-600">{formatPrice(totalPrice)}</span>
          </div>
        </div>

        {/* Book Button */}
        <Button
          onClick={handleBooking}
          disabled={loading || !filters.checkIn || !filters.checkOut || nights === 0}
          className="w-full btn-premium"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Booking...
            </>
          ) : (
            <>
              <DollarSign className="w-5 h-5 mr-2" />
              Confirm Booking
            </>
          )}
        </Button>

        {!user && (
          <p className="text-xs text-center text-muted-foreground">
            You'll be redirected to sign in before booking
          </p>
        )}
      </div>
    </div>
  );
}
