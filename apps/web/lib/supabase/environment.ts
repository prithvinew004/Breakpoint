import {
  browserSupabaseEnvironmentSchema,
  parseEnvironment,
} from "@repo/shared";

export function getSupabaseEnvironment() {
  return parseEnvironment(browserSupabaseEnvironmentSchema, {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
}
