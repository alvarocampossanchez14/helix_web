// astro.config.mjs
// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel'; // ¡OJO con el /serverless!
import tailwindcss from '@tailwindcss/vite';
import tunnel from 'astro-tunnel';

// https://astro.build/config
export default defineConfig({
  vite: {
      plugins: [tailwindcss()],
  },
  integrations: [tunnel()],
  // ⬇️ Este es el cambio clave ⬇️
  output: 'server',
  adapter: vercel({
      webAnalytics: { enabled: true }
  }),
});