'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import apiClient from '@/lib/apiClient';
import {canAccessPath} from '@/lib/access';
import styles from './Management.module.css';
export default function PendingApprovalSummary(){
    const user=apiClient.getUserData(),admin=apiClient.hasPermission('CanApproveAsAdmin'),root=apiClient.hasPermission('CanApproveAsSuperAdmin');
    const allowed=(admin||root)&&canAccessPath(user,'/admin/approvals');const [count,setCount]=useState(null),[error,setError]=useState('');
    useEffect(()=>{if(!allowed)return;let alive=true,version=0;async function load(){const request=++version;try{const rows=await Promise.all([admin&&!root?apiClient.getAdminApprovalQueue():[],root?apiClient.getSuperAdminApprovalQueue():[]]);if(alive&&request===version){setCount(new Set(rows.flat().map(row=>row.contentId||row.id)).size);setError('');}}catch{if(alive&&request===version)setError('Could not refresh the approval count. Open the queue to try again.');}}const refresh=()=>{if(!document.hidden)load();};load();const timer=setInterval(refresh,30000);window.addEventListener('focus',refresh);window.addEventListener('dayspring:workflow-changed',refresh);return()=>{alive=false;clearInterval(timer);window.removeEventListener('focus',refresh);window.removeEventListener('dayspring:workflow-changed',refresh);};},[allowed,admin,root]);
    if(!allowed)return null;
    return <article className={styles.card} style={{marginBottom:20}} aria-label="Pending media approvals"><h2>Pending approvals</h2><strong className={styles.value}>{count??'—'}</strong><p>Media waiting for a review you can perform.</p>{error&&<p role="status">{error}</p>}<Link className={styles.button} href="/admin/approvals">Open approval queue →</Link></article>;
}
