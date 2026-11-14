import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StoreCatalog } from "@/components/store/store-catalog";
import { StoreUnavailable } from "@/components/store/store-unavailable";
import { Icon } from "@/components/ui/icons";
import { getCurrentBasketSafe } from "@/lib/basket/session";
import { stripHtml } from "@/lib/format";
import { siteConfig } from "@/lib/site";
import {
  getCategoryBySlugSafe,
  getStoreDataSafe
} from "@/lib/tebex/store";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlugSafe(slug);

  if (!category) {
    notFound();
  }

  const description = stripHtml(category.description).slice(0, 160);

  return {
    title: category.name,
    description:
      description ||
      `Découvre la catégorie ${category.name} de la boutique ${siteConfig.name}.`,
    alternates: { canonical: `/store/${category.slug}` }
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const [category, { webstore, categories, unavailable }, basket] =
    await Promise.all([
      getCategoryBySlugSafe(slug),
      getStoreDataSafe(),
      getCurrentBasketSafe()
    ]);

  if (!category) {
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

  const basketQuantities: Record<number, number> = {};
  for (const item of basket?.packages ?? []) {
    basketQuantities[item.id] = item.quantity;
  }

  return (
    <>
      <section className="page-hero">
        <div className="container-tbnk page-hero__inner">
          <nav className="breadcrumb" aria-label="Fil d’Ariane">
            <Link href="/">Accueil</Link>
            <span>/</span>
            <Link href="/store">Boutique</Link>
            <span>/</span>
            <b>{category.name}</b>
          </nav>
          <span className="eyebrow" style={{ marginTop: 18 }}>
            {category.packages.length} articles disponibles
          </span>
          <h1>{category.name}</h1>
          <p>
            {stripHtml(category.description) ||
              `Découvre les articles de la catégorie ${category.name}.`}
          </p>
          <div className="page-hero__meta">
            <span className="badge badge-success">
              <Icon name="check-circle" size={10} />
              Livraison instantanée
            </span>
            <span className="badge badge-muted">Paiement Tebex</span>
            {basket?.isMock ? (
              <span className="badge badge-accent">Mode démo</span>
            ) : null}
          </div>
        </div>
      </section>

      <StoreCatalog
        categories={[category]}
        allCategories={categories}
        activeCategoryId={category.id}
        currency={webstore.currency || siteConfig.currency}
        basketQuantities={basketQuantities}
        showCategorySections={false}
      />
    </>
  );
}
