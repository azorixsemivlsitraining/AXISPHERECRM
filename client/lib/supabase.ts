import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase URL or anon key. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.",
  );
}

// Custom fetch wrapper to handle middleware that reads response body
const customFetch = async (
  url: string,
  options?: RequestInit,
): Promise<Response> => {
  try {
    const response = await fetch(url, options);

    // Clone the response to avoid "body stream already read" issues
    // This handles cases where middleware/proxies read the response
    const clonedResponse = response.clone();

    // Return the cloned response so the body can be read
    return clonedResponse;
  } catch (error) {
    // If fetch fails, throw with more context
    if (error instanceof Error) {
      throw new Error(`Fetch failed for ${url}: ${error.message}`);
    }
    throw error;
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: customFetch,
  },
});
