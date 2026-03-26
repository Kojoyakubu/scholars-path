import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          if (id.includes('jspdf')) {
            return 'vendor-jspdf';
          }

          if (id.includes('html2canvas')) {
            return 'vendor-html2canvas';
          }

          if (id.includes('react') || id.includes('scheduler')) {
            return 'vendor-react';
          }

          if (id.includes('@mui') || id.includes('@emotion')) {
            return 'vendor-mui';
          }

          if (id.includes('react-router-dom') || id.includes('@remix-run/router')) {
            return 'vendor-router';
          }

          if (id.includes('framer-motion')) {
            return 'vendor-motion';
          }

          if (id.includes('@reduxjs/toolkit') || id.includes('react-redux')) {
            return 'vendor-redux';
          }

          if (
            id.includes('react-markdown') ||
            id.includes('remark-') ||
            id.includes('rehype-') ||
            id.includes('unified') ||
            id.includes('micromark') ||
            id.includes('mdast')
          ) {
            return 'vendor-markdown';
          }

          if (id.includes('axios') || id.includes('dompurify')) {
            return 'vendor-utils';
          }

          if (id.includes('react-toastify') || id.includes('react-hot-toast') || id.includes('react-select')) {
            return 'vendor-ui-extras';
          }

          return undefined;
        },
      },
    },
  },
})