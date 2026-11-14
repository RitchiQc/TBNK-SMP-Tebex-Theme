"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDeferredValue, useMemo, useState } from "react";
import { stripHtml } from "@/lib/format";
import type { Category, Package } from "@/lib/tebex/types";
import { Icon } from "@/components/ui/icons";
import { ProductCard } from "./product-card";

type SortOption = "recommended" | "price-asc" | "price-desc" | "name";

function sortPackages(packages: Package[], sort: SortOption): Package[] {
  const copy = [...packages];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.totalPrice - b.totalPrice);
    case "price-desc":
      return copy.sort((a, b) => b.totalPrice - a.totalPrice);
    case "name":
      return copy.sort((a, b) => a.name.localeCompare(b.name, "fr"));
    default:
      return copy.sort((a, b) => a.order - b.order);
  }
}

export function StoreCatalog({
  categories,
  allCategories,
  currency,
  basketQuantities,
  showCategorySections = true,
  activeCategoryId
}: {
  categories: Category[];
  allCategories: Category[];
  currency: string;
  basketQuantities: Record<number, number>;
  showCategorySections?: boolean;
  activeCategoryId?: number;
}) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("recommended");
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim().toLowerCase();

  const filteredCategories = useMemo(() => {
    return categories
      .map((category) => {
        const packages = category.packages.filter((pkg) => {
          if (!normalizedQuery) return true;
          const haystack = [pkg.name, pkg.categoryName, stripHtml(pkg.description)]
            .join(" ")
            .toLowerCase();
          return haystack.includes(normalizedQuery);
        });

        return {
          ...category,
          packages: sortPackages(packages, sort)
        };
      })
      .filter((category) => category.packages.length > 0);
  }, [categories, normalizedQuery, sort]);

  const flatResults = useMemo(
    () =>
      filteredCategories.flatMap((category) =>
        category.packages.map((pkg) => ({ pkg, category }))
      ),
    [filteredCategories]
  );

  const resultCount = flatResults.length;

  return (
    <>
      <div className="store-chips-bar">
        <div className="container-tbnk">
          <div className="category-chips">
            <Link
              href="/store"
              className={`chip${!showCategorySections && !activeCategoryId ? " is-active" : ""}`}
            >
              <Icon name="store" size={13} />
              Tout
            </Link>
            {allCategories.map((category) =>
              showCategorySections ? (
                <a
                  key={category.slug}
                  href={`#category-${category.slug}`}
                  className="chip"
                >
                  {category.name}
                  <span className="chip__count">{category.packages.length}</span>
                </a>
              ) : (
                <Link
                  key={category.slug}
                  href={`/store/${category.slug}`}
                  className={`chip${activeCategoryId === category.id ? " is-active" : ""}`}
                >
                  {category.name}
                  <span className="chip__count">{category.packages.length}</span>
                </Link>
              )
            )}
          </div>
        </div>
      </div>

      <div className="container-tbnk" style={{ paddingTop: 28 }}>
        <div className="store-toolbar">
          <label className="store-search">
            <Icon name="search" size={16} />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher un rang, une clé, un cosmétique…"
              aria-label="Rechercher dans la boutique"
            />
          </label>
          <select
            className="store-sort"
            value={sort}
            onChange={(event) => setSort(event.target.value as SortOption)}
            aria-label="Trier les articles"
          >
            <option value="recommended">Recommandés</option>
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix décroissant</option>
            <option value="name">Nom (A–Z)</option>
          </select>
        </div>

        <p className="store-results">
          <strong>{resultCount}</strong>{" "}
          {resultCount > 1 ? "articles disponibles" : "article disponible"}
          {normalizedQuery ? ` pour « ${deferredQuery} »` : ""}
        </p>

        {resultCount === 0 ? (
          <div className="empty-state">
            <span className="empty-state__icon">
              <Icon name="search" size={24} />
            </span>
            <h2>Aucun article trouvé</h2>
            <p>
              Essaye un autre mot-clé ou explore toutes les catégories de la
              boutique.
            </p>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setQuery("")}
            >
              Effacer la recherche
            </button>
          </div>
        ) : normalizedQuery || !showCategorySections ? (
          <div className="product-grid">
            {flatResults.map(({ pkg }) => (
              <ProductCard
                key={pkg.id}
                pkg={pkg}
                currency={currency}
                inBasketQuantity={basketQuantities[pkg.id] ?? 0}
                returnPath={pathname}
              />
            ))}
          </div>
        ) : (
          filteredCategories.map((category) => (
            <section
              key={category.slug}
              id={`category-${category.slug}`}
              className="category-section"
            >
              <div className="category-section__head">
                <div>
                  <h2>{category.name}</h2>
                  {category.description ? (
                    <p>{stripHtml(category.description)}</p>
                  ) : null}
                </div>
                <span className="category-section__count">
                  {category.packages.length} items
                </span>
              </div>
              <div className="product-grid">
                {category.packages.map((pkg) => (
                  <ProductCard
                    key={pkg.id}
                    pkg={pkg}
                    currency={currency}
                    inBasketQuantity={basketQuantities[pkg.id] ?? 0}
                    returnPath={pathname}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </>
  );
}
