import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "وادنا Ouedna | دليل وادي سوف",
    short_name: "وادنا",
    description: "تطبيق ويب لاكتشاف معالم وادي سوف، التخطيط للرحلة، والمجتمع المحلي.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8f5ef",
    theme_color: "#0E4B42",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
