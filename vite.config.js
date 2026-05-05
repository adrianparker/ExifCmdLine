import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: resolve(__dirname, 'web'),
  build: {
    outDir: resolve(__dirname, 'web/dist'),
    emptyOutDir: true
  }
})
