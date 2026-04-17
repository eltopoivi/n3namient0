import { expect, test } from "@playwright/test";

test("unauthenticated visitor is redirected to /login and sees the sign-in form", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole("heading", { name: "Iniciar sesión" })).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Contraseña")).toBeVisible();
  await expect(page.getByRole("button", { name: /entrar/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /crear cuenta/i })).toBeVisible();
});

test("signup page renders the full registration form", async ({ page }) => {
  await page.goto("/signup");
  await expect(page.getByRole("heading", { name: "Crear cuenta" })).toBeVisible();
  await expect(page.getByLabel("Nombre de usuario")).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Contraseña")).toBeVisible();
  await expect(page.getByRole("link", { name: /iniciar sesión/i })).toBeVisible();
});
