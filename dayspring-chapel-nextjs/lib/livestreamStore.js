const DEFAULT = {
    youtube:   { active: false, url: '' },
    facebook:  { active: false, url: '' },
    instagram: { active: false, url: '' },
    announcement: { description: '', imageUrl: '' },
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
    global.__dayspringStreams = {
        youtube:   { ...s.youtube,   ...(data.youtube   || {}) },
        facebook:  { ...s.facebook,  ...(data.facebook  || {}) },
        instagram: { ...s.instagram, ...(data.instagram || {}) },
        announcement: { ...s.announcement, ...(data.announcement || {}) },
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
