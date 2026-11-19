'use client';
import { useEffect, useState } from 'react';
import { deliveryVideo, videoPoster } from '@/lib/mediaDelivery';

export default function HeroVideo({src,onError}) {
    const [policy,setPolicy]=useState(null),[playing,setPlaying]=useState(false),[failedSource,setFailedSource]=useState(null);
    useEffect(()=>{
        const mobile=matchMedia('(max-width: 767px)'),motion=matchMedia('(prefers-reduced-motion: reduce)'),connection=navigator.connection;
        const update=()=>setPolicy({mobile:mobile.matches,enabled:!motion.matches&&!connection?.saveData&&!['slow-2g','2g'].includes(connection?.effectiveType)});
        const idle=window.requestIdleCallback?.(update,{timeout:1500});const timer=idle==null?setTimeout(update,150):null;
        mobile.addEventListener('change',update);motion.addEventListener('change',update);connection?.addEventListener?.('change',update);
        return()=>{if(idle!=null)window.cancelIdleCallback(idle);clearTimeout(timer);mobile.removeEventListener('change',update);motion.removeEventListener('change',update);connection?.removeEventListener?.('change',update);};
    },[]);
    const poster=src?videoPoster(src):undefined;
    const video=src?(failedSource===src?src:deliveryVideo(src,policy?.mobile?720:1280)):policy?.mobile?'/home-hero-mobile.mp4':'/home-hero-desktop.mp4';
    return <>
        <picture>
            {!poster&&<source media="(max-width: 767px)" srcSet="/home-hero-mobile.jpg"/>}
            {/* Tiny pre-generated posters paint before the background video is requested. */}
            <img src={poster||'/home-hero-desktop.jpg'} alt="" fetchPriority="high" className="absolute inset-0 w-full h-full object-cover"/>
        </picture>
        {policy?.enabled&&<video key={video} src={video} autoPlay muted loop playsInline preload="none" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" style={{opacity:playing?1:0}} onPlaying={()=>setPlaying(true)} onError={event=>{if(src&&video!==src){setFailedSource(src);return;}onError?.(event);}}/>}
    </>;
}
