import { createClient } from "@supabase/supabase-js"

// These environment variables must be set:
// - VITE_SUPABASE_URL: Your Supabase project URL
// - VITE_SUPABASE_ANON_KEY: Your Supabase public anon key
//
// The anon key is safe to client-side. The service_role key should
// never be exposed to the browser.

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
)