import { Pixelify_Sans } from 'next/font/google';

// Misma tipografía pixel que la sección de Evolución, para mantener coherencia visual.
export const pixelFont = Pixelify_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
});
