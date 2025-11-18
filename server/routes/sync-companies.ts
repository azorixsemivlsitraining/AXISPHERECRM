import { RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("[Sync] Missing Supabase credentials in environment variables");
}

const supabase = createClient(supabaseUrl || "", supabaseKey || "");

export const handleSyncCompanies: RequestHandler = async (req, res) => {
  try {
    const { companies } = req.body;

    if (!companies || !Array.isArray(companies)) {
      return res
        .status(400)
        .setHeader("Content-Type", "application/json")
        .end(
          JSON.stringify({
            error: "Invalid request body. Expected array of companies.",
          }),
        );
    }

    console.log(
      `[Sync] Syncing ${companies.length} companies to saved_companies table`,
    );

    const formattedCompanies = companies.map((company: any) => ({
      apollo_id: company.apolloId || company.id,
      company_name: company.name,
      sync_status: "synced",
    }));

    const { data, error } = await supabase
      .from("saved_companies")
      .upsert(formattedCompanies, {
        onConflict: "apollo_id",
      })
      .select();

    if (error) {
      console.error("[Sync] Error syncing companies:", error);
      return res
        .status(500)
        .setHeader("Content-Type", "application/json")
        .end(
          JSON.stringify({
            error: "Failed to sync companies",
            details: error.message,
          }),
        );
    }

    console.log(`[Sync] Successfully synced ${data?.length || 0} companies`);

    return res
      .status(200)
      .setHeader("Content-Type", "application/json")
      .end(
        JSON.stringify({
          success: true,
          synced: data?.length || 0,
          message: `Synced ${data?.length || 0} companies to Supabase`,
        }),
      );
  } catch (error) {
    console.error("[Sync] Unexpected error:", error);
    return res
      .status(500)
      .setHeader("Content-Type", "application/json")
      .end(
        JSON.stringify({
          error: "Failed to sync companies",
          message: error instanceof Error ? error.message : "Unknown error",
        }),
      );
  }
};
