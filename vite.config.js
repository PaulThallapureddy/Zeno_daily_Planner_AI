import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/Zeno_daily_Planner_AI/', // ← important for GitHub Pages
  plugins: [react()],
});
