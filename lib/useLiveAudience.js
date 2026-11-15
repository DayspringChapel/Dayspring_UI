'use client';
import { useEffect, useRef, useState } from 'react';
const STATES = { '-1':'page', 0:'ended', 1:'playing', 2:'paused', 3:'buffering', 5:'paused' };
export default function useLiveAudience(stream) {
    const [counts,setCounts] = useState(null); const channel=useRef(null);
    useEffect(() => {
        let alive=true, writing=false, queued=false, sequence=0, state='page';
        const sessionId=crypto.randomUUID().replaceAll('-','');
        const permitted = navigator.doNotTrack!=='1' && navigator.globalPrivacyControl!==true;
        const source={platform:stream.platform,sourceUrl:stream.url};
        const device=window.innerWidth<640?'mobile':window.innerWidth<1024?'tablet':'desktop';
        let referrer='direct'; try { if(document.referrer)referrer=new URL(document.referrer).origin===window.location.origin?'website':'external'; } catch { /* No referrer category. */ }
        const accept=value=>{ if(alive && Number.isFinite(value?.watching) && Number.isFinite(value?.views))setCounts(value); };
        const effective=()=>document.hidden?'hidden':state;
        async function send(next=effective(),beacon=false) {
            if(!permitted)return;
            if(writing && !beacon){queued=true;return;}
            const body=JSON.stringify({...source,sessionId,sequence:++sequence,state:next,device,referrer});
            if(beacon){navigator.sendBeacon?.('/api/live-analytics/heartbeat',new Blob([body],{type:'application/json'}));return;}
            writing=true;
            try {const response=await fetch('/api/live-analytics/heartbeat',{method:'POST',headers:{'Content-Type':'application/json'},body,keepalive:true,signal:AbortSignal.timeout(10000)});if(response.ok)accept(await response.json());}
            catch { /* Statistics must never interrupt the player or comments. */ }
            finally {writing=false;if(queued && alive){queued=false;send();}}
        }
        let reading=false;
        async function read(){
            if(reading || document.hidden)return;reading=true;
            try {const response=await fetch(`/api/live-analytics/current?${new URLSearchParams(source)}`,{cache:'no-store',signal:AbortSignal.timeout(10000)});if(response.ok)accept(await response.json());else if(alive)setCounts(null);}
            catch {if(alive)setCounts(null);}finally{reading=false;}
        }
        channel.current={player:value=>{state=STATES[value]||'page';send();},error:()=>{state='error';send();},outbound:()=>send('outbound')};
        send('page');read();
        const beat=setInterval(()=>send(),20000), poll=setInterval(read,15000);
        const visibility=()=>{send(effective(),document.hidden);if(!document.hidden)read();};
        const leave=()=>send('left',true), returnToPage=()=>{send();read();};
        document.addEventListener('visibilitychange',visibility);window.addEventListener('pagehide',leave);window.addEventListener('pageshow',returnToPage);
        return()=>{alive=false;channel.current=null;leave();clearInterval(beat);clearInterval(poll);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('pagehide',leave);window.removeEventListener('pageshow',returnToPage);};
    },[stream.platform,stream.url]);
    return {counts,onPlayerState:value=>channel.current?.player(value),onPlayerError:()=>channel.current?.error(),onOutbound:()=>channel.current?.outbound()};
}
