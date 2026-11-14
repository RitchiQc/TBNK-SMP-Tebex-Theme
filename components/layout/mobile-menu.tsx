"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/basket/actions";
import { siteConfig } from "@/lib/site";
import { CopyButton } from "@/components/ui/copy-button";
import { Icon } from "@/components/ui/icons";

export type CategoryLink = {
  name: string;
  slug: string;
  packageCount: number;
};

const legalLinks = [
  { label: "Conditions", href: "/legal/terms" },
  { label: "Confidentialité", href: "/legal/privacy" },
  { label: "Remboursement", href: "/legal/refund" },
  { label: "Contact", href: "/legal/contact" }
];

export function MobileMenu({
  open,
  onClose,
  storeName,
  logo,
  categories,
  username
}: {
  open: boolean;
  onClose: () => void;
  storeName: string;
  logo: string;
  categories: CategoryLink[];
  username: string | null;
}) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <div
      id="mobile-menu"
      className={`mobile-menu${open ? " is-open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Menu de navigation"
      aria-hidden={!open}
    >
      <button
        type="button"
        className="mobile-menu__backdrop"
        aria-label="Fermer le menu"
        onClick={onClose}
        tabIndex={open ? 0 : -1}
      />
      <div className="mobile-menu__panel">
        <div className="mobile-menu__head">
          <Link href="/" className="brand" onClick={onClose}>
            <img className="brand__logo" src={logo} alt={storeName} />
          </Link>
          <button
            type="button"
            className="icon-button"
            aria-label="Fermer le menu"
            onClick={onClose}
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <nav className="mobile-menu__nav" aria-label="Navigation mobile">
          <Link
            href="/"
            className={`mobile-menu__link${isActive("/") ? " is-active" : ""}`}
            onClick={onClose}
          >
            <span>Accueil</span>
            <Icon name="chevron-right" size={16} />
          </Link>
          <Link
            href="/store"
            className={`mobile-menu__link${isActive("/store") ? " is-active" : ""}`}
            onClick={onClose}
          >
            <span>Boutique</span>
            <Icon name="chevron-right" size={16} />
          </Link>
          <Link
            href="/status"
            className={`mobile-menu__link${isActive("/status") ? " is-active" : ""}`}
            onClick={onClose}
          >
            <span>Statut du serveur</span>
            <Icon name="chevron-right" size={16} />
          </Link>
          <Link
            href="/guide"
            className={`mobile-menu__link${isActive("/guide") ? " is-active" : ""}`}
            onClick={onClose}
          >
            <span>Comment rejoindre</span>
            <Icon name="chevron-right" size={16} />
          </Link>
          <a
            href={siteConfig.discordUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mobile-menu__link"
            onClick={onClose}
          >
            <span>Discord</span>
            <Icon name="external" size={16} />
          </a>
          <span className="mobile-menu__section-title">Catégories</span>
          <div className="mobile-menu__sub">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/store/${category.slug}`}
                onClick={onClose}
              >
                {category.name}
              </Link>
            ))}
          </div>
          <span className="mobile-menu__section-title">Informations</span>
          <div className="mobile-menu__sub">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="mobile-menu__footer">
          <div className="mobile-menu__ip">
            <div>
              <div className="mobile-menu__section-title">IP Java</div>
              <code>{siteConfig.javaIp}</code>
            </div>
            <CopyButton
              value={siteConfig.javaIp}
              label="Copier"
              className="btn btn-secondary btn-sm"
            />
          </div>
          <a
            href={siteConfig.discordUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-wide"
          >
            <Icon name="discord" size={17} />
            Rejoindre le Discord
          </a>
          {username ? (
            <form action={logoutAction}>
              <button type="submit" className="btn btn-secondary btn-wide">
                <Icon name="logout" size={16} />
                Se déconnecter ({username})
              </button>
            </form>
          ) : (
            <Link href="/login" className="btn btn-secondary btn-wide" onClick={onClose}>
              <Icon name="user" size={16} />
              Connexion
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
