'use client';
import {useEffect,useState} from 'react';
import apiClient from '@/lib/apiClient';
import ui from './Management.module.css';
export default function MediaWorkflowSettings(){
    const [required,setRequired]=useState(null),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
    const role=apiClient.getUserData()?.role;
    const canChange=String(typeof role==='string'?role:role?.name||'').toLowerCase()==='superadmin';
    useEffect(()=>{if(!canChange)return;const controller=new AbortController();apiClient.request('/api/v1/MediaContent/workflow-settings',{signal:controller.signal}).then(value=>{if(!controller.signal.aborted)setRequired(value.approvalRequired);}).catch(error=>{if(!controller.signal.aborted)setMessage(error.message);});return()=>controller.abort();},[canChange]);
    if(!canChange)return null;
    async function change(){if(busy||required===null)return;setBusy(true);try{const result=await apiClient.request('/api/v1/MediaContent/workflow-settings',{method:'PUT',body:JSON.stringify({approvalRequired:!required})});setRequired(result.approvalRequired);setMessage(result.message);}catch(error){setMessage(error.message);}finally{setBusy(false);}}
    return <aside className={ui.card} style={{marginBottom:24,color:'#24344b'}} aria-label="Media approval policy"><h2 style={{color:'#172b43'}}>Media approval policy</h2><p style={{color:'#526177'}}>{required===null?'Loading the approval policy…':required?'New uploads automatically go to the next reviewer: Media → Church Admin → Superadmin. Superadmin may publish directly.':'Approval is disabled by Superadmin. New submissions become ready to publish; publishing is still a separate action.'}</p>{canChange&&<button type="button" style={{background:'#fff',color:'#24344b',border:'1px solid #c7d1df',borderRadius:8,padding:'12px 16px'}} disabled={busy||required===null} onClick={change}>{busy?'Saving…':required?'Disable approval for new submissions':'Require approval for new submissions'}</button>}{message&&<p role="status">{message}</p>}</aside>;
}
