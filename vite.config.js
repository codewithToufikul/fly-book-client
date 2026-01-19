import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['pdfjs-dist/build/pdf.worker.mjs'],
    // Force pre-bundling to avoid circular dependencies
    force: true,
  },
  build: {
    outDir: 'dist',
    // Production optimizations
    minify: 'esbuild', // Use esbuild instead of terser for better compatibility
    // Chunk size optimization
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Minimal code splitting to avoid circular dependencies
        manualChunks: (id) => {
          // Only split very large libraries
          if (id.includes('node_modules')) {
            // Separate only the heaviest libraries
            if (id.includes('face-api.js')) {
              return 'face-api';
            }
            if (id.includes('pdfjs-dist')) {
              return 'pdf-vendor';
            }
            // Keep everything else together to avoid circular deps
            return 'vendor';
          }
        },
        // Optimize chunk file names
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // Source maps for production debugging (optional - remove for smaller bundle)
    sourcemap: false,
    // CSS code splitting
    cssCodeSplit: true,
    // Common chunk strategy
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
  // Server optimizations
  server: {
    hmr: {
      overlay: false, // Disable error overlay in dev
    },
  },
});
