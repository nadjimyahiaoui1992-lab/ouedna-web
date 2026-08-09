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
const siteName = "اكتشف سوف | Souf Explorer";
const siteTitle = " اكتشف سوف - عاصمة الألف قبة وقبة";
const siteDescription = "منصة سياحية ذكية لاستكشاف التراث، الصحراء، والقباب المعمارية في ولاية الوادي عبر خريطة تفاعلية متكاملة.";
const siteUrl = "https://souf360.vercel.app";
const panoramicOgImage = "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1200&auto=format&fit=crop";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  keywords: ["السياحة في الوادي", " اكتشف سوف ", "ولاية الوادي", "مدينة الألف قبة", "الخريطة السياحية", "الصحراء الجزائرية"],
  applicationName: "اكتشف سوف",
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
    images: [{ url: panoramicOgImage, alt: "اكتسف سوف  السياحية - ولاية الوادي" }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [{ url: panoramicOgImage, alt: "اكتشف سوف  السياحية - ولاية الوادي" }],
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
  themeColor: "#0f172a",
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
