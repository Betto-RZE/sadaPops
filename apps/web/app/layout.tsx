import './globals.css';
import type { Metadata } from 'next';

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
      <body className="antialiased selection:bg-purple-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
