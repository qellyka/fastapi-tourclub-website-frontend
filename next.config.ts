import type { NextConfig } from "next";

const nextConfig = {
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
