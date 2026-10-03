import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Mapa de Dalias y Participación Ciudadana | Hackathon INE',
  description: 'Plataforma interactiva de participación cívica basada en prueba social y datos de la CCPC del INE.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.variable} font-sans antialiased selection:bg-dalia-600 selection:text-white bg-background text-brand-navy`}>
        {children}
      </body>
    </html>
  );
}
