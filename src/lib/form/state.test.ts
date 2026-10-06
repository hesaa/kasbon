import { describe, it, expect } from "vitest";
import { old, formError, formSuccess } from "./state";

describe("Form State Helper (Laravel old() equivalent)", () => {
  it("returns submitted field value when present", () => {
    const state = formError("Invalid password", { email: "user@kasbon.test" });
    expect(old(state, "email")).toBe("user@kasbon.test");
  });

  it("returns fallback when field is missing or state is undefined", () => {
    expect(old(undefined, "email", "default@kasbon.test")).toBe("default@kasbon.test");
    expect(old({}, "email")).toBe("");
  });

  it("creates formError and formSuccess structures correctly", () => {
    const errState = formError("Sign in failed", { email: "test@kasbon.test" });
    expect(errState.error).toBe("Sign in failed");
    expect(errState.fields?.email).toBe("test@kasbon.test");

    const succState = formSuccess("Account created!");
    expect(succState.message).toBe("Account created!");
  });
});
