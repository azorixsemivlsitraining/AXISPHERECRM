# Soft Delete Implementation & Status Update

## Summary of Changes

This document outlines the changes made to implement soft deletes for leads and salespersons, and update the lead status options.

### 1. What Changed

#### A. Database Schema Changes
- Added `is_deleted` boolean column (default: FALSE) to both `leads` and `salespersons` tables
- Created indexes on `is_deleted` column for better query performance
- See: `supabase/migrations/add_soft_delete.sql`

#### B. Status Options Updated
- **Old statuses**: "Not lifted", "Not connected", "Voice Message", "Quotation sent", "Site visit", "Advance payment", "Lead finished", "Contacted"
- **New statuses**: "No Stage", "Appointment Schedule", "Presentation Done", "Proposal", "Negotiation", "Evaluation", "Result"

#### C. Code Changes

**Files Modified:**
1. `client/hooks/useCRMStore.ts` - Updated `LeadStatus` type and added default status constant
2. `client/lib/supabase-db.ts` - Implemented soft deletes and filtering
3. `client/pages/Leads.tsx` - Updated status options and colors
4. Added `supabase/migrations/add_soft_delete.sql` - Migration script for database

### 2. How Soft Deletes Work

**Before:** When you deleted a lead or salesperson, it was permanently removed from Supabase.

**After:** When you delete a lead or salesperson:
1. A flag (`is_deleted = true`) is set on the record
2. The record stays in the database but is hidden from the UI
3. Data integrity is maintained - leads linked to deleted salespersons still work
4. Records can be recovered if needed (soft delete can be reversed)

### 3. What You Need to Do

#### CRITICAL STEP: Run the Migration in Supabase

**⚠️ This step is REQUIRED to make soft deletes work:**

1. Open your Supabase Dashboard
2. Go to **SQL Editor**
3. Click **"New Query"**
4. Copy and paste the SQL from `supabase/migrations/add_soft_delete.sql`:

```sql
-- Add is_deleted column to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

-- Add is_deleted column to salespersons table
ALTER TABLE salespersons ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_leads_is_deleted ON leads(is_deleted);
CREATE INDEX IF NOT EXISTS idx_salespersons_is_deleted ON salespersons(is_deleted);
```

5. Click **"Execute"** or press **Ctrl+Enter**
6. You should see a success message

#### Verification (Optional but Recommended)

After running the migration, verify the columns exist:

```sql
-- Verify leads table
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'leads' AND column_name = 'is_deleted';

-- Verify salespersons table
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'salespersons' AND column_name = 'is_deleted';
```

### 4. Testing the Changes

#### Test Soft Deletes
1. Create a new lead or salesperson
2. Click the delete button
3. Confirm the deletion
4. The record disappears from the UI
5. In Supabase SQL Editor, verify the record still exists but has `is_deleted = true`:

```sql
SELECT id, name, is_deleted FROM leads WHERE id = 'YOUR_LEAD_ID';
```

#### Test New Status Options
1. Create a new lead
2. You should see the new status options:
   - No Stage
   - Appointment Schedule
   - Presentation Done
   - Proposal
   - Negotiation
   - Evaluation
   - Result
3. All leads should now have one of these statuses instead of the old options

#### Test Page Refresh
1. Create a new lead
2. Change the lead status
3. Refresh the page (F5 or Ctrl+R)
4. The lead and its status should still be visible (not "not found")
5. This is because soft deletes don't remove the data

### 5. Why These Changes Matter

**Page "Not Found" Issue:**
- When you refreshed the page, it might have showed "not found" if your local state was out of sync
- With proper filtering of `is_deleted = false` records, pagination and filtering work correctly
- Data persists correctly on refresh

**Data Integrity:**
- Deleted records are never permanently removed
- Historical data is preserved for auditing
- Relationships to deleted records remain intact

**Business Continuity:**
- If a lead is assigned to a salesperson and that salesperson is deleted, the lead remains accessible
- Reports and analytics can include soft-deleted records if needed in the future

### 6. Rollback (If Needed)

If you need to restore a deleted lead or salesperson:

```sql
UPDATE leads SET is_deleted = FALSE WHERE id = 'LEAD_ID';
-- or
UPDATE salespersons SET is_deleted = FALSE WHERE id = 'SALESPERSON_ID';
```

Then refresh the application page.

### 7. Troubleshooting

**Problem: Still seeing "Not found" on refresh**
- Solution: Make sure you ran the migration in Supabase
- Clear your browser cache (Ctrl+Shift+Delete)
- Refresh the page (Ctrl+F5 for hard refresh)

**Problem: Old statuses still showing**
- Solution: This is expected if you had leads with old statuses
- The app will display them, but new leads will use the new statuses
- You can manually update old leads to use new statuses via the UI

**Problem: Cannot select new status options**
- Solution: Make sure your browser cache is cleared and the page is fully refreshed
- Check browser console (F12) for any JavaScript errors

## Questions or Issues?

If you encounter any issues with the migration:
1. Check Supabase SQL Editor for error messages
2. Verify the `is_deleted` column exists: `DESCRIBE leads;`
3. Ensure the tables are in the public schema
4. Check that no RLS policies are blocking the UPDATE operations
