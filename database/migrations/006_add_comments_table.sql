-- Create comments table for article comments
CREATE TABLE IF NOT EXISTS comments (
  id BIGSERIAL PRIMARY KEY,
  article_id BIGINT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  author_name VARCHAR(100) NOT NULL,
  author_email VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_comments_article_id ON comments(article_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- Add RLS (Row Level Security) policies
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read approved comments
CREATE POLICY "Anyone can read approved comments"
  ON comments
  FOR SELECT
  USING (status = 'approved');

-- Policy: Anyone can insert comments (will be pending by default)
CREATE POLICY "Anyone can insert comments"
  ON comments
  FOR INSERT
  WITH CHECK (status = 'pending');

-- Policy: Only authenticated users can update/delete comments (admin feature)
-- Note: You'll need to adjust this based on your auth system
CREATE POLICY "Authenticated users can manage comments"
  ON comments
  FOR ALL
  USING (
    -- This assumes you have auth.role() function from Supabase
    -- Adjust based on your authentication setup
    current_setting('request.jwt.claims', true)::json->>'role' = 'authenticated'
  );

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_comments_timestamp
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_comments_updated_at();

-- Add comment to table
COMMENT ON TABLE comments IS 'Stores user comments for articles';
COMMENT ON COLUMN comments.status IS 'Comment moderation status: pending, approved, or rejected';
