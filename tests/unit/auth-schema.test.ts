import { describe, expect, it } from "vitest";

import { signInSchema, signUpSchema, usernameSchema } from "@/lib/schemas/auth";

describe("usernameSchema", () => {
  it("lowercases and trims", () => {
    expect(usernameSchema.parse(" Atleta_01 ")).toBe("atleta_01");
  });

  it("rejects characters outside the allowed set", () => {
    expect(usernameSchema.safeParse("atleta.01").success).toBe(false);
  });

  it("enforces min and max length", () => {
    expect(usernameSchema.safeParse("ab").success).toBe(false);
    expect(usernameSchema.safeParse("a".repeat(21)).success).toBe(false);
    expect(usernameSchema.safeParse("abc").success).toBe(true);
  });
});

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
  it("accepts valid input and normalizes username + email", () => {
    const parsed = signUpSchema.parse({
      username: " Ivan_01 ",
      email: " Foo@Example.COM ",
      password: "supersecret",
    });
    expect(parsed.username).toBe("ivan_01");
    expect(parsed.email).toBe("foo@example.com");
  });

  it("rejects short passwords", () => {
    const result = signUpSchema.safeParse({
      username: "ivan",
      email: "a@b.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });
});
