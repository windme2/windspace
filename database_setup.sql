-- ============================================
-- WindSpace Database Setup
-- ============================================
-- สร้างวันที่: January 8, 2026
-- สำหรับ: Comments, Newsletter, Authors system
-- ============================================

-- 1. สร้าง Authors Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.authors (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    social_links JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- เพิ่ม author_id ใน articles table
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS author_id BIGINT REFERENCES public.authors(id) ON DELETE SET NULL;

-- สร้าง index สำหรับ author_id
CREATE INDEX IF NOT EXISTS idx_articles_author_id ON public.articles(author_id);

-- ============================================
-- 2. สร้าง Comments Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.comments (
    id BIGSERIAL PRIMARY KEY,
    article_id BIGINT NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
    author_name VARCHAR(255) NOT NULL,
    author_email VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT FALSE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- สร้าง indexes สำหรับ comments
CREATE INDEX IF NOT EXISTS idx_comments_article_id ON public.comments(article_id);
CREATE INDEX IF NOT EXISTS idx_comments_is_approved ON public.comments(is_approved);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at DESC);

-- ============================================
-- 3. สร้าง Newsletter Subscribers Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    subscription_source VARCHAR(100) DEFAULT 'website',
    ip_address VARCHAR(45),
    subscribed_at TIMESTAMPTZ DEFAULT NOW(),
    unsubscribed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- สร้าง indexes สำหรับ newsletter
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON public.newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_is_active ON public.newsletter_subscribers(is_active);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribed_at ON public.newsletter_subscribers(subscribed_at DESC);

-- ============================================
-- 4. เปิดใช้งาน Row Level Security (RLS)
-- ============================================

-- Authors RLS
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view authors" 
ON public.authors FOR SELECT 
USING (true);

CREATE POLICY "Only authenticated users can insert authors" 
ON public.authors FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can update authors" 
ON public.authors FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Comments RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved comments" 
ON public.comments FOR SELECT 
USING (is_approved = true);

CREATE POLICY "Service role can view all comments" 
ON public.comments FOR SELECT 
USING (auth.role() = 'service_role');

CREATE POLICY "Anyone can insert comments" 
ON public.comments FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Only authenticated users can update comments" 
ON public.comments FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can delete comments" 
ON public.comments FOR DELETE 
USING (auth.role() = 'authenticated');

-- Newsletter Subscribers RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only authenticated users can view subscribers" 
ON public.newsletter_subscribers FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can subscribe" 
ON public.newsletter_subscribers FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can unsubscribe with their email" 
ON public.newsletter_subscribers FOR UPDATE 
USING (true);

-- ============================================
-- 5. สร้าง Functions และ Triggers
-- ============================================

-- Function สำหรับ update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers สำหรับ authors
DROP TRIGGER IF EXISTS update_authors_updated_at ON public.authors;
CREATE TRIGGER update_authors_updated_at
    BEFORE UPDATE ON public.authors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Triggers สำหรับ comments
DROP TRIGGER IF EXISTS update_comments_updated_at ON public.comments;
CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON public.comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Triggers สำหรับ newsletter_subscribers
DROP TRIGGER IF EXISTS update_newsletter_subscribers_updated_at ON public.newsletter_subscribers;
CREATE TRIGGER update_newsletter_subscribers_updated_at
    BEFORE UPDATE ON public.newsletter_subscribers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. เพิ่มข้อมูล Sample Authors
-- ============================================
INSERT INTO public.authors (name, email, bio, avatar_url, social_links) VALUES
('Somchai Jaidee', 'somchai@windspace.com', 'Food enthusiast and Bangkok restaurant expert. Love exploring street food and fine dining.', 'https://i.pravatar.cc/150?img=12', '{"twitter": "@somchai_food", "instagram": "@somchai.eats"}'),
('Naphat Wandee', 'naphat@windspace.com', 'Travel blogger who loves discovering hidden gems around Thailand and Asia.', 'https://i.pravatar.cc/150?img=5', '{"twitter": "@naphat_travel", "instagram": "@naphat.travels"}'),
('Ploy Wellness', 'ploy@windspace.com', 'Lifestyle coach focusing on wellness, mindfulness, and sustainable living.', 'https://i.pravatar.cc/150?img=9', '{"twitter": "@ploy_wellness", "instagram": "@ploy.lifestyle"}'),
('Krit Techie', 'krit@windspace.com', 'Tech journalist covering AI, gadgets, and digital innovation in Thailand.', 'https://i.pravatar.cc/150?img=15', '{"twitter": "@krit_tech", "instagram": "@krit.tech"}')
ON CONFLICT (email) DO NOTHING;

-- กำหนด author_id ให้กับบทความที่มีอยู่ (ตามหมวดหมู่)
UPDATE public.articles 
SET author_id = (SELECT id FROM public.authors WHERE email = 'somchai@windspace.com')
WHERE category_id = 1 AND author_id IS NULL; -- Food

UPDATE public.articles 
SET author_id = (SELECT id FROM public.authors WHERE email = 'naphat@windspace.com')
WHERE category_id = 2 AND author_id IS NULL; -- Travel

UPDATE public.articles 
SET author_id = (SELECT id FROM public.authors WHERE email = 'ploy@windspace.com')
WHERE category_id = 3 AND author_id IS NULL; -- Lifestyle

UPDATE public.articles 
SET author_id = (SELECT id FROM public.authors WHERE email = 'krit@windspace.com')
WHERE category_id = 4 AND author_id IS NULL; -- Technology

-- ============================================
-- 7. เพิ่มข้อมูล Sample Comments (สำหรับทดสอบ)
-- ============================================
INSERT INTO public.comments (article_id, author_name, author_email, content, is_approved) VALUES
(3, 'John Doe', 'john@example.com', 'Great article! Very informative and well-written.', true),
(3, 'Jane Smith', 'jane@example.com', 'Thanks for sharing this. Looking forward to more content!', true),
(5, 'Mike Wilson', 'mike@example.com', 'This is exactly what I was looking for. Thank you!', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- 8. สร้าง Views สำหรับ Analytics
-- ============================================

-- View: Comments count per article
CREATE OR REPLACE VIEW article_comments_count AS
SELECT 
    article_id,
    COUNT(*) as total_comments,
    COUNT(CASE WHEN is_approved THEN 1 END) as approved_comments
FROM public.comments
GROUP BY article_id;

-- View: Newsletter statistics
CREATE OR REPLACE VIEW newsletter_stats AS
SELECT 
    COUNT(*) as total_subscribers,
    COUNT(CASE WHEN is_active THEN 1 END) as active_subscribers,
    COUNT(CASE WHEN NOT is_active THEN 1 END) as inactive_subscribers,
    COUNT(CASE WHEN subscribed_at > NOW() - INTERVAL '30 days' THEN 1 END) as new_this_month
FROM public.newsletter_subscribers;

-- ============================================
-- DONE! ✅
-- ============================================
-- คำสั่งที่สร้าง:
-- ✅ authors table (4 sample authors)
-- ✅ comments table (with RLS)
-- ✅ newsletter_subscribers table (with RLS)
-- ✅ author_id column in articles
-- ✅ Indexes สำหรับ performance
-- ✅ RLS Policies สำหรับ security
-- ✅ Triggers สำหรับ auto-update timestamps
-- ✅ Views สำหรับ analytics
-- ============================================
