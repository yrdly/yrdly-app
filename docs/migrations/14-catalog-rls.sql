-- Catalog Items Row Level Security Policies
-- Enable RLS on catalog_items table

ALTER TABLE catalog_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view catalog items" ON catalog_items;
DROP POLICY IF EXISTS "Business owners can insert catalog items" ON catalog_items;
DROP POLICY IF EXISTS "Business owners can update catalog items" ON catalog_items;
DROP POLICY IF EXISTS "Business owners can delete catalog items" ON catalog_items;

-- Everyone can view catalog items
CREATE POLICY "Anyone can view catalog items" ON catalog_items
FOR SELECT USING (true);

-- Business owners can insert catalog items
CREATE POLICY "Business owners can insert catalog items" ON catalog_items
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM businesses 
    WHERE id = business_id 
    AND owner_id = auth.uid()
  )
);

-- Business owners can update their catalog items
CREATE POLICY "Business owners can update catalog items" ON catalog_items
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM businesses 
    WHERE id = business_id 
    AND owner_id = auth.uid()
  )
);

-- Business owners can delete their catalog items
CREATE POLICY "Business owners can delete catalog items" ON catalog_items
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM businesses 
    WHERE id = business_id 
    AND owner_id = auth.uid()
  )
);

-- Create storage bucket for catalog item images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('catalog-items', 'catalog-items', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for catalog-items bucket
CREATE POLICY "Anyone can view catalog item images"
ON storage.objects FOR SELECT
USING (bucket_id = 'catalog-items');

CREATE POLICY "Authenticated users can upload catalog item images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'catalog-items' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own catalog item images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'catalog-items' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own catalog item images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'catalog-items' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

