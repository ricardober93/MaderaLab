import { v4 as uuid } from 'uuid'
import type { FurnitureConfig, Piece, HardwareItem, Position, SpatialDimension } from '../types'
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

  return generator(config)
}

function piece(
  nombre: string,
  kind: Piece['kind'],
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

function generateEstanteria(c: FurnitureConfig) {
  const { ancho, alto, profundidad, grosor, entrepanos, repisas } = c
  const g = grosor
  const totalDivisions = entrepanos
  const espacioInternoH = alto - g * 2
  const espacioEntreDivisiones = totalDivisions > 0 ? (espacioInternoH - g * totalDivisions) / (totalDivisions + 1) : espacioInternoH

  const pieces: Piece[] = []
  const hardware: HardwareItem[] = []
  const materialId = 'melamina_blanca'

  pieces.push(piece('Tapa superior', 'tapa', ancho, g, profundidad, { x: 0, y: alto - g, z: 0 }, materialId))
  pieces.push(piece('Base inferior', 'base', ancho, g, profundidad, { x: 0, y: 0, z: 0 }, materialId))
  pieces.push(piece('Lateral izquierdo', 'lateral', g, alto, profundidad, { x: 0, y: 0, z: 0 }, materialId))
  pieces.push(piece('Lateral derecho', 'lateral', g, alto, profundidad, { x: ancho - g, y: 0, z: 0 }, materialId))
  pieces.push(piece('Fondo', 'fondo', ancho - g * 2, alto - g * 2, 3, { x: g, y: g, z: profundidad - 3 }, materialId))

  for (let i = 0; i < totalDivisions; i++) {
    const yPos = g + espacioEntreDivisiones * (i + 1) + g * i
    pieces.push(piece(`Entrepño ${i + 1}`, 'entepano', ancho - g * 2, g, profundidad - 3, { x: g, y: yPos, z: 0 }, materialId))
  }

  for (let i = 0; i < repisas; i++) {
    pieces.push(piece(`Repisa ${i + 1}`, 'repisa', ancho - g * 2, g, profundidad - 3, { x: g, y: 0, z: 0 }, materialId))
  }

  const laterales = 2
  const unionesPorLateral = totalDivisions + 2
  const totalConfirmat = laterales * unionesPorLateral * 2
  hardware.push({ id: 'hc-1', nombre: 'Tornillo confirmat', especificacion: '5x50mm', cantidad: totalConfirmat })
  hardware.push({ id: 'hc-2', nombre: 'Dado confirmat', especificacion: '5mm', cantidad: totalConfirmat })
  hardware.push({ id: 'hc-3', nombre: 'Tornillo fondo', especificacion: '3x16mm', cantidad: Math.max(4, Math.ceil((ancho - g * 2) / 200) * 2) })

  if (repisas > 0) {
    hardware.push({ id: 'hc-4', nombre: 'Soporte de repisa', especificacion: '5mm', cantidad: repisas * laterales * 4 })
  }

  return { pieces, hardware }
}

function generateMesita(c: FurnitureConfig) {
  const { ancho, alto, profundidad, grosor, cajones, usaPatas, cantidadPatas } = c
  const g = grosor
  const materialId = 'melamina_blanca'

  const pieces: Piece[] = []
  const hardware: HardwareItem[] = []

  pieces.push(piece('Tapa superior', 'tapa', ancho, g, profundidad, { x: 0, y: alto - g, z: 0 }, materialId))
  pieces.push(piece('Lateral izquierdo', 'lateral', g, alto - g, profundidad, { x: 0, y: 0, z: 0 }, materialId))
  pieces.push(piece('Lateral derecho', 'lateral', g, alto - g, profundidad, { x: ancho - g, y: 0, z: 0 }, materialId))
  pieces.push(piece('Fondo', 'fondo', ancho - g * 2, alto - g * 2, 3, { x: g, y: g, z: profundidad - 3 }, materialId))

  const cajonHeight = (alto - g) / Math.max(cajones, 1)
  for (let i = 0; i < cajones; i++) {
    const yBase = i * cajonHeight
    const cG = 12
    const cFrenteH = cajonHeight - 8
    const cW = ancho - g * 2 - 4
    const cD = profundidad - 3 - 20

    pieces.push(piece(`Frente cajón ${i + 1}`, 'cajon_frente', cW + 4, cFrenteH, g, { x: g - 2, y: yBase + 4, z: -2 }, materialId))
    pieces.push(piece(`Lateral izq. cajón ${i + 1}`, 'cajon_lateral', cD, cFrenteH - g * 2, cG, { x: g + 2, y: yBase + 4 + g, z: g }, materialId))
    pieces.push(piece(`Lateral der. cajón ${i + 1}`, 'cajon_lateral', cD, cFrenteH - g * 2, cG, { x: ancho - g - 2 - cG, y: yBase + 4 + g, z: g }, materialId))
    pieces.push(piece(`Fondo cajón ${i + 1}`, 'cajon_fondo', cW - cG * 2 - 4, cFrenteH - g * 2, 3, { x: g + 2 + cG, y: yBase + 4 + g, z: g }, materialId))
    pieces.push(piece(`Base cajón ${i + 1}`, 'cajon_base', cW - cG * 2 - 4, 3, cD, { x: g + 2 + cG, y: yBase + 4 + g, z: g }, materialId))

    hardware.push({ id: `hc-c${i}-1`, nombre: 'Corredera de cajón', especificacion: `${Math.round(cD)}mm`, cantidad: 2 })
    hardware.push({ id: `hc-c${i}-2`, nombre: 'Tirador', especificacion: '96mm', cantidad: 1 })
  }

  if (usaPatas && cantidadPatas > 0) {
    for (let i = 0; i < cantidadPatas; i++) {
      const xPos = i < 2 ? g : ancho - g - 30
      const zPos = i % 2 === 0 ? g : profundidad - g - 30
      pieces.push(piece(`Pata ${i + 1}`, 'pata', 30, 50, 30, { x: xPos, y: -50, z: zPos }, materialId))
    }
    hardware.push({ id: 'hc-patas', nombre: 'Tacos de nivelación', especificacion: '10mm', cantidad: cantidadPatas })
  }

  hardware.push({ id: 'hc-m1', nombre: 'Tornillo confirmat', especificacion: '5x50mm', cantidad: (2 + cajones * 2) * 4 })
  hardware.push({ id: 'hc-m2', nombre: 'Dado confirmat', especificacion: '5mm', cantidad: (2 + cajones * 2) * 4 })

  return { pieces, hardware }
}

function generateMesa(c: FurnitureConfig) {
  const { ancho, alto, profundidad, grosor } = c
  const g = grosor
  const materialId = 'melamina_blanca'

  const pieces: Piece[] = []
  const hardware: HardwareItem[] = []

  pieces.push(piece('Tablero superior', 'tapa', ancho, g, profundidad, { x: 0, y: alto - g, z: 0 }, materialId))

  const pataH = alto - g
  const pataSize = 45
  const insetX = 40
  const insetZ = 40

  pieces.push(piece('Pata delantera izq.', 'pata', pataSize, pataH, pataSize, { x: insetX, y: 0, z: insetZ }, materialId))
  pieces.push(piece('Pata delantera der.', 'pata', pataSize, pataH, pataSize, { x: ancho - insetX - pataSize, y: 0, z: insetZ }, materialId))
  pieces.push(piece('Pata trasera izq.', 'pata', pataSize, pataH, pataSize, { x: insetX, y: 0, z: profundidad - insetZ - pataSize }, materialId))
  pieces.push(piece('Pata trasera der.', 'pata', pataSize, pataH, pataSize, { x: ancho - insetX - pataSize, y: 0, z: profundidad - insetZ - pataSize }, materialId))

  hardware.push({ id: 'hc-mesa-1', nombre: 'Tornillo confirmat', especificacion: '5x70mm', cantidad: 16 })
  hardware.push({ id: 'hc-mesa-2', nombre: 'Dado confirmat', especificacion: '5mm', cantidad: 16 })

  return { pieces, hardware }
}

function generateCocina(c: FurnitureConfig) {
  const { ancho, alto, profundidad, grosor, cajones, tienePuertas } = c
  const g = grosor
  const materialId = 'melamina_blanca'

  const pieces: Piece[] = []
  const hardware: HardwareItem[] = []

  pieces.push(piece('Tapa superior', 'tapa', ancho, g, profundidad, { x: 0, y: alto - g, z: 0 }, materialId))
  pieces.push(piece('Base inferior', 'base', ancho, g, profundidad, { x: 0, y: 0, z: 0 }, materialId))
  pieces.push(piece('Lateral izquierdo', 'lateral', g, alto, profundidad, { x: 0, y: 0, z: 0 }, materialId))
  pieces.push(piece('Lateral derecho', 'lateral', g, alto, profundidad, { x: ancho - g, y: 0, z: 0 }, materialId))
  pieces.push(piece('Fondo', 'fondo', ancho - g * 2, alto - g * 2, 3, { x: g, y: g, z: profundidad - 3 }, materialId))

  const cajonZoneH = (alto - g) * 0.4
  const cajonHeight = cajonZoneH / Math.max(cajones, 1)

  for (let i = 0; i < cajones; i++) {
    const yBase = alto - g - cajonZoneH + i * cajonHeight
    const cW = ancho - g * 2 - 4
    const cD = profundidad - 3 - 20
    const cG = 12
    const cFrenteH = cajonHeight - 8

    pieces.push(piece(`Frente cajón ${i + 1}`, 'cajon_frente', cW + 4, cFrenteH, g, { x: g - 2, y: yBase + 4, z: -2 }, materialId))
    pieces.push(piece(`Lateral izq. cajón ${i + 1}`, 'cajon_lateral', cD, cFrenteH - g * 2, cG, { x: g + 2, y: yBase + 4 + g, z: g }, materialId))
    pieces.push(piece(`Lateral der. cajón ${i + 1}`, 'cajon_lateral', cD, cFrenteH - g * 2, cG, { x: ancho - g - 2 - cG, y: yBase + 4 + g, z: g }, materialId))
    pieces.push(piece(`Fondo cajón ${i + 1}`, 'cajon_fondo', cW - cG * 2 - 4, cFrenteH - g * 2, 3, { x: g + 2 + cG, y: yBase + 4 + g, z: g }, materialId))
    pieces.push(piece(`Base cajón ${i + 1}`, 'cajon_base', cW - cG * 2 - 4, 3, cD, { x: g + 2 + cG, y: yBase + 4 + g, z: g }, materialId))

    hardware.push({ id: `hc-coc-c${i}-1`, nombre: 'Corredera de cajón', especificacion: `${Math.round(cD)}mm`, cantidad: 2 })
    hardware.push({ id: `hc-coc-c${i}-2`, nombre: 'Tirador', especificacion: '96mm', cantidad: 1 })
  }

  if (tienePuertas) {
    const puertaZoneH = (alto - g) * 0.6
    const puertaW = ancho - g * 2
    const puertaH = puertaZoneH - 4

    pieces.push(piece('Puerta', 'puerta', puertaW, puertaH, g, { x: g, y: g + 2, z: -2 }, materialId))

    hardware.push({ id: 'hc-coc-p1', nombre: 'Bisagra de puerta', especificacion: '110°', cantidad: 2 })
    hardware.push({ id: 'hc-coc-p2', nombre: 'Tirador', especificacion: '128mm', cantidad: 1 })
  }

  hardware.push({ id: 'hc-coc-m1', nombre: 'Tornillo confirmat', especificacion: '5x50mm', cantidad: 24 })
  hardware.push({ id: 'hc-coc-m2', nombre: 'Dado confirmat', especificacion: '5mm', cantidad: 24 })
  hardware.push({ id: 'hc-coc-m3', nombre: 'Tornillo fondo', especificacion: '3x16mm', cantidad: 8 })

  return { pieces, hardware }
}

function generateCajonera(c: FurnitureConfig) {
  const { ancho, alto, profundidad, grosor, cajones, usaPatas, cantidadPatas } = c
  const g = grosor
  const materialId = 'melamina_blanca'

  const pieces: Piece[] = []
  const hardware: HardwareItem[] = []

  pieces.push(piece('Tapa superior', 'tapa', ancho, g, profundidad, { x: 0, y: alto - g, z: 0 }, materialId))
  pieces.push(piece('Base inferior', 'base', ancho, g, profundidad, { x: 0, y: 0, z: 0 }, materialId))
  pieces.push(piece('Lateral izquierdo', 'lateral', g, alto, profundidad, { x: 0, y: 0, z: 0 }, materialId))
  pieces.push(piece('Lateral derecho', 'lateral', g, alto, profundidad, { x: ancho - g, y: 0, z: 0 }, materialId))
  pieces.push(piece('Fondo', 'fondo', ancho - g * 2, alto - g * 2, 3, { x: g, y: g, z: profundidad - 3 }, materialId))

  const cajonHeight = (alto - g * 2) / Math.max(cajones, 1)

  for (let i = 0; i < cajones; i++) {
    const yBase = g + i * cajonHeight
    const cW = ancho - g * 2 - 4
    const cD = profundidad - 3 - 20
    const cG = 12
    const cFrenteH = cajonHeight - 8

    pieces.push(piece(`Frente cajón ${i + 1}`, 'cajon_frente', cW + 4, cFrenteH, g, { x: g - 2, y: yBase + 4, z: -2 }, materialId))
    pieces.push(piece(`Lateral izq. cajón ${i + 1}`, 'cajon_lateral', cD, cFrenteH - g * 2, cG, { x: g + 2, y: yBase + 4 + g, z: g }, materialId))
    pieces.push(piece(`Lateral der. cajón ${i + 1}`, 'cajon_lateral', cD, cFrenteH - g * 2, cG, { x: ancho - g - 2 - cG, y: yBase + 4 + g, z: g }, materialId))
    pieces.push(piece(`Fondo cajón ${i + 1}`, 'cajon_fondo', cW - cG * 2 - 4, cFrenteH - g * 2, 3, { x: g + 2 + cG, y: yBase + 4 + g, z: g }, materialId))
    pieces.push(piece(`Base cajón ${i + 1}`, 'cajon_base', cW - cG * 2 - 4, 3, cD, { x: g + 2 + cG, y: yBase + 4 + g, z: g }, materialId))

    hardware.push({ id: `hc-caj-c${i}-1`, nombre: 'Corredera de cajón', especificacion: `${Math.round(cD)}mm`, cantidad: 2 })
    hardware.push({ id: `hc-caj-c${i}-2`, nombre: 'Tirador', especificacion: '96mm', cantidad: 1 })
  }

  if (usaPatas && cantidadPatas > 0) {
    for (let i = 0; i < cantidadPatas; i++) {
      const xPos = i < 2 ? g : ancho - g - 30
      const zPos = i % 2 === 0 ? g : profundidad - g - 30
      pieces.push(piece(`Pata ${i + 1}`, 'pata', 30, 50, 30, { x: xPos, y: -50, z: zPos }, materialId))
    }
    hardware.push({ id: 'hc-caj-patas', nombre: 'Tacos de nivelación', especificacion: '10mm', cantidad: cantidadPatas })
  }

  hardware.push({ id: 'hc-caj-1', nombre: 'Tornillo confirmat', especificacion: '5x50mm', cantidad: (2 + cajones * 2) * 4 })
  hardware.push({ id: 'hc-caj-2', nombre: 'Dado confirmat', especificacion: '5mm', cantidad: (2 + cajones * 2) * 4 })

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