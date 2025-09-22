
import type { NextConfig } from "next";

const nextConfig = {
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
        return [
            {
                source: '/api/:path*',
                destination: process.env.NEXT_PUBLIC_BACKEND_URL + '/api/:path*',
            },
            {
                source: '/hikes/:id/report',
                destination: process.env.NEXT_PUBLIC_BACKEND_URL + '/api/archive/hikes/:id/file/report',
            },
            {
                source: '/hikes/:id/route',
                destination: process.env.NEXT_PUBLIC_BACKEND_URL + '/api/archive/hikes/:id/file/route',
            },
        ];
    },
};

export default nextConfig;
