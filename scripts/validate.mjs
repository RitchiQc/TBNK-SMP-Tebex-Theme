import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const requiredFiles = [
  "package.json",
  "next.config.ts",
  "tsconfig.json",
  "postcss.config.mjs",
  ".env.example",
  "app/layout.tsx",
  "app/page.tsx",
  "app/store/page.tsx",
  "app/store/[slug]/page.tsx",
  "app/package/[slug]/page.tsx",
  "app/cart/page.tsx",
  "app/login/page.tsx",
  "app/status/page.tsx",
  "app/guide/page.tsx",
  "lib/tebex/client.ts",
  "lib/tebex/store.ts",
  "lib/basket/actions.ts",
  "public/images/logo-tbnk.svg",
  "public/images/banner-tbnk.svg",
  "public/images/package-placeholder.svg",
  "README.md"
];

const requiredAssets = [
  "public/images/logo.png",
  "public/images/banner.png",
  "public/images/logo-tbnk.svg",
  "public/images/banner-tbnk.svg",
  "public/images/package-placeholder.svg",
  "public/images/packages/rank.svg",
  "public/images/packages/key.svg",
  "public/images/packages/cosmetic.svg",
  "public/images/packages/booster.svg",
  "app/icon.svg"
];

const problems = [];

for (const file of requiredFiles) {
  try {
    await access(path.join(root, file));
  } catch {
    problems.push(`Fichier manquant : ${file}`);
  }
}

for (const asset of requiredAssets) {
  try {
    await access(path.join(root, asset));
  } catch {
    problems.push(`Asset manquant : ${asset}`);
  }
}

const envExample = await readFile(path.join(root, ".env.example"), "utf8");
for (const key of ["TEBEX_PUBLIC_TOKEN", "NEXT_PUBLIC_SITE_URL"]) {
  if (!envExample.includes(key)) {
    problems.push(`.env.example ne contient pas ${key}`);
  }
}

const readme = await readFile(path.join(root, "README.md"), "utf8");
if (readme.length < 1500) {
  problems.push("README.md semble trop court ou incomplet.");
}

async function walk(directory) {
  const entries = await readdir(path.join(root, directory), {
    withFileTypes: true
  });
  const files = [];
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".next") continue;
    const relative = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(relative)));
    } else if (/\.(tsx?|css|mjs|json)$/.test(entry.name)) {
      files.push(relative);
    }
  }
  return files;
}

const sourceFiles = [
  ...(await walk("app")),
  ...(await walk("components")),
  ...(await walk("lib")),
  ...(await walk("styles"))
];

const localAssetPattern = /["'(]\/images\/[^"')\s]+\.(?:svg|png|webp|jpe?g)["')]/gi;
for (const file of sourceFiles) {
  const content = await readFile(path.join(root, file), "utf8");

  if (/TEBEX_PRIVATE|private[_-]?key\s*[:=]\s*["'][^"']+["']/i.test(content)) {
    problems.push(`Secret potentiel détecté dans ${file}`);
  }

  const matches = content.match(localAssetPattern) ?? [];
  for (const match of matches) {
    const assetPath = match.replace(/^["'(]/, "").replace(/["')]$/, "");
    try {
      await access(path.join(root, "public", assetPath.replace(/^\//, "")));
    } catch {
      problems.push(`Référence d'asset introuvable dans ${file} : ${assetPath}`);
    }
  }
}

if (problems.length > 0) {
  console.log(
    `Validation failed:\n${problems.map((problem) => `- ${problem}`).join("\n")}`
  );
  process.exitCode = 1;
} else {
  console.log(
    `Validation passed: ${requiredFiles.length} fichiers requis, ${requiredAssets.length} assets, ${sourceFiles.length} fichiers source.`
  );
}
