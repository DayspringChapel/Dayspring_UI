'use client';

import { useSocialLinks, whatsAppLink } from '@/lib/useSocialLinks';
import { WhatsAppIcon } from '@/components/icons/SocialIcons';

const WHATSAPP_GREEN = '#25D366';

export default function WhatsAppButton() {
    const social = useSocialLinks();
    const href = whatsAppLink(social.whatsAppNumber, "Hi DaySpring Chapel, I'd like to chat.");

    if (!href) return null;

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with us on WhatsApp"
            style={{
                position: 'fixed',
                bottom: 24,
                left: 24,
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: WHATSAPP_GREEN,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 28px rgba(37,211,102,0.50), 0 2px 8px rgba(0,0,0,0.18)',
                zIndex: 9999,
                transition: 'transform 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
            <WhatsAppIcon width={30} height={30} />
        </a>
    );
}
