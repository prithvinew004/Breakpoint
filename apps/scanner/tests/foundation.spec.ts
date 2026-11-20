import { expect, test } from "@playwright/test";

test("collects an error-level console event", async ({ page }) => {
  const messageText = "T031 console error proof";
  const consoleError = page.waitForEvent(
    "console",
    (message) => message.type() === "error" && message.text() === messageText,
  );

  await page.evaluate((message) => console.error(message), messageText);

  const message = await consoleError;
  expect(message.type()).toBe("error");
  expect(message.text()).toBe(messageText);
});

test("collects an aborted request", async ({ page }) => {
  const requestPath = "/__t031-aborted-request";
  await page.route(`**${requestPath}`, (route) => route.abort("aborted"));
  const failedRequest = page.waitForEvent(
    "requestfailed",
    (request) => new URL(request.url()).pathname === requestPath,
  );

  await expect(page.goto(requestPath)).rejects.toThrow("net::ERR_ABORTED");

  const request = await failedRequest;
  expect(new URL(request.url()).pathname).toBe(requestPath);
  expect(request.failure()?.errorText).toBe("net::ERR_ABORTED");
});

test("collects a failed HTTP response", async ({ page }) => {
  const responsePath = "/__t031-failed-response";
  await page.route(`**${responsePath}`, (route) =>
    route.fulfill({
      status: 503,
      contentType: "text/plain",
      body: "T031 unavailable proof",
    }),
  );
  const failedResponse = page.waitForEvent(
    "response",
    (response) => new URL(response.url()).pathname === responsePath,
  );

  await page.goto(responsePath);

  const response = await failedResponse;
  expect(response.status()).toBe(503);
  expect(response.ok()).toBe(false);
});

test("foundation page is semantic and responsive", async ({
  page,
}, testInfo) => {
  const consoleErrors: string[] = [];
  const requestFailures: Array<{
    errorText: string;
    method: string;
    url: string;
  }> = [];
  const failedResponses: Array<{
    method: string;
    status: number;
    url: string;
  }> = [];

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("requestfailed", (request) => {
    requestFailures.push({
      errorText: request.failure()?.errorText ?? "unknown failure",
      method: request.method(),
      url: request.url(),
    });
  });
  page.on("response", (response) => {
    if (response.status() >= 400) {
      failedResponses.push({
        method: response.request().method(),
        status: response.status(),
        url: response.url(),
      });
    }
  });

  await page.goto("/");

  await expect(page.getByRole("main")).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 1, name: "Breakpoint" }),
  ).toBeVisible();
  await expect(page.getByText("Phase 0 repository foundation")).toBeVisible();

  const overflows = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
  expect(overflows).toBe(false);

  const content = await page.locator("main > section").first().boundingBox();
  expect(content?.x).toBeGreaterThanOrEqual(24);

  await page.screenshot({
    path: testInfo.outputPath("foundation.png"),
    fullPage: true,
  });

  expect
    .soft(consoleErrors, "Unexpected error-level browser console messages")
    .toEqual([]);
  expect
    .soft(requestFailures, "Unexpected network-layer request failures")
    .toEqual([]);
  expect
    .soft(failedResponses, "Unexpected HTTP responses with status >= 400")
    .toEqual([]);
});
