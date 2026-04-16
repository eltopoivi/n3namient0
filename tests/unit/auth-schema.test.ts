import { describe, expect, it } from "vitest";

import { magicLinkSchema } from "@/lib/schemas/auth";

describe("magicLinkSchema", () => {
  it("accepts a valid email and normalizes case", () => {
    const parsed = magicLinkSchema.parse({ email: " Foo@Example.COM " });
    expect(parsed.email).toBe("foo@example.com");
  });

  it("rejects an invalid email", () => {
    const result = magicLinkSchema.safeParse({ email: "nope" });
    expect(result.success).toBe(false);
  });

  it("accepts an optional next path starting with /", () => {
    const parsed = magicLinkSchema.parse({ email: "a@b.com", next: "/perfil" });
    expect(parsed.next).toBe("/perfil");
  });

  it("rejects an absolute next url", () => {
    const result = magicLinkSchema.safeParse({ email: "a@b.com", next: "https://evil.example" });
    expect(result.success).toBe(false);
  });
});
