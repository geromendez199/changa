import "dotenv/config";
import { defineConfig, devices } from "@playwright/test";
import { getBaseUrl } from "./e2e/support/env";

const baseURL = getBaseUrl();
const includeOptionalBrowsers = process.env.PW_OPTIONAL_BROWSERS === "1";
const shouldBootLocalServer = /^(http:\/\/127\.0\.0\.1|http:\/\/localhost)/.test(baseURL);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  globalSetup: "./global-setup.ts",
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-report" }],
    ["./reporters/error-reporter.ts"],
  ],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    ignoreHTTPSErrors: true,
  },
  webServer: shouldBootLocalServer
    ? {
        command: "npm run dev -- --host 127.0.0.1 --port 4173",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      }
    : undefined,
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        browserName: "chromium",
      },
    },
    ...(includeOptionalBrowsers
      ? [
          {
            name: "firefox",
            use: {
              ...devices["Desktop Firefox"],
              browserName: "firefox",
            },
          },
          {
            name: "webkit",
            use: {
              ...devices["Desktop Safari"],
              browserName: "webkit",
            },
          },
        ]
      : []),
  ],
});
