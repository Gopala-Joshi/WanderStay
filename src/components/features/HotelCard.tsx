import { Link } from 'react-router-dom';
import { Hotel } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, TrendingUp, Wifi, ParkingCircle } from 'lucide-react';
import { formatPrice, formatRating, getRatingColor, getCityImageUrl } from '@/lib/utils';

interface HotelCardProps {
  hotel: Hotel;
}

export default function HotelCard({ hotel }: HotelCardProps) {
  const features = [
    hotel.feature_1,
    hotel.feature_2,
    hotel.feature_3,
    hotel.feature_4,
    hotel.feature_5,
  ].filter(Boolean);

  // Check for common amenities
  const hasWifi = features.some(f => f?.toLowerCase().includes('wi-fi'));
  const hasParking = features.some(f => f?.toLowerCase().includes('parking'));

  return (
    <Link to={`/hotel/${hotel.id}`}>
      <Card className="glass overflow-hidden card-hover group cursor-pointer">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={getCityImageUrl(hotel.city)}
            alt={hotel.hotel_name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Rating Badge */}
          {hotel.rating && (
            <div className="absolute top-3 right-3 glass-strong px-3 py-1.5 rounded-full flex items-center gap-1">
              <Star className={`w-4 h-4 ${getRatingColor(hotel.rating)} fill-current`} />
              <span className="font-semibold text-sm">{formatRating(hotel.rating)}</span>
            </div>
          )}

          {/* Smart Pricing Badge */}
          <div className="absolute top-3 left-3 bg-primary-500 text-white px-3 py-1.5 rounded-full flex items-center gap-1 text-xs font-medium">
            <TrendingUp className="w-3 h-3" />
            Smart Pricing
          </div>
        </div>

        <CardContent className="p-5">
          {/* Hotel Name */}
          <h3 className="font-display text-xl font-semibold mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors">
            {hotel.hotel_name}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
            <MapPin className="w-4 h-4" />
            <span>{hotel.city}{hotel.state ? `, ${hotel.state}` : ''}</span>
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-2 mb-4">
            {features.slice(0, 2).map((feature, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {feature}
              </Badge>
            ))}
            {hasWifi && (
              <Badge variant="outline" className="text-xs">
                <Wifi className="w-3 h-3 mr-1" />
                Wi-Fi
              </Badge>
            )}
            {hasParking && (
              <Badge variant="outline" className="text-xs">
                <ParkingCircle className="w-3 h-3 mr-1" />
                Parking
              </Badge>
            )}
          </div>

          {/* Price */}
          <div className="flex items-end justify-between pt-4 border-t border-border/50">
            <div>
              <p className="text-xs text-muted-foreground">Starting from</p>
              <p className="text-2xl font-bold text-primary-600">
                {formatPrice(hotel.price_per_night)}
              </p>
              <p className="text-xs text-muted-foreground">per night</p>
            </div>
            {hotel.number_of_reviews && (
              <p className="text-xs text-muted-foreground">
                {hotel.number_of_reviews} reviews
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
