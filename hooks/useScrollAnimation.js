'use client';

import { useEffect, useState } from 'react';

/**
 * Custom hook for scroll animations using Intersection Observer
 * @param {Object} options - IntersectionObserver options
 * @returns {Array} [ref, isVisible] - Ref to attach to element and visibility state
 */
export default function useScrollAnimation(options = {}) {
    const [isVisible, setIsVisible] = useState(false);
    const [ref, setRef] = useState(null);

    useEffect(() => {
        if (!ref) return;

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                // Optionally unobserve after first reveal
                if (options.once !== false) {
                    observer.unobserve(entry.target);
                }
            } else if (options.once === false) {
                setIsVisible(false);
            }
        }, {
            threshold: options.threshold || 0.1,
            rootMargin: options.rootMargin || '0px',
        });

        observer.observe(ref);

        return () => {
            if (ref) {
                observer.unobserve(ref);
            }
        };
    }, [ref, options.threshold, options.rootMargin, options.once]);

    return [setRef, isVisible];
}
