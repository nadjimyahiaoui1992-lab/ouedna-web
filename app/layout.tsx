import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "./platform.css";
import "./app-shell.css";
import "./app-pages.css";
import "./guide.css";
import "./itinerary.css";
import "./pwa-install.css";
import "leaflet/dist/leaflet.css";
import PwaRuntime from "./PwaRuntime";

// Ouedna brand metadata: Arabic-first tourism gateway for El Oued, Algeria.
const siteName = "Ouedna | وادنا";
const siteTitle = "وادنا Ouedna | اكتشف الوادي على إيقاعك";
const siteDescription = "وادنا هو الدليل السياحي الذكي لاكتشاف ولاية الوادي: المعالم، الواحات، الأسواق، التراث، والخرائط في تطبيق واحد.";
const siteUrl = "https://ouedna.vercel.app";
const panoramicOgImage = "/ouedna/hero-oasis.jpg";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  keywords: ["Ouedna", "وادنا", "وادي سوف", "السياحة في الجزائر", "Wadi Souf", "El Oued"],
  applicationName: "Ouedna",
  alternates: { canonical: "/" },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    type: "website",
    locale: "ar_AR",
    siteName,
    url: siteUrl,
    images: [{ url: panoramicOgImage, width: 1920, height: 1080, alt: "واحة وكثبان وادي سوف الذهبية - Ouedna" }],
  },
  twitter: { card: "summary_large_image", title: siteTitle, description: siteDescription, images: [{ url: panoramicOgImage, alt: "واحة وكثبان وادي سوف الذهبية - Ouedna" }] },
  icons: { icon: [{ url: "/ouedna/mark.svg", type: "image/svg+xml" }] },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0E4B42" };

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const schema = { "@context": "https://schema.org", "@type": "TravelAgency", name: "وادنا Ouedna", description: siteDescription, url: siteUrl, location: { "@type": "Place", name: "ولاية الوادي، الجزائر" } };
  return (
    <html lang="ar" dir="rtl" className="h-full antialiased">
      <body className="min-h-full overflow-x-hidden">
        <PwaRuntime />
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-amber-600 focus:px-4 focus:py-2 focus:text-white">الانتقال إلى المحتوى الرئيسي</a>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
        <div id="main-content">{children}</div>
      </body>
    </html>
  );
}
