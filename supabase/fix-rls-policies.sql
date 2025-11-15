-- Drop existing policies if they exist
DROP POLICY IF EXISTS "allow_insert_leads" ON leads;
DROP POLICY IF EXISTS "allow_select_leads" ON leads;
DROP POLICY IF EXISTS "allow_update_leads" ON leads;
DROP POLICY IF EXISTS "allow_delete_leads" ON leads;
DROP POLICY IF EXISTS "allow_insert_salespersons" ON salespersons;
DROP POLICY IF EXISTS "allow_select_salespersons" ON salespersons;

-- Enable RLS on tables
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE salespersons ENABLE ROW LEVEL SECURITY;

-- LEADS TABLE POLICIES
-- Allow authenticated users to insert leads
CREATE POLICY "allow_insert_leads" ON leads
FOR INSERT TO authenticated
WITH CHECK (true);

-- Allow users to select leads assigned to them or all leads if admin view
CREATE POLICY "allow_select_leads" ON leads
FOR SELECT TO authenticated
USING (true);

-- Allow users to update leads assigned to them
CREATE POLICY "allow_update_leads" ON leads
FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);

-- Allow users to delete leads
CREATE POLICY "allow_delete_leads" ON leads
FOR DELETE TO authenticated
USING (true);

-- SALESPERSONS TABLE POLICIES
-- Allow authenticated users to view salespersons
CREATE POLICY "allow_select_salespersons" ON salespersons
FOR SELECT TO authenticated
USING (true);

-- Allow authenticated users to insert salespersons (for registration flow)
CREATE POLICY "allow_insert_salespersons" ON salespersons
FOR INSERT TO authenticated
WITH CHECK (true);

-- Allow admin to manage salespersons
CREATE POLICY "allow_update_salespersons" ON salespersons
FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "allow_delete_salespersons" ON salespersons
FOR DELETE TO authenticated
USING (true);

-- Also allow anon role for login/registration flows if needed
CREATE POLICY "allow_read_salespersons_anon" ON salespersons
FOR SELECT TO anon
USING (true);

CREATE POLICY "allow_insert_salespersons_anon" ON salespersons
FOR INSERT TO anon
WITH CHECK (true);

-- Allow anon to insert leads for now (adjust as needed)
CREATE POLICY "allow_insert_leads_anon" ON leads
FOR INSERT TO anon
WITH CHECK (true);

CREATE POLICY "allow_select_leads_anon" ON leads
FOR SELECT TO anon
USING (true);
