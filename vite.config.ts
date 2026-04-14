import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // <--- Change this from '/' to './'
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // This ensures your build doesn't fail on small type warnings
    minify: 'esbuild',
    reportCompressedSize: false,
  }
});
