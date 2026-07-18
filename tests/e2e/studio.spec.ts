import { expect, test } from "@playwright/test";
import { stat } from "node:fs/promises";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("poster-canvas")).toBeVisible();
  await expect(page.locator(".posterFrame")).toHaveAttribute("data-status", "ready", {
    timeout: 30_000,
  });
});

test("renders a nonblank poster and keeps the viewport free of horizontal overflow", async ({
  page,
}, testInfo) => {
  const pixelEvidence = await page.getByTestId("poster-canvas").evaluate((canvas) => {
    const element = canvas as HTMLCanvasElement;
    const context = element.getContext("2d");
    if (!context) return { nonBlank: 0, width: 0, height: 0 };
    const points = [
      [0.1, 0.1],
      [0.5, 0.3],
      [0.8, 0.6],
      [0.5, 0.9],
    ];
    let nonBlank = 0;
    for (const [x, y] of points) {
      const pixel = context.getImageData(
        Math.floor(element.width * x),
        Math.floor(element.height * y),
        1,
        1,
      ).data;
      if (pixel[3] > 0 && pixel[0] + pixel[1] + pixel[2] > 12) nonBlank += 1;
    }
    return { nonBlank, width: element.width, height: element.height };
  });

  expect(pixelEvidence.nonBlank).toBeGreaterThanOrEqual(3);
  expect(pixelEvidence.width).toBeGreaterThan(500);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);

  if (testInfo.project.name === "mobile") {
    const undersizedButtons = await page.locator("button:visible").evaluateAll((buttons) =>
      buttons
        .map((button) => {
          const box = button.getBoundingClientRect();
          return { label: button.textContent?.trim(), width: box.width, height: box.height };
        })
        .filter((button) => button.width < 44 || button.height < 44),
    );
    expect(undersizedButtons).toEqual([]);
  }
});

test("updates composition controls and downloads a PNG", async ({ page }) => {
  await page.getByRole("button", { name: "Archive" }).click();
  await page.getByRole("button", { name: "1:1" }).click();
  await expect(page.locator(".previewHeader strong")).toContainText("Archive / 1:1");

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download PNG" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/museum|wave|kanagawa/i);
  const downloadPath = await download.path();
  expect(downloadPath).not.toBeNull();
  expect((await stat(downloadPath!)).size).toBeGreaterThan(100_000);
  await expect(page.locator(".actionStatus")).toContainText("PNG downloaded");
});

test("restores a shared composition from its URL", async ({ page }) => {
  await page.goto(
    "/?art=16568&layout=full-bleed&ratio=story&scale=1.20&fx=-0.10&fy=0.16&utm_source=share",
  );
  await expect(page.locator(".posterFrame")).toHaveAttribute("data-status", "ready", {
    timeout: 30_000,
  });
  await expect(page.locator(".previewHeader strong")).toContainText("Full bleed / 9:16");
  await expect(page.locator(".artworkCaption")).toContainText("Water Lilies");
  await expect(page.getByLabel("Zoom")).toHaveValue("1.2");
});

test("keeps curated works available when live search fails", async ({ page }) => {
  await page.route("**/api/v1/artworks/search**", (route) =>
    route.fulfill({ status: 503, contentType: "application/json", body: "{}" }),
  );
  await page.getByPlaceholder("Monet, waves, Paris…").fill("impressionism");
  await expect(page.locator(".resultStatus")).toContainText("unavailable", { timeout: 10_000 });
  await expect(page.locator(".artworkResult")).toHaveCount(6);
  await expect(page.getByTestId("poster-canvas")).toBeVisible();
});
