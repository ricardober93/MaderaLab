import type { MaterialDef, PriceSet } from '../types'

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

export const CANTOS = [
  { id: 'canto_melaninico', nombre: 'Canto melamínico', especificacion: '22mm' },
]

export const HERRAJES = [
  { id: 'tornillo_confirmat_5x50', nombre: 'Tornillo confirmat', especificacion: '5 × 50mm' },
  { id: 'tornillo_confirmat_5x70', nombre: 'Tornillo confirmat', especificacion: '5 × 70mm' },
  { id: 'tornillo_fondo_3x16', nombre: 'Tornillo fondo', especificacion: '3 × 16mm' },
  { id: 'dado_confirmat_5mm', nombre: 'Dado confirmat', especificacion: '5mm' },
  { id: 'tarqueta_6x30', nombre: 'Tarqueta/espiga', especificacion: '6 × 30mm' },
  { id: 'bisagra_35mm', nombre: 'Bisagra de cajón', especificacion: '35mm' },
  { id: 'bisagra_puerta', nombre: 'Bisagra de puerta', especificacion: '110°' },
  { id: 'corredera_300', nombre: 'Corredera de cajón', especificacion: '300mm' },
  { id: 'corredera_400', nombre: 'Corredera de cajón', especificacion: '400mm' },
  { id: 'corredera_500', nombre: 'Corredera de cajón', especificacion: '500mm' },
  { id: 'tirador', nombre: 'Tirador', especificacion: '96mm' },
  { id: 'soporte_repisa', nombre: 'Soporte de repisa', especificacion: '5mm' },
  { id: 'tacos_nivelacion', nombre: 'Tacos de nivelación', especificacion: '10mm' },
]

export const PRECIOS_DEFAULT: PriceSet = {
  materiales: {
    mdf: 12000,
    pino: 9000,
    roble: 42000,
    melamina_blanca: 15500,
    melamina_negra: 16500,
    melamina_roble: 17000,
    contrachapado: 13000,
    aglomerado: 11000,
  },
  cantos: {
    canto_melaninico: 1200,
  },
  herrajes: {
    tornillo_confirmat_5x50: 150,
    tornillo_confirmat_5x70: 170,
    tornillo_fondo_3x16: 90,
    dado_confirmat_5mm: 30,
    tarqueta_6x30: 200,
    bisagra_35mm: 2500,
    bisagra_puerta: 2500,
    corredera_300: 4500,
    corredera_400: 5200,
    corredera_500: 6000,
    tirador: 3500,
    soporte_repisa: 250,
    tacos_nivelacion: 300,
  },
  moneda: 'CLP',
}
