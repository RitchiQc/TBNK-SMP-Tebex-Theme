import type { Metadata } from "next";
import Link from "next/link";
import { JoinSection } from "@/components/home/join-section";
import { Icon } from "@/components/ui/icons";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Comment rejoindre",
  description:
    "Guide de connexion au serveur Minecraft Java TBNK-SMP : IP, version, étapes et support Discord.",
  alternates: { canonical: "/guide" }
};

export default function GuidePage() {
  return (
    <>
      <section className="page-hero">
        <div className="container-tbnk page-hero__inner">
          <nav className="breadcrumb" aria-label="Fil d’Ariane">
            <Link href="/">Accueil</Link>
            <span>/</span>
            <b>Comment rejoindre</b>
          </nav>
          <span className="eyebrow" style={{ marginTop: 18 }}>
            Guide de connexion
          </span>
          <h1>Rejoindre TBNK-SMP</h1>
          <p>
            TBNK-SMP est un serveur Minecraft <strong>Java Edition</strong>. Il
            n’y a pas de connexion Bedrock pour le moment. Ajoute l’IP,
            connecte-toi et retrouve la communauté en jeu.
          </p>
          <div className="page-hero__meta">
            <span className="badge badge-success">
              <Icon name="check-circle" size={10} />
              Java Edition
            </span>
            <span className="badge badge-muted">{siteConfig.javaIp}</span>
            <span className="badge badge-muted">Bedrock non supporté</span>
          </div>
        </div>
      </section>

      <JoinSection />
    </>
  );
}
