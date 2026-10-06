import { describe, it, expect } from "vitest";
import { env } from "./env";

describe("Environment configuration", () => {
  it("should have validated env properties", () => {
    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined();
    expect(env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).toBeDefined();
  });
});
