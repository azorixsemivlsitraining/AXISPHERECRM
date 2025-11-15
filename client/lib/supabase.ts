import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase URL or anon key. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.",
  );
}

// Custom fetch wrapper to handle deployment environments with response interceptors
const customFetch = async (
  url: string,
  options?: RequestInit,
): Promise<Response> => {
  try {
    const response = await fetch(url, options);

    // Handle cases where the response body has already been read by middleware/proxies
    // by reading it once and creating a new response
    if (response.bodyUsed) {
      console.warn(
        `Response body already used for ${url}. Creating new response.`,
      );
      return new Response("", {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    }

    // For successful responses, clone to allow multiple reads
    return response.clone();
  } catch (error) {
    // If fetch fails, throw with more context
    if (error instanceof Error) {
      console.error(`Fetch error for ${url}:`, error.message);
      throw error;
    }
    throw error;
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: customFetch,
  },
});
