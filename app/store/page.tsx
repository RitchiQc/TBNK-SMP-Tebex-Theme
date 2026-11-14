import type { Metadata } from "next";
import Link from "next/link";
import { StoreCatalog } from "@/components/store/store-catalog";
import { Icon } from "@/components/ui/icons";
import { getCurrentBasket } from "@/lib/basket/session";
import { siteConfig } from "@/lib/site";
import { getStoreData } from "@/lib/tebex/store";

export const metadata: Metadata = {
  title: "Boutique",
  description:
    "Rangs, clés, cosmétiques et boosters du serveur Minecraft Java TBNK-SMP. Livraison instantanée via Tebex.",
  alternates: { canonical: "/store" }
};

export default async function StorePage() {
  const [{ webstore, categories, packages }, basket] = await Promise.all([
    getStoreData(),
    getCurrentBasket()
  ]);

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
            <b>Boutique</b>
          </nav>
          <span className="eyebrow" style={{ marginTop: 18 }}>
            Boutique officielle
          </span>
          <h1>
            La boutique <span className="text-gradient">TBNK-SMP</span>
          </h1>
          <p>
            Rangs, clés, cosmétiques et boosters : chaque article est pensé pour
            améliorer ton expérience sans casser l’équilibre du serveur. Les
            articles éligibles sont livrés automatiquement en jeu après
            paiement.
          </p>
          <div className="page-hero__meta">
            <span className="badge badge-success">
              <Icon name="check-circle" size={10} />
              Livraison Tebex
            </span>
            <span className="badge badge-accent">Java Edition</span>
            <span className="badge badge-muted">
              {categories.length} catégories · {packages.length} articles
            </span>
            {basket?.isMock ? (
              <span className="badge badge-accent">Mode démo</span>
            ) : null}
          </div>
        </div>
      </section>

      {categories.length === 0 ? (
        <section className="container-tbnk section">
          <div className="empty-state">
            <span className="empty-state__icon">
              <Icon name="package" size={24} />
            </span>
            <h2>Boutique en préparation</h2>
            <p>
              Les catégories et les articles n’ont pas encore été publiés. Reviens
              bientôt ou rejoins le Discord pour être prévenu de l’ouverture.
            </p>
            <a
              href={siteConfig.discordUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm"
            >
              <Icon name="discord" size={15} />
              Rejoindre le Discord
            </a>
          </div>
        </section>
      ) : (
        <StoreCatalog
          categories={categories}
          allCategories={categories}
          currency={webstore.currency || siteConfig.currency}
          basketQuantities={basketQuantities}
          showCategorySections
        />
      )}
    </>
  );
}
