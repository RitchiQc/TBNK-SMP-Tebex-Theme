import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const EDGE_PATH =
  process.env.EDGE_PATH ??
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const OUT_DIR = path.resolve("preview-output");

const routes = [
  { name: "home", path: "/" },
  { name: "store", path: "/store" },
  { name: "category-ranks", path: "/store/rangs" },
  { name: "package-tbnk-plus", path: "/package/tbnk-plus" },
  { name: "status", path: "/status" },
  { name: "guide", path: "/guide" },
  { name: "login", path: "/login" },
  { name: "legal-terms", path: "/legal/terms" },
  { name: "cart-empty", path: "/cart" }
];

function attachDiagnostics(page, bucket) {
  page.on("console", (message) => {
    if (message.type() === "error") {
      const text = message.text();
      if (
        !text.includes("favicon") &&
        !text.includes("Download the React DevTools")
      ) {
        bucket.consoleErrors.push(text);
      }
    }
  });
  page.on("pageerror", (error) => {
    bucket.pageErrors.push(error.message);
  });
}

async function inspectPage(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    const overflow = Math.max(
      0,
      doc.scrollWidth - window.innerWidth,
      document.body.scrollWidth - window.innerWidth
    );
    const brokenImages = Array.from(document.images)
      .filter((image) => !image.complete || image.naturalWidth === 0)
      .map((image) => image.currentSrc || image.src)
      .slice(0, 8);

    return {
      overflow,
      brokenImages,
      title: document.title,
      h1: document.querySelector("h1")?.textContent?.trim() ?? null
    };
  });
}

async function runViewport(browser, name, viewport) {
  const context = await browser.newContext({
    viewport,
    locale: "fr-CA",
    colorScheme: "dark"
  });
  const results = [];

  for (const route of routes) {
    const page = await context.newPage();
    const diagnostics = { consoleErrors: [], pageErrors: [] };
    attachDiagnostics(page, diagnostics);

    try {
      await page.goto(`${BASE_URL}${route.path}`, {
        waitUntil: "networkidle",
        timeout: 60000
      });
      await page.waitForTimeout(400);
      await page.evaluate(async () => {
        await new Promise((resolve) => {
          let y = 0;
          const step = 700;
          const timer = setInterval(() => {
            y += step;
            window.scrollTo(0, y);
            if (y >= document.body.scrollHeight) {
              clearInterval(timer);
              window.scrollTo(0, 0);
              setTimeout(resolve, 400);
            }
          }, 40);
        });
      });
      await page.waitForTimeout(300);
      const info = await inspectPage(page);
      await page.screenshot({
        path: path.join(OUT_DIR, `${name}-${route.name}.png`),
        fullPage: true
      });
      results.push({ route: route.path, ...info, ...diagnostics });
    } catch (error) {
      results.push({
        route: route.path,
        error: error instanceof Error ? error.message : String(error),
        ...diagnostics
      });
    } finally {
      await page.close();
    }
  }

  await context.close();
  return results;
}

async function runCartFlow(browser) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    locale: "fr-CA",
    colorScheme: "dark"
  });
  const page = await context.newPage();
  const diagnostics = { consoleErrors: [], pageErrors: [] };
  attachDiagnostics(page, diagnostics);
  const result = { added: false, cartLines: 0, diagnostics };

  try {
    await page.goto(`${BASE_URL}/store/rangs`, {
      waitUntil: "networkidle",
      timeout: 60000
    });
    const addButton = page
      .getByRole("button", { name: /Abonner|Ajouter au panier/i })
      .first();
    await addButton.click();
    await page.waitForTimeout(1200);
    await page.goto(`${BASE_URL}/cart`, {
      waitUntil: "networkidle",
      timeout: 60000
    });
    await page.waitForTimeout(400);
    result.cartLines = await page.locator(".cart-line").count();
    result.added = result.cartLines > 0;
    await page.screenshot({
      path: path.join(OUT_DIR, "desktop-cart-filled.png"),
      fullPage: true
    });
  } catch (error) {
    result.error = error instanceof Error ? error.message : String(error);
  }

  await context.close();
  return result;
}

async function runLoginFlow(browser) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    locale: "fr-CA",
    colorScheme: "dark"
  });
  const page = await context.newPage();
  const diagnostics = { consoleErrors: [], pageErrors: [] };
  attachDiagnostics(page, diagnostics);
  const result = { loggedIn: false, diagnostics };

  try {
    await page.goto(`${BASE_URL}/login?next=/login`, {
      waitUntil: "networkidle",
      timeout: 60000
    });
    await page.locator("#username").fill("Alex_13241");
    await page.getByRole("button", { name: "Continuer" }).click();
    await page.waitForTimeout(1600);
    result.loggedIn = await page
      .getByText("Compte Minecraft associé", { exact: false })
      .isVisible()
      .catch(() => false);
    await page.screenshot({
      path: path.join(OUT_DIR, "desktop-login-account.png"),
      fullPage: true
    });
  } catch (error) {
    result.error = error instanceof Error ? error.message : String(error);
  }

  await context.close();
  return result;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({
    executablePath: EDGE_PATH,
    headless: true
  });

  const desktop = await runViewport(browser, "desktop", {
    width: 1440,
    height: 1000
  });
  const mobile = await runViewport(browser, "mobile", {
    width: 390,
    height: 844
  });
  const cart = await runCartFlow(browser);
  const login = await runLoginFlow(browser);

  await browser.close();

  const report = { desktop, mobile, cart, login };
  console.log(JSON.stringify(report, null, 2));

  const problems = [...desktop, ...mobile].filter(
    (item) =>
      item.error ||
      item.overflow > 1 ||
      item.consoleErrors?.length ||
      item.pageErrors?.length
  );

  if (problems.length > 0) {
    console.error(`\n${problems.length} page(s) with issues.`);
    process.exitCode = 1;
  } else {
    console.log("\nNo page-level errors or horizontal overflow detected.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
