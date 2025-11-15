import { RequestHandler } from "express";

const APOLLO_BASE_URL = "https://api.apollo.io/v1";

export const handleGetCompanies: RequestHandler = async (req, res) => {
  try {
    const APOLLO_API_KEY = process.env.VITE_APOLLO_API_KEY;
    if (!APOLLO_API_KEY) {
      console.error("Missing VITE_APOLLO_API_KEY environment variable");
      return res.status(500).json({
        error: "Apollo API key not configured",
      });
    }

    // Get pagination parameters from query string
    const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 100, 1), 500);
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);

    console.log(`[Companies API] Fetching saved companies with limit=${limit}, page=${page}`);

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${APOLLO_API_KEY}`,
    };

    // First, fetch bookmarks (saved companies)
    const bookmarksResponse = await fetch(`${APOLLO_BASE_URL}/bookmarks`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        limit,
        page,
        type: "organization",
      }),
    });

    if (!bookmarksResponse.ok) {
      const errorText = await bookmarksResponse.text();
      console.error(`[Companies API] Bookmarks API error: ${bookmarksResponse.status} - ${errorText}`);
      return res.status(bookmarksResponse.status).json({
        error: "Failed to fetch saved companies from Apollo",
        details: errorText,
      });
    }

    const bookmarksData = await bookmarksResponse.json();
    const bookmarks = bookmarksData.bookmarks || [];

    console.log(`[Companies API] Fetched ${bookmarks.length} bookmarks`);

    // Fetch details for each bookmarked organization
    const companiesDetails = await Promise.all(
      bookmarks.map(async (bookmark: any) => {
        const orgId = bookmark.organization_id || bookmark.id;
        if (!orgId) return null;

        try {
          const orgResponse = await fetch(`${APOLLO_BASE_URL}/organizations/${orgId}`, {
            method: "GET",
            headers,
          });

          if (!orgResponse.ok) {
            console.warn(`[Companies API] Failed to fetch details for org ${orgId}`);
            // Return basic info from bookmark if details fetch fails
            return mapBookmarkToCompany(bookmark);
          }

          const orgData = await orgResponse.json();
          return mapOrganizationToCompany(orgData.organization || orgData);
        } catch (error) {
          console.warn(`[Companies API] Error fetching details for org ${orgId}:`, error);
          return mapBookmarkToCompany(bookmark);
        }
      })
    );

    // Filter out null entries and return
    const companies = companiesDetails.filter((c): c is any => c !== null);

    res.json({
      companies,
      total: bookmarksData.pagination?.total_entries || companies.length,
      page,
      limit,
      hasMore: bookmarksData.pagination?.total_pages ? page < bookmarksData.pagination.total_pages : false,
    });
  } catch (error) {
    console.error("Companies API error:", error);
    res.status(500).json({
      error: "Failed to fetch companies",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

function mapOrganizationToCompany(org: any) {
  return {
    id: org.id || org.organization_id,
    name: org.name,
    domain: org.domain,
    industry: org.industry,
    employeeCount: org.employee_count,
    employeeCountRange: org.employee_count_range,
    revenue: org.revenue,
    revenueRange: org.revenue_range,
    logoUrl: org.logo_url,
    linkedinUrl: org.linkedin_url,
    crunchbaseUrl: org.crunchbase_url,
    foundedYear: org.founded_year,
    hqAddress: org.hq_address,
    countries: org.countries,
    website: org.website,
    phone: org.phone,
    apolloProfileUrl: org.apollo_url,
  };
}

function mapBookmarkToCompany(bookmark: any) {
  return {
    id: bookmark.organization_id || bookmark.id,
    name: bookmark.organization_name || bookmark.name,
    domain: bookmark.domain,
    industry: bookmark.industry,
    employeeCount: bookmark.employee_count,
    employeeCountRange: bookmark.employee_count_range,
    revenue: bookmark.revenue,
    revenueRange: bookmark.revenue_range,
    logoUrl: bookmark.logo_url,
    linkedinUrl: bookmark.linkedin_url,
    crunchbaseUrl: bookmark.crunchbase_url,
    foundedYear: bookmark.founded_year,
    hqAddress: bookmark.hq_address,
    countries: bookmark.countries,
    website: bookmark.website,
    phone: bookmark.phone,
    apolloProfileUrl: bookmark.apollo_url,
  };
}
