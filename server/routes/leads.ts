import { RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Debug: log if keys are loaded
console.log("[Leads Route] Supabase URL loaded:", !!supabaseUrl);
console.log("[Leads Route] Service Role Key loaded:", !!supabaseServiceKey);
if (!supabaseServiceKey) {
  console.error(
    "[Leads Route] CRITICAL: SUPABASE_SERVICE_ROLE_KEY is not set in environment",
  );
  console.log(
    "[Leads Route] Available env keys:",
    Object.keys(process.env)
      .filter((k) => k.includes("SUPABASE"))
      .sort(),
  );
}

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

export const handleDeleteSalesperson: RequestHandler = async (req, res) => {
  try {
    if (!adminSupabase) {
      console.error("[Delete Salesperson] adminSupabase not initialized");
      return res
        .status(500)
        .setHeader("Content-Type", "application/json")
        .end(
          JSON.stringify({
            error: "Server configuration error: service role key not configured",
            details: "SUPABASE_SERVICE_ROLE_KEY is not set",
          }),
        );
    }

    const { salespersonId } = req.body;

    if (!salespersonId) {
      return res
        .status(400)
        .setHeader("Content-Type", "application/json")
        .end(
          JSON.stringify({
            error: "Missing required field: salespersonId",
          }),
        );
    }

    console.log(
      "[Delete Salesperson] Attempting to delete salesperson:",
      salespersonId,
    );

    // First, get the salesperson to retrieve auth_id
    const { data: salesperson, error: fetchError } = await adminSupabase
      .from("salespersons")
      .select("auth_id")
      .eq("id", salespersonId)
      .single();

    if (fetchError) {
      console.error("[Delete Salesperson] Error fetching salesperson:", fetchError);
      return res
        .status(400)
        .setHeader("Content-Type", "application/json")
        .end(
          JSON.stringify({
            error: "Failed to fetch salesperson",
            details: fetchError.message,
          }),
        );
    }

    // Delete all leads assigned to this salesperson
    const { error: leadsError } = await adminSupabase
      .from("leads")
      .delete()
      .eq("assigned_to", salespersonId);

    if (leadsError) {
      console.error("[Delete Salesperson] Error deleting leads:", leadsError);
      return res
        .status(400)
        .setHeader("Content-Type", "application/json")
        .end(
          JSON.stringify({
            error: "Failed to delete leads for salesperson",
            details: leadsError.message,
          }),
        );
    }

    // Delete the salesperson record
    const { error: spError } = await adminSupabase
      .from("salespersons")
      .delete()
      .eq("id", salespersonId);

    if (spError) {
      console.error("[Delete Salesperson] Error deleting salesperson:", spError);
      return res
        .status(400)
        .setHeader("Content-Type", "application/json")
        .end(
          JSON.stringify({
            error: "Failed to delete salesperson",
            details: spError.message,
          }),
        );
    }

    // Delete the auth user if auth_id exists
    if (salesperson?.auth_id) {
      const { error: authError } = await adminSupabase.auth.admin.deleteUser(
        salesperson.auth_id,
      );

      if (authError) {
        console.error(
          "[Delete Salesperson] Warning: Failed to delete auth user:",
          authError,
        );
        // Don't fail the entire operation if auth deletion fails
      }
    }

    console.log("[Delete Salesperson] Successfully deleted salesperson");
    return res
      .status(200)
      .setHeader("Content-Type", "application/json")
      .end(
        JSON.stringify({
          success: true,
          message: "Salesperson deleted successfully",
        }),
      );
  } catch (error) {
    console.error("[Delete Salesperson] Unexpected error:", error);
    return res
      .status(500)
      .setHeader("Content-Type", "application/json")
      .end(
        JSON.stringify({
          error:
            error instanceof Error ? error.message : "Delete failed",
        }),
      );
  }
};
