import type { MaterialDef } from '../types'

export const MATERIALES: MaterialDef[] = [
  { id: 'mdf', nombre: 'MDF', colorDefault: '#D4A76A', grosoresDisponibles: [3, 6, 12, 15, 16, 18, 25] },
  { id: 'pino', nombre: 'Pino', colorDefault: '#E8C876', grosoresDisponibles: [12, 15, 16, 18, 19, 25] },
  { id: 'roble', nombre: 'Roble', colorDefault: '#B5894E', grosoresDisponibles: [16, 18, 19, 25] },
  { id: 'melamina_blanca', nombre: 'Melamina Blanca', colorDefault: '#F5F5F5', grosoresDisponibles: [12, 15, 16, 18, 25] },
  { id: 'melamina_negra', nombre: 'Melamina Negra', colorDefault: '#2C2C2C', grosoresDisponibles: [12, 15, 16, 18, 25] },
  { id: 'melamina_roble', nombre: 'Melamina Roble', colorDefault: '#C49A6C', grosoresDisponibles: [12, 15, 16, 18, 25] },
  { id: 'contrachapado', nombre: 'Contrachapado', colorDefault: '#C4A35A', grosoresDisponibles: [3, 6, 12, 15, 16, 18, 25] },
  { id: 'aglomerado', nombre: 'Aglomerado', colorDefault: '#8B7D6B', grosoresDisponibles: [12, 15, 16, 18, 25] },
]

export const PALETA_COLORES = [
  '#F5F5F5', '#E0E0E0', '#BDBDBD', '#9E9E9E',
  '#2C2C2C', '#424242', '#616161', '#757575',
  '#D4A76A', '#C49A6C', '#B5894E', '#8B7D6B',
  '#E8C876', '#A0522D', '#6B3A2A', '#DEB887',
  '#F5E6CC', '#D2B48C', '#FAEBD7', '#FFF8DC',
  '#5B7A3D', '#3E6B48', '#8B4513', '#CD853F',
]

export const HERRAJES = [
  { id: 'tornillo_confirmat_5x50', nombre: 'Tornillo confirmat', especificacion: '5 × 50mm', porUnion: 2 },
  { id: 'tornillo_confirmat_5x70', nombre: 'Tornillo confirmat', especificacion: '5 × 70mm', porUnion: 2 },
  { id: 'dado_confirmat_5mm', nombre: 'Dado confirmat', especificacion: '5mm', porUnion: 1 },
  { id: 'tarqueta_6x30', nombre: 'Tarqueta/espiga', especificacion: '6 × 30mm', porUnion: 2 },
  { id: 'bisagra_35mm', nombre: 'Bisagra de cajón', especificacion: '35mm', porPieza: 2 },
  { id: 'bisagra_puerta', nombre: 'Bisagra de puerta', especificacion: '110°', porPieza: 2 },
  { id: 'corredera_300', nombre: 'Corredera de cajón', especificacion: '300mm', porPieza: 1 },
  { id: 'corredera_400', nombre: 'Corredera de cajón', especificacion: '400mm', porPieza: 1 },
  { id: 'corredera_500', nombre: 'Corredera de cajón', especificacion: '500mm', porPieza: 1 },
  { id: 'canto_melaninico', nombre: 'Canto melamínico', especificacion: '22mm', porArista: 1 },
  { id: 'tirador', nombre: 'Tirador', especificacion: '96mm', porPieza: 1 },
  { id: 'soporte_repisa', nombre: 'Soporte de repisa', especificacion: '5mm', porRepisaPorLado: 4 },
  { id: 'tacos_nivelacion', nombre: 'Tacos de nivelación', especificacion: '10mm', porPata: 1 },
]