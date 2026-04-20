import path from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import type { Plugin } from "vite";
import { defineConfig } from "vitest/config";
import { VitePWA } from "vite-plugin-pwa";

function figmaAssetResolver(): Plugin {
  return {
    name: "figma-asset-resolver",
    resolveId(id: string) {
      if (id.startsWith("figma:asset/")) {
        const filename = id.replace("figma:asset/", "");
        return path.resolve(__dirname, "src/assets", filename);
      }
    },
  };
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: false,
      includeAssets: [
        "brand/logo.svg",
        "brand/logo.png",
        "favicon.png",
        "icons/apple-touch-icon.png",
        "icons/favicon-16x16.png",
        "icons/favicon-32x32.png",
      ],
      manifest: {
        id: "/",
        name: "changa.",
        short_name: "changa.",
        description:
          "Marketplace local para pedir ayuda, publicar servicios y coordinar changas desde el celu.",
        start_url: "/home",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#ffffff",
        theme_color: "#0dae79",
        lang: "es-AR",
        icons: [
          {
            src: "/icons/favicon-16x16.png",
            sizes: "16x16",
            type: "image/png",
          },
          {
            src: "/icons/favicon-32x32.png",
            sizes: "32x32",
            type: "image/png",
          },
          {
            src: "/icons/apple-touch-icon.png",
            sizes: "180x180",
            type: "image/png",
          },
          {
            src: "/favicon.png",
            sizes: "2000x2000",
            type: "image/png",
          },
          {
            src: "/favicon.png",
            sizes: "2000x2000",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        additionalManifestEntries: [
          { url: "/", revision: null },
          { url: "/home", revision: null },
          { url: "/search", revision: null },
        ],
        navigateFallback: "/index.html",
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp}"],
        runtimeCaching: [
          {
            urlPattern: ({ request, url }) =>
              request.mode === "navigate" &&
              ["/", "/home", "/search"].includes(url.pathname),
            handler: "NetworkFirst",
            options: {
              cacheName: "core-pages-cache",
              networkTimeoutSeconds: 3,
            },
          },
          {
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: "pages-cache",
              networkTimeoutSeconds: 5,
            },
          },
          {
            urlPattern: ({ request, url }) =>
              request.destination === "style" ||
              request.destination === "script" ||
              request.destination === "worker" ||
              url.pathname.startsWith("/assets/"),
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "static-assets-cache",
            },
          },
          {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "image-cache",
              expiration: {
                maxEntries: 120,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
          {
            urlPattern: ({ url }) => url.origin === "https://images.unsplash.com",
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "remote-image-cache",
              expiration: {
                maxEntries: 80,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes("node_modules")) return undefined;

          if (id.includes("@supabase")) return "supabase-vendor";
          if (id.includes("react-router")) return "router-vendor";
          if (id.includes("react-dom") || id.includes("/react/")) return "react-vendor";
          if (
            id.includes("@mui") ||
            id.includes("@radix-ui") ||
            id.includes("lucide-react") ||
            id.includes("recharts") ||
            id.includes("react-day-picker") ||
            id.includes("embla-carousel-react") ||
            id.includes("vaul") ||
            id.includes("sonner")
          ) {
            return "ui-vendor";
          }

          return "vendor";
        },
      },
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ["**/*.svg", "**/*.csv"],
  test: {
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["e2e/**", "node_modules/**", "dist/**"],
  },
});
