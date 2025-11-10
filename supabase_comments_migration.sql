-- Migration to add parent_id column to comments table for nested replies
-- Run this SQL in your Supabase SQL Editor if the parent_id column doesn't exist

-- Add parent_id column to comments table (nullable for top-level comments)
ALTER TABLE comments ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES comments(id) ON DELETE CASCADE;

-- Create index on parent_id for better query performance
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);

-- Update RLS policy for comments to ensure users can read replies
-- This policy already exists but we're ensuring it covers replies properly
DROP POLICY IF EXISTS "Anyone can read comments on published posts" ON comments;
CREATE POLICY "Anyone can read comments on published posts" ON comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = comments.post_id
      AND posts.status = 'published'
    )
  );

-- Allow post authors to delete any comment on their posts
DROP POLICY IF EXISTS "Post authors can delete comments on their posts" ON comments;
CREATE POLICY "Post authors can delete comments on their posts" ON comments
  FOR DELETE
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = comments.post_id
      AND posts.author_id = auth.uid()
    )
  );
