import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The site is served from https://<user>.github.io/dungeonsanddadjokes/
// so the base path must match the repository name for asset URLs to resolve.
export default defineConfig({
  base: '/dungeonsanddadjokes/',
  plugins: [react()],
})
