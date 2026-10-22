import { Metadata } from 'next';
import { EstadosPage } from '@/features/estados/EstadosPage';

export const metadata: Metadata = {
  title: '¿Cómo participa cada estado? | Mapa de Dalias y Participación Ciudadana',
  description: 'Explora la participación electoral de una entidad y compárala con otra en un duelo amistoso.',
};

export default function Page() {
  return <EstadosPage />;
}
