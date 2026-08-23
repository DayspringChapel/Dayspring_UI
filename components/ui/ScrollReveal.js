'use client';

import { useEffect, useRef, useState } from 'react';

export default function ScrollReveal({
    children,
    className = '',
    threshold = 0.1,
    rootMargin = '0px',
}) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    // Unobserve after revealing to prevent re-animation
                    observer.unobserve(entry.target);
                }
            },
            {
                threshold,
                rootMargin,
            }
        );

        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [threshold, rootMargin]);

    return (
        <div
            ref={ref}
            className={`
        transition-all duration-500 ease-in
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-36'}
        ${className}
      `}
        >
            {children}
        </div>
    );
}
