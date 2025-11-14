export interface ApolloCompany {
  id: string;
  name: string;
  domain: string;
  industry: string;
  employee_count?: number;
  employee_count_range?: string;
  revenue?: number;
  revenue_range?: string;
  logo_url?: string;
  linkedin_url?: string;
  crunchbase_url?: string;
  founded_year?: number;
  hq_address?: string;
  countries?: string[];
  website?: string;
  phone?: string;
  [key: string]: any;
}

export interface ApolloSearchParams {
  q_organization_name?: string;
  q_industry?: string;
  q_organization_employee_size?: string;
  limit?: number;
  page?: number;
}

async function callApolloAPI(
  endpoint: string,
  method: "GET" | "POST" = "POST",
  body?: Record<string, any>,
): Promise<any> {
  const options: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      endpoint,
      method,
      body,
    }),
  };

  try {
    const response = await fetch("/api/apollo", options);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Apollo API error: ${response.status} - ${
          errorData.message || errorData.error || "Unknown error"
        }`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Apollo API call failed:", error);
    throw error;
  }
}

export async function searchCompanies(
  params: ApolloSearchParams,
): Promise<ApolloCompany[]> {
  try {
    const response = await callApolloAPI("/mixed_companies/search", "POST", {
      ...params,
      limit: params.limit || 20,
      page: params.page || 1,
    });

    return response.organizations || [];
  } catch (error) {
    console.error("Error searching companies:", error);
    throw error;
  }
}

export async function getCompanyDetails(
  organizationId: string,
): Promise<ApolloCompany> {
  try {
    const response = await callApolloAPI(
      `/organizations/${organizationId}`,
      "GET",
    );
    return response.organization || response;
  } catch (error) {
    console.error("Error fetching company details:", error);
    throw error;
  }
}

export async function getSavedCompanies(
  limit: number = 100,
  page: number = 1,
): Promise<ApolloCompany[]> {
  try {
    const response = await callApolloAPI("/bookmarks", "POST", {
      limit,
      page,
      type: "organization",
    });

    const organizations = response.bookmarks || response.organizations || [];

    if (organizations.length === 0) {
      console.log("No saved companies found in Apollo");
    }

    return organizations.map((org: any) => ({
      id: org.id || org.organization_id,
      name: org.name,
      domain: org.domain,
      industry: org.industry,
      employee_count: org.employee_count,
      employee_count_range: org.employee_count_range,
      revenue: org.revenue,
      revenue_range: org.revenue_range,
      logo_url: org.logo_url,
      linkedin_url: org.linkedin_url,
      crunchbase_url: org.crunchbase_url,
      founded_year: org.founded_year,
      hq_address: org.hq_address,
      countries: org.countries,
      website: org.website,
      phone: org.phone,
    }));
  } catch (error) {
    console.error("Error fetching saved companies:", error);
    throw error;
  }
}
