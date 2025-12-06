'use client';

import './globals.css';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import { usePathname } from 'next/navigation';
import { EventProvider } from '@/context/EventContext';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <EventProvider>
          <ConditionalLayout>{children}</ConditionalLayout>
        </EventProvider>
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
    </>
  );
}
