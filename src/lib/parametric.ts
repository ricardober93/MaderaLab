import { v4 as uuid } from 'uuid'
import type { FurnitureConfig, FurnitureType, Piece, HardwareItem, Position, PieceKind, SpatialDimension, CantosEstado } from '../types'
import { toCutDimension } from '../types'

export function generateFurniture(config: FurnitureConfig): {
  pieces: Piece[]
  hardware: HardwareItem[]
} {
  const generators: Record<string, (c: FurnitureConfig) => { pieces: Piece[]; hardware: HardwareItem[] }> = {
    estanteria: generateEstanteria,
    mesita: generateMesita,
    mesa: generateMesa,
    cocina: generateCocina,
    cajonera: generateCajonera,
  }

  const generator = generators[config.tipo]
  if (!generator) return { pieces: [], hardware: [] }

  const generated = generator(config)
  return {
    pieces: generated.pieces.map((p) => ({ ...p, cantos: defaultCantos(p.kind) })),
    hardware: generated.hardware,
  }
}

export function defaultCantos(kind: PieceKind): CantosEstado {
  switch (kind) {
    case 'puerta':
    case 'cajon_frente':
      return 'cuatro_lados'
    case 'tapa':
    case 'base':
    case 'lateral':
    case 'entepano':
    case 'repisa':
    case 'cajon_lateral':
      return 'largo'
    default:
      return 'sin_canto'
  }
}

function materialDe(c: FurnitureConfig): string {
  return c.materialId || 'melamina_blanca'
}

function piece(
  generationKey: string,
  nombre: string,
  kind: PieceKind,
  sizeX: number,
  sizeY: number,
  sizeZ: number,
  pos: Position,
  materialId: string,
): Piece {
  const dimension: SpatialDimension = { sizeX, sizeY, sizeZ }
  const scale: Piece['scale'] = { x: 1, y: 1, z: 1 }
  return {
    id: uuid(),
    generationKey,
    nombre,
    kind,
    dimension,
    cutDimension: toCutDimension(dimension, scale),
    position: pos,
    rotation: { x: 0, y: 0, z: 0 },
    scale,
    materialId,
    color: '',
  }
}

interface Carcasa {
  pieces: Piece[]
  internoH: number
}

function carcasaEstanteria(c: FurnitureConfig, tipo: string, materialId: string): Carcasa {
  const { ancho, alto, profundidad, grosor: g } = c
  return {
    pieces: [
      piece(`${tipo}.tapa`, 'Tapa superior', 'tapa', ancho, g, profundidad, { x: 0, y: alto - g, z: 0 }, materialId),
      piece(`${tipo}.base`, 'Base inferior', 'base', ancho, g, profundidad, { x: 0, y: 0, z: 0 }, materialId),
      piece(`${tipo}.lateral.izq`, 'Lateral izquierdo', 'lateral', g, alto, profundidad, { x: 0, y: 0, z: 0 }, materialId),
      piece(`${tipo}.lateral.der`, 'Lateral derecho', 'lateral', g, alto, profundidad, { x: ancho - g, y: 0, z: 0 }, materialId),
      piece(`${tipo}.fondo`, 'Fondo', 'fondo', ancho - g * 2, alto - g * 2, 3, { x: g, y: g, z: profundidad - 3 }, materialId),
    ],
    internoH: alto - g * 2,
  }
}

function carcasaMesita(c: FurnitureConfig, tipo: string, materialId: string): Carcasa {
  const { ancho, alto, profundidad, grosor: g } = c
  return {
    pieces: [
      piece(`${tipo}.tapa`, 'Tapa superior', 'tapa', ancho, g, profundidad, { x: 0, y: alto - g, z: 0 }, materialId),
      piece(`${tipo}.lateral.izq`, 'Lateral izquierdo', 'lateral', g, alto - g, profundidad, { x: 0, y: 0, z: 0 }, materialId),
      piece(`${tipo}.lateral.der`, 'Lateral derecho', 'lateral', g, alto - g, profundidad, { x: ancho - g, y: 0, z: 0 }, materialId),
      piece(`${tipo}.fondo`, 'Fondo', 'fondo', ancho - g * 2, alto - g * 2, 3, { x: g, y: g, z: profundidad - 3 }, materialId),
    ],
    internoH: alto - g,
  }
}

function espaciadoEntrepanos(internoH: number, g: number, entrepanos: number): number {
  const totalDivisions = entrepanos
  return totalDivisions > 0
    ? (internoH - g * totalDivisions) / (totalDivisions + 1)
    : internoH
}

function cajonZona(c: FurnitureConfig, tipo: string, materialId: string, i: number, yBase: number, cajonHeight: number): Piece[] {
  const { ancho, profundidad, grosor: g } = c
  const cFrenteH = cajonHeight - 8
  const cW = ancho - g * 2 - 4
  const cD = profundidad - 3 - 20
  const cG = 12
  return [
    piece(
      `${tipo}.cajon.frente.${i + 1}`, `Frente cajón ${i + 1}`, 'cajon_frente',
      cW + 4, cFrenteH, g, { x: g - 2, y: yBase + 4, z: -2 }, materialId,
    ),
    piece(
      `${tipo}.cajon.lateral.izq.${i + 1}`, `Lateral izq. cajón ${i + 1}`, 'cajon_lateral',
      cD, cFrenteH - g * 2, cG, { x: g + 2, y: yBase + 4 + g, z: g }, materialId,
    ),
    piece(
      `${tipo}.cajon.lateral.der.${i + 1}`, `Lateral der. cajón ${i + 1}`, 'cajon_lateral',
      cD, cFrenteH - g * 2, cG, { x: ancho - g - 2 - cG, y: yBase + 4 + g, z: g }, materialId,
    ),
    piece(
      `${tipo}.cajon.fondo.${i + 1}`, `Fondo cajón ${i + 1}`, 'cajon_fondo',
      cW - cG * 2 - 4, cFrenteH - g * 2, 3, { x: g + 2 + cG, y: yBase + 4 + g, z: g }, materialId,
    ),
    piece(
      `${tipo}.cajon.base.${i + 1}`, `Base cajón ${i + 1}`, 'cajon_base',
      cW - cG * 2 - 4, 3, cD, { x: g + 2 + cG, y: yBase + 4 + g, z: g }, materialId,
    ),
  ]
}

function herrajesCajon(cD: number): HardwareItem[] {
  const bucket = [300, 400, 500].find((t) => Math.round(cD) <= t + 2) ?? 500
  return [
    { id: `corredera_${bucket}`, nombre: 'Corredera de cajón', especificacion: `${Math.round(cD)}mm`, cantidad: 2 },
    { id: 'tirador', nombre: 'Tirador', especificacion: '96mm', cantidad: 1 },
  ]
}

function patasNivelacion(c: FurnitureConfig, tipo: string, materialId: string): Piece[] {
  const { ancho, profundidad, grosor: g, cantidadPatas } = c
  const pieces: Piece[] = []
  for (let i = 0; i < cantidadPatas; i++) {
    const xPos = i < 2 ? g : ancho - g - 30
    const zPos = i % 2 === 0 ? g : profundidad - g - 30
    pieces.push(piece(`${tipo}.pata.${i + 1}`, `Pata ${i + 1}`, 'pata', 30, 50, 30, { x: xPos, y: -50, z: zPos }, materialId))
  }
  return pieces
}

function generateEstanteria(c: FurnitureConfig) {
  const { grosor: g, entrepanos, repisas } = c
  const materialId = materialDe(c)

  const { pieces: shellP, internoH } = carcasaEstanteria(c, 'estanteria', materialId)
  const pieces: Piece[] = [...shellP]
  const hardware: HardwareItem[] = []

  const espacioEntreDivisiones = espaciadoEntrepanos(internoH, g, entrepanos)

  for (let i = 0; i < entrepanos; i++) {
    const yPos = g + espacioEntreDivisiones * (i + 1) + g * i
    pieces.push(piece(
      `estanteria.entepano.${i + 1}`, `Entrepño ${i + 1}`, 'entepano',
      c.ancho - g * 2, g, c.profundidad - 3, { x: g, y: yPos, z: 0 }, materialId,
    ))
  }

  for (let i = 0; i < repisas; i++) {
    pieces.push(piece(
      `estanteria.repisa.${i + 1}`, `Repisa ${i + 1}`, 'repisa',
      c.ancho - g * 2, g, c.profundidad - 3, { x: g, y: 0, z: 0 }, materialId,
    ))
  }

  const laterales = 2
  const unionesPorLateral = entrepanos + 2
  const totalConfirmat = laterales * unionesPorLateral * 2
  hardware.push({ id: 'tornillo_confirmat_5x50', nombre: 'Tornillo confirmat', especificacion: '5 × 50mm', cantidad: totalConfirmat })
  hardware.push({ id: 'dado_confirmat_5mm', nombre: 'Dado confirmat', especificacion: '5mm', cantidad: totalConfirmat })
  hardware.push({ id: 'tornillo_fondo_3x16', nombre: 'Tornillo fondo', especificacion: '3 × 16mm', cantidad: Math.max(4, Math.ceil((c.ancho - g * 2) / 200) * 2) })

  if (repisas > 0) {
    hardware.push({ id: 'soporte_repisa', nombre: 'Soporte de repisa', especificacion: '5mm', cantidad: repisas * laterales * 4 })
  }

  return { pieces, hardware }
}

function generateMesita(c: FurnitureConfig) {
  const { grosor: g, cajones, usaPatas, cantidadPatas } = c
  const materialId = materialDe(c)

  const { pieces: shellP } = carcasaMesita(c, 'mesita', materialId)
  const pieces: Piece[] = [...shellP]
  const hardware: HardwareItem[] = []

  const cajonHeight = (c.alto - g) / Math.max(cajones, 1)
  for (let i = 0; i < cajones; i++) {
    const yBase = i * cajonHeight
    const cD = c.profundidad - 3 - 20
    pieces.push(...cajonZona(c, 'mesita', materialId, i, yBase, cajonHeight))
    hardware.push(...herrajesCajon(cD))
  }

  if (usaPatas && cantidadPatas > 0) {
    pieces.push(...patasNivelacion(c, 'mesita', materialId))
    hardware.push({ id: 'tacos_nivelacion', nombre: 'Tacos de nivelación', especificacion: '10mm', cantidad: cantidadPatas })
  }

  hardware.push({ id: 'tornillo_confirmat_5x50', nombre: 'Tornillo confirmat', especificacion: '5 × 50mm', cantidad: (2 + cajones * 2) * 4 })
  hardware.push({ id: 'dado_confirmat_5mm', nombre: 'Dado confirmat', especificacion: '5mm', cantidad: (2 + cajones * 2) * 4 })

  return { pieces, hardware }
}

function generateMesa(c: FurnitureConfig) {
  const { ancho, alto, profundidad, grosor } = c
  const g = grosor
  const materialId = materialDe(c)

  const pieces: Piece[] = []
  const hardware: HardwareItem[] = []

  pieces.push(piece('mesa.tapa', 'Tablero superior', 'tapa', ancho, g, profundidad, { x: 0, y: alto - g, z: 0 }, materialId))

  const pataH = alto - g
  const pataSize = 45
  const insetX = 40
  const insetZ = 40

  pieces.push(piece('mesa.pata.del.izq', 'Pata delantera izq.', 'pata', pataSize, pataH, pataSize, { x: insetX, y: 0, z: insetZ }, materialId))
  pieces.push(piece('mesa.pata.del.der', 'Pata delantera der.', 'pata', pataSize, pataH, pataSize, { x: ancho - insetX - pataSize, y: 0, z: insetZ }, materialId))
  pieces.push(piece('mesa.pata.tras.izq', 'Pata trasera izq.', 'pata', pataSize, pataH, pataSize, { x: insetX, y: 0, z: profundidad - insetZ - pataSize }, materialId))
  pieces.push(piece('mesa.pata.tras.der', 'Pata trasera der.', 'pata', pataSize, pataH, pataSize, { x: ancho - insetX - pataSize, y: 0, z: profundidad - insetZ - pataSize }, materialId))

  hardware.push({ id: 'tornillo_confirmat_5x70', nombre: 'Tornillo confirmat', especificacion: '5 × 70mm', cantidad: 16 })
  hardware.push({ id: 'dado_confirmat_5mm', nombre: 'Dado confirmat', especificacion: '5mm', cantidad: 16 })

  return { pieces, hardware }
}

function generateCocina(c: FurnitureConfig) {
  const { ancho, alto, profundidad, grosor: g, cajones, tienePuertas } = c
  const materialId = materialDe(c)

  const { pieces: shellP } = carcasaEstanteria(c, 'cocina', materialId)
  const pieces: Piece[] = [...shellP]
  const hardware: HardwareItem[] = []

  const cajonZoneH = (alto - g) * 0.4
  const cajonHeight = cajonZoneH / Math.max(cajones, 1)

  for (let i = 0; i < cajones; i++) {
    const yBase = alto - g - cajonZoneH + i * cajonHeight
    const cD = profundidad - 3 - 20
    pieces.push(...cajonZona(c, 'cocina', materialId, i, yBase, cajonHeight))
    hardware.push(...herrajesCajon(cD))
  }

  if (tienePuertas) {
    const puertaZoneH = (alto - g) * 0.6
    const puertaW = ancho - g * 2
    const puertaH = puertaZoneH - 4

    pieces.push(piece('cocina.puerta', 'Puerta', 'puerta', puertaW, puertaH, g, { x: g, y: g + 2, z: -2 }, materialId))

    hardware.push({ id: 'bisagra_puerta', nombre: 'Bisagra de puerta', especificacion: '110°', cantidad: 2 })
    hardware.push({ id: 'tirador', nombre: 'Tirador', especificacion: '128mm', cantidad: 1 })
  }

  hardware.push({ id: 'tornillo_confirmat_5x50', nombre: 'Tornillo confirmat', especificacion: '5 × 50mm', cantidad: 24 })
  hardware.push({ id: 'dado_confirmat_5mm', nombre: 'Dado confirmat', especificacion: '5mm', cantidad: 24 })
  hardware.push({ id: 'tornillo_fondo_3x16', nombre: 'Tornillo fondo', especificacion: '3 × 16mm', cantidad: 8 })

  return { pieces, hardware }
}

function generateCajonera(c: FurnitureConfig) {
  const { alto, grosor: g, cajones, usaPatas, cantidadPatas } = c
  const materialId = materialDe(c)

  const { pieces: shellP } = carcasaEstanteria(c, 'cajonera', materialId)
  const pieces: Piece[] = [...shellP]
  const hardware: HardwareItem[] = []

  const cajonHeight = (alto - g * 2) / Math.max(cajones, 1)

  for (let i = 0; i < cajones; i++) {
    const yBase = g + i * cajonHeight
    const cD = c.profundidad - 3 - 20
    pieces.push(...cajonZona(c, 'cajonera', materialId, i, yBase, cajonHeight))
    hardware.push(...herrajesCajon(cD))
  }

  if (usaPatas && cantidadPatas > 0) {
    pieces.push(...patasNivelacion(c, 'cajonera', materialId))
    hardware.push({ id: 'tacos_nivelacion', nombre: 'Tacos de nivelación', especificacion: '10mm', cantidad: cantidadPatas })
  }

  hardware.push({ id: 'tornillo_confirmat_5x50', nombre: 'Tornillo confirmat', especificacion: '5 × 50mm', cantidad: (2 + cajones * 2) * 4 })
  hardware.push({ id: 'dado_confirmat_5mm', nombre: 'Dado confirmat', especificacion: '5mm', cantidad: (2 + cajones * 2) * 4 })

  return { pieces, hardware }
}

export function generateCutList(pieces: Piece[]): {
  nombre: string
  cantidad: number
  largo: number
  ancho: number
  grosor: number
  material: string
}[] {
  const groups = new Map<string, { nombre: string; cantidad: number; largo: number; ancho: number; grosor: number; material: string }>()

  for (const p of pieces) {
    const cd = toCutDimension(p.dimension, p.scale)
    const key = `${p.kind}:${cd.largo}:${cd.ancho}:${cd.grosor}:${p.materialId}`
    const existing = groups.get(key)
    if (existing) {
      existing.cantidad++
    } else {
      groups.set(key, {
        nombre: p.nombre,
        cantidad: 1,
        largo: cd.largo,
        ancho: cd.ancho,
        grosor: cd.grosor,
        material: p.materialId,
      })
    }
  }

  return Array.from(groups.values())
}

const LEGACY_NAME_TO_KEY: Record<string, string> = {
  'Tapa superior': 'tapa',
  'Tablero superior': 'tapa',
  'Base inferior': 'base',
  'Lateral izquierdo': 'lateral.izq',
  'Lateral derecho': 'lateral.der',
  'Fondo': 'fondo',
  'Puerta': 'puerta',
  'Pata delantera izq.': 'pata.del.izq',
  'Pata delantera der.': 'pata.del.der',
  'Pata trasera izq.': 'pata.tras.izq',
  'Pata trasera der.': 'pata.tras.der',
}

const LEGACY_PATTERNS: Array<{ re: RegExp; to: (n: number) => string }> = [
  { re: /^Entrepño (\d+)$/, to: (n) => `entepano.${n}` },
  { re: /^Repisa (\d+)$/, to: (n) => `repisa.${n}` },
  { re: /^Frente cajón (\d+)$/, to: (n) => `cajon.frente.${n}` },
  { re: /^Lateral izq. cajón (\d+)$/, to: (n) => `cajon.lateral.izq.${n}` },
  { re: /^Lateral der. cajón (\d+)$/, to: (n) => `cajon.lateral.der.${n}` },
  { re: /^Fondo cajón (\d+)$/, to: (n) => `cajon.fondo.${n}` },
  { re: /^Base cajón (\d+)$/, to: (n) => `cajon.base.${n}` },
  { re: /^Pata (\d+)$/, to: (n) => `pata.${n}` },
]

export function legacyKeyFor(tipo: FurnitureType, nombre: string): string | undefined {
  if (nombre in LEGACY_NAME_TO_KEY) {
    return `${tipo}.${LEGACY_NAME_TO_KEY[nombre]}`
  }
  for (const { re, to } of LEGACY_PATTERNS) {
    const m = re.exec(nombre)
    if (m) return `${tipo}.${to(Number(m[1]))}`
  }
  return undefined
}
