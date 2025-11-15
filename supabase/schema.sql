-- Create salespersons table
CREATE TABLE IF NOT EXISTS salespersons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apollo_id TEXT,
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

-- Create leads table with note and next_reminder_date fields
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  job_title TEXT,
  company TEXT,
  email TEXT,
  phone_numbers TEXT[],
  actions TEXT[],
  links TEXT[],
  locations TEXT[],
  company_employees TEXT,
  company_industries TEXT[],
  company_keywords TEXT[],
  assigned_to UUID REFERENCES salespersons(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'Not lifted',
  note TEXT,
  next_reminder_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_next_reminder_date ON leads(next_reminder_date);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_salespersons_auth_id ON salespersons(auth_id);
CREATE INDEX IF NOT EXISTS idx_companies_apollo_id ON companies(apollo_id);

-- Enable Row Level Security
ALTER TABLE salespersons ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Policies for salespersons table
-- Users can see all salespersons
CREATE POLICY "Allow users to view all salespersons" ON salespersons
  FOR SELECT USING (true);

-- Users can only insert their own salesperson record
CREATE POLICY "Allow users to insert their own record" ON salespersons
  FOR INSERT WITH CHECK (auth_id = auth.uid());

-- Users can only update their own record
CREATE POLICY "Allow users to update their own record" ON salespersons
  FOR UPDATE USING (auth_id = auth.uid());

-- Policies for leads table
-- Salespersons can view all leads (admin view) or their assigned leads
-- For now, we allow viewing all leads - you can restrict this later
CREATE POLICY "Allow users to view all leads" ON leads
  FOR SELECT USING (true);

-- Salespersons can insert leads
CREATE POLICY "Allow salespersons to insert leads" ON leads
  FOR INSERT WITH CHECK (true);

-- Salespersons can update assigned leads
CREATE POLICY "Allow salespersons to update assigned leads" ON leads
  FOR UPDATE USING (
    assigned_to = (
      SELECT id FROM salespersons 
      WHERE auth_id = auth.uid()
      LIMIT 1
    )
  );

-- Salespersons can delete assigned leads
CREATE POLICY "Allow salespersons to delete assigned leads" ON leads
  FOR DELETE USING (
    assigned_to = (
      SELECT id FROM salespersons 
      WHERE auth_id = auth.uid()
      LIMIT 1
    )
  );

-- Policies for companies table
CREATE POLICY "Allow users to view all companies" ON companies
  FOR SELECT USING (true);

CREATE POLICY "Allow users to insert companies" ON companies
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow users to delete companies" ON companies
  FOR DELETE USING (true);
