import Link from "next/link";
import { stripHtml, truncate } from "@/lib/format";
import type { Category } from "@/lib/tebex/types";
import { Icon, type IconName } from "@/components/ui/icons";

function categoryIcon(category: Category): IconName {
  const key = `${category.slug} ${category.name}`.toLowerCase();
  if (key.includes("rang") || key.includes("rank")) return "crown";
  if (key.includes("clé") || key.includes("cle") || key.includes("key")) return "key";
  if (key.includes("cosmet") || key.includes("cape") || key.includes("aura")) return "sparkles";
  if (key.includes("boost")) return "bolt";
  if (key.includes("coffre") || key.includes("crate")) return "gift";
  return "package";
}

export function CategoryGrid({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="container-tbnk home-section" id="boutique">
      <div className="home-section__head">
        <div>
          <span className="eyebrow">La boutique</span>
          <h2>Choisis ton prochain avantage</h2>
          <p>
            Chaque achat soutient directement le serveur et la communauté. Les
            articles éligibles sont livrés automatiquement en jeu.
          </p>
        </div>
        <Link href="/store" className="btn btn-secondary btn-sm home-section__link">
          Voir tous les articles
          <Icon name="arrow-right" size={15} />
        </Link>
      </div>

      <div className="category-grid">
        {categories.map((category, index) => (
          <Link
            key={category.id}
            href={`/store/${category.slug}`}
            className="category-card"
          >
            <span className="category-card__number">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="category-card__icon">
              <Icon name={categoryIcon(category)} size={26} />
            </span>
            <h3 className="category-card__title">{category.name}</h3>
            <p className="category-card__text">
              {truncate(stripHtml(category.description), 115)}
            </p>
            <div className="category-card__bottom">
              <span>
                {category.packages.length}{" "}
                {category.packages.length > 1 ? "articles" : "article"}
              </span>
              <Icon name="arrow-up-right" size={15} />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
