'use client';
import { useEffect, useRef } from 'react';
import useLiveAudience from '@/lib/useLiveAudience';
import { loadYouTubePlayerApi } from '@/lib/youtubePlayerApi';
import styles from './LiveWatch.module.css';
function PlayerFrame({embed,title,platform,onState,onError}) {
    const host=useRef(null);const handlers=useRef({onState,onError});
    useEffect(()=>{handlers.current={onState,onError};},[onState,onError]);
    useEffect(()=>{
        let active=true,player;
        const frame=document.createElement('iframe');frame.src=embed;frame.title=title;frame.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';
        const container=host.current;container.appendChild(frame);
        if(platform==='youtube')loadYouTubePlayerApi().then(YT=>{if(active)player=new YT.Player(frame,{events:{onReady:event=>{if(active)handlers.current.onState(event.target.getPlayerState());},onStateChange:event=>{if(active)handlers.current.onState(event.data);},onError:()=>{if(active)handlers.current.onError();}}});}).catch(()=>{ /* The iframe remains playable even if statistics are blocked. */ });
        return()=>{active=false;try{player?.destroy();}catch{}container.replaceChildren();};
    },[embed,title,platform]);
    return <div className={styles.player}><div ref={host} /></div>;
}
export default function LivePlayer({stream,embed}) {
    const audience=useLiveAudience(stream);const counts=audience.counts;
    return <>
        {embed?<PlayerFrame embed={embed} title={`${stream.label} Live Stream`} platform={stream.platform} onState={audience.onPlayerState} onError={audience.onPlayerError}/>:<div className={styles.empty}><span className={styles.eyebrow}>{stream.label} LIVE</span><h2>Continue watching on {stream.label}</h2><p>{stream.platform==='instagram'?'This platform opens its live player in its own app or website.':'This broadcast is available through its original player.'}</p><a className={styles.primary} href={stream.url} onClick={audience.onOutbound} target="_blank" rel="noopener noreferrer">Watch live on {stream.label} ↗</a></div>}
        <div className={styles.caption}><div><h2>{stream.label} live broadcast</h2>{stream.description&&<p>{stream.description}</p>}</div><a href={stream.url} onClick={audience.onOutbound} target="_blank" rel="noopener noreferrer">Open in {stream.label} ↗</a></div>
        <div className={styles.audience} aria-label="Website livestream audience">
            <span title="Browsers reporting active playback on this website within the last 45 seconds. Updated approximately every 15 seconds."><strong>{counts?.playbackMeasured===false?'—':counts?counts.watching.toLocaleString():'—'}</strong> watching here</span>
            <span title="Playback sessions started on this website for this broadcast. Refreshing and playing again can create another view; this is not YouTube’s official view count."><strong>{counts?.playbackMeasured===false?'—':counts?counts.views.toLocaleString():'—'}</strong> website views</span>
        </div>
    </>;
}
