import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const alt = "TBNK-SMP — Boutique officielle Minecraft Java";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          color: "#F4F4F4",
          backgroundColor: "#0E0E0E",
          backgroundImage:
            "radial-gradient(circle at 82% 12%, rgba(247,148,29,0.34), transparent 45%), radial-gradient(circle at 8% 92%, rgba(232,110,29,0.18), transparent 40%)",
          fontFamily: "Arial, sans-serif"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "10px 18px",
              border: "1px solid rgba(247,148,29,0.4)",
              borderRadius: 999,
              color: "#FFB347",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 3
            }}
          >
            MINECRAFT JAVA
          </div>
          <div
            style={{
              display: "flex",
              color: "#9A9A9A",
              fontSize: 22
            }}
          >
            {siteConfig.javaIp}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 104,
              fontWeight: 900,
              letterSpacing: -4,
              lineHeight: 1
            }}
          >
            <span style={{ color: "#F4F4F4" }}>TBNK</span>
            <span style={{ color: "#F7941D" }}>-SMP</span>
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 26,
              fontSize: 40,
              fontWeight: 700,
              color: "#D8D8D8"
            }}
          >
            Boutique officielle · Rangs, clés, cosmétiques & boosters
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,0.12)",
            paddingTop: 26,
            color: "#9A9A9A",
            fontSize: 22
          }}
        >
          <span>tbnk-smp.com</span>
          <span style={{ color: "#F7941D" }}>Livraison instantanée via Tebex</span>
        </div>
      </div>
    ),
    {
      ...size
    }
  );
}
