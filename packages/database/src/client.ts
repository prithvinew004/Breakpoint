import { createClient } from "@supabase/supabase-js";
import {
  browserSupabaseEnvironmentSchema,
  parseEnvironment,
  serverSupabaseEnvironmentSchema,
} from "@repo/shared";

export function createBrowserSupabaseClient(environment: unknown) {
  const config = parseEnvironment(
    browserSupabaseEnvironmentSchema,
    environment,
  );

  return createClient(
    config.NEXT_PUBLIC_SUPABASE_URL,
    config.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

export function createServerSupabaseClient(environment: unknown) {
  const config = parseEnvironment(serverSupabaseEnvironmentSchema, environment);

  return createClient(config.SUPABASE_URL, config.SUPABASE_PUBLISHABLE_KEY);
}
