import type { PriceSet } from '../types'
import { PRECIOS_DEFAULT, HERRAJES, MATERIALES, CANTOS } from '../data/catalogs'

const PRICES_KEY = 'maderalab_prices'

function clonPorDefecto(): PriceSet {
  const copy = { ...PRECIOS_DEFAULT, materiales: {}, cantos: {}, herrajes: {} } as PriceSet
  copy.materiales = { ...PRECIOS_DEFAULT.materiales }
  copy.cantos = { ...PRECIOS_DEFAULT.cantos }
  copy.herrajes = { ...PRECIOS_DEFAULT.herrajes }
  return copy
}

export function loadPriceSet(): PriceSet {
  try {
    const raw = localStorage.getItem(PRICES_KEY)
    if (!raw) return clonPorDefecto()
    const stored = JSON.parse(raw) as Partial<PriceSet>
    const merged = clonPorDefecto()
    merged.moneda = stored.moneda || merged.moneda
    merged.materiales = { ...merged.materiales, ...(stored.materiales || {}) }
    merged.cantos = { ...merged.cantos, ...(stored.cantos || {}) }
    merged.herrajes = { ...merged.herrajes, ...(stored.herrajes || {}) }
    return merged
  } catch {
    return clonPorDefecto()
  }
}

export function savePriceSet(p: PriceSet): void {
  localStorage.setItem(PRICES_KEY, JSON.stringify(p))
}

export function resetPriceSet(): PriceSet {
  const copy = clonPorDefecto()
  savePriceSet(copy)
  return copy
}

export function formatMoneda(n: number, moneda: string): string {
  const esClp = moneda === 'CLP'
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: esClp ? 'CLP' : 'USD',
    maximumFractionDigits: esClp ? 0 : 2,
  }).format(esClp ? Math.round(n) : n)
}

export function catalogoLineasPrecios(): {
  materiales: Array<{ id: string; nombre: string; unidad: string }>
  cantos: Array<{ id: string; nombre: string; unidad: string }>
  herrajes: Array<{ id: string; nombre: string; especificacion: string }>
} {
  return {
    materiales: MATERIALES.map((m) => ({ id: m.id, nombre: m.nombre, unidad: '/m²' })),
    cantos: CANTOS.map((c) => ({ id: c.id, nombre: c.nombre, unidad: '/m' })),
    herrajes: HERRAJES.map((h) => ({ id: h.id, nombre: h.nombre, especificacion: h.especificacion })),
  }
}
