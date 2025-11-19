# Comments and Reactions Backend Implementation

This document describes the complete backend implementation for comments and reactions (likes) functionality in the application.

## Overview

The backend is organized into three layers:
1. **Data Access Layer** (`lib/comments.ts`, `lib/reactions.ts`) - Pure Supabase query functions
2. **Business Logic Layer** (`lib/actions/comments.ts`, `lib/actions/posts.ts`) - Server actions with validation and authorization
3. **Type Layer** (`lib/types.ts`) - TypeScript type definitions

## Architecture

### Data Access Layer

Located in `/lib/comments.ts` and `/lib/reactions.ts`, this layer provides reusable, pure query functions without business logic or authorization checks.

#### Comments Data Access (`lib/comments.ts`)

**Functions:**
- `fetchTopLevelComments(postId)` - Fetch root-level comments for a post
- `fetchReplies(commentId)` - Fetch replies to a specific comment
- `fetchCommentsTree(postId)` - Fetch complete comment tree with nested replies
- `fetchCommentById(commentId)` - Fetch a single comment
- `insertComment(postId, userId, content, parentId?)` - Create a new comment
- `updateComment(commentId, content)` - Update comment content
- `deleteCommentById(commentId)` - Delete a comment
- `deleteCommentsByPostId(postId)` - Delete all comments for a post
- `getCommentCount(postId)` - Get comment count for a post
- `getCommentCounts(postIds[])` - Get comment counts for multiple posts

#### Reactions Data Access (`lib/reactions.ts`)

**Functions:**
- `hasUserLikedPost(postId, userId)` - Check if user has liked a post
- `fetchLike(postId, userId)` - Get a specific like record
- `createLike(postId, userId)` - Create a new like
- `deleteLike(postId, userId)` - Remove a like
- `deleteLikesByPostId(postId)` - Delete all likes for a post
- `getLikeCount(postId)` - Get like count for a post
- `getLikeCounts(postIds[])` - Get like counts for multiple posts
- `fetchPostLikes(postId)` - Get all likes for a post
- `fetchUserLikes(userId)` - Get all posts a user has liked

### Business Logic Layer

Server actions that add validation, authorization, and RLS policy enforcement.

#### Comments Actions (`lib/actions/comments.ts`)

**Exported Functions:**

1. **`getComments(postId: string): Promise<CommentWithUser[]>`**
   - Fetches comments tree with nested replies (one level deep)
   - Returns empty array on error
   - Publicly accessible (guests can view)

2. **`createComment(postId, content, parentId?): Promise<{success, error?, comment?}>`**
   - Creates a new comment or reply
   - Validates:
     - User is authenticated
     - Content is not empty
     - Parent comment doesn't already have a parent (no nested nesting)
   - Revalidates post page after creation

3. **`deleteComment(commentId, postId): Promise<{success, error?}>`**
   - Deletes a comment
   - Authorization rules:
     - User must be the comment author OR
     - User must be the post author (moderation)
   - Revalidates post page after deletion

#### Post Reactions Actions (`lib/actions/posts.ts`)

**Exported Functions:**

1. **`togglePostLike(postId: string): Promise<{success, liked, error?}>`**
   - Toggles like status for a post
   - Returns `liked: true` if like was added
   - Returns `liked: false` if like was removed
   - Validates user is authenticated
   - Revalidates post page after toggle

2. **`getPost(postId)`, `getPosts(limit)`, `getMyPosts()`**
   - Include aggregated counts:
     - `comment_count` - Total number of comments
     - `like_count` - Total number of likes
     - `user_has_liked` - Whether current user has liked (if authenticated)

### Type Definitions (`lib/types.ts`)

**Core Types:**
- `Comment` - Comment table row type
- `Like` / `Reaction` - Like/reaction table row type
- `CommentWithUser` - Comment with nested replies
- `PostWithDetails` - Post with aggregated counts
- `PostWithCounts` - Aggregated counts for analytics
- `CommentCreate` - Comment insert payload
- `ReactionCreate` - Reaction insert payload

## Database Schema

### Comments Table
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);
```

### Likes Table
```sql
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Indexes
CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);
```

## RLS Policies

### Comments
- **SELECT**: Anyone can read comments on published posts
- **INSERT**: Authenticated users can create comments
- **UPDATE**: Users can update their own comments
- **DELETE**: Users can delete their own comments OR post authors can delete any comment on their posts

### Likes
- **SELECT**: Anyone can read likes on published posts
- **INSERT**: Authenticated users can create likes (unique constraint prevents duplicates)
- **DELETE**: Users can delete their own likes

## Features

### Nested Comments
- Support for one level of nesting (comments and replies, no nested replies)
- Validation prevents replies to replies
- Tree structure returned by `getComments()` includes `replies` array

### Comment Moderation
- Post authors can delete any comment on their posts
- Comment authors can always delete their own comments
- Server-side authorization checks in addition to RLS policies

### Like Toggle
- Single action to add/remove likes
- Returns current state (`liked: true/false`)
- Optimistic UI support via client-side components
- Unique constraint prevents duplicate likes

### Aggregated Counts
- Efficient count queries using Supabase `count: 'exact'`
- Batch count functions for multiple posts (`getCommentCounts`, `getLikeCounts`)
- Counts included in post list and detail responses
- Analytics-ready data structure

## API Usage Examples

### Creating a Comment
```typescript
import { createComment } from '@/lib/actions/comments'

const result = await createComment('post-123', 'Great post!', null)
if (result.success) {
  console.log('Comment created:', result.comment)
} else {
  console.error('Error:', result.error)
}
```

### Creating a Reply
```typescript
const result = await createComment('post-123', 'Thanks!', 'comment-456')
```

### Toggling a Like
```typescript
import { togglePostLike } from '@/lib/actions/posts'

const result = await togglePostLike('post-123')
if (result.success) {
  console.log(result.liked ? 'Liked!' : 'Unliked!')
}
```

### Fetching Comments with Replies
```typescript
import { getComments } from '@/lib/actions/comments'

const comments = await getComments('post-123')
// Returns CommentWithUser[] with nested replies
comments.forEach(comment => {
  console.log(comment.content)
  comment.replies?.forEach(reply => {
    console.log('  -', reply.content)
  })
})
```

### Using Data Access Layer Directly
```typescript
import { getCommentCount, getLikeCount } from '@/lib/comments'
import { getLikeCounts } from '@/lib/reactions'

// Single post counts
const commentCount = await getCommentCount('post-123')
const likeCount = await getLikeCount('post-123')

// Batch counts for multiple posts
const postIds = ['post-1', 'post-2', 'post-3']
const likeCounts = await getLikeCounts(postIds)
// Returns: { 'post-1': 5, 'post-2': 8, 'post-3': 3 }
```

## Testing

### Test Coverage
- **Comments Tests** (`lib/actions/__tests__/comments.test.ts`) - 16 tests
  - Comment creation (success, validation, authorization)
  - Comment deletion (authorization, moderation, error handling)
  - Nested replies (success, prevention of deep nesting)
  - Error handling and edge cases

- **Reactions Tests** (`lib/actions/__tests__/reactions.test.ts`) - 7 tests
  - Like toggle (add, remove, errors)
  - Authorization checks
  - Duplicate prevention
  - Error handling

### Running Tests
```bash
# Run all tests
npm test

# Run specific test suites
npm test comments.test.ts
npm test reactions.test.ts

# Watch mode
npm test:watch
```

## Security

### Authentication
- All write operations require authenticated user
- User identity from `supabase.auth.getUser()`
- RLS policies enforce user ownership

### Authorization
- Comment authors can delete own comments
- Post authors can moderate (delete) all comments on their posts
- Server-side checks before database operations
- RLS policies as additional enforcement layer

### Input Validation
- Content cannot be empty (trimmed)
- Parent comment validation (no nested nesting)
- Error messages don't expose sensitive information

### Data Integrity
- Foreign key constraints ensure referential integrity
- CASCADE deletes prevent orphaned records
- Unique constraint on likes table prevents duplicates
- Indexes optimize query performance

## Performance Optimization

### Efficient Queries
- Batch count queries for multiple posts
- Single query for comment tree (one query for parents, one per parent for replies)
- Indexes on foreign keys and frequently queried columns
- `head: true` for count queries (no data transfer)

### Caching
- `revalidatePath()` after mutations to update Next.js cache
- Page-level caching for analytics data (60 seconds)
- Stale-while-revalidate pattern for optimal UX

### Scalability
- Separate data access and business logic layers
- Reusable query functions
- Support for batch operations
- Optimized for serverless environments

## Future Enhancements

Potential improvements for future iterations:

1. **Pagination** - Add cursor-based pagination for comments and likes
2. **Reactions Types** - Extend beyond likes (love, laugh, etc.)
3. **Comment Editing** - Add ability to edit comments with history
4. **Notifications** - Notify users of replies and likes
5. **Spam Prevention** - Rate limiting and content filtering
6. **Rich Text** - Support markdown or rich text in comments
7. **Mentions** - @mention other users in comments
8. **Search** - Full-text search across comments
9. **Soft Deletes** - Mark comments as deleted instead of removing
10. **Analytics** - Track engagement metrics over time

## Related Documentation

- [Comments Feature UI](./COMMENTS_FEATURE.md) - Frontend implementation
- [Content Backend](./CONTENT_BACKEND_SUMMARY.md) - Posts CRUD operations
- [Analytics Module](./ANALYTICS_MODULE.md) - Analytics and reporting
- [Database Schema](./supabase_analytics_schema.sql) - Complete database setup
- [Comments Migration](./supabase_comments_migration.sql) - Parent ID and policies
