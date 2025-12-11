import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Date utilities
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateInput(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

export function calculateNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end.getTime() - start.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getMonthNumber(date: string): number {
  return new Date(date).getMonth() + 1;
}

export function isDateInRange(date: string, start: string, end: string): boolean {
  const d = new Date(date);
  const s = new Date(start);
  const e = new Date(end);
  return d >= s && d <= e;
}

// Price utilities
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatPriceShort(price: number): string {
  if (price >= 100000) {
    return `₹${(price / 100000).toFixed(1)}L`;
  }
  if (price >= 1000) {
    return `₹${(price / 1000).toFixed(1)}K`;
  }
  return `₹${price}`;
}

// Rating utilities
export function formatRating(rating: number | null): string {
  if (!rating) return 'N/A';
  return rating.toFixed(1);
}

export function getRatingColor(rating: number | null): string {
  if (!rating) return 'text-muted-foreground';
  if (rating >= 4.5) return 'text-green-600 dark:text-green-400';
  if (rating >= 4.0) return 'text-primary-600 dark:text-primary-400';
  if (rating >= 3.5) return 'text-accent-600 dark:text-accent-400';
  return 'text-orange-600 dark:text-orange-400';
}

// Image utilities
export function getCityImageUrl(city: string): string {
  const cityImageMap: Record<string, string> = {
    Mumbai: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&h=900&fit=crop',
    Delhi: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1600&h=900&fit=crop',
    Bengaluru: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=1600&h=900&fit=crop',
    Jaipur: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1600&h=900&fit=crop',
    Goa: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1600&h=900&fit=crop',
    Kochi: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1600&h=900&fit=crop',
    Hyderabad: 'https://images.unsplash.com/photo-1591825729269-caeb344f6df2?w=1600&h=900&fit=crop',
    Chennai: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1600&h=900&fit=crop',
    Kolkata: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=1600&h=900&fit=crop',
    Pune: 'https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=1600&h=900&fit=crop',
  };

  return cityImageMap[city] || `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&h=900&fit=crop&q=80`;
}

export function getHeroImageUrl(): string {
  // Random scenic India images for hero
  const heroImages = [
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1920&h=1080&fit=crop',
    'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1920&h=1080&fit=crop',
    'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1920&h=1080&fit=crop',
    'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1920&h=1080&fit=crop',
  ];
  
  return heroImages[Math.floor(Math.random() * heroImages.length)];
}

// String utilities
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Array utilities
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
