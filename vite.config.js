import { resolve } from "node:path";
import { defineConfig } from "vite";
import handlebars from "vite-plugin-handlebars";

const r = (...paths) => resolve(__dirname, ...paths);

export default defineConfig({
  root: r("src"),
  plugins: [
    handlebars({
      partialDirectory: r("src", "partials"),
      context(pagePath) {
        const now = new Date();
        const year = String(now.getFullYear());
        const url = (p) => `https://example.com/${p.replace(/^\//, "")}`;

        const defaults = {
          year,
          meta: {
            title: "NeuroAI — AI SaaS + Tools Directory",
            description:
              "NeuroAI is a modern AI SaaS template with a tools directory and an admin dashboard UI.",
            canonical: url(pagePath.split("/").pop() || ""),
            ogImage: "/assets/og/neuroai-og.svg"
          }
        };

        const pageName = (pagePath.split("/").pop() || "").toLowerCase();
        const titleMap = {
          "index.html": "NeuroAI — AI SaaS + Tools Directory",
          "demo-showcase.html": "Demo Showcase — NeuroAI",
          "tools.html": "AI Tools Directory — NeuroAI",
          "tool-details.html": "Tool Details — NeuroAI",
          "pricing.html": "Pricing — NeuroAI",
          "features.html": "Features — NeuroAI",
          "integrations.html": "Integrations — NeuroAI",
          "blog.html": "Blog — NeuroAI",
          "blog-details.html": "Blog Post — NeuroAI",
          "about.html": "About — NeuroAI",
          "contact.html": "Contact — NeuroAI",
          "login.html": "Login — NeuroAI",
          "register.html": "Register — NeuroAI",
          "dashboard.html": "Dashboard — NeuroAI"
        };

        return {
          ...defaults,
          meta: {
            ...defaults.meta,
            title: titleMap[pageName] || defaults.meta.title,
            canonical: url(pageName)
          }
        };
      }
    }),
  ],
  build: {
    outDir: r("dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: r("src", "index.html"),
        demoShowcase: r("src", "demo-showcase.html"),
        tools: r("src", "tools.html"),
        toolDetails: r("src", "tool-details.html"),
        pricing: r("src", "pricing.html"),
        features: r("src", "features.html"),
        integrations: r("src", "integrations.html"),
        blog: r("src", "blog.html"),
        blogDetails: r("src", "blog-details.html"),
        about: r("src", "about.html"),
        contact: r("src", "contact.html"),
        login: r("src", "login.html"),
        register: r("src", "register.html"),
        dashboard: r("src", "dashboard.html")
      },
      output: {
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]"
      }
    }
  },
  server: {
    port: 5173,
    strictPort: true
  }
});

