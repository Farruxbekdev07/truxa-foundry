-- Add new columns for complete startup information
ALTER TABLE public.startups 
ADD COLUMN IF NOT EXISTS target_market TEXT,
ADD COLUMN IF NOT EXISTS problem TEXT,
ADD COLUMN IF NOT EXISTS solution TEXT,
ADD COLUMN IF NOT EXISTS team_info TEXT;