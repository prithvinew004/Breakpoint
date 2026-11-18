import { z } from "zod";

const httpUrl = z.url({ protocol: /^https?$/ });
const publishableKey = z.string().trim().min(1);

export const apiEnvironmentSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
});

export const browserSupabaseEnvironmentSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: httpUrl,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publishableKey,
});

export const serverSupabaseEnvironmentSchema = z.object({
  SUPABASE_URL: httpUrl,
  SUPABASE_PUBLISHABLE_KEY: publishableKey,
});

export function parseEnvironment<Schema extends z.ZodType>(
  schema: Schema,
  input: unknown,
): z.output<Schema> {
  const result = schema.safeParse(input);

  if (result.success) {
    return result.data;
  }

  const variables = [
    ...new Set(
      result.error.issues.map((issue) =>
        String(issue.path[0] ?? "environment"),
      ),
    ),
  ].sort();

  throw new Error(`Invalid environment variables: ${variables.join(", ")}`);
}
