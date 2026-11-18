import { describe, expect, it } from "vitest";
import {
  createBrowserSupabaseClient,
  createServerSupabaseClient,
} from "../src/client";

describe("Supabase client boundaries", () => {
  it("creates a browser client from public variables", () => {
    const client = createBrowserSupabaseClient({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable-key",
    });

    expect(client.from).toBeTypeOf("function");
  });

  it("creates a server client from server-only variable names", () => {
    const client = createServerSupabaseClient({
      SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_PUBLISHABLE_KEY: "publishable-key",
    });

    expect(client.from).toBeTypeOf("function");
  });

  it("rejects incomplete client configuration", () => {
    expect(() => createBrowserSupabaseClient({})).toThrow(
      "NEXT_PUBLIC_SUPABASE_URL",
    );
    expect(() => createServerSupabaseClient({})).toThrow("SUPABASE_URL");
  });
});
