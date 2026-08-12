import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    {
      name: 'github-pages-404',
      apply: 'build',
      closeBundle() {
        const outDir = path.resolve(__dirname, '../docs')
        const indexPath = path.resolve(outDir, 'index.html')
        const notFoundPath = path.resolve(outDir, '404.html')

        if (fs.existsSync(indexPath)) {
          fs.copyFileSync(indexPath, notFoundPath)
        }
      },
    },
  ],
  build: {
    outDir: '../docs',
    emptyOutDir: true,
  },
})
