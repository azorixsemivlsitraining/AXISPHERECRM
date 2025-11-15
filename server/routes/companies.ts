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

    // Fetch from /bookmarks endpoint to get saved/bookmarked companies
    const bookmarksUrl = `${APOLLO_BASE_URL}/bookmarks`;

    console.log(
      `[Companies] Calling ${bookmarksUrl} with limit=${limit}, page=${page}`,
    );

    const effectiveLimit = Math.min(500, limit);

    const bookmarksResponse = await fetch(bookmarksUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        limit: effectiveLimit,
        page,
        type: "organization",
      }),
    });

    const responseText = await bookmarksResponse.text();
    console.log(`[Companies] Response status: ${bookmarksResponse.status}`);

    if (!bookmarksResponse.ok) {
      console.error(`[Companies] Bookmarks API error: ${bookmarksResponse.status}`);
      console.error(
        `[Companies] Error response: ${responseText.substring(0, 300)}`,
      );

      return res.status(bookmarksResponse.status).json({
        error: "Failed to fetch saved companies from Apollo",
        status: bookmarksResponse.status,
      });
    }

    let bookmarksData;
    try {
      bookmarksData = JSON.parse(responseText);
    } catch (e) {
      console.error(
        "[Companies] Failed to parse response:",
        responseText.substring(0, 300),
      );
      return res.status(500).json({
        error: "Invalid response from Apollo API",
      });
    }

    // Extract organizations from bookmarks response
    const organizations = bookmarksData.bookmarks || bookmarksData.organizations || [];
    console.log(`[Companies] Fetched ${organizations.length} saved companies`);

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
