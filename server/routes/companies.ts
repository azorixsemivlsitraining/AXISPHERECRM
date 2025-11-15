import { RequestHandler, Response } from "express";

const APOLLO_BASE_URL = "https://api.apollo.io/v1";

export const handleGetCompanies: RequestHandler = async (req, res) => {
  try {
    const APOLLO_API_KEY = process.env.VITE_APOLLO_API_KEY;

    if (!APOLLO_API_KEY) {
      console.error(
        "[Companies] Missing VITE_APOLLO_API_KEY environment variable",
      );
      return res.status(500).json({
        error: "Apollo API key not configured",
      });
    }

    console.log("[Companies] API key is set");

    // Get pagination parameters from query string
    const limit = Math.min(
      Math.max(parseInt(req.query.limit as string) || 100, 1),
      500,
    );
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);

    console.log(
      `[Companies] Fetching saved companies with limit=${limit}, page=${page}`,
    );

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "X-Api-Key": APOLLO_API_KEY,
    };

    // Try to fetch from mixed_companies/search endpoint with higher limit to get all saved companies
    const searchUrl = `${APOLLO_BASE_URL}/mixed_companies/search`;

    console.log(
      `[Companies] Calling ${searchUrl} with limit=${limit}, page=${page}`,
    );

    // Try fetching with a large limit to get all saved companies at once
    const effectiveLimit = Math.min(500, limit);

    const searchResponse = await fetch(searchUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        limit: effectiveLimit,
        page,
        person_details: [],
        organization_details: true,
        show_suggestions: false,
        reveal_personal_emails: false,
        // Try to get only bookmarked/saved companies
        bookmarked_only: true,
      }),
    });

    const responseText = await searchResponse.text();
    console.log(`[Companies] Response status: ${searchResponse.status}`);

    if (!searchResponse.ok) {
      console.error(`[Companies] Search API error: ${searchResponse.status}`);
      console.error(
        `[Companies] Error response: ${responseText.substring(0, 300)}`,
      );

      return res.status(searchResponse.status).json({
        error: "Failed to fetch companies from Apollo",
        status: searchResponse.status,
      });
    }

    let searchData;
    try {
      searchData = JSON.parse(responseText);
    } catch (e) {
      console.error(
        "[Companies] Failed to parse response:",
        responseText.substring(0, 300),
      );
      return res.status(500).json({
        error: "Invalid response from Apollo API",
      });
    }

    const organizations = searchData.organizations || [];
    console.log(`[Companies] Fetched ${organizations.length} companies`);

    // Map organizations to company format
    const companies = organizations
      .filter((org: any) => org && org.id)
      .map((org: any) => ({
        id: org.id,
        name: org.name || "",
        domain: org.domain || "",
        industry: org.industry || "",
        employeeCount: org.employee_count,
        employeeCountRange: org.employee_count_range || "",
        revenue: org.revenue,
        revenueRange: org.revenue_range || "",
        logoUrl: org.logo_url || "",
        linkedinUrl: org.linkedin_url || "",
        crunchbaseUrl: org.crunchbase_url || "",
        foundedYear: org.founded_year,
        hqAddress: org.hq_address || "",
        countries: org.countries || [],
        website: org.website || "",
        phone: org.phone || "",
        apolloProfileUrl: org.apollo_url || "",
      }));

    res.json({
      companies,
      total: searchData.pagination?.total_entries || companies.length,
      page,
      limit,
      hasMore: searchData.pagination?.total_pages
        ? page < searchData.pagination.total_pages
        : false,
    });
  } catch (error) {
    console.error("[Companies] Unexpected error:", error);
    res.status(500).json({
      error: "Failed to fetch companies",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
