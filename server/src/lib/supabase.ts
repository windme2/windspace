import { createClient } from "@supabase/supabase-js";
import { Database } from "../types/database";

const supabaseUrl =
  process.env.SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_KEY || "placeholder-key";

console.log("🔍 Environment check:");
console.log("  NODE_ENV:", process.env.NODE_ENV);
console.log("  SUPABASE_URL exists:", !!process.env.SUPABASE_URL);
console.log(
  "  SUPABASE_SERVICE_KEY exists:",
  !!process.env.SUPABASE_SERVICE_KEY
);

if (
  supabaseUrl.includes("placeholder") ||
  supabaseServiceKey.includes("placeholder")
) {
  console.warn(
    "⚠️  Supabase environment variables not set. Using placeholder values for development."
  );
  console.warn(
    "📋 Please follow SUPABASE_SETUP.md to configure your Supabase project."
  );
} else {
  console.log("✅ Supabase connected to:", supabaseUrl);
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
