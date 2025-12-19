/* eslint-disable @typescript-eslint/no-require-imports */
import type { NextConfig } from 'next';

type NextPwaOptions = {
  dest?: string;
  register?: boolean;
  skipWaiting?: boolean;
  disable?: boolean;
};

type NextPwaPlugin = (options?: NextPwaOptions) => (config?: NextConfig) => NextConfig;

const withPWA: NextPwaPlugin = require('next-pwa');

const nextPwa = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'samplelib.com' },
      { protocol: 'https', hostname: 'www2.cs.uic.edu' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  turbopack: {},
};

export default nextPwa(nextConfig);
