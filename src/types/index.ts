export type FurnitureType = 'estanteria' | 'mesita' | 'mesa' | 'cocina' | 'cajonera'

export type PieceKind =
  | 'lateral'
  | 'entepano'
  | 'repisa'
  | 'fondo'
  | 'tapa'
  | 'base'
  | 'cajon_frente'
  | 'cajon_lateral'
  | 'cajon_fondo'
  | 'cajon_base'
  | 'puerta'
  | 'pata'

export type TransformMode = 'translate' | 'rotate' | 'scale'

export interface SpatialDimension {
  sizeX: number
  sizeY: number
  sizeZ: number
}

export interface CutDimension {
  largo: number
  ancho: number
  grosor: number
}

export interface Position {
  x: number
  y: number
  z: number
}

export interface Rotation {
  x: number
  y: number
  z: number
}

export interface Scale {
  x: number
  y: number
  z: number
}

export interface Piece {
  id: string
  nombre: string
  kind: PieceKind
  dimension: SpatialDimension
  cutDimension: CutDimension
  position: Position
  rotation: Rotation
  scale: Scale
  materialId: string
  color: string
}

export interface HardwareItem {
  id: string
  nombre: string
  especificacion: string
  cantidad: number
}

export interface MaterialDef {
  id: string
  nombre: string
  colorDefault: string
  grosoresDisponibles: number[]
}

export interface FurnitureConfig {
  tipo: FurnitureType
  ancho: number
  alto: number
  profundidad: number
  grosor: number
  entrepanos: number
  repisas: number
  cajones: number
  tienePuertas: boolean
  usaPatas: boolean
  cantidadPatas: number
}

export interface Project {
  id: string
  nombre: string
  config: FurnitureConfig
  pieces: Piece[]
  hardware: HardwareItem[]
  materialId: string
  createdAt: number
  updatedAt: number
}

export const DEFAULT_CONFIGS: Record<FurnitureType, Omit<FurnitureConfig, 'tipo'>> = {
  estanteria: { ancho: 800, alto: 2000, profundidad: 300, grosor: 16, entrepanos: 3, repisas: 4, cajones: 0, tienePuertas: false, usaPatas: false, cantidadPatas: 0 },
  mesita: { ancho: 450, alto: 550, profundidad: 400, grosor: 16, entrepanos: 1, repisas: 1, cajones: 1, tienePuertas: false, usaPatas: true, cantidadPatas: 4 },
  mesa: { ancho: 1200, alto: 750, profundidad: 700, grosor: 25, entrepanos: 0, repisas: 0, cajones: 0, tienePuertas: false, usaPatas: true, cantidadPatas: 4 },
  cocina: { ancho: 600, alto: 850, profundidad: 580, grosor: 16, entrepanos: 0, repisas: 1, cajones: 2, tienePuertas: true, usaPatas: false, cantidadPatas: 0 },
  cajonera: { ancho: 800, alto: 900, profundidad: 450, grosor: 16, entrepanos: 0, repisas: 0, cajones: 4, tienePuertas: false, usaPatas: true, cantidadPatas: 4 },
}

export const GROSORES_ESTANDAR = [3, 6, 12, 15, 16, 18, 19, 25] as const

export const DIMENSION_LIMITS = {
  ancho: { min: 200, max: 3000 },
  alto: { min: 200, max: 2500 },
  profundidad: { min: 150, max: 1200 },
} as const

export function toCutDimension(dim: SpatialDimension, scale?: Scale): CutDimension {
  const sx = dim.sizeX * (scale?.x ?? 1)
  const sy = dim.sizeY * (scale?.y ?? 1)
  const sz = dim.sizeZ * (scale?.z ?? 1)
  const sorted = [sx, sy, sz].sort((a, b) => b - a)
  return {
    largo: Math.round(sorted[0]),
    ancho: Math.round(sorted[1]),
    grosor: Math.round(sorted[2]),
  }
}