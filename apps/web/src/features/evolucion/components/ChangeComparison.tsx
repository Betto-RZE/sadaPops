export function ChangeComparison() {
  return (
    <section className="mb-24 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
      <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-4">
        <h2 className="text-3xl md:text-4xl font-bold text-brand-navy">¿Qué cambió respecto al ciclo previo?</h2>
        <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase hidden md:inline-block">ANÁLISIS COMPARATIVO</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Ciclo inmediato */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-8">
            <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">CICLO INMEDIATO</span>
            <span className="text-xs font-bold text-dalia-600">XXXX Intermedia → XXXX Presidencial</span>
          </div>
          
          <div className="flex items-end gap-3 mb-4">
            <div className="text-6xl font-black text-brand-navy tracking-tighter flex items-start">
              <span className="text-3xl text-gray-300 mr-1 mt-2">+</span>X.X <span className="text-2xl text-gray-400 font-bold ml-1 mt-6">pts</span>
            </div>
            <div className="text-dalia-600 font-bold flex items-center gap-1 mb-2 bg-dalia-50 px-2 py-1 rounded">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 15l7-7 7 7"/></svg>
              Incremento cíclico
            </div>
          </div>
          
          <p className="text-gray-500 font-medium mb-8 leading-relaxed">
            Salto proporcional de votantes que llenaron las casillas en las 32 entidades federativas.
          </p>
          
          <div className="flex justify-between text-sm font-bold text-gray-400 border-t border-gray-100 pt-4">
            <span>Año: XX.X%</span>
            <span className="text-gray-300">—</span>
            <span>Año: XX.X%</span>
          </div>
        </div>

        {/* Misma naturaleza */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-8">
            <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">MISMA NATURALEZA</span>
            <span className="text-xs font-bold text-gray-400">Presidencial XXXX vs XXXX</span>
          </div>
          
          <div className="flex items-end gap-3 mb-4">
            <div className="text-6xl font-black text-brand-navy tracking-tighter flex items-start">
              <span className="text-3xl text-gray-300 mr-1 mt-2">+</span>X.X <span className="text-2xl text-gray-400 font-bold ml-1 mt-6">pts</span>
            </div>
            <div className="text-gray-500 font-bold flex items-center gap-1 mb-2 bg-gray-50 px-2 py-1 rounded">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/></svg>
              Variación moderada
            </div>
          </div>
          
          <p className="text-gray-500 font-medium mb-8 leading-relaxed">
            Ligero avance porcentual, pero con más personas votando en números absolutos por el crecimiento del padrón.
          </p>
          
          <div className="flex justify-between text-sm font-bold text-gray-400 border-t border-gray-100 pt-4">
            <span>Año: XX.X%</span>
            <span className="text-gray-300">—</span>
            <span>Año: XX.X%</span>
          </div>
        </div>
      </div>
    </section>
  );
}
