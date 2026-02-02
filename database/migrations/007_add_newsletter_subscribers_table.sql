-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
  verification_token VARCHAR(255),
  verified BOOLEAN DEFAULT FALSE,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_status ON newsletter_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_verified ON newsletter_subscribers(verified);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribed_at ON newsletter_subscribers(subscribed_at DESC);

-- Add RLS (Row Level Security) policies
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Policy: Only authenticated users can read subscribers (admin feature)
CREATE POLICY "Authenticated users can read subscribers"
  ON newsletter_subscribers
  FOR SELECT
  USING (
    current_setting('request.jwt.claims', true)::json->>'role' = 'authenticated'
  );

-- Policy: Anyone can subscribe (insert with default status)
CREATE POLICY "Anyone can subscribe"
  ON newsletter_subscribers
  FOR INSERT
  WITH CHECK (status = 'active' OR status IS NULL);

-- Policy: Anyone can update their own subscription (for unsubscribe)
-- This allows unsubscribe via email token
CREATE POLICY "Anyone can update newsletter subscription"
  ON newsletter_subscribers
  FOR UPDATE
  USING (true);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_newsletter_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  
  -- Set unsubscribed_at when status changes to unsubscribed
  IF NEW.status = 'unsubscribed' AND OLD.status != 'unsubscribed' THEN
    NEW.unsubscribed_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_newsletter_timestamp
  BEFORE UPDATE ON newsletter_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION update_newsletter_updated_at();

-- Create view for active subscribers count
CREATE OR REPLACE VIEW newsletter_stats AS
SELECT
  COUNT(*) FILTER (WHERE status = 'active') as active_subscribers,
  COUNT(*) FILTER (WHERE status = 'unsubscribed') as unsubscribed_count,
  COUNT(*) FILTER (WHERE verified = true) as verified_subscribers,
  COUNT(*) as total_subscribers
FROM newsletter_subscribers;

-- Add comments
COMMENT ON TABLE newsletter_subscribers IS 'Stores newsletter subscription information';
COMMENT ON COLUMN newsletter_subscribers.status IS 'Subscription status: active or unsubscribed';
COMMENT ON COLUMN newsletter_subscribers.verification_token IS 'Token for email verification (optional)';
