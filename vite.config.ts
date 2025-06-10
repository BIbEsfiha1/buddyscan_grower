import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react'; 
import fs from 'fs'; 

const certPath = path.resolve(__dirname, 'cert.pem');
const keyPath = path.resolve(__dirname, 'key.pem');

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      plugins: [react()], 
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.OPENWEATHER_API_KEY': JSON.stringify(env.OPENWEATHER_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      server: { 
        host: '0.0.0.0', 
        https: fs.existsSync(certPath) && fs.existsSync(keyPath) ? { 
          key: fs.readFileSync(keyPath),
          cert: fs.readFileSync(certPath),
        } : undefined, 
      }
    };
});
