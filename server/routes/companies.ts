import { RequestHandler } from "express";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "[Companies] Missing Supabase credentials in environment variables",
  );
}

const supabase = createClient(supabaseUrl || "", supabaseKey || "");

export const handleGetCompanies: RequestHandler = async (req, res) => {
  try {
    console.log("[Companies] Fetching saved companies from Supabase");

    // Get pagination parameters from query string
    const limit = Math.min(
      Math.max(parseInt(req.query.limit as string) || 100, 1),
      500,
    );
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const offset = (page - 1) * limit;

    console.log(
      `[Companies] Fetching with limit=${limit}, page=${page}, offset=${offset}`,
    );

    // Fetch from Supabase saved_companies table
    const { data, error, count } = await supabase
      .from("saved_companies")
      .select("*", { count: "exact" })
      .order("saved_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("[Companies] Supabase error:", error);
      return res.status(500).json({
        error: "Failed to fetch saved companies from Supabase",
        details: error.message,
      });
    }

    const companies = (data || []).map((item: any) => ({
      id: item.id,
      apolloId: item.apollo_id,
      name: item.company_name,
      domain: "",
      industry: "",
      employeeCount: undefined,
      employeeCountRange: "",
      revenue: undefined,
      revenueRange: "",
      logoUrl: "",
      linkedinUrl: "",
      crunchbaseUrl: "",
      foundedYear: undefined,
      hqAddress: "",
      countries: [],
      website: "",
      phone: "",
      apolloProfileUrl: "",
    }));

    console.log(`[Companies] Fetched ${companies.length} saved companies`);

    const total = count || 0;
    const hasMore = offset + limit < total;

    return res.status(200).json({
      companies,
      total,
      page,
      limit,
      hasMore,
    });
  } catch (error) {
    console.error("[Companies] Unexpected error:", error);
    return res.status(500).json({
      error: "Failed to fetch companies",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
