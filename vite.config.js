import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// PWA-plugin läggs till i Sprint 2 (fas 7)
// import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          firebase:    ['firebase/app', 'firebase/firestore', 'firebase/auth', 'firebase/storage'],
          vendor:      ['react', 'react-dom'],
          // Tunga export-bibliotek i egna chunks — laddas bara när ExportModal öppnas
          'html2canvas': ['html2canvas'],
          'jspdf':       ['jspdf'],
        }
      }
    }
  }
})
