import { describe, expect, it } from 'vitest'
import { mergePieces } from '../src/lib/merge'
import type { Piece } from '../src/types'
import { toCutDimension } from '../src/types'

function piece(opts: {
  id: string
  generationKey?: string
  materialId: string
  materialCustom?: boolean
  nombre?: string
  color?: string
  sizeX?: number
}): Piece {
  const dimension = { sizeX: opts.sizeX ?? 800, sizeY: 16, sizeZ: 300 }
  return {
    id: opts.id,
    nombre: opts.nombre ?? 'Tapa superior',
    kind: 'tapa',
    dimension,
    cutDimension: toCutDimension(dimension),
    position: { x: 0, y: 1984, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    materialId: opts.materialId,
    color: opts.color ?? '',
    generationKey: opts.generationKey,
    materialCustom: opts.materialCustom,
  }
}

function piezaCanonica(opts: { id: string; generationKey: string; materialId: string; sizeX?: number }): Piece {
  const dimension = { sizeX: opts.sizeX ?? 800, sizeY: 16, sizeZ: 300 }
  return {
    id: opts.id,
    nombre: 'Tapa superior',
    kind: 'tapa',
    dimension,
    cutDimension: toCutDimension(dimension),
    position: { x: 0, y: 1984, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    materialId: opts.materialId,
    color: '',
    generationKey: opts.generationKey,
  }
}

describe('mergePieces — material base vs override por pieza', () => {
  it('pieza con materialCustom=true conserva su material tras la regeneración', () => {
    const previa = piece({
      id: 'a1',
      generationKey: 'estanteria.tapa',
      materialId: 'roble',
      materialCustom: true,
    })
    const canonica = piezaCanonica({ id: 'n1', generationKey: 'estanteria.tapa', materialId: 'pino' })
    const [merged] = mergePieces([previa], [canonica])
    expect(merged.id).toBe('a1')
    expect(merged.materialId).toBe('roble')
    expect(merged.materialCustom).toBe(true)
  })

  it('pieza sin flag toma el material canónico (regeneración por select del mueble)', () => {
    const previa = piece({ id: 'a2', generationKey: 'estanteria.tapa', materialId: 'melamina_blanca' })
    const canonica = piezaCanonica({ id: 'n2', generationKey: 'estanteria.tapa', materialId: 'pino' })
    const [merged] = mergePieces([previa], [canonica])
    expect(merged.materialId).toBe('pino')
    expect(merged.materialCustom).toBeUndefined()
  })

  it('proyecto legacy (sin flag) repinta completo al material canónico', () => {
    const previas = [
      piece({ id: 'a3', generationKey: 'estanteria.tapa', materialId: 'melamina_blanca' }),
      piece({ id: 'a4', generationKey: 'estanteria.base', materialId: 'aglomerado' }),
    ]
    const canonicas = [
      piezaCanonica({ id: 'n3', generationKey: 'estanteria.tapa', materialId: 'mdf' }),
      piezaCanonica({ id: 'n4', generationKey: 'estanteria.base', materialId: 'mdf' }),
    ]
    const merged = mergePieces(previas, canonicas)
    expect(merged.map((p) => p.materialId)).toEqual(['mdf', 'mdf'])
  })

  it('override y base conviven: tapa roble (custom), resto toma canónico pino', () => {
    const previas = [
      piece({ id: 'a5', generationKey: 'estanteria.tapa', materialId: 'roble', materialCustom: true }),
      piece({ id: 'a6', generationKey: 'estanteria.base', materialId: 'melamina_blanca' }),
    ]
    const canonicas = [
      piezaCanonica({ id: 'n5', generationKey: 'estanteria.tapa', materialId: 'pino' }),
      piezaCanonica({ id: 'n6', generationKey: 'estanteria.base', materialId: 'pino' }),
    ]
    const merged = mergePieces(previas, canonicas)
    expect(merged[0].materialId).toBe('roble')
    expect(merged[1].materialId).toBe('pino')
  })

  it('la geometría se rebasea a la canónica aunque el material se conserve', () => {
    const previa = piece({
      id: 'a7',
      generationKey: 'estanteria.tapa',
      materialId: 'roble',
      materialCustom: true,
      sizeX: 800,
    })
    const canonica = piezaCanonica({ id: 'n7', generationKey: 'estanteria.tapa', materialId: 'pino', sizeX: 900 })
    const [merged] = mergePieces([previa], [canonica])
    expect(merged.dimension.sizeX).toBe(900)
    expect(merged.materialId).toBe('roble')
  })

  it('piezas nuevas canónicas nacen con su material de generación', () => {
    const nueva = piezaCanonica({ id: 'n8', generationKey: 'estanteria.entepano.4', materialId: 'aglomerado' })
    const merged = mergePieces([], [nueva])
    expect(merged).toHaveLength(1)
    expect(merged[0].materialId).toBe('aglomerado')
  })
})
