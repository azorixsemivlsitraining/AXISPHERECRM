# Invoice Management Feature - Setup Guide

This guide will help you set up the invoice management feature in your Axisphere CRM application.

## Features

The invoice management system includes:

- **Package Management**: Pre-defined AI marketing packages (Starter, Growth, Enterprise)
- **Invoice Creation**: Create invoices with customer details and selected package features
- **Multi-page Invoice Display**: 
  - Page 1: Professional invoice bill with pricing
  - Page 2: Scope and features included in the package
- **PDF Export**: Download invoices as PDF files
- **Invoice Management**: View, list, and delete invoices

## Step 1: Create the Invoices Table in Supabase

1. Go to your Supabase project dashboard
2. Navigate to the **SQL Editor**
3. Click **New Query**
4. Copy and paste the entire content from `supabase/invoices-table.sql`
5. Click **Run**

### Expected Database Structure

The `invoices` table will have the following columns:

- `id` (UUID) - Primary key
- `invoice_number` (VARCHAR) - Unique invoice identifier (e.g., AXI-202501-00123)
- `full_name` (VARCHAR) - Customer's full name
- `email` (VARCHAR) - Customer's email
- `phone_number` (VARCHAR) - Customer's phone number
- `company_name` (VARCHAR) - Customer's company name
- `package_id` (VARCHAR) - Selected package ID
- `package_name` (VARCHAR) - Selected package name
- `package_price` (NUMERIC) - Package price in rupees
- `scope` (JSONB) - Array of selected features with inclusion status
- `paid_amount` (NUMERIC) - Amount to be paid
- `additional_notes` (TEXT) - Optional additional notes
- `tax_percentage` (NUMERIC) - Tax percentage (default 18%)
- `created_at` (TIMESTAMP) - Invoice creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

## Step 2: Verify RLS Policies

After running the SQL migration, verify that the Row Level Security (RLS) policies are created:

1. In Supabase dashboard, go to **Authentication** → **Policies**
2. Select the `invoices` table
3. You should see three policies:
   - "Allow authenticated users to view invoices" (SELECT)
   - "Allow authenticated users to insert invoices" (INSERT)
   - "Allow authenticated users to delete invoices" (DELETE)

If policies are not showing, they may already be enabled from the migration script.

## Step 3: Access the Invoice Feature

### Admin Panel - Invoice Tab

1. Log in as an admin user
2. Navigate to the Admin Panel (`/admin`)
3. Click on the **Invoices** tab
4. View all available packages:
   - **AI Starter Package** (₹30,000/month)
   - **AI Growth Package** (₹75,000/month)
   - **AI Enterprise Package** (₹150,000/month)

### Create an Invoice

1. Click **Create Invoice** button on any package
2. Fill in customer details:
   - Full Name
   - Email Address
   - Phone Number
   - Company Name
3. Select which features to include (all features are selected by default)
4. Set the paid amount (defaults to package price)
5. Add optional additional notes
6. Click **Create & View Invoice**

### View Invoice

The invoice displays in two pages:

**Page 1 - Bill:**
- Company header with logo
- Invoice number and dates
- Bill to (customer) section
- Payment terms
- Item details table with pricing
- Subtotal, tax (18% GST), and total amount
- Footer with contact information

**Page 2 - Scope & Features:**
- Package name and description
- All available features in a grid layout
- Selected features are marked with a green checkmark
- Additional notes section (if provided)

### Download PDF

Click the **Download PDF** button to save the invoice as a PDF file. The PDF includes both pages and can be shared with customers.

### View All Invoices

1. From the Admin Panel Invoice tab, click **View All Invoices**
2. See a table with all created invoices showing:
   - Invoice number
   - Customer name
   - Company name
   - Package name
   - Total amount (with tax)
   - Creation date
   - Action buttons (View, Delete)

## Step 4: Customization

### Modify Package Details

To change package names, prices, or features, edit the `client/lib/packages.ts` file:

```typescript
export const PACKAGES: Package[] = [
  {
    id: "starter",
    name: "Your Package Name",
    price: 50000,
    description: "Your description",
    monthlyLabel: "/month",
    features: [
      "Feature 1",
      "Feature 2",
      // ... add more features
    ],
  },
  // ... add more packages
];
```

### Customize Invoice Header

The company information displayed in invoices is configured in `client/pages/InvoiceView.tsx`:

```typescript
const companyInfo = {
  name: "Your Company Name",
  address: "Your Address",
  logo: "https://your-logo-url",
};
```

## Troubleshooting

### "Invoices table does not exist" error

**Solution:** Run the SQL migration from `supabase/invoices-table.sql` in your Supabase SQL Editor.

### "Permission denied" when creating invoices

**Solution:** 
1. Make sure RLS policies are created for the `invoices` table
2. Verify you're logged in as an authenticated user
3. Check that your Supabase session is active

### PDF download not working

**Possible causes:**
- Browser pop-up blockers blocking the download
- JavaScript errors in the console (check F12 developer tools)
- The html2pdf.js library may not be properly installed

**Solution:**
```bash
pnpm add html2pdf.js
```

### Invoice number format is incorrect

The invoice number is automatically generated in format: `AXI-YYYYMM-XXXXX` where:
- `AXI` = Company prefix
- `YYYYMM` = Year and month
- `XXXXX` = Random 5-digit number

To change this format, edit the `addInvoice` function in `client/lib/supabase-db.ts`.

## Features Overview

### Invoice Types

The system currently supports:
- Full package invoices with all features included
- Partial package invoices with selective features
- Custom pricing with automatic tax calculation (18% GST)

### Invoice Numbers

- **Format**: AXI-YYYYMM-XXXXX (e.g., AXI-202501-00123)
- **Auto-generated**: Unique number created for each invoice
- **Database**: Stored in the `invoices` table for reference

### Payment Information

- Package price with GST calculation (18% by default)
- Paid amount tracking
- Payment terms (30 days default)
- Due date calculation (30 days from creation)

## API Endpoints (Optional Backend Integration)

If you need to integrate with backend services, the following functions are available in `client/lib/supabase-db.ts`:

- `getInvoices()` - Fetch all invoices
- `addInvoice(invoice)` - Create new invoice
- `getInvoiceById(id)` - Fetch specific invoice
- `deleteInvoice(id)` - Delete invoice

## Next Steps

1. ✅ Create the invoices table in Supabase
2. ✅ Access the Admin Panel and try creating an invoice
3. ✅ Download and view PDF invoices
4. 🔄 Customize packages and company details to match your business
5. 🔄 Integrate with your email system to send invoices to customers

## Support

For issues or questions about the invoice feature:

1. Check the troubleshooting section above
2. Review the error messages in browser console (F12)
3. Verify Supabase table structure and RLS policies
4. Check that all components and dependencies are properly installed

## Database Backup

Before making changes to the invoices table:

1. Export your invoices data from Supabase Dashboard
2. Keep backups of important invoices as PDF files
3. Test changes in a development environment first
