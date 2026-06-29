const DEFAULT = {
    youtube:   { active: false, url: '', description: '' },
    facebook:  { active: false, url: '', description: '' },
    instagram: { active: false, url: '', description: '' },
    imageUrl: '',
    _meta: { lastYouTubeCheck: 0 },
};

if (!global.__dayspringStreams) {
    global.__dayspringStreams = structuredClone(DEFAULT);
}

export function getStreams() {
    return global.__dayspringStreams;
}

export function setStreams(data) {
    const s = global.__dayspringStreams;

    const merge = (key) => {
        const incoming = data[key] || {};
        const merged = { ...s[key], ...incoming };
        // Never persist active:true without a URL
        if (merged.active && !merged.url?.trim()) merged.active = false;
        return merged;
    };

    global.__dayspringStreams = {
        youtube:   merge('youtube'),
        facebook:  merge('facebook'),
        instagram: merge('instagram'),
        imageUrl:  data.imageUrl ?? s.imageUrl,
        _meta: s._meta,
    };
    return global.__dayspringStreams;
}

export function setYouTubeActive(active) {
    global.__dayspringStreams.youtube.active = active;
}

export function touchYouTubeCheck() {
    global.__dayspringStreams._meta.lastYouTubeCheck = Date.now();
}
