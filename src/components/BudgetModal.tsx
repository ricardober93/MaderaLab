import { useEffect, useState } from 'react'
import { computeBudget } from '../lib/budget'
import { loadPriceSet, savePriceSet, resetPriceSet, formatMoneda, catalogoLineasPrecios } from '../lib/prices'
import { useProjectStore } from '../stores/projectStore'
import type { PriceSet } from '../types'

export function BudgetModal({ project }: { project: NonNullable<ReturnType<typeof useProjectStore.getState>['currentProject']> }) {
  const setShowBudget = useProjectStore((s) => s.setShowBudget)
  const [prices, setPrices] = useState<PriceSet>(() => loadPriceSet())
  const [editando, setEditando] = useState(false)

  const budget = computeBudget(project, prices)

  const actualizar = (next: PriceSet) => {
    setPrices(next)
    savePriceSet(next)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowBudget(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setShowBudget])

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onMouseDown={(e) => e.target === e.currentTarget && setShowBudget(false)}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-[min(680px,92vw)] max-h-[86vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-800">Presupuesto — {project.nombre}</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setEditando((v) => !v)}
              className="px-3 py-1.5 text-sm border border-neutral-300 rounded text-neutral-700 hover:bg-neutral-100"
            >
              {editando ? 'Ver presupuesto' : 'Editar precios…'}
            </button>
            <button
              onClick={() => setShowBudget(false)}
              className="px-3 py-1.5 text-sm border border-neutral-300 rounded text-neutral-500 hover:bg-neutral-100"
            >
              Cerrar
            </button>
          </div>
        </div>

        {editando ? (
          <PriceEditor prices={prices} onChange={actualizar} onClose={() => setEditando(false)} />
        ) : (
          <PresupuestoView budget={budget} moneda={prices.moneda} />
        )}
      </div>
    </div>
  )
}

function PresupuestoView({ budget, moneda }: { budget: ReturnType<typeof computeBudget>; moneda: string }) {
  const fmt = (n: number) => formatMoneda(n, moneda)
  return (
    <div className="flex flex-col gap-5 text-sm">
      <Seccion titulo="Materiales">
        {budget.materiales.map((m) => (
          <div key={m.materialId} className="flex justify-between py-1">
            <span>{m.nombre} · {m.m2.toFixed(2)} m² × {fmt(m.unit)}</span>
            <span className="font-medium">{fmt(m.total)}</span>
          </div>
        ))}
      </Seccion>

      {budget.cantos.length > 0 && (
        <Seccion titulo="Cantos">
          {budget.cantos.map((c) => (
            <div key={c.cantoId} className="flex justify-between py-1">
              <span>
                {c.nombre} · {c.metros.toFixed(2)} m × {fmt(c.unit)}
                {c.sinPrecio && <span className="ml-1 text-red-500">(sin precio)</span>}
              </span>
              <span className="font-medium">{fmt(c.total)}</span>
            </div>
          ))}
        </Seccion>
      )}

      <Seccion titulo="Herrajes">
        {budget.herrajes.map((h) => (
          <div key={h.id} className="flex justify-between py-1">
            <span>
              {h.nombre} {h.especificacion} × {h.cantidad}
              {h.sinPrecio && <span className="ml-1 text-red-500">(sin precio)</span>}
            </span>
            <span className="font-medium">{fmt(h.total)}</span>
          </div>
        ))}
      </Seccion>

      <div className="border-t-2 border-neutral-800 pt-3 flex justify-between text-base font-semibold">
        <span>Total</span>
        <span>{fmt(budget.total)}</span>
      </div>
      {budget.sinPrecios > 0 && (
        <p className="text-xs text-red-500">
          {budget.sinPrecios} ítem(s) sin precio definido — el total no los incluye.
        </p>
      )}
    </div>
  )
}

function PriceEditor({ prices, onChange, onClose }: { prices: PriceSet; onChange: (p: PriceSet) => void; onClose: () => void }) {
  const lineas = catalogoLineasPrecios()
  const campo = (v: string): number => (v === '' ? 0 : Number(v) || 0)

  return (
    <div className="flex flex-col gap-4 text-sm">
      <p className="text-xs text-neutral-500">Precios en {prices.moneda}. Guardan en este navegador.</p>

      <Seccion titulo="Materiales ($/m²)">
        {lineas.materiales.map((m) => (
          <div key={m.id} className="flex items-center gap-2 py-1">
            <span className="flex-1">{m.nombre}</span>
            <input
              type="number"
              className="w-28 border border-neutral-300 rounded px-2 py-1 text-right"
              value={prices.materiales[m.id] ?? 0}
              onChange={(e) => onChange({ ...prices, materiales: { ...prices.materiales, [m.id]: campo(e.target.value) } })}
            />
          </div>
        ))}
      </Seccion>

      <Seccion titulo="Cantos ($/m)">
        {lineas.cantos.map((c) => (
          <div key={c.id} className="flex items-center gap-2 py-1">
            <span className="flex-1">{c.nombre}</span>
            <input
              type="number"
              className="w-28 border border-neutral-300 rounded px-2 py-1 text-right"
              value={prices.cantos[c.id] ?? 0}
              onChange={(e) => onChange({ ...prices, cantos: { ...prices.cantos, [c.id]: campo(e.target.value) } })}
            />
          </div>
        ))}
      </Seccion>

      <Seccion titulo="Herrajes ($ por unidad)">
        {lineas.herrajes.map((h) => (
          <div key={h.id} className="flex items-center gap-2 py-1">
            <span className="flex-1">{h.nombre} <span className="text-neutral-400 text-xs">{h.especificacion}</span></span>
            <input
              type="number"
              className="w-28 border border-neutral-300 rounded px-2 py-1 text-right"
              value={prices.herrajes[h.id] ?? 0}
              onChange={(e) => onChange({ ...prices, herrajes: { ...prices.herrajes, [h.id]: campo(e.target.value) } })}
            />
          </div>
        ))}
      </Seccion>

      <div className="flex gap-2">
        <button
          onClick={() => onChange(resetPriceSet())}
          className="px-3 py-1.5 border border-neutral-300 rounded text-neutral-600 hover:bg-neutral-100"
        >
          Restaurar defaults
        </button>
        <button
          onClick={onClose}
          className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Listo
        </button>
      </div>
    </div>
  )
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-neutral-700 border-b border-neutral-200 pb-1 mb-1">{titulo}</h3>
      {children}
    </div>
  )
}
