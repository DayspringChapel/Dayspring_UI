'use client';

import { useEffect, useRef, useState } from 'react';
import { extractYouTubeId } from '@/lib/youtube';
import Image from '@/components/PublicImage';
import { deliveryVideo, videoPoster } from '@/lib/mediaDelivery';

const YOUTUBE_RATIO = 16 / 9;

// Renders an in-app player for a video from either source — a restrained YouTube
// (nocookie) iframe, or a native <video> tag for a directly-uploaded file.
// Renders nothing if neither URL is usable, so callers can render unconditionally.
// Pass `fill` to have it absolutely fill its positioned parent (e.g. a card used
// as background media) instead of sizing itself by aspect ratio.
// Pass `autoplay` to have it start playing immediately like a static image would —
// browsers only allow this muted, so autoplay always implies muted + looped.
export default function VideoEmbed({ youtubeUrl, videoUrl, title = 'Video', className = '', style, fill = false, autoplay = false }) {
    const youtubeId = extractYouTubeId(youtubeUrl);
    const containerRef = useRef(null);
    const [coverSize, setCoverSize] = useState(null);
    const [near,setNear]=useState(false),[activated,setActivated]=useState(false),[motion,setMotion]=useState(false);
    const [failedSource,setFailedSource]=useState(null);
    useEffect(()=>{
        const element=containerRef.current;if(!element)return;
        const observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting){setNear(true);setMotion(!matchMedia('(prefers-reduced-motion: reduce)').matches&&!navigator.connection?.saveData);observer.disconnect();}},{rootMargin:'150px'});
        observer.observe(element);return()=>observer.disconnect();
    },[youtubeId,videoUrl]);
    const automatic=autoplay&&motion;
    const fillStyle = fill
        ? { position: 'absolute', inset: 0, width: '100%', height: '100%' }
        : { position: 'relative', width: '100%', aspectRatio: '16 / 9' };

    // A YouTube iframe can't use object-fit: cover — it only fits its own box,
    // it never crops. To make it "mask" a background area like a real cover video,
    // measure the container and oversize the iframe to the larger dimension, then
    // center it so the excess is clipped by the container's overflow: hidden.
    useEffect(() => {
        if (!fill || !youtubeId) return;
        const el = containerRef.current;
        if (!el) return;
        const measure = () => {
            const { width, height } = el.getBoundingClientRect();
            if (width && height) setCoverSize({ width, height });
        };
        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(el);
        return () => ro.disconnect();
    }, [fill, youtubeId]);

    if (youtubeId) {
        const params = new URLSearchParams({ modestbranding: '1', rel: '0' });
        if (automatic || activated) {
            params.set('autoplay', '1');
        }
        if (automatic) {
            params.set('mute', '1');
            params.set('loop', '1');
            params.set('playlist', youtubeId); // required by YouTube for single-video looping
            params.set('controls', '0');
            params.set('showinfo', '0');
            params.set('iv_load_policy', '3');
            params.set('disablekb', '1');
        }

        let iframeStyle = { position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 };
        if (fill && coverSize) {
            const containerRatio = coverSize.width / coverSize.height;
            const width = containerRatio > YOUTUBE_RATIO ? coverSize.width : coverSize.height * YOUTUBE_RATIO;
            const height = containerRatio > YOUTUBE_RATIO ? coverSize.width / YOUTUBE_RATIO : coverSize.height;
            iframeStyle = {
                position: 'absolute', top: '50%', left: '50%',
                width, height, border: 0,
                transform: 'translate(-50%, -50%)',
                pointerEvents: autoplay ? 'none' : 'auto',
            };
        }

        return (
            <div
                ref={containerRef}
                className={className}
                style={{ ...fillStyle, overflow: 'hidden', background: '#000', ...style }}
            >
                {near&&(automatic||activated)?<iframe
                    src={`https://www.youtube-nocookie.com/embed/${youtubeId}?${params.toString()}`}
                    title={title}
                    style={iframeStyle}
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />:<button type="button" aria-label={`Play ${title}`} onClick={()=>setActivated(true)} style={{position:'absolute',inset:0,width:'100%',height:'100%',padding:0,background:'#101521',color:'#fff'}}>
                    {near&&<Image src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`} alt="" fill sizes="(max-width: 767px) 100vw, 50vw" className="object-cover"/>}
                    <span style={{position:'relative',display:'inline-grid',placeItems:'center',width:64,height:64,borderRadius:'50%',background:'#0009',fontSize:28}}>▶</span>
                </button>}
            </div>
        );
    }

    if (videoUrl) {
        return (
            <div ref={containerRef} className={className} style={{...fillStyle,overflow:'hidden',background:'#000',...style}}><video
                src={near?(failedSource===videoUrl?videoUrl:deliveryVideo(videoUrl)):undefined}
                onError={()=>setFailedSource(videoUrl)}
                poster={near?videoPoster(videoUrl):undefined}
                preload="none"
                controls={!automatic}
                autoPlay={automatic&&near}
                muted={automatic}
                loop={automatic}
                playsInline
                className={className}
                style={fill
                    ? { ...fillStyle, objectFit: 'cover', background: '#000', ...style }
                    : { width: '100%', display: 'block', objectFit: 'cover', background: '#000', ...style }}
            /></div>
        );
    }

    return null;
}
