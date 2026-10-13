import { Metadata } from 'next';
import { EdadesPage } from '@/features/edades/EdadesPage';

export const metadata: Metadata = {
  title: '¿Qué edades participan más? | Mapa de Dalias y Participación Ciudadana',
  description: 'Visualización de demostración de participación electoral por grupo de edad.',
};

export default function Page() {
  return <EdadesPage />;
}
