import { createClient } from "@supabase/supabase-js";
import { Database } from "../types/database";

const supabaseUrl =
  process.env.SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_KEY || "placeholder-key";

if (
  supabaseUrl.includes("placeholder") ||
  supabaseServiceKey.includes("placeholder")
) {
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      "⚠️  Supabase environment variables not set. Using placeholder values for development."
    );
  } else {
    throw new Error("Supabase environment variables must be set in production");
  }
}

// Server-side client with service role key for admin operations
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export default supabase;
