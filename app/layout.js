'use client';

import './globals.css';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import ChatWidget from '@/components/ChatWidget';
import { usePathname } from 'next/navigation';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  );
}

function ConditionalLayout({ children }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  if (isAdminRoute) {
    // Admin routes: no nav/footer
    return <>{children}</>;
  }

  // Regular routes: with nav/footer
  return (
    <>
      <Navigation />
      <main>{children}</main>
      <Footer />
      <ChatWidget />
    </>
  );
}
