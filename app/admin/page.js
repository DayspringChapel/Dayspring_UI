'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';

export default function AdminIndexPage() {
    const router = useRouter();

    useEffect(() => {
        apiClient.restoreSession()
            .then((user) => router.replace(user ? '/admin/dashboard' : '/admin/login'))
            .catch(() => router.replace('/admin/login'));
    }, [router]);

    return null;
}
