import { chromium } from "playwright-core";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const BASE_HOST = new URL(BASE_URL).hostname;
const executablePath =
  process.env.BROWSER_PATH ??
  process.env.EDGE_PATH ??
  (process.platform === "win32"
    ? "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
    : undefined);

const failures = [];
const results = {};

async function checkStatus(path, expected) {
  const response = await fetch(`${BASE_URL}${path}`, { redirect: "manual" });
  results[path] = response.status;
  if (response.status !== expected) {
    failures.push(`${path}: attendu ${expected}, reçu ${response.status}`);
  }
}

await checkStatus("/legal/__proto__", 404);
await checkStatus("/legal/constructor", 404);
await checkStatus("/package/%25E0%25A4%25A", 404);
await checkStatus("/login?next=a&next=b", 200);

const browser = await chromium.launch({
  ...(executablePath ? { executablePath } : {}),
  headless: true
});

try {
  const loginContext = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    locale: "fr-CA"
  });
  const loginPage = await loginContext.newPage();
  const consoleErrors = [];
  loginPage.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await loginPage.goto(`${BASE_URL}/login?next=/%5Cevil.com`, {
    waitUntil: "networkidle"
  });
  await loginPage.locator("#username").fill("Alex_13241");
  await loginPage.getByRole("button", { name: "Continuer" }).click();
  await loginPage.waitForTimeout(1600);

  const loginOrigin = new URL(loginPage.url()).origin;
  results.loginRedirectOrigin = loginOrigin;
  if (loginOrigin !== new URL(BASE_URL).origin) {
    failures.push(
      `redirection ouverte : le login a quitté l'origine (${loginPage.url()})`
    );
  }

  await loginContext.close();

  const pendingContext = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    locale: "fr-CA"
  });
  await pendingContext.addCookies([
    {
      name: "tbnk_pending_add",
      value: encodeURIComponent(
        JSON.stringify({
          packageId: "pkg_1_101",
          quantity: 1,
          variableData: {},
          returnPath: "https://evil.com"
        })
      ),
      domain: BASE_HOST,
      path: "/"
    }
  ]);
  const pendingPage = await pendingContext.newPage();
  await pendingPage.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
  await pendingPage.locator("#username").fill("Alex_13241");
  await pendingPage.getByRole("button", { name: "Continuer" }).click();
  await pendingPage.waitForTimeout(1600);

  const pendingOrigin = new URL(pendingPage.url()).origin;
  results.pendingRedirectOrigin = pendingOrigin;
  if (pendingOrigin !== new URL(BASE_URL).origin) {
    failures.push(
      `pending.returnPath non validé : redirection hors origine (${pendingPage.url()})`
    );
  }
  await pendingContext.close();

  const checkoutContext = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    locale: "fr-CA"
  });
  const checkoutPage = await checkoutContext.newPage();

  await checkoutPage.goto(`${BASE_URL}/store/cles-coffres`, {
    waitUntil: "networkidle"
  });
  const primeCard = checkoutPage
    .locator(".product-card")
    .filter({ hasText: "Clé Prime" })
    .first();
  await primeCard.getByRole("button", { name: "Ajouter au panier" }).click();
  await checkoutPage.waitForTimeout(1400);

  await checkoutPage.goto(`${BASE_URL}/cart`, { waitUntil: "networkidle" });
  const linesBefore = await checkoutPage.locator(".cart-line").count();

  await checkoutPage.goto(`${BASE_URL}/api/checkout/success`, {
    waitUntil: "networkidle"
  });
  const successUrl = checkoutPage.url();

  await checkoutPage.goto(`${BASE_URL}/cart`, { waitUntil: "networkidle" });
  const linesAfter = await checkoutPage.locator(".cart-line").count();

  results.checkoutSuccess = {
    linesBefore,
    linesAfter,
    successUrl
  };

  if (linesBefore !== 1) {
    failures.push(`checkout : ${linesBefore} ligne(s) avant, attendu 1`);
  }
  if (linesAfter !== 0) {
    failures.push(`checkout : ${linesAfter} ligne(s) après, attendu 0`);
  }
  if (!successUrl.includes("checkout=success")) {
    failures.push(`checkout : URL de succès inattendue (${successUrl})`);
  }

  results.consoleErrors = consoleErrors;
  if (consoleErrors.length > 0) {
    failures.push(`erreurs console : ${consoleErrors.join(" | ")}`);
  }

  await checkoutContext.close();
} finally {
  await browser.close();
}

console.log(JSON.stringify(results, null, 2));

if (failures.length > 0) {
  console.error(`\nSecurity e2e failed:\n- ${failures.join("\n- ")}`);
  process.exitCode = 1;
} else {
  console.log("\nSecurity e2e passed.");
}