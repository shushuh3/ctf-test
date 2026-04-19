import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  // Убираем Next.js dev-indicator ("N" в нижнем левом углу в dev-режиме).
  devIndicators: false,
};

export default nextConfig;
