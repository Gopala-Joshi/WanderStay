import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Booking } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, MapPin, Users, DollarSign, Star } from 'lucide-react';
import { formatPrice, formatDate, getCityImageUrl } from '@/lib/utils';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      fetchBookings();
    }
  }, [user, authLoading, navigate]);

  const fetchBookings = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        hotel:hotels_india(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookings:', error);
    } else {
      setBookings(data || []);
    }
    setLoading(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  const upcomingBookings = bookings.filter(
    (b) => new Date(b.check_in) >= new Date() && b.status === 'confirmed'
  );
  const pastBookings = bookings.filter(
    (b) => new Date(b.check_out) < new Date() || b.status !== 'confirmed'
  );

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-display text-display-md mb-2">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-xl text-muted-foreground">
            Manage your bookings and explore new destinations
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-500" />
                Upcoming Trips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-primary-600">
                {upcomingBookings.length}
              </p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-accent-500" />
                Total Spent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-accent-600">
                {formatPrice(bookings.reduce((sum, b) => sum + b.total_price, 0))}
              </p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-500" />
                Cities Visited
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-green-600">
                {new Set(bookings.map((b) => b.hotel?.city)).size}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Bookings */}
        {upcomingBookings.length > 0 && (
          <div className="mb-12">
            <h2 className="font-display text-3xl font-semibold mb-6">
              Upcoming Trips
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {upcomingBookings.map((booking) => (
                <Card key={booking.id} className="glass overflow-hidden card-hover">
                  <div
                    className="h-40 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${getCityImageUrl(booking.hotel?.city || '')})`,
                    }}
                  />
                  <CardContent className="p-6">
                    <h3 className="font-display text-xl font-semibold mb-2">
                      {booking.hotel?.hotel_name}
                    </h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        {booking.hotel?.city}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {formatDate(booking.check_in)} - {formatDate(booking.check_out)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        {booking.guests} guest{booking.guests > 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <Badge variant="default" className="bg-green-500">
                        {booking.status}
                      </Badge>
                      <p className="text-xl font-bold text-primary-600">
                        {formatPrice(booking.total_price)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Past Bookings */}
        {pastBookings.length > 0 && (
          <div>
            <h2 className="font-display text-3xl font-semibold mb-6">
              Past Trips
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastBookings.map((booking) => (
                <Card key={booking.id} className="glass opacity-80">
                  <CardContent className="p-6">
                    <h3 className="font-display text-lg font-semibold mb-2">
                      {booking.hotel?.hotel_name}
                    </h3>
                    <div className="space-y-1.5 mb-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5" />
                        {booking.hotel?.city}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(booking.check_in)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-border/50">
                      <Badge variant="secondary">{booking.status}</Badge>
                      <p className="font-semibold">{formatPrice(booking.total_price)}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {bookings.length === 0 && (
          <div className="glass p-12 rounded-2xl text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-display text-2xl mb-2">No bookings yet</h3>
            <p className="text-muted-foreground mb-6">
              Start exploring and book your first hotel with AI-powered insights
            </p>
            <Button onClick={() => navigate('/search')} className="btn-premium">
              Search Hotels
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
