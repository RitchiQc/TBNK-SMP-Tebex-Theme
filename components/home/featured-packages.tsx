import Link from "next/link";
import type { Package } from "@/lib/tebex/types";
import { Icon } from "@/components/ui/icons";
import { ProductCard } from "@/components/store/product-card";

export function FeaturedPackages({
  packages,
  currency,
  basketQuantities
}: {
  packages: Package[];
  currency: string;
  basketQuantities: Record<number, number>;
}) {
  if (packages.length === 0) return null;

  return (
    <section className="container-tbnk home-section">
      <div className="home-section__head">
        <div>
          <span className="eyebrow">Les plus populaires</span>
          <h2>Prêt à passer au niveau suivant ?</h2>
          <p>
            Une sélection d’avantages choisis par la communauté. Livraison
            instantanée après paiement.
          </p>
        </div>
        <Link href="/store" className="btn btn-secondary btn-sm home-section__link">
          Toute la boutique
          <Icon name="arrow-right" size={15} />
        </Link>
      </div>

      <div className="product-grid">
        {packages.map((pkg) => (
          <ProductCard
            key={pkg.id}
            pkg={pkg}
            currency={currency}
            inBasketQuantity={basketQuantities[pkg.id] ?? 0}
            returnPath="/"
          />
        ))}
      </div>

    </section>
  );
}
