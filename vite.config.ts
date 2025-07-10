// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/team-balancer/', // <— вот эта строчка!
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
});
