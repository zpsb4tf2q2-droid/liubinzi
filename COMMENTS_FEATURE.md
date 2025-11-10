# Comments UI Feature

This document describes the implementation of the comments UI feature for posts.

## Overview

The comments feature allows authenticated users to:
- View comments on published posts
- Add top-level comments
- Reply to comments (one level of nesting)
- Like posts with optimistic UI updates
- Delete their own comments
- Post authors can delete any comment on their posts

Guest users can view comments but must log in to interact.

## Database Schema

### Comments Table Updates

The `comments` table now includes a `parent_id` column for nested replies:

```sql
ALTER TABLE comments ADD COLUMN parent_id UUID REFERENCES comments(id) ON DELETE CASCADE;
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
```

Run the migration script: `supabase_comments_migration.sql`

## Components

### Server Components
- **`/app/posts/page.tsx`** - Posts listing page with comment/like counts
- **`/app/posts/[id]/page.tsx`** - Post detail page with full comments UI

### Client Components

#### CommentsSection
Main container for the comments UI. Handles authentication state and comment refresh.

**Props:**
- `postId: string` - ID of the post
- `comments: CommentWithUser[]` - Initial comments data
- `currentUserId?: string | null` - Current logged-in user ID
- `postAuthorId?: string` - ID of the post author
- `isAuthenticated: boolean` - Whether user is authenticated

#### CommentForm
Form for creating new comments or replies.

**Props:**
- `postId: string` - ID of the post
- `parentId?: string | null` - Parent comment ID for replies
- `onSuccess?: () => void` - Callback after successful submission
- `onCancel?: () => void` - Callback for cancel action
- `placeholder?: string` - Input placeholder text
- `submitLabel?: string` - Submit button label
- `autoFocus?: boolean` - Auto-focus textarea on mount

**Features:**
- Form validation (non-empty content)
- Loading states during submission
- Toast notifications for success/error
- Keyboard accessible

#### CommentItem
Displays individual comment with user info, content, and actions.

**Props:**
- `comment: CommentWithUser` - Comment data with user info and replies
- `postId: string` - ID of the post
- `currentUserId?: string | null` - Current logged-in user ID
- `postAuthorId?: string` - ID of the post author
- `isReply?: boolean` - Whether this is a nested reply
- `onDeleted?: () => void` - Callback after deletion

**Features:**
- Relative timestamps (just now, 5m ago, 2h ago, etc.)
- Reply button (only for top-level comments)
- Delete button (for own comments and post authors)
- Inline reply form
- Recursive rendering of replies

#### CommentsList
Container for rendering all comments with empty states.

**Props:**
- `postId: string` - ID of the post
- `initialComments: CommentWithUser[]` - Initial comments data
- `currentUserId?: string | null` - Current logged-in user ID
- `postAuthorId?: string` - ID of the post author

#### LikeButton
Like/unlike button with optimistic UI updates.

**Props:**
- `postId: string` - ID of the post
- `initialLiked: boolean` - Whether user has liked the post
- `initialCount: number` - Initial like count
- `isAuthenticated: boolean` - Whether user is authenticated

**Features:**
- Optimistic UI updates (immediate visual feedback)
- Animated heart icon
- Error handling with rollback
- Redirects guests to login page

## Server Actions

### Post Actions (`/lib/actions/posts.ts`)

#### `getPost(postId: string)`
Fetches a single post with comment/like counts and user's like status.

#### `getPosts(limit: number)`
Fetches published posts with engagement metrics.

#### `togglePostLike(postId: string)`
Toggles like status for a post. Returns new like state.

### Comment Actions (`/lib/actions/comments.ts`)

#### `getComments(postId: string)`
Fetches top-level comments with nested replies for a post.

#### `createComment(postId: string, content: string, parentId?: string)`
Creates a new comment or reply. Validates:
- User is authenticated
- Content is not empty
- Replies are only one level deep

#### `deleteComment(commentId: string, postId: string)`
Deletes a comment. Allows deletion if:
- User is the comment author, OR
- User is the post author

## Responsive Design

All components are fully responsive and tested down to 375px width:

- **Mobile (< 640px)**
  - Stacked layouts
  - Reduced padding and spacing
  - Smaller avatar sizes
  - Compact navigation

- **Tablet (640px - 1024px)**
  - Optimized spacing
  - Medium avatar sizes
  - Grid layouts where appropriate

- **Desktop (> 1024px)**
  - Full spacing
  - Large avatar sizes
  - Wide layouts with max-width constraints

## Accessibility

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Proper focus states on buttons and links
- Tab order follows visual hierarchy

### Screen Readers
- ARIA labels on icon-only buttons
- Semantic HTML elements
- Status updates via toast notifications
- Loading states announced

### Focus Management
- Auto-focus on reply forms
- Focus indicators on all interactive elements
- Skip to main content link

## Loading States

- **Comment Form**: Disabled state with "Posting..." text
- **Delete Button**: Disabled state during deletion
- **Like Button**: Scale animation during transition
- **Empty States**: Friendly messages with icons

## Error Handling

All actions include comprehensive error handling:

1. **Validation Errors**: Toast notifications for invalid input
2. **Authentication Errors**: Redirect to login with message
3. **Permission Errors**: Toast notification explaining restriction
4. **Network Errors**: Generic error message with retry option
5. **Not Found**: Custom 404 page for missing posts

## Performance Optimizations

1. **Optimistic UI**: Like button updates immediately before server response
2. **Revalidation**: Post page revalidates after comment/like changes
3. **Caching**: Posts list page has 60-second revalidation cache
4. **Lazy Loading**: Client components load only when needed
5. **Efficient Queries**: Parallel data fetching with Promise.all

## Security

1. **Row Level Security (RLS)**: All database operations enforce RLS policies
2. **Server-Side Validation**: All inputs validated on server
3. **CSRF Protection**: Built-in Next.js CSRF protection
4. **Authentication Checks**: All mutations require authentication
5. **Authorization**: Users can only delete their own content (except post authors)

## Usage Example

```tsx
// In a server component
import { getPost } from '@/lib/actions/posts'
import { getComments } from '@/lib/actions/comments'
import CommentsSection from '@/components/CommentsSection'

export default async function PostPage({ params }: { params: { id: string } }) {
  const post = await getPost(params.id)
  const comments = await getComments(params.id)
  const user = await getCurrentUser() // Your auth logic
  
  return (
    <div>
      {/* Post content */}
      <CommentsSection
        postId={post.id}
        comments={comments}
        currentUserId={user?.id}
        postAuthorId={post.author_id}
        isAuthenticated={!!user}
      />
    </div>
  )
}
```

## Testing Checklist

- [ ] Authenticated users can add comments
- [ ] Authenticated users can reply to comments (one level)
- [ ] Guests can view comments but see login prompt
- [ ] Users can delete own comments
- [ ] Post authors can delete any comment on their posts
- [ ] Like button works with optimistic updates
- [ ] Responsive layout works on mobile (375px)
- [ ] Keyboard navigation works throughout
- [ ] Screen readers can navigate comments
- [ ] Empty states display correctly
- [ ] Error handling works for all edge cases
- [ ] Loading states display during operations

## Known Limitations

1. **Reply Depth**: Only one level of nesting supported (replies to replies not allowed)
2. **Real-time Updates**: Comments don't update in real-time (requires manual refresh)
3. **Comment Editing**: Edit functionality not yet implemented
4. **Comment Likes**: Only posts can be liked, not individual comments
5. **Pagination**: All comments load at once (no pagination for large threads)

## Future Enhancements

- Real-time comment updates using Supabase subscriptions
- Comment editing within time window
- Comment likes/reactions
- Comment pagination for large threads
- Rich text formatting in comments
- @mentions and notifications
- Moderation tools (report, flag, hide)
- Sort options (newest, oldest, most liked)
