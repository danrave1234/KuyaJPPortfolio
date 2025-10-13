import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Generate source maps for better debugging
    sourcemap: false,
    // Optimize chunk size for better loading
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'firebase-vendor': ['firebase/app', 'firebase/analytics', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
        },
      },
    },
    // Compress assets
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'lucide-react'],
  },
  // Server configuration
  server: {
    port: 3000,
    strictPort: false,
    host: true,
  },
  // Preview configuration
  preview: {
    port: 3000,
    strictPort: false,
    host: true,
  },
})
