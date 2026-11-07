import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['mongodb', '@aws-sdk/client-s3', '@aws-sdk/s3-request-presigner'],
  // Prevent Next.js from scanning the admin subfolder
  transpilePackages: [],
};

export default nextConfig;
