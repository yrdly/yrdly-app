
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'yrdly-coyig.firebasestorage.app',
        port: '',
        pathname: '/v0/b/yrdly-coyig.appspot.com/o/**',
      }
    ],
  },
};

export default nextConfig;
