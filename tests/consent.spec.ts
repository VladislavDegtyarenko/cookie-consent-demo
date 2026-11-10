import { expect, type Page, test } from "@playwright/test";

const ANALYTICS_SCRIPT = "**/demo-analytics.js";

const ANALYTICS_COOKIE = "cookie_demo_analytics";

const CONSENT_COOKIE = "cookie_demo_consent";

/** Captures analytics requests, including attempts made during page startup. */
function watchAnalytics(page: Page) {
  const REQUESTS: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).pathname.endsWith("/demo-analytics.js")) {
      REQUESTS.push(request.url());
    }
  });
  return REQUESTS;
}

/** Changes the saved Analytics setting through the footer dialog. */
async function saveAnalyticsPreference(page: Page, isAllowed: boolean) {
  await page.getByRole("button", { name: "Cookie settings" }).click();
  const SWITCH = page.getByRole("switch", { name: "Analytics" });
  await SWITCH.setChecked(isAllowed);
  await page.getByRole("button", { name: "Save preferences" }).click();
}

/** Reads the response to an event offered directly to the script. */
async function dispatchWithoutButton(page: Page) {
  return page.evaluate(() => {
    let acknowledgements = 0;
    const COUNT = () => {
      acknowledgements += 1;
    };
    window.addEventListener("cookie-demo:event-processed", COUNT);
    window.dispatchEvent(new Event("cookie-demo:test-event"));
    window.removeEventListener("cookie-demo:event-processed", COUNT);
    return acknowledgements;
  });
}

test("makes no analytics request before a choice, after refusal, or after reload", async ({
  page,
  context,
}) => {
  const REQUESTS = watchAnalytics(page);
  await page.goto("/");
  await expect(page.getByText("Analytics is blocked until you opt in")).toBeVisible();
  await expect(page.getByRole("button", { name: "Send test event" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Cookie settings" })).toBeVisible();
  expect(REQUESTS).toHaveLength(0);
  expect(await context.cookies()).toHaveLength(0);

  await page.getByRole("button", { name: "Reject optional" }).click();
  await expect(page.getByText("Analytics is off", { exact: true })).toBeVisible();
  await expect(page.getByText("Rejected", { exact: true })).toBeVisible();
  expect(REQUESTS).toHaveLength(0);

  await page.reload();
  await expect(page.getByText("Analytics is off", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Accept all" })).toHaveCount(0);
  expect(REQUESTS).toHaveLength(0);
  expect(await context.cookies()).toEqual([
    expect.objectContaining({ name: CONSENT_COOKIE, value: "v1.rejected" }),
  ]);
});

test("activates after acceptance and restores consent on reload", async ({ page, context }) => {
  const REQUESTS = watchAnalytics(page);
  await page.goto("/");
  const RESPONSE = page.waitForResponse(ANALYTICS_SCRIPT);
  await page.getByRole("button", { name: "Accept all" }).click();
  expect((await RESPONSE).ok()).toBe(true);
  await expect(page.getByText("Analytics is active", { exact: true })).toBeVisible();
  expect(REQUESTS).toHaveLength(1);
  expect(await context.cookies()).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ name: CONSENT_COOKIE, value: "v1.accepted" }),
      expect.objectContaining({ name: ANALYTICS_COOKIE, value: "active" }),
    ]),
  );

  const COUNT = page.getByRole("status", { name: "Processed test events" });
  await expect(COUNT).toHaveText("0");
  await page.getByRole("button", { name: "Send test event" }).click();
  await expect(COUNT).toHaveText("1");

  await page.reload();
  await expect(page.getByText("Analytics is active", { exact: true })).toBeVisible();
  await expect(COUNT).toHaveText("0");
  expect(REQUESTS).toHaveLength(2);
});

test("withdrawal stops the handler and a new opt-in counts each event once", async ({
  page,
  context,
}) => {
  const REQUESTS = watchAnalytics(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Accept all" }).click();
  const BUTTON = page.getByRole("button", { name: "Send test event" });
  const COUNT = page.getByRole("status", { name: "Processed test events" });
  await BUTTON.click();
  await expect(COUNT).toHaveText("1");

  await saveAnalyticsPreference(page, false);
  await expect(page.getByText("Analytics is off. Consent was withdrawn")).toBeVisible();
  await expect(BUTTON).toBeDisabled();
  expect(await dispatchWithoutButton(page)).toBe(0);
  await expect(COUNT).toHaveText("1");
  expect((await context.cookies()).some(({ name }) => name === ANALYTICS_COOKIE)).toBe(false);

  await saveAnalyticsPreference(page, true);
  await BUTTON.click();
  await expect(COUNT).toHaveText("2");
  expect(REQUESTS).toHaveLength(1);

  await saveAnalyticsPreference(page, false);
  await page.reload();
  await expect(page.getByText("Analytics is off. Consent was withdrawn")).toBeVisible();
  await expect(BUTTON).toBeDisabled();
  expect(REQUESTS).toHaveLength(1);
  expect(await context.cookies()).toEqual([
    expect.objectContaining({ name: CONSENT_COOKIE, value: "v1.withdrawn" }),
  ]);
});

test("a script that finishes loading after withdrawal stays inert", async ({ page, context }) => {
  const GATE = Promise.withResolvers<void>();
  await page.route(ANALYTICS_SCRIPT, async (route) => {
    await GATE.promise;
    await route.continue();
  });

  await page.goto("/");
  const REQUEST = page.waitForRequest(ANALYTICS_SCRIPT);
  await page.getByRole("button", { name: "Accept all" }).click();
  await REQUEST;
  await expect(page.getByText("Loading the local analytics script…")).toBeVisible();

  try {
    await saveAnalyticsPreference(page, false);
    await expect(page.getByText("Analytics is off. Consent was withdrawn")).toBeVisible();
  } finally {
    GATE.resolve();
  }

  await page.waitForFunction(() => typeof window.startCookieDemoAnalytics === "function");
  expect(await dispatchWithoutButton(page)).toBe(0);
  expect((await context.cookies()).some(({ name }) => name === ANALYTICS_COOKIE)).toBe(false);
  await expect(page.getByRole("button", { name: "Send test event" })).toBeDisabled();
});

test("closing preferences discards changes and leaves essential enabled", async ({ page }) => {
  const REQUESTS = watchAnalytics(page);
  await page.goto("/");
  const PREFERENCES = page.getByRole("button", { name: "Preferences", exact: true });
  await PREFERENCES.click();
  const DIALOG = page.getByRole("dialog", { name: "Cookie preferences" });
  const ESSENTIAL = DIALOG.getByRole("switch", { name: "Essential" });
  const ANALYTICS = DIALOG.getByRole("switch", { name: "Analytics" });

  await expect(ESSENTIAL).toBeChecked();
  await expect(ESSENTIAL).toBeDisabled();
  await expect(ANALYTICS).not.toBeChecked();
  await ANALYTICS.click();
  await page.keyboard.press("Escape");
  await expect(DIALOG).toHaveCount(0);
  await expect(PREFERENCES).toBeFocused();
  expect(REQUESTS).toHaveLength(0);

  await PREFERENCES.click();
  await expect(ANALYTICS).not.toBeChecked();
  await ANALYTICS.click();
  await DIALOG.getByRole("button", { name: "Save preferences" }).click();
  await expect(page.getByText("Analytics is active", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Cookie settings" })).toBeFocused();
});

for (const VALUE of ["v0.accepted", "v1.corrupted"]) {
  test(`ignores an invalid consent cookie: ${VALUE}`, async ({ page, context, baseURL }) => {
    const REQUESTS = watchAnalytics(page);
    await context.addCookies([{ name: CONSENT_COOKIE, value: VALUE, url: baseURL }]);
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Accept all" })).toBeVisible();
    await expect(page.getByText("Analytics is blocked until you opt in")).toBeVisible();
    expect(REQUESTS).toHaveLength(0);
  });
}
