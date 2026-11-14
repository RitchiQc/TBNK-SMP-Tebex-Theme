import { getHeaderBasket } from "@/lib/basket/session";
import { siteConfig } from "@/lib/site";
import { getStoreData } from "@/lib/tebex/store";
import { HeaderClient } from "./header-client";

export async function SiteHeader() {
  const [{ webstore, categories, isMock }, header] = await Promise.all([
    getStoreData(),
    getHeaderBasket()
  ]);

  return (
    <HeaderClient
      storeName={webstore.name || siteConfig.name}
      logo={webstore.logo || siteConfig.logo}
      categories={categories.map((category) => ({
        name: category.name,
        slug: category.slug,
        packageCount: category.packages.length
      }))}
      basketCount={header.count}
      username={header.username}
      isMock={isMock}
    />
  );
}
