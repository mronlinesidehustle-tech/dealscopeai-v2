import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: { 
    outDir: 'dist', 
    rollupOptions: { 
      external: ['@google/genai'],
      input: 'index.html'
    } 
  }
})
