-- Create LEADS table
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  job_title TEXT,
  company TEXT,
  email TEXT,
  phone_numbers TEXT[] DEFAULT '{}',
  actions TEXT[] DEFAULT '{}',
  links TEXT[] DEFAULT '{}',
  locations TEXT[] DEFAULT '{}',
  company_employees TEXT,
  company_industries TEXT[] DEFAULT '{}',
  company_keywords TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create SALESPERSONS table
CREATE TABLE IF NOT EXISTS public.salespersons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create COMPANIES table
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  apollo_id TEXT UNIQUE,
  name TEXT NOT NULL,
  domain TEXT,
  industry TEXT,
  employee_count INTEGER,
  employee_count_range TEXT,
  revenue BIGINT,
  revenue_range TEXT,
  logo_url TEXT,
  linkedin_url TEXT,
  crunchbase_url TEXT,
  founded_year INTEGER,
  hq_address TEXT,
  countries TEXT[],
  website TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salespersons ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all operations for now - adjust in production)
-- For LEADS table
CREATE POLICY "Enable insert for all users" ON public.leads
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable select for all users" ON public.leads
  FOR SELECT
  USING (true);

CREATE POLICY "Enable update for all users" ON public.leads
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for all users" ON public.leads
  FOR DELETE
  USING (true);

-- For SALESPERSONS table
CREATE POLICY "Enable insert for all users" ON public.salespersons
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable select for all users" ON public.salespersons
  FOR SELECT
  USING (true);

CREATE POLICY "Enable update for all users" ON public.salespersons
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for all users" ON public.salespersons
  FOR DELETE
  USING (true);

-- For COMPANIES table
CREATE POLICY "Enable insert for all users" ON public.companies
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable select for all users" ON public.companies
  FOR SELECT
  USING (true);

CREATE POLICY "Enable update for all users" ON public.companies
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for all users" ON public.companies
  FOR DELETE
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_company ON public.leads(company);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_salespersons_created_at ON public.salespersons(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_salespersons_email ON public.salespersons(email);
