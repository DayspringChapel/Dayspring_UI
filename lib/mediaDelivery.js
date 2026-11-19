// Delivery-only transformations. Uploaded originals and stored URLs stay intact.
function transform(value, resource, transformations) {
    if (typeof value !== 'string') return value;
    try {
        const url = new URL(value);
        if (url.hostname !== 'res.cloudinary.com' || url.search || url.hash) return value;
        const marker = `/${resource}/upload/`, at = url.pathname.indexOf(marker);
        if (at < 0) return value;
        const parts = url.pathname.slice(at + marker.length).split('/');
        if (parts.some(part => /^s--/.test(part))) return value; // Signed URLs cannot be rewritten.
        let index = parts.findIndex(part => /^v\d+$/.test(part));
        if (index < 0) {
            index = 0;
            while (index < parts.length - 1 && /^(?:[a-z]{1,3}_|\$|if_)/.test(parts[index])) index++;
        }
        parts.splice(index, 0, transformations);
        url.pathname = url.pathname.slice(0, at + marker.length) + parts.join('/');
        url.protocol = 'https:';
        return url.href;
    } catch { return value; }
}
export function cloudinaryImage({src,width}) {
    return transform(src,'image',`c_limit,w_${Math.max(16,Math.min(2560,Math.round(width||1280)))}/q_auto:good/f_auto`);
}
export function deliveryVideo(src,width=1280) {
    return transform(src,'video',`c_limit,w_${width}/q_auto/f_mp4,vc_h264`);
}
export function videoPoster(src,width=960) {
    const result=transform(src,'video',`so_0/c_limit,w_${width}/q_auto/f_jpg`);
    if(result===src)return undefined;
    return result.replace(/\.[a-z0-9]+$/i,'.jpg');
}
