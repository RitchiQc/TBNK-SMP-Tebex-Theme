import { appEnv, isMockMode } from "@/lib/env";

export function DemoBanner() {
  if (appEnv === "production") return null;

  const label =
    appEnv === "development" ? "Développement" : "Préproduction";
  const message = isMockMode
    ? "Mode démo : catalogue fictif, aucun paiement réel."
    : "Environnement de test : ne pas utiliser pour de vrais achats.";

  return (
    <div className="demo-banner" role="status">
      <strong>{label}</strong>
      <span>{message}</span>
    </div>
  );
}
