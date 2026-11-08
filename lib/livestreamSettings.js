// Keep the browser-facing platform key stable across .NET's YouTube -> youTube casing.
export function normalizeLivestreamSettings(value = {}) {
    const platform = source => ({ active: false, url: '', description: '', ...source });
    return {
        youtube: platform(value.youtube ?? value.youTube),
        facebook: platform(value.facebook),
        instagram: platform(value.instagram),
        imageUrl: value.imageUrl || '',
        hideWatchOnline: !!value.hideWatchOnline,
        social: { whatsAppNumber: '', facebookPageUrl: '', instagramPageUrl: '', youTubeChannelId: '', ...value.social },
    };
}
