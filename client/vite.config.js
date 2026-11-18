import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Ensures assets load cleanly on Netlify root AND GitHub Pages subpaths (/Shashwat-Group-SAAS-software/)
  server: {
    port: 3000,
    open: true
  }
});
