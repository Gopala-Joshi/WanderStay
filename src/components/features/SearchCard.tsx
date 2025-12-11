import { useSearchStore } from '@/stores/searchStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Search, MapPin, Calendar as CalendarIcon, Users as UsersIcon } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useState } from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface SearchCardProps {
  cities: string[];
  onSearch: () => void;
}

export default function SearchCard({ cities, onSearch }: SearchCardProps) {
  const { filters, setFilters } = useSearchStore();
  const [open, setOpen] = useState(false);

  return (
    <div className="glass-strong p-6 rounded-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* City */}
        <div className="lg:col-span-1">
          <Label className="text-sm font-medium mb-2 block flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            City
          </Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between font-normal"
              >
                {filters.city || "Select city..."}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="Search city..." />
                <CommandEmpty>No city found.</CommandEmpty>
                <CommandGroup className="max-h-64 overflow-auto">
                  {cities.map((city) => (
                    <CommandItem
                      key={city}
                      value={city}
                      onSelect={() => {
                        setFilters({ city });
                        setOpen(false);
                      }}
                    >
                      {city}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Check-in */}
        <div>
          <Label htmlFor="checkIn" className="text-sm font-medium mb-2 block flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            Check-in
          </Label>
          <Input
            id="checkIn"
            type="date"
            value={filters.checkIn}
            onChange={(e) => setFilters({ checkIn: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Check-out */}
        <div>
          <Label htmlFor="checkOut" className="text-sm font-medium mb-2 block flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            Check-out
          </Label>
          <Input
            id="checkOut"
            type="date"
            value={filters.checkOut}
            onChange={(e) => setFilters({ checkOut: e.target.value })}
            min={filters.checkIn}
          />
        </div>

        {/* Guests */}
        <div>
          <Label htmlFor="guests" className="text-sm font-medium mb-2 block flex items-center gap-2">
            <UsersIcon className="w-4 h-4" />
            Guests
          </Label>
          <Input
            id="guests"
            type="number"
            min="1"
            max="10"
            value={filters.guests}
            onChange={(e) => setFilters({ guests: parseInt(e.target.value) })}
          />
        </div>

        {/* Search Button */}
        <div className="flex items-end">
          <Button
            onClick={onSearch}
            disabled={!filters.city}
            className="w-full btn-premium"
          >
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
      </div>

      {/* Budget Slider */}
      <div className="mt-6 pt-6 border-t border-border/50">
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-medium">Budget per night</Label>
        </div>
        <div className="flex items-center justify-between mb-3 text-sm font-semibold">
          <span className="text-primary-600">{formatPrice(filters.budgetMin)}</span>
          <span className="text-primary-600">{formatPrice(filters.budgetMax)}</span>
        </div>
        <Slider
          min={0}
          max={50000}
          step={500}
          value={[filters.budgetMin, filters.budgetMax]}
          onValueChange={([min, max]) =>
            setFilters({ budgetMin: min, budgetMax: max })
          }
          className="mb-4"
        />

        {/* Segment Toggle */}
        <div className="flex gap-2">
          {(['all', 'budget', 'mid', 'luxury'] as const).map((segment) => (
            <Button
              key={segment}
              variant={filters.segment === segment ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilters({ segment })}
              className="flex-1"
            >
              {segment === 'all' ? 'All' : segment.charAt(0).toUpperCase() + segment.slice(1)}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
