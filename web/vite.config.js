import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import automations from './plugins/vite-plugin-automations.js'

export default defineConfig({
  plugins: [react(), tailwindcss(), automations()],
  server: {
    port: 5173,
    // Bez tohohle se Vite na Windows pověsí jen na IPv6 (::1) a prohlížeč,
    // který si localhost přeloží na 127.0.0.1, dostane odmítnuté spojení.
    host: true,
    // Prohlížeč si otevírá Anna sama — dev server nikdy nevyskakuje okno.
    open: false,
    fs: {
      // web/ je root, ale katalog čte ze sousední automations/
      allow: ['..', '../..'],
    },
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1200,
  },
})
