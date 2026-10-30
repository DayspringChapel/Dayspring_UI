import { PLATFORM_BRANDING } from '@/lib/branding';

export const metadata = {
    title: { default: PLATFORM_BRANDING.name, template: `%s | ${PLATFORM_BRANDING.name}` },
    robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
    return children;
}
