import { describe, expect, it } from 'vitest'
import { metrajeCanto, computeBudget } from '../src/lib/budget'
import { PRECIOS_DEFAULT } from '../src/data/catalogs'
import { generateFurniture } from '../src/lib/parametric'
import { toCutDimension } from '../src/types'
import type { Piece, Project, PriceSet, HardwareItem } from '../src/types'

function pieceConCantos(opts: {
  id: string
  sizeX: number
  sizeY: number
  sizeZ: number
  cantos: Piece['cantos']
  materialId?: string
}): Piece {
  const dimension = { sizeX: opts.sizeX, sizeY: opts.sizeY, sizeZ: opts.sizeZ }
  return {
    id: opts.id,
    nombre: opts.id,
    kind: 'tapa',
    dimension,
    cutDimension: toCutDimension(dimension),
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    materialId: opts.materialId ?? 'melamina_blanca',
    color: '',
    cantos: opts.cantos,
  }
}

describe('metrajeCanto', () => {
  it('repisa con cantos largo → 2 aristas mayores', () => {
    const p = pieceConCantos({ id: 'a', sizeX: 768, sizeY: 297, sizeZ: 16, cantos: 'largo' })
    expect(metrajeCanto(p)).toBeCloseTo(1.536)
  })

  it('puerta con cuatro_lados → 4 aristas', () => {
    const p = pieceConCantos({ id: 'b', sizeX: 768, sizeY: 1984, sizeZ: 16, cantos: 'cuatro_lados' })
    expect(metrajeCanto(p)).toBeCloseTo(5.504)
  })

  it('sin cantos → 0 metros', () => {
    const p = pieceConCantos({ id: 'c', sizeX: 800, sizeY: 300, sizeZ: 16, cantos: 'sin_canto' })
    expect(metrajeCanto(p)).toBe(0)
  })

  it('dos piezas con mismo cantos se suman', () => {
    const p1 = pieceConCantos({ id: 'd1', sizeX: 768, sizeY: 297, sizeZ: 16, cantos: 'largo' })
    const p2 = pieceConCantos({ id: 'd2', sizeX: 768, sizeY: 297, sizeZ: 16, cantos: 'largo' })
    expect(metrajeCanto(p1) + metrajeCanto(p2)).toBeCloseTo(3.072)
  })
})

function proyectoDe(pieces: Piece[], hardware: HardwareItem[] = []): Project {
  return {
    id: 'p',
    nombre: 'Test',
    config: { tipo: 'estanteria', ancho: 800, alto: 2000, profundidad: 300, grosor: 16, entrepanos: 3, repisas: 4, cajones: 0, tienePuertas: false, usaPatas: false, cantidadPatas: 0, materialId: 'melamina_blanca' },
    pieces,
    hardware,
    materialId: 'melamina_blanca',
    createdAt: 0,
    updatedAt: 0,
  }
}

describe('computeBudget', () => {
  it('estantería generada: materiales + cantos + herrajes y total = suma de secciones', () => {
    const { pieces, hardware } = generateFurniture({
      tipo: 'estanteria',
      ancho: 800,
      alto: 2000,
      profundidad: 300,
      grosor: 16,
      entrepanos: 3,
      repisas: 4,
      cajones: 0,
      tienePuertas: false,
      usaPatas: false,
      cantidadPatas: 0,
      materialId: 'melamina_blanca',
    })
    const budget = computeBudget(proyectoDe(pieces, hardware), PRECIOS_DEFAULT)

    expect(budget.materiales).toHaveLength(1)
    expect(budget.materiales[0].materialId).toBe('melamina_blanca')
    expect(budget.materiales[0].unit).toBe(15500)

    const fondo = pieces.find((p) => p.generationKey === 'estanteria.fondo')
    expect(fondo?.cantos).toBe('sin_canto')
    const tapa = pieces.find((p) => p.generationKey === 'estanteria.tapa')
    expect(tapa?.cantos).toBe('largo')

    expect(budget.cantos).toHaveLength(1)
    expect(budget.cantos[0].metros).toBeGreaterThan(0)
    expect(budget.cantos[0].unit).toBe(1200)

    expect(budget.herrajes.length).toBeGreaterThan(0)
    expect(budget.herrajes.every((h) => !h.sinPrecio)).toBe(true)

    const suma = budget.materiales.reduce((a, l) => a + l.total, 0) +
      budget.cantos.reduce((a, l) => a + l.total, 0) +
      budget.herrajes.reduce((a, l) => a + l.total, 0)
    expect(budget.total).toBeCloseTo(suma)
  })

  it('herraje sin precio en el PriceSet → sinPrecio y $0 en esa línea', () => {
    const pieces = [pieceConCantos({ id: 'x', sizeX: 800, sizeY: 300, sizeZ: 16, cantos: 'sin_canto' })]
    const hardware: HardwareItem[] = [{ id: 'desconocido', nombre: 'Misterio', especificacion: '?', cantidad: 3 }]
    const prices: PriceSet = { ...PRECIOS_DEFAULT, herrajes: {} }
    const budget = computeBudget(proyectoDe(pieces, hardware), prices)
    expect(budget.herrajes[0].sinPrecio).toBe(true)
    expect(budget.herrajes[0].total).toBe(0)
    expect(budget.sinPrecios).toBe(1)
  })

  it('metros de canto × unit dan el total de cantos', () => {
    const pieces = [
      pieceConCantos({ id: 'y', sizeX: 768, sizeY: 297, sizeZ: 16, cantos: 'largo' }),
      pieceConCantos({ id: 'z', sizeX: 768, sizeY: 1984, sizeZ: 16, cantos: 'cuatro_lados' }),
    ]
    const budget = computeBudget(proyectoDe(pieces, []), PRECIOS_DEFAULT)
    const esperado = (1.536 + 5.504) * 1200
    expect(budget.cantos[0].total).toBeCloseTo(esperado, 0)
  })

  it('proyecto sin campos de precio (PriceSet vacío) → sinPrecios visibles, total $0', () => {
    const pieces = [pieceConCantos({ id: 'w', sizeX: 800, sizeY: 300, sizeZ: 16, cantos: 'largo' })]
    const hardware: HardwareItem[] = [{ id: 'tornillo_confirmat_5x50', nombre: 'Tornillo confirmat', especificacion: '5 × 50mm', cantidad: 10 }]
    const prices: PriceSet = { materiales: {}, cantos: {}, herrajes: {}, moneda: 'CLP' }
    const budget = computeBudget(proyectoDe(pieces, hardware), prices)
    expect(budget.total).toBe(0)
    expect(budget.cantos[0].sinPrecio).toBe(true)
    expect(budget.herrajes[0].sinPrecio).toBe(true)
  })
})
