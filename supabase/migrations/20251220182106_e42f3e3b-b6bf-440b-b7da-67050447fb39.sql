-- Add unique constraint to ensure one startup per founder
ALTER TABLE public.startups ADD CONSTRAINT startups_founder_id_unique UNIQUE (founder_id);