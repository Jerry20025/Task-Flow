/** @type {import('next').NextConfig} */
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const nextConfig = {
  allowedDevOrigins: ['192.168.1.8'],
  typescript: {
    ignoreBuildErrors: true,

  },
  images: {
    unoptimized: true,
  },
  turbopack: {
    // Explicitly set workspace root to silence the lockfile warning
    root: __dirname,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.API_URL || process.env.NEXT_PUBLIC_API_URL,
  },
}

export default nextConfig
