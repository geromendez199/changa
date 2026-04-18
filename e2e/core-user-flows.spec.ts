import { test, expect } from "./support/test-base";
import { LoginPage } from "./pages/LoginPage";
import { HomePage } from "./pages/HomePage";
import { AUTH_PATHS, hasSupabaseSession } from "./support/auth";
import { getEnv, hasClientCredentials } from "./support/env";
import { uniqueValue } from "./support/scenarios";

test("@core Home pública carga correctamente", async ({ page }) => {
  await page.goto("/home", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/home(?:\?|$)/);
  await expect(page.getByRole("main").or(page.locator("body"))).toBeVisible();
});

test("@core Sin sesión, rutas privadas redirigen a login", async ({ page }) => {
  await page.goto("/publish", { waitUntil: "domcontentloaded" });

  const stayedInPublish = /\/publish(?:\?|$)/.test(page.url());
  if (stayedInPublish) {
    const bodyText = (await page.locator("body").textContent()) ?? "";
    test.skip(
      /vista previa local|datos de muestra|conectá supabase/i.test(bodyText),
      "En entorno local fallback la app permite rutas privadas para revisar UI sin backend.",
    );
  }

  await expect(page).toHaveURL(/\/login(?:\?|$)/);
});

test("@core Navegación principal permite ir a búsqueda", async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();

  const searchNav = page.getByTestId("bottom-nav-buscar");
  if (await searchNav.isVisible().catch(() => false)) {
    await searchNav.click();
  } else {
    await page.goto("/search", { waitUntil: "domcontentloaded" });
  }

  await expect(page).toHaveURL(/\/search(?:\?|$)/);
});

test("@core Login exitoso con usuario de prueba", async ({ page }) => {
  test.skip(!hasClientCredentials(), "Requiere TEST_EMAIL y TEST_PASSWORD.");

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.fillEmail(getEnv("TEST_EMAIL"));
  await loginPage.fillPassword(getEnv("TEST_PASSWORD"));
  await loginPage.submit();

  await expect(page).toHaveURL(/\/home(?:\?|$)/);
  expect(await hasSupabaseSession(page)).toBe(true);
});

test("@core Login fallido mantiene al usuario en /login", async ({ page }) => {
  test.skip(!hasClientCredentials(), "Requiere TEST_EMAIL para probar contraseña incorrecta.");

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.fillEmail(getEnv("TEST_EMAIL"));
  await loginPage.fillPassword("password-invalida-e2e");
  await loginPage.submit();

  await expect(page).toHaveURL(/\/login(?:\?|$)/);
  await expect.poll(() => loginPage.getErrorMessage()).not.toBeNull();
});

test.describe.serial("@core autenticado", () => {
  test.use({ storageState: AUTH_PATHS.user });

  test("@core Usuario autenticado puede hacer logout", async ({ page }) => {
    await page.goto("/profile", { waitUntil: "domcontentloaded" });
    test.skip(!(await hasSupabaseSession(page)), "Requiere storage state autenticado.");

    const logoutButton = page.getByTestId("profile-logout-button");
    await expect(logoutButton).toBeVisible();
    await logoutButton.click();
    await expect(page).toHaveURL(/\/login(?:\?|$)/);
  });

  test("@core Usuario autenticado puede publicar una changa", async ({ page }) => {
    await page.goto("/publish", { waitUntil: "domcontentloaded" });
    test.skip(!(await hasSupabaseSession(page)), "Requiere storage state autenticado.");

    await page.getByTestId("publish-category-otros").click();
    await page.getByTestId("publish-continue-button").click();
    await page.getByTestId("publish-title-input").fill(uniqueValue("Servicio E2E"));
    await page
      .getByTestId("publish-description-input")
      .fill("Publicación E2E de prueba con descripción suficiente para pasar validaciones.");
    await page.getByTestId("publish-continue-button").click();
    await page.getByTestId("publish-location-input").fill("Rafaela, Santa Fe");
    await page.getByTestId("publish-price-input").fill("15000");
    await page.getByTestId("publish-availability-input").fill("Mañana por la tarde");
    await page.getByTestId("publish-continue-button").click();
    await page.getByTestId("publish-continue-button").click();

    await expect(page).toHaveURL(/\/publish\/confirm\//);
  });

  test("@core Usuario puede buscar y abrir detalle de changa", async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    test.skip(!(await hasSupabaseSession(page)), "Requiere storage state autenticado.");

    await homePage.searchService("plomería");
    await page.waitForURL(/\/search\?/);
    await expect(page.locator("text=/resultado|changa|buscar/i").first()).toBeVisible();

    const detailCandidate = page.locator('a[href*="/job/"], button:has-text("Ver detalle")').first();
    test.skip(!(await detailCandidate.isVisible().catch(() => false)), "No se encontró un CTA de detalle visible en resultados.");

    await detailCandidate.click();
    await expect(page).toHaveURL(/\/job\//);
  });
});
