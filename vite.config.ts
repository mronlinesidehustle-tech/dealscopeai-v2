import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react' // keep if you use it

export default defineConfig({
  // plugins: [react()], // keep if used
  base: '/',
  build: { outDir: 'dist', rollupOptions: { external: ['@google/genai'] } }
})
