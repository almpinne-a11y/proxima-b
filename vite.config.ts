import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Chemins relatifs : le build fonctionne aussi hors de la racine d'un domaine (aperçu publié).
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    // Les polices (quelques dizaines de Ko) sont intégrées au CSS : pas de requête supplémentaire.
    assetsInlineLimit: 80 * 1024,
    chunkSizeWarningLimit: 1600,
  },
})
