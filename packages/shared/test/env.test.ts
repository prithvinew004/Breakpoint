import { describe, expect, it } from "vitest";
import {
  apiEnvironmentSchema,
  browserSupabaseEnvironmentSchema,
  parseEnvironment,
} from "../src/env";

describe("environment validation", () => {
  it("uses the default API port and validates explicit ports", () => {
    expect(parseEnvironment(apiEnvironmentSchema, {})).toEqual({ PORT: 3001 });
    expect(parseEnvironment(apiEnvironmentSchema, { PORT: "65535" })).toEqual({
      PORT: 65535,
    });
    expect(() =>
      parseEnvironment(apiEnvironmentSchema, { PORT: "65536" }),
    ).toThrow("PORT");
  });

  it("accepts only complete browser-safe Supabase configuration", () => {
    expect(
      parseEnvironment(browserSupabaseEnvironmentSchema, {
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable-key",
      }),
    ).toEqual({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable-key",
    });

    expect(() =>
      parseEnvironment(browserSupabaseEnvironmentSchema, {
        SUPABASE_URL: "https://example.supabase.co",
        SUPABASE_PUBLISHABLE_KEY: "server-key",
      }),
    ).toThrow("NEXT_PUBLIC_SUPABASE_URL");
  });
});
