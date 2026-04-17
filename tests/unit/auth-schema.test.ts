import { describe, expect, it } from "vitest";

import { signInSchema, signUpSchema } from "@/lib/schemas/auth";

describe("signInSchema", () => {
  it("accepts a valid email and non-empty password", () => {
    const parsed = signInSchema.parse({ email: "Foo@Example.COM", password: "anything" });
    expect(parsed.email).toBe("foo@example.com");
  });

  it("rejects an empty password", () => {
    expect(signInSchema.safeParse({ email: "a@b.com", password: "" }).success).toBe(false);
  });

  it("rejects an invalid email", () => {
    expect(signInSchema.safeParse({ email: "nope", password: "whatever" }).success).toBe(false);
  });
});

describe("signUpSchema", () => {
  it("accepts valid input and normalizes email", () => {
    const parsed = signUpSchema.parse({
      email: " Foo@Example.COM ",
      password: "supersecret",
    });
    expect(parsed.email).toBe("foo@example.com");
  });

  it("rejects short passwords", () => {
    expect(signUpSchema.safeParse({ email: "a@b.com", password: "short" }).success).toBe(false);
  });

  it("rejects invalid emails", () => {
    expect(signUpSchema.safeParse({ email: "nope", password: "supersecret" }).success).toBe(false);
  });
});
