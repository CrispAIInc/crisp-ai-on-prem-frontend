import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    historyApiFallback: true, // Enable history-based routing
    hmr: {
      protocol: 'wss',
      host: 'crisp-ai.com',
      port: 443, // Default SSL port for WebSocket
    }
  },
});
