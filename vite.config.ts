import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react' // keep if you use it

export default defineConfig({
  // plugins: [react()], // keep if used
  base: '/',           // ✅ important on Vercel
  build: { outDir: 'dist' }
})
