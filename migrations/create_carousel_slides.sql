-- Create carousel_slides table
CREATE TABLE IF NOT EXISTS carousel_slides (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    media_url TEXT NOT NULL,
    media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
    alt_text TEXT DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for efficient public queries (active slides sorted by order)
CREATE INDEX idx_carousel_slides_active_order ON carousel_slides (is_active, sort_order);

-- Enable RLS
ALTER TABLE carousel_slides ENABLE ROW LEVEL SECURITY;

-- Public can read active slides
CREATE POLICY "Public can view active carousel slides"
    ON carousel_slides FOR SELECT
    USING (is_active = true);

-- Authenticated users can read all slides (for admin panel)
CREATE POLICY "Authenticated users can view all carousel slides"
    ON carousel_slides FOR SELECT
    TO authenticated
    USING (true);

-- Authenticated users can insert slides
CREATE POLICY "Authenticated users can insert carousel slides"
    ON carousel_slides FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Authenticated users can update slides
CREATE POLICY "Authenticated users can update carousel slides"
    ON carousel_slides FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Authenticated users can delete slides
CREATE POLICY "Authenticated users can delete carousel slides"
    ON carousel_slides FOR DELETE
    TO authenticated
    USING (true);

-- Storage bucket for carousel media (run in Supabase dashboard or via SQL)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('carousel-media', 'carousel-media', true);

-- Storage policies for carousel-media bucket
-- Public read access
-- CREATE POLICY "Public can view carousel media"
--     ON storage.objects FOR SELECT
--     USING (bucket_id = 'carousel-media');

-- Authenticated users can upload
-- CREATE POLICY "Authenticated users can upload carousel media"
--     ON storage.objects FOR INSERT
--     TO authenticated
--     WITH CHECK (bucket_id = 'carousel-media');

-- Authenticated users can delete
-- CREATE POLICY "Authenticated users can delete carousel media"
--     ON storage.objects FOR DELETE
--     TO authenticated
--     USING (bucket_id = 'carousel-media');
