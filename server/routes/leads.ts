import { RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Debug: log if keys are loaded
console.log("[Leads Route] Supabase URL loaded:", !!supabaseUrl);
console.log("[Leads Route] Service Role Key loaded:", !!supabaseServiceKey);

if (!supabaseUrl) {
  console.error("Missing VITE_SUPABASE_URL on server");
}

// Create server-side Supabase client with service role key (bypasses RLS)
const adminSupabase =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

export const handleUpdateLead: RequestHandler = async (req, res) => {
  try {
    if (!adminSupabase) {
      return res.status(500).json({
        error: "Server configuration error: service role key not configured",
        details: "SUPABASE_SERVICE_ROLE_KEY is not set",
      });
    }

    const { leadId, updates } = req.body;

    if (!leadId || !updates) {
      return res.status(400).json({
        error: "Missing required fields: leadId and updates",
      });
    }

    // Map camelCase to snake_case for database
    const updateData: any = {};

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.jobTitle !== undefined) updateData.job_title = updates.jobTitle;
    if (updates.company !== undefined) updateData.company = updates.company;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.phoneNumbers !== undefined)
      updateData.phone_numbers = updates.phoneNumbers;
    if (updates.actions !== undefined) updateData.actions = updates.actions;
    if (updates.links !== undefined) updateData.links = updates.links;
    if (updates.locations !== undefined)
      updateData.locations = updates.locations;
    if (updates.companyEmployees !== undefined)
      updateData.company_employees = updates.companyEmployees;
    if (updates.companyIndustries !== undefined)
      updateData.company_industries = updates.companyIndustries;
    if (updates.companyKeywords !== undefined)
      updateData.company_keywords = updates.companyKeywords;
    if (updates.assignedTo !== undefined)
      updateData.assigned_to = updates.assignedTo;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.note !== undefined) updateData.note = updates.note;
    if (updates.nextReminderDate !== undefined)
      updateData.next_reminder_date = updates.nextReminderDate;

    // Update lead using service role (bypasses RLS)
    const { error } = await adminSupabase
      .from("leads")
      .update(updateData)
      .eq("id", leadId);

    if (error) {
      console.error("Error updating lead:", error);
      return res.status(400).json({
        error: "Failed to update lead",
        details: error.message,
      });
    }

    res.json({
      success: true,
      message: "Lead updated successfully",
    });
  } catch (error) {
    console.error("Lead update error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Lead update failed",
    });
  }
};
