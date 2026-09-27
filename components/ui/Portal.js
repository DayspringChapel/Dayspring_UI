'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Renders children into document.body. Use for modals/overlays: admin pages animate in with a
 * transform, which turns `position: fixed` into "fixed to the page box", so an overlay rendered
 * in place ends up pinned near the top and under the sticky header instead of centred on screen.
 */
export default function Portal({ children }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Portals need the DOM, so wait until after hydration.
        const id = requestAnimationFrame(() => setMounted(true));
        return () => cancelAnimationFrame(id);
    }, []);

    return mounted ? createPortal(children, document.body) : null;
}
