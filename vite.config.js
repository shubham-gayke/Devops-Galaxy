import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    // Generates dist/bundle-report.html after every build
    // Open it to inspect chunk sizes and dependency breakdown
    visualizer({
      open: false,
      filename: 'dist/bundle-report.html',
      gzipSize: true,
      brotliSize: true,
    }),
  ],

  build: {
    // Increase the chunk size warning threshold slightly — diagrams are legitimately large
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor chunks — grouped by concern for optimal cache lifetime
          if (id.includes('react-router-dom') || (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/'))) {
            return 'vendor-react'
          }
          if (id.includes('framer-motion')) {
            return 'vendor-motion'
          }
          if (id.includes('react-markdown') || id.includes('remark-gfm')) {
            return 'vendor-markdown'
          }
          if (id.includes('react-syntax-highlighter')) {
            return 'vendor-highlight'
          }
          if (id.includes('reactflow')) {
            return 'vendor-reactflow'
          }
          if (id.includes('lucide-react')) {
            return 'vendor-lucide'
          }
        },
      },
    },
  },

  // Ensure markdown files in public/ are served correctly
  server: {
    headers: {
      'Cache-Control': 'public, max-age=86400',
    },
  },
})
