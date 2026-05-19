import { defineConfig } from "vitepress";

export default defineConfig({
  title: "chromext",
  description:
    "Free, open-source Chrome extensions for solo builders. Minimal permissions, zero tracking, MIT licensed.",
  lang: "en-US",
  base: "/chromext/",
  lastUpdated: true,

  appearance: "force-dark",

  head: [
    ["link", { rel: "icon", type: "image/svg+xml", href: "/chromext/icon.svg" }],
    [
      "meta",
      { name: "theme-color", content: "#1a1b1e" },
    ],
    [
      "meta",
      { property: "og:title", content: "chromext — Chrome Extensions for Solo Builders" },
    ],
    [
      "meta",
      {
        property: "og:description",
        content:
          "Free, open-source Chrome extensions. Minimal permissions, zero tracking, inspectable source.",
      },
    ],
  ],

  themeConfig: {
    siteTitle: "chromext",

    nav: [
      { text: "Extensions", link: "/#extensions" },
      { text: "Screenshots", link: "/screenshots" },
      { text: "Privacy", link: "/privacy" },
      { text: "GitHub", link: "https://github.com/srmdn/chromext" },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/srmdn/chromext" },
    ],

    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2026 srmdn",
    },

    search: {
      provider: "local",
    },
  },

  markdown: {
    theme: {
      dark: "vitesse-dark",
    },
  },
});
