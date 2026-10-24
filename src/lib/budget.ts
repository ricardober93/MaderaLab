import type { Piece, Project, PriceSet } from '../types'
import { toCutDimension } from '../types'
import { CANTOS, MATERIALES } from '../data/catalogs'

export interface LineaMaterial {
  materialId: string
  nombre: string
  m2: number
  unit: number
  total: number
}

export interface LineaCanto {
  cantoId: string
  nombre: string
  metros: number
  unit: number
  total: number
  sinPrecio?: boolean
}

export interface LineaHerraje {
  id: string
  nombre: string
  especificacion: string
  cantidad: number
  unit: number
  total: number
  sinPrecio?: boolean
}

export interface Presupuesto {
  materiales: LineaMaterial[]
  cantos: LineaCanto[]
  herrajes: LineaHerraje[]
  total: number
  sinPrecios: number
}

export function metrajeCanto(p: Piece): number {
  if (!p.cantos || p.cantos === 'sin_canto') return 0
  const cd = toCutDimension(p.dimension, p.scale)
  const mayor = Math.max(cd.largo, cd.ancho)
  const menor = Math.min(cd.largo, cd.ancho)
  if (p.cantos === 'largo') return (2 * mayor) / 1000
  return (2 * mayor + 2 * menor) / 1000
}

export function computeBudget(project: Project, prices: PriceSet): Presupuesto {
  const materialesMap = new Map<string, LineaMaterial>()
  let metrosTotales = 0

  for (const p of project.pieces) {
    const cd = toCutDimension(p.dimension, p.scale)
    const m2 = (cd.largo * cd.ancho) / 1e6
    const existing = materialesMap.get(p.materialId)
    if (existing) {
      existing.m2 += m2
    } else {
      materialesMap.set(p.materialId, {
        materialId: p.materialId,
        nombre: MATERIALES.find((m) => m.id === p.materialId)?.nombre || p.materialId,
        m2,
        unit: 0,
        total: 0,
      })
    }
    metrosTotales += metrajeCanto(p)
  }

  const materiales: LineaMaterial[] = Array.from(materialesMap.values())
  for (const linea of materiales) {
    linea.unit = prices.materiales[linea.materialId] ?? 0
    linea.total = round2(linea.m2 * linea.unit)
  }

  const cantos: LineaCanto[] = []
  if (metrosTotales > 0) {
    const canto = CANTOS[0]
    const unit = prices.cantos[canto.id] ?? 0
    const sinPrecio = prices.cantos[canto.id] === undefined
    cantos.push({
      cantoId: canto.id,
      nombre: canto.nombre,
      metros: round2(metrosTotales),
      unit,
      total: round2(metrosTotales * unit),
      sinPrecio,
    })
  }

  let sinPrecios = 0
  const herrajes: LineaHerraje[] = project.hardware.map((h) => {
    const unit = prices.herrajes[h.id] ?? 0
    const sinPrecio = prices.herrajes[h.id] === undefined
    if (sinPrecio) sinPrecios++
    return {
      id: h.id,
      nombre: h.nombre,
      especificacion: h.especificacion,
      cantidad: h.cantidad,
      unit,
      total: round2(h.cantidad * unit),
      sinPrecio,
    }
  })

  const total = round2(
    materiales.reduce((acc, l) => acc + l.total, 0) +
    cantos.reduce((acc, l) => acc + l.total, 0) +
    herrajes.reduce((acc, l) => acc + l.total, 0),
  )

  return { materiales, cantos, herrajes, total, sinPrecios }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
