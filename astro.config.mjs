import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://aecgmc.favorintl.org',
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    build: {
      assetsInlineLimit: 4096,
    },
  },
});
