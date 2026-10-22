import { Metadata } from 'next';
import { UrbanoRuralPage } from '@/features/urbano-rural/UrbanoRuralPage';

export const metadata: Metadata = {
  title: '¿Dónde se participa más? | Mapa de Dalias y Participación Ciudadana',
  description: 'Compara la participación electoral en secciones urbanas, mixtas y rurales.',
};

export default function Page() {
  return <UrbanoRuralPage />;
}
