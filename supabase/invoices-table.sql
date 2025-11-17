-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  package_id VARCHAR(50) NOT NULL,
  package_name VARCHAR(255) NOT NULL,
  package_price NUMERIC(12, 2) NOT NULL,
  scope JSONB DEFAULT '[]'::jsonb,
  paid_amount NUMERIC(12, 2) NOT NULL,
  additional_notes TEXT,
  tax_percentage NUMERIC(5, 2) DEFAULT 18.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on invoice_number for faster lookups
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);

-- Create index on created_at for sorting
CREATE INDEX idx_invoices_created_at ON invoices(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to allow authenticated users to view all invoices
CREATE POLICY "Allow authenticated users to view invoices" 
ON invoices FOR SELECT 
TO authenticated 
USING (true);

-- Create RLS policy to allow authenticated users to insert invoices
CREATE POLICY "Allow authenticated users to insert invoices" 
ON invoices FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Create RLS policy to allow authenticated users to delete invoices
CREATE POLICY "Allow authenticated users to delete invoices" 
ON invoices FOR DELETE 
TO authenticated 
USING (true);

-- Grant permissions to authenticated role
GRANT SELECT, INSERT, DELETE ON invoices TO authenticated;
