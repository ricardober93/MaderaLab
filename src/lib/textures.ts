import * as THREE from 'three'
import { MATERIALES } from '../data/catalogs'

type Perfil = 'veta' | 'vetaSuave' | 'fibra' | 'particula' | 'speckle'

const PERFILES: Record<string, Perfil> = {
  roble: 'veta',
  pino: 'veta',
  contrachapado: 'veta',
  melamina_roble: 'vetaSuave',
  mdf: 'fibra',
  aglomerado: 'particula',
  melamina_blanca: 'speckle',
  melamina_negra: 'speckle',
}

const TILE = 0.25

function hexHSL(hex: string): [number, number, number] {
  const n = hex.replace('#', '')
  const r = parseInt(n.slice(0, 2), 16) / 255
  const g = parseInt(n.slice(2, 4), 16) / 255
  const b = parseInt(n.slice(4, 6), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  const d = max - min
  if (d === 0) return [0, 0, l]
  const s = d / (1 - Math.abs(2 * l - 1))
  let h: number
  if (max === r) h = ((g - b) / d) % 6
  else if (max === g) h = (b - r) / d + 2
  else h = (r - g) / d + 4
  h = h * 60
  if (h < 0) h += 360
  return [h, s, l]
}

function seedRng(seed: string): () => number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  let estado = h >>> 0
  return () => {
    estado ^= estado << 13
    estado ^= estado >>> 17
    estado ^= estado << 5
    estado >>>= 0
    return (estado & 0xff) / 255
  }
}

function hashMatriz(rng: () => number, size: number): Float32Array {
  const m = new Float32Array(size * size)
  for (let i = 0; i < m.length; i++) m[i] = rng()
  return m
}

function pintarCanvas(
  perfil: Perfil,
  hex: string,
  size: number,
): { foto: HTMLCanvasElement, bump: HTMLCanvasElement | null } {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const img = ctx.createImageData(size, size)
  const d = img.data
  const base = hexHSL(hex)
  const rng = seedRng(perfil + hex)
  const matriz = hashMatriz(rng, size)
  const ondul = [2 + Math.floor(rng() * 3), rng(), 5 + Math.floor(rng() * 6), rng(), 1 + rng() * 2, rng()]
  const CELLA = 7
  const chips: number[] = []
  if (perfil === 'particula') {
    const celdas = Math.ceil(size / CELLA)
    for (let cy = 0; cy < celdas; cy++)
      for (let cx = 0; cx < celdas; cx++) chips[cy * celdas + cx] = seedRng(`chip${(cy * 20011 + cx) | 0}`)()
  }
  const fuerza = perfil === 'veta' ? 1 : perfil === 'vetaSuave' ? 0.5 : perfil === 'fibra' ? 0.25 : 0
  const dl = perfil === 'particula' ? 0.09 : perfil === 'speckle' ? 0.02 : 0.16

  const bumpPerfil = perfil === 'veta' || perfil === 'vetaSuave'
  const bumpCanvas = bumpPerfil ? document.createElement('canvas') : null
  if (bumpCanvas) {
    bumpCanvas.width = size
    bumpCanvas.height = size
  }
  let bCtx: CanvasRenderingContext2D | null = null
  let imgB: ImageData | null = null
  if (bumpCanvas) {
    bCtx = bumpCanvas.getContext('2d')!
    imgB = bCtx.createImageData(size, size)
  }
  const dB = imgB?.data

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4
      let delta: number
      const px = Math.floor(x), py = Math.floor(y)
      if (perfil === 'particula') {
        const celdas = Math.ceil(size / CELLA)
        delta = (chips[Math.floor(y / CELLA) * celdas + Math.floor(x / CELLA)] - 0.5) * 2 * dl
      } else if (perfil === 'speckle') {
        delta = (rng() - 0.5) * 2 * dl
      } else {
        const wav =
          0.55 * Math.sin((x / size) * Math.PI * 2 * ondul[0] + ondul[1] * 6.28) +
          0.3 * Math.sin((x / size) * Math.PI * 2 * ondul[2] + ondul[3] * 6.28) +
          0.15 * Math.sin((y / size) * Math.PI * 2 * ondul[4] * 0.5 + ondul[5] * 6.28)
        const rug = (matriz[py * size + px] - 0.5) * 0.3
        delta = (wav + rug) * dl * fuerza
      }
      const l = Math.max(0, Math.min(1, base[2] + delta))
      const [r, g, b] = hslToRgb(base[0] / 360, base[1], l)
      d[i] = r * 255
      d[i + 1] = g * 255
      d[i + 2] = b * 255
      d[i + 3] = 255
      if (dB) {
        const va = Math.max(0, Math.min(255, 128 + delta * 640))
        dB[i] = va
        dB[i + 1] = va
        dB[i + 2] = va
        dB[i + 3] = 255
      }
    }
  }
  ctx.putImageData(img, 0, 0)
  if (bumpCanvas && bCtx && imgB) bCtx.putImageData(imgB, 0, 0)
  return { foto: canvas, bump: bumpCanvas }
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) return [l, l, l]
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  const t = (v: number) => {
    let x = v % 1
    if (x < 0) x += 1
    if (x < 1 / 6) return p + (q - p) * 6 * x
    if (x < 1 / 2) return q
    if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6
    return p
  }
  return [t(h + 1 / 3), t(h), t(h - 1 / 3)]
}

interface TexturaMesh {
  map: THREE.Texture
  bump: THREE.Texture | null
}

const cacheBase = new Map<string, { foto: HTMLCanvasElement, bump: HTMLCanvasElement | null }>()

function canvasBase(materialId: string): { foto: HTMLCanvasElement, bump: HTMLCanvasElement | null } {
  const hit = cacheBase.get(materialId)
  if (hit) return hit
  const mat = MATERIALES.find((m) => m.id === materialId)
  const perfil = PERFILES[materialId] ?? 'speckle'
  const out = pintarCanvas(perfil, mat?.colorDefault ?? '#cccccc', 512)
  cacheBase.set(materialId, out)
  return out
}

const cacheTex = new Map<string, { map: THREE.Texture, bump: THREE.Texture | null }>()

export function texturaBaseMaterial(materialId: string): TexturaMesh {
  const hit = cacheTex.get(materialId)
  if (hit) return hit
  const { foto, bump } = canvasBase(materialId)
  const map = new THREE.CanvasTexture(foto)
  map.wrapS = THREE.RepeatWrapping
  map.wrapT = THREE.RepeatWrapping
  map.colorSpace = THREE.SRGBColorSpace
  map.anisotropy = 4
  let bumpT: THREE.Texture | null = null
  if (bump) {
    bumpT = new THREE.CanvasTexture(bump)
    bumpT.wrapS = THREE.RepeatWrapping
    bumpT.wrapT = THREE.RepeatWrapping
    bumpT.anisotropy = 4
  }
  const out = { map, bump: bumpT }
  cacheTex.set(materialId, out)
  return out
}

const cacheSwatch = new Map<string, string>()

export function texturaSwatch(materialId: string): string {
  const hit = cacheSwatch.get(materialId)
  if (hit) return hit
  const { foto } = canvasBase(materialId)
  const out = foto.toDataURL('image/png')
  cacheSwatch.set(materialId, out)
  return out
}

export const TILE_SIZE = TILE
