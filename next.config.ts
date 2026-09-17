import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();
const backendUrl = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5014').replace(/\/$/, '');

const nextConfig: NextConfig = {
    transpilePackages: ['md-editor-rt'],
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: `${backendUrl}/api/:path*`,
            },
            {
                source: '/avatars/:path*',
                destination: `${backendUrl}/avatars/:path*`,
            },
            {
                source: '/badges/:path*',
                destination: `${backendUrl}/badges/:path*`,
            },
        ];
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'image.tmdb.org',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '5014',
                pathname: '/avatars/**',
            },
        ],
    }
};

export default withNextIntl(nextConfig);
