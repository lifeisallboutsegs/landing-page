import path from 'path'
import { fileURLToPath } from 'url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    // `motion` and `framer-motion` are the same library under two names. With
    // both installed, two runtimes load with two React contexts: AnimatePresence
    // finishes exit animations without unmounting, and `motion.*` components
    // silently stop applying styles or forwarding refs. The duplicate direct
    // dependency is gone; this collapses any nested copy a transitive dep might
    // still bring onto a single instance.
    //
    // Do NOT alias 'framer-motion' -> 'motion/react' to enforce this: motion's
    // own entry re-exports from framer-motion, so the alias is circular and
    // every export (AnimatePresence included) resolves to undefined.
    dedupe: ['motion', 'framer-motion', 'motion-dom', 'motion-utils', 'react', 'react-dom'],
  },
})
