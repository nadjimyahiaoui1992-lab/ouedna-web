import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import "leaflet/dist/leaflet.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// معلومات الموقع الرسمية المباشرة لتجنب أي أخطاء في مسارات خارجية
const siteName = "Souf 360 | عاصمة الألف قبة وقبة";
const siteTitle = "Souf 360 | اكتشف وادي سوف";
const siteDescription = "دليلك السياحي الذكي لاكتشاف وادي سوف: المعالم، الواحات، الأسواق، التراث، والكثبان الذهبية، مع خريطة تفاعلية ومساعد ذكي.";
const siteUrl = "https://souf360.vercel.app";
const panoramicOgImage = "/og-souf360.jpg";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  keywords: ["Souf 360", "وادي سوف", "السياحة في الجزائر", "Wadi Souf", "El Oued", "اكتشف سوف"],
  applicationName: "Souf 360",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    type: "website",
    locale: "ar_AR",
    siteName: siteName,
    url: siteUrl,
    images: [
      {
        url: panoramicOgImage,
        width: 2560,
        height: 1440,
        alt: "واحة وكثبان وادي سوف الذهبية - Souf 360",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: panoramicOgImage,
        alt: "واحة وكثبان وادي سوف الذهبية - Souf 360",
      },
    ],
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#193F38",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: "سوف 360",
    description: siteDescription,
    url: siteUrl,
    location: {
      "@type": "Place",
      name: "ولاية الوادي، الجزائر",
    },
  };

  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full overflow-x-hidden bg-[#0f172a] text-white">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-amber-600 focus:px-4 focus:py-2 focus:text-white"
        >
          الانتقال إلى المحتوى الرئيسي
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
        <div id="main-content">{children}</div>
      </body>
    </html>
  );
}
