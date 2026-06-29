const DEFAULT = {
    youtube:   { active: false, url: '' },
    facebook:  { active: false, url: '' },
    instagram: { active: false, url: '' },
};

// global persists for the lifetime of the Node.js process (survives HMR in dev)
if (!global.__dayspringStreams) {
    global.__dayspringStreams = structuredClone(DEFAULT);
}

export function getStreams() {
    return global.__dayspringStreams;
}

export function setStreams(data) {
    global.__dayspringStreams = {
        youtube:   { ...global.__dayspringStreams.youtube,   ...(data.youtube   || {}) },
        facebook:  { ...global.__dayspringStreams.facebook,  ...(data.facebook  || {}) },
        instagram: { ...global.__dayspringStreams.instagram, ...(data.instagram || {}) },
    };
    return global.__dayspringStreams;
}
