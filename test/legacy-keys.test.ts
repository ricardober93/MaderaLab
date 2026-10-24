import { describe, expect, it } from 'vitest'
import { legacyKeyFor } from '../src/lib/parametric'
import { migrateProject } from '../src/lib/storage'
import type { Project, Piece } from '../src/types'
import { DEFAULT_CONFIGS, toCutDimension } from '../src/types'

function pieceLegado(id: string, nombre: string, kind: Piece['kind']): Piece {
  const dimension = { sizeX: 800, sizeY: 16, sizeZ: 300 }
  return {
    id,
    nombre,
    kind,
    dimension,
    cutDimension: toCutDimension(dimension),
    position: { x: 0, y: 1984, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    materialId: 'melamina_blanca',
    color: '#ff0000',
  }
}

function proyectoLegado(pieces: Piece[]): Project {
  return {
    id: 'p1',
    nombre: 'Viejo',
    config: { ...DEFAULT_CONFIGS.estanteria, tipo: 'estanteria' },
    pieces,
    hardware: [],
    materialId: 'melamina_blanca',
    createdAt: 0,
    updatedAt: 0,
  }
}

describe('legacyKeyFor', () => {
  it('mapea nombres canónicos a keys del motor', () => {
    expect(legacyKeyFor('estanteria', 'Tapa superior')).toBe('estanteria.tapa')
    expect(legacyKeyFor('estanteria', 'Lateral izquierdo')).toBe('estanteria.lateral.izq')
    expect(legacyKeyFor('estanteria', 'Lateral derecho')).toBe('estanteria.lateral.der')
    expect(legacyKeyFor('cocina', 'Fondo')).toBe('cocina.fondo')
    expect(legacyKeyFor('mesa', 'Tablero superior')).toBe('mesa.tapa')
    expect(legacyKeyFor('mesa', 'Pata delantera izq.')).toBe('mesa.pata.del.izq')
  })

  it('mapea piezas numeradas (con el typo histórico Entrepño)', () => {
    expect(legacyKeyFor('estanteria', 'Entrepño 2')).toBe('estanteria.entepano.2')
    expect(legacyKeyFor('estanteria', 'Repisa 5')).toBe('estanteria.repisa.5')
    expect(legacyKeyFor('cajonera', 'Frente cajón 3')).toBe('cajonera.cajon.frente.3')
    expect(legacyKeyFor('mesita', 'Lateral izq. cajón 1')).toBe('mesita.cajon.lateral.izq.1')
    expect(legacyKeyFor('mesita', 'Pata 4')).toBe('mesita.pata.4')
  })

  it('devuelve undefined para nombres no reconocibles (pieza manual)', () => {
    expect(legacyKeyFor('estanteria', 'Mi tablita')).toBeUndefined()
    expect(legacyKeyFor('estanteria', 'Tapa modificado')).toBeUndefined()
  })
})

describe('migrateProject', () => {
  it('asigna generationKey a piezas reconocibles de proyectos legados', () => {
    const proyecto = proyectoLegado([
      pieceLegado('a', 'Tapa superior', 'tapa'),
      pieceLegado('b', 'Lateral izquierdo', 'lateral'),
    ])

    const migrated = migrateProject(proyecto)

    const tapa = migrated.pieces.find((p) => p.id === 'a')
    expect(tapa?.generationKey).toBe('estanteria.tapa')
    expect(tapa?.color).toBe('#ff0000')
    expect(migrated.pieces.find((p) => p.id === 'b')?.generationKey).toBe('estanteria.lateral.izq')
  })

  it('deja sin key las piezas renombradas no reconocibles (se tratan como manuales)', () => {
    const proyecto = proyectoLegado([pieceLegado('x', 'Mi tablita renombrada', 'tapa')])
    const migrated = migrateProject(proyecto)
    expect(migrated.pieces[0].generationKey).toBeUndefined()
  })

  it('no toca piezas que ya tienen generationKey', () => {
    const conKey = { ...pieceLegado('a', 'Tapa superior', 'tapa'), generationKey: 'estanteria.tapa' }
    const proyecto = proyectoLegado([conKey])
    const migrated = migrateProject(proyecto)
    expect(migrated.pieces[0].generationKey).toBe('estanteria.tapa')
  })
})
