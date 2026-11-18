import { expect, test } from "@playwright/test";

test("foundation page is semantic and responsive", async ({
  page,
}, testInfo) => {
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
});
