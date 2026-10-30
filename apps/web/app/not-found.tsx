import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[#EEEDEA] text-brand-navy">
      <h2 className="text-4xl font-black uppercase font-sans tracking-tight mb-2">404</h2>
      <p className="text-sm font-bold text-brand-navy/70 uppercase tracking-widest mb-6">Página no encontrada</p>
      <Link
        href="/"
        className="px-4 py-2 rounded-full bg-dalia-600 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:bg-dalia-700 transition-colors"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
