import Link from "next/link";
import { getDiscordStats } from "@/lib/community/discord";
import { siteConfig } from "@/lib/site";
import { getStoreDataSafe } from "@/lib/tebex/store";
import { CookieSettingsButton } from "@/components/consent/cookie-settings-button";
import { CopyButton } from "@/components/ui/copy-button";
import { Icon } from "@/components/ui/icons";

export async function SiteFooter() {
  const [{ webstore, categories }, discord] = await Promise.all([
    getStoreDataSafe(),
    getDiscordStats()
  ]);

  return (
    <footer className="site-footer">
      <div className="container-tbnk">
        <div className="footer-grid">
          <div className="footer-brand">
            <img
              className="footer-logo"
              src={webstore.logo || siteConfig.logo}
              alt={webstore.name || siteConfig.name}
            />
            <p className="footer-tagline">
              Le serveur Minecraft Java TBNK-SMP. Rejoins une communauté active,
              progresse à ton rythme et soutiens le serveur.
            </p>
            <div className="footer-socials">
              <a
                href={siteConfig.discordUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
              >
                <Icon name="discord" size={15} />
                Discord
              </a>
              <Link href="/status" className="btn btn-secondary btn-sm">
                <Icon name="server" size={15} />
                Statut
              </Link>
            </div>
            <div className="footer-ip" style={{ marginTop: 14 }}>
              <code>{siteConfig.javaIp}</code>
              <CopyButton
                value={siteConfig.javaIp}
                label="Copier"
                className="btn btn-secondary btn-sm"
              />
            </div>

            <div className="footer-legal-identity">
              <strong>{siteConfig.legalName || "Identité légale à compléter"}</strong>
              <span>{siteConfig.legalAddress || "Adresse à compléter"}</span>
              <span>
                {siteConfig.legalPhone || "Téléphone à compléter"}
                {" · "}
                {siteConfig.supportEmail ? (
                  <a href={`mailto:${siteConfig.supportEmail}`}>
                    {siteConfig.supportEmail}
                  </a>
                ) : (
                  "Courriel à compléter"
                )}
              </span>
              <span>
                Confidentialité :{" "}
                {siteConfig.privacyEmail || siteConfig.supportEmail ? (
                  <a
                    href={`mailto:${
                      siteConfig.privacyEmail || siteConfig.supportEmail
                    }`}
                  >
                    {siteConfig.privacyEmail || siteConfig.supportEmail}
                  </a>
                ) : (
                  "Courriel à compléter"
                )}
              </span>
            </div>
          </div>

          <div>
            <h2 className="footer-heading">Boutique</h2>
            <div className="footer-links">
              {categories.map((category) => (
                <Link key={category.slug} href={`/store/${category.slug}`}>
                  {category.name}
                </Link>
              ))}
              <Link href="/store">Tous les articles</Link>
            </div>
          </div>

          <div>
            <h2 className="footer-heading">Communauté</h2>
            <div className="footer-links">
              <a
                href={siteConfig.discordUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Discord — {discord.members} membres
              </a>
              <Link href="/status">Statut du serveur</Link>
              <Link href="/guide">Comment rejoindre</Link>
              <Link href="/legal/contact">Support</Link>
              <a href={`https://${siteConfig.domain}`} target="_blank" rel="noopener noreferrer">
                {siteConfig.domain}
              </a>
            </div>
          </div>

          <div>
            <h2 className="footer-heading">Informations</h2>
            <div className="footer-links">
              <Link href="/legal/terms">Conditions d’utilisation</Link>
              <Link href="/legal/privacy">Confidentialité</Link>
              <Link href="/legal/refund">Politique de remboursement</Link>
              <Link href="/legal/contact">Contact</Link>
            </div>
            <div className="payment-pills" aria-label="Paiement">
              <span className="payment-pill">Tebex</span>
              <span className="payment-pill">Paiement sécurisé</span>
              <span className="payment-pill">Moyens affichés au checkout</span>
            </div>
          </div>
        </div>

        <p className="tebex-disclosure">
          Les paiements sont traités par <strong>Tebex</strong>, revendeur
          officiel et marchand of record. TBNK-SMP n’est ni affilié ni sponsorisé
          par Mojang Studios ou Microsoft. Les articles numériques sont livrés
          sur le compte Minecraft renseigné lors du paiement. Consulte les{" "}
          <Link href="/legal/terms">conditions</Link> et la{" "}
          <Link href="/legal/refund">politique de remboursement</Link> avant tout
          achat.
        </p>

        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} {siteConfig.name}. Tous droits réservés.
          </span>
          <div className="footer-legal">
            <Link href="/legal/terms">Conditions</Link>
            <Link href="/legal/privacy">Confidentialité</Link>
            <Link href="/legal/refund">Remboursement</Link>
            <CookieSettingsButton />
            <a
              href="https://www.tebex.io"
              target="_blank"
              rel="noopener noreferrer"
            >
              Propulsé par Tebex
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
