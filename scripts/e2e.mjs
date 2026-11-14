import { chromium } from "playwright-core";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const BASE_HOST = new URL(BASE_URL).hostname;
const executablePath =
  process.env.BROWSER_PATH ??
  process.env.EDGE_PATH ??
  (process.platform === "win32"
    ? "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
    : undefined);

const browser = await chromium.launch({
  ...(executablePath ? { executablePath } : {}),
  headless: true
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  locale: "fr-CA"
});
await context.addCookies([
  {
    name: "tbnk_consent",
    value: encodeURIComponent(
      JSON.stringify({
        necessary: true,
        media: false,
        avatars: false,
        version: 1
      })
    ),
    domain: BASE_HOST,
    path: "/"
  }
]);
const page = await context.newPage();
const errors = [];
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
page.on("pageerror", (error) => errors.push(error.message));

const checks = {};

try {
  await page.goto(`${BASE_URL}/store/cles-coffres`, {
    waitUntil: "networkidle"
  });

  const primeCard = page
    .locator(".product-card")
    .filter({ hasText: "Clé Prime" })
    .first();
  await primeCard.locator(".qty-chip", { hasText: "5x" }).click();
  await primeCard.getByRole("button", { name: "Ajouter au panier" }).click();
  await page.waitForTimeout(1400);

  checks.cartCountAfterAdd = await page
    .locator(".cart-count")
    .first()
    .textContent()
    .catch(() => null);

  await page.goto(`${BASE_URL}/cart`, {
    waitUntil: "networkidle"
  });
  await page.waitForTimeout(400);

  checks.cartLines = await page.locator(".cart-line").count();
  checks.quantity = await page
    .locator(".cart-line input[type=number]")
    .first()
    .inputValue()
    .catch(() => null);
  checks.totalBefore = await page
    .locator(".summary-total strong")
    .innerText();

  await page.locator(".coupon-form input").fill("TBNK10");
  await page.getByRole("button", { name: "Appliquer" }).click();
  await page.waitForTimeout(1400);
  checks.totalAfterCoupon = await page
    .locator(".summary-total strong")
    .innerText();
  checks.couponVisible = await page
    .getByText("TBNK10", { exact: false })
    .first()
    .isVisible()
    .catch(() => false);

  await page.screenshot({
    path: "preview-output/desktop-cart-coupon.png",
    fullPage: true
  });

  await page.getByRole("button", { name: "Passer au paiement" }).click();
  await page.waitForTimeout(700);
  checks.demoModalVisible = await page
    .getByRole("heading", { name: "Paiement Tebex" })
    .isVisible()
    .catch(() => false);

  if (checks.demoModalVisible) {
    await page.getByRole("button", { name: "Continuer la visite" }).click();
  }

  await page.getByRole("button", { name: "Retirer", exact: true }).click();
  await page.waitForTimeout(1400);
  checks.emptyAfterRemove = await page
    .getByText("Ton panier est vide", { exact: false })
    .isVisible()
    .catch(() => false);
} catch (error) {
  checks.error = error instanceof Error ? error.message : String(error);
}

checks.consoleErrors = errors;
console.log(JSON.stringify(checks, null, 2));

const passed =
  !checks.error &&
  checks.cartLines === 1 &&
  checks.quantity === "5" &&
  checks.totalBefore !== checks.totalAfterCoupon &&
  checks.demoModalVisible === true &&
  checks.emptyAfterRemove === true &&
  checks.consoleErrors.length === 0;

console.log(passed ? "\nE2E demo flow passed." : "\nE2E demo flow has issues.");
if (!passed) process.exitCode = 1;

await browser.close();
