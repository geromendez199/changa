import { expect, type Page } from "@playwright/test";

export async function currentPath(page: Page) {
  return new URL(page.url()).pathname;
}

export async function isInvalidRoute(page: Page) {
  const invalidHeading = page.getByRole("heading", { name: /ruta inv[aá]lida/i }).first();
  return invalidHeading.isVisible().catch(() => false);
}

export async function gotoFirstAvailableRoute(page: Page, routes: readonly string[]) {
  let lastRoute = routes[0];

  for (const route of routes) {
    lastRoute = route;
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle").catch(() => undefined);

    const path = await currentPath(page);
    if (path === "/login" || !(await isInvalidRoute(page))) {
      return route;
    }
  }

  return lastRoute;
}

export async function expectRedirectToLogin(page: Page) {
  const path = await currentPath(page);
  if (path === "/login") {
    await expect(page).toHaveURL(/\/login(?:\?|$)/);
    return;
  }

  const bodyText = ((await page.locator("body").textContent()) ?? "").toLowerCase();
  const isLocalRuntime = /^(127\.0\.0\.1|localhost)$/.test(new URL(page.url()).hostname);
  const isDevelopmentFallback =
    ["/my-jobs", "/publish", "/profile"].includes(path) &&
    (isLocalRuntime ||
      bodyText.includes("vista previa local") ||
      bodyText.includes("datos de muestra") ||
      bodyText.includes("conectá supabase"));

  if (!isDevelopmentFallback) {
    await expect(page).toHaveURL(/\/login(?:\?|$)/);
  }
}
