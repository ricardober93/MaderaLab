import type { WebGLRenderer, PerspectiveCamera, Scene } from 'three'
import type { Piece } from '../types'
import { SCALE } from './constants'

export const RENDER_PRESETS = ['perspectiva', 'frontal', 'lateral', 'superior'] as const
export type RenderPreset = (typeof RENDER_PRESETS)[number]

export const RENDER_PRESET_LABELS: Record<RenderPreset, string> = {
  perspectiva: 'Perspectiva',
  frontal: 'Frontal',
  lateral: 'Lateral',
  superior: 'Superior',
}

export const RENDER_FONDOS = ['blanco', 'gris', 'transparente'] as const
export type RenderFondo = (typeof RENDER_FONDOS)[number]

export const RENDER_FONDO_LABELS: Record<RenderFondo, string> = {
  blanco: 'Blanco',
  gris: 'Gris claro',
  transparente: 'Transparente',
}

export const RENDER_FONDO_COLORS: Record<Exclude<RenderFondo, 'transparente'>, string> = {
  blanco: '#ffffff',
  gris: '#d4d4d4',
}

export interface RenderBounds {
  centerX: number
  centerY: number
  centerZ: number
  maxDim: number
}

export function computeRenderBounds(pieces: Piece[]): RenderBounds {
  const maxX = Math.max(...pieces.map((p) => p.position.x + p.dimension.sizeX), 0) * SCALE
  const maxY = Math.max(...pieces.map((p) => p.position.y + p.dimension.sizeY), 0) * SCALE
  const maxZ = Math.max(...pieces.map((p) => p.position.z + p.dimension.sizeZ), 0) * SCALE
  return {
    centerX: maxX / 2,
    centerY: maxY / 2,
    centerZ: maxZ / 2,
    maxDim: Math.max(maxX, maxY, maxZ),
  }
}

export function cameraPositionFor(
  preset: RenderPreset,
  bounds: RenderBounds,
  fov = 40,
  aspect = 1.6,
): [number, number, number] {
  const tan = Math.tan((fov / 2) * Math.PI / 180)
  const { centerX, centerY, centerZ } = bounds
  const W = 2 * centerX
  const H = 2 * centerY
  const D = 2 * centerZ
  const halfDiag = Math.sqrt((W / 2) ** 2 + (H / 2) ** 2 + (D / 2) ** 2)
  const margin = 1.2
  const marginFrontal = 1.25
  const marginSuperior = 1.75

  const dPersp = (margin * halfDiag) / tan
  const dFrontal = marginFrontal * Math.max((H / 2) / tan, (W / 2) / (aspect * tan))
  const dLateral = margin * Math.max((H / 2) / tan, (D / 2) / (aspect * tan))
  const dSuperior = marginSuperior * Math.max((W / 2) / (aspect * tan), (D / 2) / tan)

  const dir = (dx: number, dy: number, dz: number): [number, number, number] => {
    const len = Math.sqrt(dx * dx + dy * dy + dz * dz)
    return [(dx / len) * dPersp, (dy / len) * dPersp, (dz / len) * dPersp]
  }

  switch (preset) {
    case 'perspectiva':
      return dir(0.62, 0.42, -0.72)
    case 'frontal':
      return [0, dFrontal * 0.06, -dFrontal]
    case 'lateral':
      return [dLateral, dLateral * 0.06, 0]
    case 'superior':
      return [0, centerY + dSuperior, 0]
  }
}

export function captureCanvas(
  gl: WebGLRenderer,
  scene: Scene,
  camera: PerspectiveCamera,
  multiplier: number,
): string {
  const base = gl.getPixelRatio()
  try {
    gl.setPixelRatio(base * multiplier)
    gl.render(scene, camera)
    return gl.domElement.toDataURL('image/png')
  } finally {
    gl.setPixelRatio(base)
  }
}

export function descargarRender(dataUrl: string, nombreProyecto: string): void {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = `${nombreProyecto.replace(/\s+/g, '_')}_render.png`
  a.click()
}
