import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PackageGallery } from "@/components/package/package-gallery";
import { PackagePurchase } from "@/components/package/package-purchase";
import { ProductCard } from "@/components/store/product-card";
import { StoreUnavailable } from "@/components/store/store-unavailable";
import { Icon } from "@/components/ui/icons";
import { getCurrentBasketSafe } from "@/lib/basket/session";
import { stripHtml, truncate } from "@/lib/format";
import { siteConfig } from "@/lib/site";
import {
  getPackageBySlugSafe,
  getStoreDataSafe
} from "@/lib/tebex/store";
import type { Package } from "@/lib/tebex/types";

type PageProps = {
  params: Promise<{ slug: string }>;
};

/**
 * URL absolue du proxy first-party : les crawlers sociaux et le JSON-LD
 * obtiennent toujours une image à jour, même si l'URL Tebex a changé.
 */
function packageImageUrl(pkg: Package): string | null {
  if (!pkg.ident && !pkg.image) return null;

  const params = new URLSearchParams();
  if (pkg.image) params.set("src", pkg.image);
  if (pkg.ident) params.set("pkg", pkg.ident);

  return `${siteConfig.url}/api/image?${params.toString()}`;
}

export async function generateMetadata({
  params
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPackageBySlugSafe(slug);

  if (!result) {
    notFound();
  }

  const { pkg } = result;
  const description = truncate(stripHtml(pkg.description), 160);
  const image = pkg.image ? packageImageUrl(pkg) : null;

  return {
    title: pkg.name,
    description:
      description ||
      `Achète ${pkg.name} sur la boutique ${siteConfig.name}.`,
    alternates: { canonical: `/package/${pkg.slug}` },
    openGraph: {
      title: `${pkg.name} — ${siteConfig.name}`,
      description,
      images: image ? [{ url: image }] : undefined
    }
  };
}

export default async function PackagePage({ params }: PageProps) {
  const { slug } = await params;
  const [result, { webstore, unavailable }, basket] = await Promise.all([
    getPackageBySlugSafe(slug),
    getStoreDataSafe(),
    getCurrentBasketSafe()
  ]);

  if (!result) {
    if (unavailable) {
      return <StoreUnavailable />;
    }
    notFound();
  }

  if (webstore.disabled) {
    return (
      <StoreUnavailable
        title="Boutique temporairement fermée"
        message="La boutique est momentanément fermée. Reviens bientôt ou rejoins le Discord pour être informé de la réouverture."
      />
    );
  }

  const { pkg, category } = result;
  const packageImage = packageImageUrl(pkg);
  const currency = pkg.currency || webstore.currency || siteConfig.currency;
  const inBasketQuantity =
    basket?.packages.find((item) => item.id === pkg.id)?.quantity ?? 0;

  const related = category.packages
    .filter((item) => item.id !== pkg.id)
    .slice(0, 3);

  const basketQuantities: Record<number, number> = {};
  for (const item of basket?.packages ?? []) {
    basketQuantities[item.id] = item.quantity;
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: pkg.name,
    description: stripHtml(pkg.description),
    image:
      pkg.image && packageImage
        ? packageImage
        : `${siteConfig.url}${siteConfig.banner}`,
    category: category.name,
    offers: {
      "@type": "Offer",
      url: `${siteConfig.url}/package/${pkg.slug}`,
      priceCurrency: currency,
      price: pkg.totalPrice.toFixed(2),
      availability: "https://schema.org/InStock"
    }
  };

  // JSON.stringify n'échappe pas `</script>` : sans cela, un nom de package
  // contenant cette chaîne peut sortir de la balise JSON-LD.
  const jsonLdString = JSON.stringify(jsonLd)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString }}
      />

      <div className="container-tbnk" style={{ paddingTop: 34 }}>
        <nav className="breadcrumb" aria-label="Fil d’Ariane">
          <Link href="/">Accueil</Link>
          <span>/</span>
          <Link href="/store">Boutique</Link>
          <span>/</span>
          <Link href={`/store/${category.slug}`}>{category.name}</Link>
          <span>/</span>
          <b>{pkg.name}</b>
        </nav>

        <div style={{ marginTop: 20 }}>
          <span className="eyebrow">{category.name}</span>
          <h1 className="package-title">{pkg.name}</h1>
          <div className="package-meta">
            {pkg.popular ? (
              <span className="badge badge-accent">
                <Icon name="star" size={10} />
                Populaire
              </span>
            ) : null}
            {pkg.discountPercent > 0 ? (
              <span className="badge badge-danger">
                -{pkg.discountPercent}%
              </span>
            ) : null}
            {pkg.type === "subscription" ? (
              <span className="badge badge-muted">Abonnement</span>
            ) : (
              <span className="badge badge-muted">Achat unique</span>
            )}
            <span className="badge badge-success">
              <Icon name="check-circle" size={10} />
              Livraison en jeu
            </span>
          </div>
        </div>

        <div className="package-layout" style={{ marginTop: 20 }}>
          <div className="package-main">
            <PackageGallery
              media={pkg.media}
              name={pkg.name}
              packageRef={pkg.ident}
              fallback="/images/package-placeholder.svg"
            />

            <div className="package-description">
              <div className="package-description__head">
                <h2>Description</h2>
                <span className="tag">TBNK-SMP</span>
              </div>
              <div
                className="prose-tbnk"
                dangerouslySetInnerHTML={{ __html: pkg.description }}
              />
            </div>
          </div>

          <PackagePurchase
            pkg={pkg}
            currency={currency}
            inBasketQuantity={inBasketQuantity}
            returnPath={`/package/${pkg.slug}`}
          />
        </div>
      </div>

      {related.length > 0 ? (
        <section className="container-tbnk home-section">
          <div className="home-section__head">
            <div>
              <span className="eyebrow">Dans la même catégorie</span>
              <h2>Tu pourrais aussi aimer</h2>
            </div>
            <Link
              href={`/store/${category.slug}`}
              className="btn btn-secondary btn-sm home-section__link"
            >
              Voir {category.name}
              <Icon name="arrow-right" size={15} />
            </Link>
          </div>
          <div className="product-grid product-grid--related">
            {related.map((item) => (
              <ProductCard
                key={item.id}
                pkg={item}
                currency={currency}
                inBasketQuantity={basketQuantities[item.id] ?? 0}
                returnPath={`/package/${pkg.slug}`}
              />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
