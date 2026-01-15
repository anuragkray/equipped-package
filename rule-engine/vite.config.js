import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

const entryFile = fileURLToPath(new URL('./src/index.jsx', import.meta.url));

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: entryFile,
      name: 'RuleEngine',
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
    },
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      external: ['react', 'react-dom'],
    },
  },
});
