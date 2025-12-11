import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Hotel, MapPin, TrendingUp, Users } from 'lucide-react';

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalHotels: 0,
    totalCities: 0,
    totalBookings: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.profile?.role !== 'admin') {
        navigate('/');
        return;
      }
      fetchStats();
    }
  }, [user, authLoading, navigate]);

  const fetchStats = async () => {
    setLoading(true);

    const [hotelsRes, citiesRes, bookingsRes, usersRes] = await Promise.all([
      supabase.from('hotels_india').select('id', { count: 'exact', head: true }),
      supabase.from('hotels_india').select('city'),
      supabase.from('bookings').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
    ]);

    const uniqueCities = citiesRes.data
      ? new Set(citiesRes.data.map((h) => h.city)).size
      : 0;

    setStats({
      totalHotels: hotelsRes.count || 0,
      totalCities: uniqueCities,
      totalBookings: bookingsRes.count || 0,
      totalUsers: usersRes.count || 0,
    });

    setLoading(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="font-display text-display-md mb-2">Admin Dashboard</h1>
          <p className="text-xl text-muted-foreground">
            Manage hotels, cities, and bookings
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hotel className="w-5 h-5 text-primary-500" />
                Total Hotels
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-primary-600">
                {stats.totalHotels}
              </p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-accent-500" />
                Cities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-accent-600">
                {stats.totalCities}
              </p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-green-600">
                {stats.totalBookings}
              </p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-blue-600">
                {stats.totalUsers}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Use the Supabase Dashboard to manage hotels, city demand data, and user profiles.
            </p>
            <div className="flex gap-4">
              <Button
                onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
                className="btn-premium"
              >
                Open Supabase Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
