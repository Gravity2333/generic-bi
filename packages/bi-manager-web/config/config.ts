import { defineConfig } from 'umi';

export default defineConfig({
  base: '/',
  theme: {
    'primary-color': '#000000',
  },
  favicon: '/favicon.ico',
  layout: {},
  scripts: [{ src: `/bi/web-static/config/config.js` }],
});
