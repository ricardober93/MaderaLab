import type { Piece, PieceKind } from '../types'

export interface ProjectedRect {
  x: number
  y: number
  w: number
  h: number
  kind: PieceKind
  nombre: string
}

export interface DimensionAnnotation {
  x1: number
  y1: number
  x2: number
  y2: number
  value: number
  horizontal: boolean
}

export interface OrthographicViewData {
  rects: ProjectedRect[]
  dims: DimensionAnnotation[]
  boundsX: number
  boundsY: number
}

const HORIZONTAL_KINDS: PieceKind[] = ['tapa', 'base', 'entepano', 'repisa', 'cajon_frente', 'puerta']

function projectFrontal(p: Piece): ProjectedRect {
  const sx = p.dimension.sizeX * p.scale.x
  const sy = p.dimension.sizeY * p.scale.y
  return { x: p.position.x, y: p.position.y, w: sx, h: sy, kind: p.kind, nombre: p.nombre }
}

function projectLateral(p: Piece): ProjectedRect {
  const sz = p.dimension.sizeZ * p.scale.z
  const sy = p.dimension.sizeY * p.scale.y
  return { x: p.position.z, y: p.position.y, w: sz, h: sy, kind: p.kind, nombre: p.nombre }
}

function projectTop(p: Piece): ProjectedRect {
  const sx = p.dimension.sizeX * p.scale.x
  const sz = p.dimension.sizeZ * p.scale.z
  return { x: p.position.x, y: p.position.z, w: sx, h: sz, kind: p.kind, nombre: p.nombre }
}

function buildDims(rects: ProjectedRect[], totalW: number, totalH: number): DimensionAnnotation[] {
  const dims: DimensionAnnotation[] = []

  dims.push({ x1: 0, y1: totalH + 15, x2: totalW, y2: totalH + 15, value: Math.round(totalW), horizontal: true })
  dims.push({ x1: totalW + 15, y1: 0, x2: totalW + 15, y2: totalH, value: Math.round(totalH), horizontal: false })

  const horizontals = rects.filter((r) => HORIZONTAL_KINDS.includes(r.kind))
  const uniqueYs = [...new Set(horizontals.map((r) => Math.round(r.y)))]
  for (const yVal of uniqueYs) {
    dims.push({ x1: -15, y1: yVal, x2: totalW, y2: yVal, value: Math.round(yVal), horizontal: true })
  }

  return dims
}

export function computeFrontalView(pieces: Piece[]): OrthographicViewData {
  const rects = pieces.map(projectFrontal)
  const boundsX = Math.max(...rects.map((r) => r.x + r.w), 0)
  const boundsY = Math.max(...rects.map((r) => r.y + r.h), 0)
  const dims = buildDims(rects, boundsX, boundsY)
  return { rects, dims, boundsX, boundsY }
}

export function computeLateralView(pieces: Piece[]): OrthographicViewData {
  const rects = pieces.map(projectLateral)
  const boundsX = Math.max(...rects.map((r) => r.x + r.w), 0)
  const boundsY = Math.max(...rects.map((r) => r.y + r.h), 0)
  const dims = buildDims(rects, boundsX, boundsY)
  return { rects, dims, boundsX, boundsY }
}

export function computeTopView(pieces: Piece[]): OrthographicViewData {
  const rects = pieces.map(projectTop)
  const boundsX = Math.max(...rects.map((r) => r.x + r.w), 0)
  const boundsY = Math.max(...rects.map((r) => r.y + r.h), 0)
  const dims = buildDims(rects, boundsX, boundsY)
  return { rects, dims, boundsX, boundsY }
}