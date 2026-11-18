import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnvironment } from "./environment";

export function createClient() {
  const environment = getSupabaseEnvironment();

  return createBrowserClient(
    environment.NEXT_PUBLIC_SUPABASE_URL,
    environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
