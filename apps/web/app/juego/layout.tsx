import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  manifest: "/juego.webmanifest",
  applicationName: "Voces en casilla",
  appleWebApp: {
    capable: true,
    title: "Voces en casilla",
    statusBarStyle: "black-translucent",
  },
  icons: { apple: "/logo-ine-oficial.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#020617",
};

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return children;
}
