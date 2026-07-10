import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Waloński Poszukiwacz",
    short_name: "Poszukiwacz",
    description: "Walloon Prospector & Rock Scanner",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#d4af37",
    icons: [
      {
        src: "/icon-192.png",
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: "/icon-512.png",
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: "/icon.png",
        sizes: '512x512',
        type: 'image/png',
      }
    ],
  };
}
