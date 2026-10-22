import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // relatív útvonalak, hogy a build bármely mappából / statikus tárhelyről fusson
  base: './',
  plugins: [react()],
})
