'use client';
import { usePathname } from 'next/navigation';
import Navigation from './Navigation';
import Footer from './Footer';
import ChatWidget from '@/components/ChatWidget';
import WhatsAppButton from '@/components/WhatsAppButton';

export default function AppChrome({ children }) {
    const pathname = usePathname();
    if (pathname?.startsWith('/admin')) return children;
    return <><Navigation /><main>{children}</main><Footer /><WhatsAppButton /><ChatWidget /></>;
}
