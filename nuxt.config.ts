import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css', "~/assets/css/markdown.css"],
  vite: {
    plugins: [
        tailwindcss(),
    ]
  },
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.API_BASE_URL,
      webSocketUrl: process.env.WEBSOCKET_URL
    }
  },
  modules: ['@nuxt/ui', '@nuxt/image']
})