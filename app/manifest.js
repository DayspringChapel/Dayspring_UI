export default function manifest() {
    return {
        name: 'DaySpring Chapel',
        short_name: 'DaySpring',
        description: 'DaySpring Chapel, an arm of Victory Life Bible Church: sermons, events, giving and more.',
        id: '/',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#d9752c',
        icons: [
            { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
            { name: 'Sermons', short_name: 'Sermons', url: '/library' },
            { name: 'Events', short_name: 'Events', url: '/events' },
            { name: 'Request an appointment', short_name: 'Appointment', url: '/appointment' },
            { name: 'Admin', short_name: 'Admin', url: '/admin/dashboard' },
        ],
    };
}
