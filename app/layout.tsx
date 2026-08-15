import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "./platform.css";
import "./app-shell.css";
import "./app-pages.css";
import "./responsive-fixes.css";
import "./map/custom-style.css";
import "./archive-enhancements.css";
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

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  applicationName: "Ouedna",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0E4B42" };

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const schema = { "@context": "https://schema.org", "@type": "TravelAgency", name: "وادنا Ouedna", description: siteDescription, url: siteUrl, location: { "@type": "Place", name: "ولاية الوادي، الجزائر" } };
  return (
    <html lang="ar" dir="rtl" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Noto+Kufi+Arabic:wght@100..900&family=Tajawal:wght@300;400;500;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full overflow-x-hidden">
        <PwaRuntime />
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-amber-600 focus:px-4 focus:py-2 focus:text-white">الانتقال إلى المحتوى الرئيسي</a>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
        <div id="main-content">{children}</div>
      </body>
    </html>
  );
}
