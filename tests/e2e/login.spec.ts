import { expect, test } from "@playwright/test";

test("unauthenticated visitor is redirected to login and sees magic-link form", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole("heading", { name: "N300" })).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByRole("button", { name: /enlace mágico/i })).toBeVisible();
});
