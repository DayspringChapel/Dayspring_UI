'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';

export default function AdminIndexPage() {
    const router = useRouter();

    useEffect(() => {
        const token = apiClient.getToken();
        router.replace(token ? '/admin/dashboard' : '/admin/login');
    }, [router]);

    return null;
}
