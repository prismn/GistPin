import bundleAnalyzer from '@next/bundle-analyzer';
import type { NextConfig } from 'next';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {};

export default withBundleAnalyzer(nextConfig);
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {};

export default nextConfig;
