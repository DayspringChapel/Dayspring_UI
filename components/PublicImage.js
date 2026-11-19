'use client';
import Image from 'next/image';
import { useState } from 'react';
import { cloudinaryImage } from '@/lib/mediaDelivery';

export default function PublicImage({src,alt='',sizes,fill,...props}) {
    const [failedSource,setFailedSource]=useState(null);
    const remote=typeof src==='string'&&/^https?:\/\//.test(src);
    const cloud=remote&&/^https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\//.test(src)&&!/[?#]|\/s--/.test(src);
    const supported=!remote||cloud||/^https:\/\/(?:i\.ytimg\.com|img\.youtube\.com|yt3\.ggpht\.com)\//.test(src);
    const original=failedSource===src;
    return <Image {...props} alt={alt} src={src} fill={fill} sizes={sizes||(fill?'100vw':undefined)} loader={cloud&&!original?cloudinaryImage:undefined} unoptimized={props.unoptimized||!supported||original} onError={event=>{if(cloud&&!original){setFailedSource(src);return;}props.onError?.(event);}} />;
}
