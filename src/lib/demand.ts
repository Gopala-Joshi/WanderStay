import { CityDemand } from './supabase';
import { getMonthNumber, isDateInRange } from './utils';

export interface EventInfo {
  name: string;
  start: string;
  end: string;
  reason?: string;
  impact: 'low' | 'medium' | 'high' | 'very_high';
}

export interface DemandContext {
  is_peak_month: boolean;
  peak_months: string | null;
  events: EventInfo[];
  demand_score: number;
}

// Parse event string format: "Event Name (YYYY-MM-DD–YYYY-MM-DD)"
export function parseEvents(eventsStr: string | null): EventInfo[] {
  if (!eventsStr) return [];
  
  const events: EventInfo[] = [];
  const eventParts = eventsStr.split(';').map(e => e.trim());
  
  for (const eventStr of eventParts) {
    const match = eventStr.match(/(.+?)\s*\((\d{4}-\d{2}-\d{2})–(\d{4}-\d{2}-\d{2})\)/);
    if (match) {
      const [, name, start, end] = match;
      events.push({
        name: name.trim(),
        start,
        end,
        impact: getEventImpact(name.trim()),
      });
    }
  }
  
  return events;
}

function getEventImpact(eventName: string): EventInfo['impact'] {
  const name = eventName.toLowerCase();
  
  // Very high impact events
  if (name.includes('kumbh') || name.includes('diwali') || name.includes('new year')) {
    return 'very_high';
  }
  
  // High impact events
  if (name.includes('wedding') || name.includes('durga puja') || name.includes('navratri')) {
    return 'high';
  }
  
  // Medium impact events
  if (name.includes('festival') || name.includes('jayanti') || name.includes('puja')) {
    return 'medium';
  }
  
  // Default to low impact
  return 'low';
}

export function calculateDemandContext(
  cityDemand: CityDemand | null,
  checkIn: string,
  checkOut: string
): DemandContext {
  const checkInMonth = getMonthNumber(checkIn);
  
  // Check if check-in is in peak month
  const peakMonths = cityDemand?.peak_months 
    ? cityDemand.peak_months.split(',').map(m => parseInt(m.trim()))
    : [];
  const isPeakMonth = peakMonths.includes(checkInMonth);
  
  // Parse and filter overlapping events
  const allEvents = parseEvents(cityDemand?.events || null);
  const overlappingEvents = allEvents.filter(event => 
    isDateInRange(checkIn, event.start, event.end) ||
    isDateInRange(checkOut, event.start, event.end) ||
    (new Date(checkIn) <= new Date(event.start) && new Date(checkOut) >= new Date(event.end))
  );
  
  // Calculate demand score
  let demandScore = 0;
  
  // Peak month contribution: 0.2 - 0.4
  if (isPeakMonth) {
    demandScore += 0.3;
  }
  
  // Event contribution: 0.1 per low, 0.2 per medium, 0.3 per high, 0.4 per very_high
  for (const event of overlappingEvents) {
    const impactScore = {
      low: 0.1,
      medium: 0.2,
      high: 0.3,
      very_high: 0.4,
    }[event.impact];
    demandScore += impactScore;
  }
  
  // Cap at 1.0
  demandScore = Math.min(demandScore, 1.0);
  
  return {
    is_peak_month: isPeakMonth,
    peak_months: cityDemand?.peak_months || null,
    events: overlappingEvents,
    demand_score: demandScore,
  };
}

export function getDemandLabel(score: number): {
  label: string;
  color: string;
  bgColor: string;
} {
  if (score >= 0.7) {
    return {
      label: 'Very High Demand',
      color: 'text-red-700 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-950',
    };
  }
  if (score >= 0.5) {
    return {
      label: 'High Demand',
      color: 'text-orange-700 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-950',
    };
  }
  if (score >= 0.3) {
    return {
      label: 'Moderate Demand',
      color: 'text-yellow-700 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-950',
    };
  }
  return {
    label: 'Low Demand',
    color: 'text-green-700 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-950',
  };
}

export function calculatePriceRange(
  baseMin: number,
  baseMax: number,
  demandScore: number
): { calculated_min: number; calculated_max: number } {
  // Conservative multiplier: 0.5 of demand score
  const multiplier = 1 + demandScore * 0.5;
  
  return {
    calculated_min: Math.round(baseMin * multiplier),
    calculated_max: Math.round(baseMax * multiplier),
  };
}
