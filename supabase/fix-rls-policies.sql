-- Drop existing policies on salespersons table
DROP POLICY IF EXISTS "Allow users to view all salespersons" ON salespersons;
DROP POLICY IF EXISTS "Allow users to insert their own record" ON salespersons;
DROP POLICY IF EXISTS "Allow users to update their own record" ON salespersons;

-- Drop existing policies on leads table
DROP POLICY IF EXISTS "Allow users to view all leads" ON leads;
DROP POLICY IF EXISTS "Allow salespersons to insert leads" ON leads;
DROP POLICY IF EXISTS "Allow salespersons to update assigned leads" ON leads;
DROP POLICY IF EXISTS "Allow salespersons to delete assigned leads" ON leads;

-- Drop existing policies on companies table
DROP POLICY IF EXISTS "Allow users to view all companies" ON companies;
DROP POLICY IF EXISTS "Allow users to insert companies" ON companies;
DROP POLICY IF EXISTS "Allow users to delete companies" ON companies;

-- ============================================
-- SALESPERSONS TABLE POLICIES
-- ============================================

-- Allow anyone to view salespersons (no auth required for SELECT)
CREATE POLICY "Allow anyone to view salespersons" ON salespersons
  FOR SELECT USING (true);

-- Allow anyone to insert a new salesperson record (for signup)
-- This is safe because we validate email uniqueness at DB level
CREATE POLICY "Allow anyone to register" ON salespersons
  FOR INSERT WITH CHECK (true);

-- Allow users to update only their own record
CREATE POLICY "Allow users to update own record" ON salespersons
  FOR UPDATE USING (auth_id = auth.uid());

-- ============================================
-- LEADS TABLE POLICIES
-- ============================================

-- Allow authenticated users to view all leads
CREATE POLICY "Allow authenticated users to view leads" ON leads
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert leads
CREATE POLICY "Allow authenticated users to insert leads" ON leads
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update only leads assigned to them
CREATE POLICY "Allow users to update assigned leads" ON leads
  FOR UPDATE USING (
    assigned_to = (
      SELECT id FROM salespersons 
      WHERE auth_id = auth.uid()
      LIMIT 1
    ) OR assigned_to IS NULL
  );

-- Allow users to delete only leads assigned to them
CREATE POLICY "Allow users to delete assigned leads" ON leads
  FOR DELETE USING (
    assigned_to = (
      SELECT id FROM salespersons 
      WHERE auth_id = auth.uid()
      LIMIT 1
    ) OR assigned_to IS NULL
  );

-- ============================================
-- COMPANIES TABLE POLICIES
-- ============================================

-- Allow authenticated users to view companies
CREATE POLICY "Allow authenticated users to view companies" ON companies
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert companies
CREATE POLICY "Allow authenticated users to insert companies" ON companies
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to delete companies
CREATE POLICY "Allow authenticated users to delete companies" ON companies
  FOR DELETE USING (auth.role() = 'authenticated');
