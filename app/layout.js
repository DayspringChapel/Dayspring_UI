
import './globals.css';
import AppChrome from '@/components/layout/AppChrome';
import { connection } from 'next/server';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import InstallPrompt from '@/components/InstallPrompt';

export const metadata = {
  icons: {
    icon: [{ url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
    shortcut: '/icons/icon-192.png',
    apple: '/icons/apple-touch-icon.png',
  },
};

export default async function RootLayout({ children }) {
  await connection();
  return (
    <html lang="en">
      <head>
        <meta name="google-site-verification" content="gXwXd20Yk0J_QCR3DdFHdtEuVL3K3g9orgrW29y_PL8" />
        <meta name="theme-color" content="#d9752c" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="DaySpring" />
      </head>
      <body>
        <ServiceWorkerRegister />
        <AppChrome>{children}</AppChrome>
        <InstallPrompt />
      </body>
    </html>
  );
}
