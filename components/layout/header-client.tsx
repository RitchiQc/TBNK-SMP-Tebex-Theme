"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { siteConfig } from "@/lib/site";
import { Icon } from "@/components/ui/icons";
import { PlayerAvatar } from "@/components/ui/player-avatar";
import { MobileMenu, type CategoryLink } from "./mobile-menu";

type HeaderClientProps = {
  storeName: string;
  logo: string;
  categories: CategoryLink[];
  basketCount: number;
  username: string | null;
  isMock: boolean;
};

export function HeaderClient({
  storeName,
  logo,
  categories,
  basketCount,
  username,
  isMock
}: HeaderClientProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("menu-open");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/#")) return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const isShopActive =
    pathname === "/store" || pathname.startsWith("/package/");

  return (
    <>
      <header className={`site-header${scrolled ? " is-scrolled" : ""}`}>
        <div className="container-tbnk header-inner">
          <Link href="/" className="brand" aria-label={`${storeName} — Accueil`}>
            <img className="brand__logo" src={logo} alt={storeName} />
            {isMock ? <span className="mock-badge">Démo</span> : null}
          </Link>

          <nav className="main-nav" aria-label="Navigation principale">
            <Link href="/" className={isActive("/") ? "is-active" : undefined}>
              Accueil
            </Link>
            <Link
              href="/store"
              className={isShopActive ? "is-active" : undefined}
            >
              Boutique
            </Link>
            <Link
              href="/status"
              className={isActive("/status") ? "is-active" : undefined}
            >
              Statut
            </Link>
            <Link href="/guide">Guide</Link>
            <a
              href={siteConfig.discordUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Discord
            </a>
          </nav>

          <div className="header-actions">
            <Link
              href="/cart"
              className="cart-button"
              aria-label={`Panier — ${basketCount} article(s)`}
            >
              <Icon name="cart" size={17} />
              <span className="cart-label">Panier</span>
              {basketCount > 0 ? (
                <span className="cart-count">{basketCount}</span>
              ) : null}
            </Link>
            {username ? (
              <Link
                href="/login"
                className="user-button"
                aria-label={`Compte de ${username}`}
              >
                <PlayerAvatar username={username} size={30} />
                <span className="user-name">{username}</span>
              </Link>
            ) : (
              <Link href="/login" className="user-button">
                <Icon name="user" size={16} />
                <span className="user-name">Connexion</span>
              </Link>
            )}
            <button
              type="button"
              className="menu-toggle"
              aria-label="Ouvrir le menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen(true)}
            >
              <Icon name="menu" size={20} />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        storeName={storeName}
        logo={logo}
        categories={categories}
        username={username}
      />
    </>
  );
}
