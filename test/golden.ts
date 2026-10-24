import type { FurnitureConfig, FurnitureType, Piece, HardwareItem } from '../src/types'
import { DEFAULT_CONFIGS } from '../src/types'
import { generateFurniture } from '../src/lib/parametric'

export interface GoldenPiece {
  generationKey?: string
  nombre: string
  kind: string
  dimension: { sizeX: number; sizeY: number; sizeZ: number }
  position: { x: number; y: number; z: number }
}

export interface GoldenConfig {
  tipo: FurnitureType
  label: string
  overrides: Partial<FurnitureConfig>
}

export const GOLDEN_CONFIGS: GoldenConfig[] = [
  { tipo: 'estanteria', label: 'default', overrides: {} },
  { tipo: 'estanteria', label: 'min', overrides: { ancho: 200, alto: 200, profundidad: 150, grosor: 12, entrepanos: 0, repisas: 0 } },
  { tipo: 'estanteria', label: 'max', overrides: { ancho: 1200, alto: 2400, profundidad: 400, grosor: 18, entrepanos: 10, repisas: 20 } },
  { tipo: 'mesita', label: 'default', overrides: {} },
  { tipo: 'mesita', label: 'sin_cajones_sin_patas', overrides: { cajones: 0, usaPatas: false, cantidadPatas: 0 } },
  { tipo: 'mesita', label: 'max_cajones', overrides: { cajones: 8 } },
  { tipo: 'mesa', label: 'default', overrides: {} },
  { tipo: 'mesa', label: 'compacta', overrides: { ancho: 600, alto: 600, profundidad: 600, grosor: 19 } },
  { tipo: 'mesa', label: 'grande', overrides: { ancho: 2500, alto: 900, profundidad: 1100 } },
  { tipo: 'cocina', label: 'default', overrides: {} },
  { tipo: 'cocina', label: 'solo_cajones', overrides: { cajones: 4, tienePuertas: false } },
  { tipo: 'cocina', label: 'solo_puerta', overrides: { cajones: 0, tienePuertas: true } },
  { tipo: 'cajonera', label: 'default', overrides: {} },
  { tipo: 'cajonera', label: 'un_cajon_sin_patas', overrides: { cajones: 1, usaPatas: false, cantidadPatas: 0 } },
  { tipo: 'cajonera', label: 'max_cajones', overrides: { cajones: 8 } },
]

const r2 = (n: number) => Math.round(n * 100) / 100

function dumpPiece(p: Piece, withKey: boolean): GoldenPiece {
  const d: GoldenPiece = {
    nombre: p.nombre,
    kind: p.kind,
    dimension: {
      sizeX: r2(p.dimension.sizeX),
      sizeY: r2(p.dimension.sizeY),
      sizeZ: r2(p.dimension.sizeZ),
    },
    position: {
      x: r2(p.position.x),
      y: r2(p.position.y),
      z: r2(p.position.z),
    },
  }
  if (withKey && p.generationKey) d.generationKey = p.generationKey
  return d
}

export interface HardwareDump {
  id: string
  nombre: string
  especificacion: string
  cantidad: number
}

export interface DumpResult {
  geometry: Record<string, GoldenPiece[]>
  design: Record<string, GoldenPiece[]>
}

const sortPieces = (a: GoldenPiece, b: GoldenPiece) =>
  a.nombre.localeCompare(b.nombre) ||
  a.kind.localeCompare(b.kind) ||
  a.position.y - b.position.y ||
  a.position.x - b.position.x ||
  a.position.z - b.position.z ||
  (a.generationKey ?? '').localeCompare(b.generationKey ?? '')

const sortHardware = (a: HardwareDump, b: HardwareDump) =>
  (a.id || a.nombre).localeCompare(b.id || b.nombre)

export function dumpAll(withKey: boolean): DumpResult {
  const geometry: Record<string, GoldenPiece[]> = {}
  const design: Record<string, GoldenPiece[]> = {}
  for (const { tipo, label, overrides } of GOLDEN_CONFIGS) {
    const config: FurnitureConfig = { ...DEFAULT_CONFIGS[tipo], ...overrides, tipo }
    const { pieces } = generateFurniture(config)
    const d = pieces
      .map((p) => dumpPiece(p, withKey))
      .sort(sortPieces)
    geometry[`${tipo}.${label}`] = d.map((p) => ({
      nombre: p.nombre,
      kind: p.kind,
      dimension: p.dimension,
      position: p.position,
    }))
    design[`${tipo}.${label}`] = withKey ? d : d.map((p) => ({
      nombre: p.nombre,
      kind: p.kind,
      dimension: p.dimension,
      position: p.position,
    }))
  }
  return { geometry, design }
}

export function dumpHardware(): Record<string, HardwareDump[]> {
  const result: Record<string, HardwareDump[]> = {}
  for (const { tipo, label, overrides } of GOLDEN_CONFIGS) {
    const config: FurnitureConfig = { ...DEFAULT_CONFIGS[tipo], ...overrides, tipo }
    const { hardware } = generateFurniture(config)
    result[`${tipo}.${label}`] = hardware
      .map((h: HardwareItem) => ({ id: h.id, nombre: h.nombre, especificacion: h.especificacion, cantidad: h.cantidad }))
      .sort(sortHardware)
  }
  return result
}

export function dumpSeries(): { all: DumpResult; hardware: Record<string, HardwareDump[]> } {
  return { all: dumpAll(true), hardware: dumpHardware() }
}
