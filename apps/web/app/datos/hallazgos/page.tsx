import { Metadata } from 'next';
import { HallazgosPage } from '@/features/hallazgos/HallazgosPage';

export const metadata: Metadata = {
  title: '¿Qué historias cuentan los datos? | Mapa de Dalias y Participación Ciudadana',
  description: 'Un libro de hallazgos con patrones que aparecen al leer juntos los Conteos Censales de Participación Ciudadana 2009–2024.',
};

export default function Page() {
  return <HallazgosPage />;
}
