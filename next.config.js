/** @type {import('next').NextConfig} */
const nextConfig = {
    // Required for Capacitor to work with Next.js's static export
    images: {
        unoptimized: true
    }
};

module.exports = nextConfig;
