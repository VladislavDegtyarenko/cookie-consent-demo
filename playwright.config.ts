import { defineConfig, devices } from "@playwright/test";

const ORIGIN = "http://127.0.0.1:4173";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  workers: 2,
  use: {
    baseURL: ORIGIN,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm preview --listen tcp://127.0.0.1:4173",
    url: ORIGIN,
  },
});
