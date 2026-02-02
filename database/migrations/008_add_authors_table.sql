-- Create authors table
CREATE TABLE IF NOT EXISTS authors (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE,
  bio TEXT,
  avatar_url VARCHAR(500),
  social_links JSONB DEFAULT '{}'::jsonb,
  slug VARCHAR(100) UNIQUE NOT NULL,
  article_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_authors_slug ON authors(slug);
CREATE INDEX IF NOT EXISTS idx_authors_email ON authors(email);
CREATE INDEX IF NOT EXISTS idx_authors_article_count ON authors(article_count DESC);

-- Add author_id column to articles table
ALTER TABLE articles
ADD COLUMN IF NOT EXISTS author_id BIGINT REFERENCES authors(id) ON DELETE SET NULL;

-- Create index for articles.author_id
CREATE INDEX IF NOT EXISTS idx_articles_author_id ON articles(author_id);

-- Add RLS (Row Level Security) policies
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read authors
CREATE POLICY "Anyone can read authors"
  ON authors
  FOR SELECT
  USING (true);

-- Policy: Only authenticated users can manage authors (admin feature)
CREATE POLICY "Authenticated users can manage authors"
  ON authors
  FOR ALL
  USING (
    current_setting('request.jwt.claims', true)::json->>'role' = 'authenticated'
  );

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_authors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_authors_timestamp
  BEFORE UPDATE ON authors
  FOR EACH ROW
  EXECUTE FUNCTION update_authors_updated_at();

-- Create function to update article_count when articles are added/removed
CREATE OR REPLACE FUNCTION update_author_article_count()
RETURNS TRIGGER AS $$
BEGIN
  -- When article is inserted
  IF TG_OP = 'INSERT' AND NEW.author_id IS NOT NULL THEN
    UPDATE authors 
    SET article_count = article_count + 1 
    WHERE id = NEW.author_id;
  END IF;
  
  -- When article is updated (author changed)
  IF TG_OP = 'UPDATE' THEN
    IF OLD.author_id IS NOT NULL AND OLD.author_id != NEW.author_id THEN
      UPDATE authors 
      SET article_count = article_count - 1 
      WHERE id = OLD.author_id;
    END IF;
    
    IF NEW.author_id IS NOT NULL AND OLD.author_id != NEW.author_id THEN
      UPDATE authors 
      SET article_count = article_count + 1 
      WHERE id = NEW.author_id;
    END IF;
  END IF;
  
  -- When article is deleted
  IF TG_OP = 'DELETE' AND OLD.author_id IS NOT NULL THEN
    UPDATE authors 
    SET article_count = article_count - 1 
    WHERE id = OLD.author_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on articles table
CREATE TRIGGER update_article_count
  AFTER INSERT OR UPDATE OR DELETE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_author_article_count();

-- Insert default authors (examples)
INSERT INTO authors (name, email, bio, slug, social_links) VALUES
(
  'วีรวัฒน์ สุขสันต์',
  'veerawat@windspace.blog',
  'นักเขียนและบล็อกเกอร์ที่หลงใหลในเทคโนโลยีและนวัตกรรม มีประสบการณ์ในวงการ IT มากกว่า 10 ปี',
  'veerawat-suksan',
  '{"twitter": "@veerawat_tech", "linkedin": "veerawat-suksan", "github": "veerawat"}'::jsonb
),
(
  'นภัส สมชาติ',
  'napas@windspace.blog',
  'Food blogger และ lifestyle writer ที่รักการสำรวจร้านอาหารและวัฒนธรรมการกินทั่วโลก',
  'napas-somchat',
  '{"instagram": "@napas_foodie", "facebook": "napasfoodblog"}'::jsonb
),
(
  'สมชาย เที่ยวสนุก',
  'somchai@windspace.blog',
  'Travel writer มืออาชีพที่เดินทางไปทั่วโลกมากกว่า 50 ประเทศ แบ่งปันประสบการณ์และเคล็ดลับการเดินทาง',
  'somchai-thiewsanuk',
  '{"instagram": "@somchai_travel", "youtube": "somchaitravelstories"}'::jsonb
),
(
  'พิมพ์ชนก ชีวิตดี',
  'pimchanok@windspace.blog',
  'Lifestyle coach และนักเขียนด้านสุขภาพและความเป็นอยู่ที่ดี มุ่งมั่นสร้างแรงบันดาลใจให้ผู้คนมีชีวิตที่สมดุล',
  'pimchanok-cheewit',
  '{"instagram": "@pim_lifestyle", "tiktok": "@pimwellness"}'::jsonb
);

-- Add comments
COMMENT ON TABLE authors IS 'Stores article author information';
COMMENT ON COLUMN authors.social_links IS 'JSON object containing social media links (twitter, instagram, facebook, etc.)';
COMMENT ON COLUMN authors.article_count IS 'Cached count of articles written by this author';
