'use client';
import { useEffect, useState } from 'react';
import apiClient from '@/lib/apiClient';
export default function ChurchSelector() {
    const [churches, setChurches] = useState([]); const [error, setError] = useState('');
    useEffect(() => { const c = new AbortController(); apiClient.request('/api/v1/churches', { signal: c.signal }).then(setChurches).catch((e) => { if (!c.signal.aborted) setError(e.message); }); return () => c.abort(); }, []);
    function change(id) {
        if (!churches.some((c) => c.id === id)) return;
        document.cookie = `dayspring_church=${id}; Path=/; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
        location.assign('/admin/forms');
    }
    return <div>{churches.length > 1 && <label>Church<select aria-label="Current church" value={apiClient.getUserData()?.churchId || ''} onChange={(e) => change(e.target.value)} style={{ width: '100%', color: '#14263b', padding: 6 }}>{churches.map((c) => <option value={c.id} key={c.id}>{c.name}</option>)}</select></label>}{error && <small role="alert">{error}</small>}</div>;
}
