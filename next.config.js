/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    // Required for Capacitor to work with Next.js's static export
    images: {
        unoptimized: true
    }
};

module.exports = nextConfig;
