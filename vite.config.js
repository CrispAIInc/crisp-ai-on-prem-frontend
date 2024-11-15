import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';

// Load environment variables based on the mode (development or production)
dotenv.config({ path: `.env.${process.env.NODE_ENV}.local` });

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // hmr: {
    //   protocol: process.env.VITE_HMR_PROTOCOL,
    //   host: process.env.VITE_HMR_HOST,
    //   port: parseInt(process.env.VITE_HMR_PORT, 10),
    // },
  },
});
