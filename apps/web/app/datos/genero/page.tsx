import { Metadata } from 'next';
import { GeneroPage } from '@/features/genero/GeneroPage';

export const metadata: Metadata = {
  title: '¿Quiénes participan más? | Mapa de Dalias y Participación Ciudadana',
  description: 'Comparativa interactiva de participación electoral entre mujeres y hombres en México (2009–2024).',
};

export default function Page() {
  return <GeneroPage />;
}
