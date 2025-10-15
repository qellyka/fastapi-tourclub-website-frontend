'use client';

import dynamic from 'next/dynamic';

export const DynamicTiptapEditor = dynamic(() => import('@/components/TiptapEditor'), { ssr: false });
