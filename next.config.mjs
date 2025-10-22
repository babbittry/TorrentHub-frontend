import createNextIntlPlugin from 'next-intl/plugin';
import { createMDX } from 'fumadocs-mdx/next';

const withNextIntl = createNextIntlPlugin();
const withMDX = createMDX({         // 初始化 Fumadocs MDX
  // customise the config file path
  // configPath: "source.config.ts"
});

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
    transpilePackages: ['md-editor-rt'],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
            {
                protocol: 'http',
                hostname: '**',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '5014',
                pathname: '/avatars/**',
            },
        ],
    },
    reactStrictMode: true,
};

export default withNextIntl(withMDX(nextConfig));