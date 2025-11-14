const APOLLO_API_KEY = import.meta.env.VITE_APOLLO_API_KEY;
const APOLLO_BASE_URL = "https://api.apollo.io/v1";

if (!APOLLO_API_KEY) {
  console.warn("Apollo.io API key is not configured");
}

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
  body?: Record<string, any>
): Promise<any> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${APOLLO_API_KEY}`,
  };

  const options: RequestInit = {
    method,
    headers,
  };

  if (body && method === "POST") {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${APOLLO_BASE_URL}${endpoint}`, options);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Apollo API error: ${response.status} - ${
          errorData.message || errorData.error || "Unknown error"
        }`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Apollo API call failed:", error);
    throw error;
  }
}

export async function searchCompanies(
  params: ApolloSearchParams
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
  organizationId: string
): Promise<ApolloCompany> {
  try {
    const response = await callApolloAPI(
      `/organizations/${organizationId}`,
      "GET"
    );
    return response.organization || response;
  } catch (error) {
    console.error("Error fetching company details:", error);
    throw error;
  }
}

export async function getSavedCompanies(
  limit: number = 20,
  page: number = 1
): Promise<ApolloCompany[]> {
  try {
    const response = await callApolloAPI("/organizations", "POST", {
      limit,
      page,
    });
    return response.organizations || [];
  } catch (error) {
    console.error("Error fetching saved companies:", error);
    throw error;
  }
}
