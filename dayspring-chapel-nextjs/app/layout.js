import './globals.css';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Dayspring Chapel',
  description:
    'Welcome to DaySpringChapel, a place where purpose is discovered, potentials are built, and dreams are fulfilled',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
