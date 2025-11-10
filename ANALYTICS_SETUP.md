# Analytics Module Setup Guide

This guide will help you set up and configure the Analytics module for your application.

## Prerequisites

- Supabase project created and configured
- Environment variables set (`.env.local`):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (optional, for admin operations)

## Installation

The analytics module dependencies have already been installed:
- `recharts` - Chart library for data visualization
- `jest` - Testing framework
- `@jest/globals` - Jest globals for TypeScript
- `ts-jest` - TypeScript support for Jest

If you need to reinstall:
```bash
npm install recharts
npm install -D jest @jest/globals @types/jest ts-jest
```

## Database Setup

### 1. Run the Schema Migration

Navigate to your Supabase project dashboard:
1. Go to **SQL Editor**
2. Create a new query
3. Copy the contents of `supabase_analytics_schema.sql`
4. Execute the query

This will create:
- `posts` table for blog posts
- `comments` table for post comments
- `likes` table for post likes
- Indexes for query performance
- Row Level Security (RLS) policies
- Auto-update triggers for timestamps

### 2. Verify Tables Created

Run this query in the SQL Editor:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('posts', 'comments', 'likes');
```

You should see all three tables listed.

### 3. Test RLS Policies

The RLS policies ensure:
- Only authenticated users can create/edit content
- Users can only edit their own posts/comments/likes
- Published posts are visible to all authenticated users
- Draft posts are only visible to their authors

Test by logging in with different users and verifying access.

## Generate TypeScript Types (Optional)

If you have the Supabase CLI installed, you can regenerate types:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/database.types.ts
```

Then update `lib/types.ts` to import from the generated file.

## Testing the Analytics Module

### Run Unit Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

### Manual Testing Checklist

1. **Authentication**
   - [ ] Unauthenticated users are redirected to `/login`
   - [ ] Authenticated users can access `/analytics`

2. **Empty State**
   - [ ] Page shows "No data yet" message when no content exists
   - [ ] Helpful messaging is displayed

3. **KPI Cards**
   - [ ] All 6 KPI cards render correctly
   - [ ] Values update when data changes
   - [ ] Icons and colors display properly
   - [ ] Dark mode styling works

4. **Charts**
   - [ ] Activity timeline line chart renders
   - [ ] Post engagement bar chart displays
   - [ ] Charts are responsive
   - [ ] Tooltips show on hover
   - [ ] Legend is visible and accurate

5. **Data Accuracy**
   - [ ] Total posts count matches database
   - [ ] Published/draft counts are correct
   - [ ] Comment and like counts are accurate
   - [ ] Engagement rate calculates properly
   - [ ] Timeline shows last 30 days of activity

6. **Performance**
   - [ ] Page loads in < 3 seconds
   - [ ] Charts render smoothly
   - [ ] No console errors
   - [ ] Revalidation works (data updates after 60s)

## Seed Sample Data

For testing, you can create sample data:

```sql
-- Create sample posts (update author_id with your user ID)
INSERT INTO posts (title, content, status, author_id)
VALUES 
  ('Getting Started with Next.js', 'This is a comprehensive guide...', 'published', 'YOUR_USER_ID'),
  ('Supabase Best Practices', 'Learn how to use Supabase effectively...', 'published', 'YOUR_USER_ID'),
  ('Draft: Upcoming Features', 'Working on new features...', 'draft', 'YOUR_USER_ID');

-- Get post IDs for comments and likes
SELECT id, title FROM posts;

-- Add comments (update post_id and user_id)
INSERT INTO comments (post_id, user_id, content)
VALUES 
  ('POST_ID_1', 'YOUR_USER_ID', 'Great article!'),
  ('POST_ID_1', 'YOUR_USER_ID', 'Very helpful, thanks!'),
  ('POST_ID_2', 'YOUR_USER_ID', 'Looking forward to more content.');

-- Add likes (update post_id and user_id)
INSERT INTO likes (post_id, user_id)
VALUES 
  ('POST_ID_1', 'YOUR_USER_ID'),
  ('POST_ID_2', 'YOUR_USER_ID');
```

## Troubleshooting

### Analytics Page Shows "Unable to load analytics"

**Possible causes:**
- Database connection issue
- Missing environment variables
- Supabase client configuration error

**Solutions:**
1. Check `.env.local` has correct Supabase credentials
2. Verify Supabase project is not paused
3. Check browser console for detailed error messages
4. Review server logs for authentication errors

### Charts Not Rendering

**Possible causes:**
- recharts not installed properly
- Client component not marked with 'use client'
- Theme context not available

**Solutions:**
1. Reinstall recharts: `npm install recharts`
2. Clear Next.js cache: `rm -rf .next`
3. Rebuild: `npm run build`
4. Check browser console for JavaScript errors

### Data Not Updating

**Possible causes:**
- Revalidation cache not expired (60s default)
- RLS policies blocking queries
- Database triggers not working

**Solutions:**
1. Wait 60 seconds for cache to expire
2. Hard refresh browser (Ctrl+Shift+R / Cmd+Shift+R)
3. Check RLS policies in Supabase dashboard
4. Verify user has proper permissions

### "No data yet" Despite Having Content

**Possible causes:**
- All posts are drafts (not published)
- RLS policies restricting access
- Date filters excluding data

**Solutions:**
1. Publish at least one post
2. Check post status: `SELECT status FROM posts`
3. Verify RLS policies allow reading published posts
4. Check created_at dates are within last 30 days for timeline

## Next Steps

After setup, consider:

1. **Customize Analytics**
   - Add more KPIs relevant to your use case
   - Create custom date range filters
   - Add export functionality (CSV/PDF)

2. **Optimize Performance**
   - Add database indexes for specific queries
   - Implement caching strategies
   - Use Supabase Edge Functions for complex aggregations

3. **Enhance Security**
   - Review and tighten RLS policies
   - Add role-based access (admin vs author)
   - Implement audit logging

4. **Add Real-time Updates**
   - Use Supabase Realtime subscriptions
   - Update charts live as data changes
   - Add notifications for milestones

## Support

For issues or questions:
- Check `ANALYTICS_MODULE.md` for detailed documentation
- Review test files for example usage
- Consult Supabase documentation for database queries
- Check recharts documentation for chart customization

## Useful Links

- [Supabase Documentation](https://supabase.com/docs)
- [Recharts Documentation](https://recharts.org/en-US/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
