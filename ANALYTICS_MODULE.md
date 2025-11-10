# Analytics Module

## Overview

The Analytics module provides comprehensive data visualization and insights for content and user engagement metrics. It aggregates data from Supabase to display KPIs, charts, and engagement statistics.

## Features

- **Key Performance Indicators (KPIs)**
  - Total posts count
  - Published vs draft posts
  - Total comments
  - Total likes
  - Engagement rate calculation

- **Interactive Charts**
  - Activity timeline (line chart) showing posts, comments, and likes over the last 30 days
  - Top posts by engagement (bar chart and table)

- **Authorization**
  - Restricted to logged-in users (authors/admins)
  - Redirects unauthenticated users to login
  - Respects Supabase Row Level Security (RLS)

- **Empty State Handling**
  - Graceful handling of no data scenarios
  - Helpful messaging for new users

## Architecture

### Server Actions (`/lib/actions/analytics.ts`)

Server-side functions that fetch analytics data from Supabase:

- `getAnalytics()` - Main function that aggregates all analytics data
- `getUserRole()` - Checks user authentication and role
- `getPostsWithEngagement()` - Fetches posts with comment and like counts
- `getActivityTimeline()` - Aggregates activity by day for the last 30 days

### Database Types (`/lib/types.ts`)

TypeScript definitions for database tables:
- `posts` - Blog posts with status (draft/published)
- `comments` - Post comments
- `likes` - Post likes

### UI Components

**Page Components:**
- `/app/analytics/page.tsx` - Main analytics dashboard page

**Data Visualization:**
- `/components/AnalyticsKPIs.tsx` - Grid of KPI cards
- `/components/AnalyticsCharts.tsx` - Activity timeline line chart
- `/components/PostEngagementTable.tsx` - Top posts bar chart and table

## Usage

### Accessing the Dashboard

Navigate to `/analytics` to view the analytics dashboard. Users must be logged in to access this page.

### Data Refresh

The analytics page uses Next.js revalidation with a 60-second cache:
```typescript
export const revalidate = 60
```

Data is automatically refetched every 60 seconds or on navigation.

### Authorization Flow

1. Page checks user authentication via `getUserRole()`
2. If not authenticated, redirects to `/login`
3. If authenticated, fetches analytics via `getAnalytics()`
4. Displays data or shows error/empty state

## Chart Library

The module uses **recharts** for data visualization:

- **Line Chart** - Activity timeline
- **Bar Chart** - Post engagement comparison
- **Responsive** - Adapts to container size
- **Dark Mode** - Supports theme switching

## Security

- All analytics queries run server-side
- Requires valid user session
- Respects Supabase RLS policies
- No sensitive data exposed to client
- Error states don't leak information

## Testing

Unit tests are located in `/lib/actions/__tests__/analytics.test.ts`:

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

Test coverage includes:
- Authentication checks
- Data aggregation
- Error handling
- Edge cases (empty data, failed queries)

## Database Schema

The analytics module expects the following Supabase tables:

### posts
```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published')),
  author_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### comments
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### likes
```sql
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);
```

## Performance Considerations

- Queries are optimized with proper indexing
- Uses `count` queries for aggregations
- Limits result sets (e.g., top 10 posts)
- Activity timeline limited to 30 days
- Server-side rendering reduces client load

## Future Enhancements

Potential improvements:
- Date range filtering
- Export to CSV/PDF
- Real-time updates via Supabase Realtime
- User-specific analytics
- Advanced filtering and grouping
- Comparison periods (week-over-week, month-over-month)
- Custom date ranges
- More chart types (pie, area, scatter)

## Troubleshooting

**Analytics not loading:**
- Check Supabase connection
- Verify RLS policies allow read access
- Check browser console for errors
- Ensure user is authenticated

**Empty data displayed:**
- Verify database tables exist
- Check that posts/comments/likes have been created
- Verify date filters aren't too restrictive

**Charts not rendering:**
- Check browser console for recharts errors
- Ensure container has proper dimensions
- Verify chart data format is correct
