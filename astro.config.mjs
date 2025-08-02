// astro.config.mjs
// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel/serverless';
import tunnel from 'astro-tunnel';

// https://astro.build/config
export default defineConfig({
  vite: {
      plugins: [tailwindcss()],
  },
  integrations: [tunnel()],
  output: 'static',
  adapter: vercel(),
});