# WanderStay - AI-Powered Hotel Booking Platform

Built with React, Vite, Tailwind CSS, Supabase, and OnSpace AI.

## Setup Instructions

### 1. Import CSV Data to Supabase

**Hotels Data:**
1. Go to Supabase Dashboard → Table Editor
2. Select `hotels_india` table
3. Click "Insert" → "Import data from CSV"
4. Upload the hotels CSV file provided
5. Map columns: hotel_name, city, state, rating, number_of_reviews, feature_1-5, price_per_night, latitude, longitude, amenities

**City Demand Data:**
1. Select `city_demand` table
2. Click "Insert" → "Import data from CSV"
3. Upload the city demand CSV file
4. Map columns: city, peak_months, events

### 2. Create Admin User (Optional)

Run this SQL in Supabase SQL Editor:

```sql
-- After signing up, update your user to admin
UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
```

### 3. Environment Variables

Already configured automatically:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Edge Function secrets (configured via OnSpace):
- `ONSPACE_AI_API_KEY`
- `ONSPACE_AI_BASE_URL`

## Features

✅ **Smart Hotel Search** - Filter by city, dates, budget, and segment  
✅ **AI Price Insights** - Demand-aware pricing with Gemini AI  
✅ **Event-Based Pricing** - Accounts for festivals and peak seasons  
✅ **User Authentication** - Secure login with Supabase Auth  
✅ **Booking Management** - Track upcoming and past trips  
✅ **Admin Dashboard** - Manage hotels and view analytics  
✅ **Premium UI** - Glassmorphism, GSAP animations, responsive design  

## Usage

1. **Search Hotels** - Select city, dates, and preferences
2. **View Details** - Click any hotel card to see full details
3. **Get AI Insights** - Click "Get AI Price Suggestion" for smart recommendations
4. **Book Stay** - Confirm booking with one click
5. **Manage Bookings** - View all trips in your dashboard

## Tech Stack

- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Edge Functions)
- **AI:** OnSpace AI (Gemini models)
- **Animations:** GSAP
- **State:** Zustand
- **UI:** shadcn/ui components

## CSV Data Format

**Hotels CSV columns:**
- hotel_name, city, state, rating, number_of_reviews
- feature_1, feature_2, feature_3, feature_4, feature_5
- price_per_night, latitude, longitude, amenities

**City Demand CSV columns:**
- city, peak_months (comma-separated month numbers)
- events (format: "Event Name (YYYY-MM-DD–YYYY-MM-DD); ...")

## Deployment

This app is ready to deploy on OnSpace. Click **Publish** in the top-right toolbar to get your live URL.

---

**Powered by OnSpace AI** ✨
