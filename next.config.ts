
import type { NextConfig } from "next";

const nextConfig = {
    output: 'standalone',
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'news-media.tkirbis30.ru',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'article-media.tkirbis30.ru',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'user-media.tkirbis30.ru',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'fst-dmitrov.ru',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'encrypted-tbn0.gstatic.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'risk.ru',
                port: '',
                pathname: '/**',
            },
        ],
    },
    async rewrites() {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        const getFullBackendUrl = (path: string) => {
            if (!backendUrl) return path; // Fallback or error if not set
            if (backendUrl.startsWith('http://') || backendUrl.startsWith('https://')) {
                return backendUrl + path;
            }
            return `http://${backendUrl}${path}`;
        };

        return [
            {
                source: '/api/:path*',
                destination: getFullBackendUrl('/api/:path*'),
            },
            {
                source: '/hikes/:id/report',
                destination: getFullBackendUrl('/api/archive/hikes/:id/file/report'),
            },
            {
                source: '/hikes/:id/route',
                destination: getFullBackendUrl('/api/archive/hikes/:id/file/route'),
            },
        ];
    },
};

export default nextConfig;
