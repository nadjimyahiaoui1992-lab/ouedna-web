import { MetadataRoute } from "next";
import { siteConfig } from "./metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { path: "", priority: 1, changeFrequency: "weekly" as const },
    { path: "/map", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/explore", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/archive", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/community", priority: 0.8, changeFrequency: "daily" as const },
    { path: "/download", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/suggest-place", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/updates", priority: 0.5, changeFrequency: "weekly" as const },
    { path: "/favorites", priority: 0.2, changeFrequency: "monthly" as const },
    { path: "/about", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" as const },
  ];

  return routes.map((route) => ({
    url: `${siteConfig.url}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
