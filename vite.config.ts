import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  envPrefix: ['VITE_'];
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [sveltekit(), purgeCss()],
    define: {
      'process.env': env,
      
    }
  };
});