import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/ui/icons";
import { appEnv } from "@/lib/deployment";
import { siteConfig } from "@/lib/site";
import {
  LEGAL_LINKS,
  getLegalPage
} from "@/lib/legal";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return LEGAL_LINKS.map((link) => ({ slug: link.slug }));
}

export async function generateMetadata({
  params
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getLegalPage(slug);

  if (!page) {
    notFound();
  }

  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/legal/${page.slug}` }
  };
}

export default async function LegalPage({ params }: PageProps) {
  const { slug } = await params;
  const page = getLegalPage(slug);

  if (!page) {
    notFound();
  }

  const contactIncomplete =
    !siteConfig.supportEmail ||
    !siteConfig.privacyEmail ||
    !siteConfig.privacyOfficer;

  return (
    <>
      <section className="page-hero">
        <div className="container-tbnk page-hero__inner">
          <nav className="breadcrumb" aria-label="Fil d’Ariane">
            <Link href="/">Accueil</Link>
            <span>/</span>
            <b>{page.title}</b>
          </nav>
          <span className="eyebrow" style={{ marginTop: 18 }}>
            Informations légales
          </span>
          <h1>{page.title}</h1>
          <p>{page.description}</p>
          <p className="legal-updated">Dernière mise à jour : {page.updated}</p>
        </div>
      </section>

      <div className="container-tbnk" style={{ paddingBottom: 34 }}>
        <div className="legal-layout">
          <nav className="legal-nav" aria-label="Pages légales">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.slug}
                href={`/legal/${link.slug}`}
                className={link.slug === page.slug ? "is-active" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div>
            {contactIncomplete && appEnv !== "production" ? (
              <div className="cart-login-banner" style={{ marginBottom: 16 }}>
                <p>
                  <b>Coordonnées de confidentialité à compléter.</b> Renseigne{" "}
                  <code>NEXT_PUBLIC_SUPPORT_EMAIL</code>,{" "}
                  <code>NEXT_PUBLIC_PRIVACY_EMAIL</code> et{" "}
                  <code>NEXT_PUBLIC_PRIVACY_OFFICER</code> avant la mise en
                  production. Les champs <code>NEXT_PUBLIC_LEGAL_*</code> sont
                  facultatifs (identité d’entreprise si TBNK-SMP est le vendeur).
                  Le build de production échoue si les contacts obligatoires
                  manquent.
                </p>
              </div>
            ) : null}

            <article
              className="legal-content"
              dangerouslySetInnerHTML={{ __html: page.html }}
            />

            <div className="cta-band" style={{ marginTop: 18 }}>
              <div className="cta-band__content">
                <span className="eyebrow">Une question ?</span>
                <h2>Le support est sur Discord</h2>
                <p>
                  Pour une question sur un achat, une livraison ou tes données,
                  ouvre un ticket sur le Discord officiel de {siteConfig.name}.
                </p>
              </div>
              <div className="cta-band__actions">
                <a
                  href={siteConfig.discordUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  <Icon name="discord" size={17} />
                  Rejoindre le Discord
                </a>
                <Link href="/store" className="btn btn-secondary">
                  <Icon name="store" size={17} />
                  Boutique
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
