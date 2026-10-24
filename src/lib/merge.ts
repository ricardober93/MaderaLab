import type { Piece } from '../types'

/*
  Fusiona piezas canónicas recién generadas con las piezas actuales del
  proyecto, matcheando por generationKey:
  - mismo key   → conservar id + decoración del usuario (color, material,
                  nombre renombrado), rebasear geometría a la canónica
  - solo en canónicas  → pieza nueva (id nuevo, geometría canónica)
  - solo en actuales y SIN key → pieza manual, intacta, al final
  - solo en actuales y CON key → descartada (dejó de existir)
*/
export function mergePieces(actuales: Piece[], canonicas: Piece[]): Piece[] {
  const actualesPorKey = new Map<string, Piece>()
  const manuales: Piece[] = []
  const vistos = new Set<string>()

  for (const p of actuales) {
    if (!p.generationKey) {
      manuales.push(p)
      continue
    }
    if (!vistos.has(p.generationKey)) {
      actualesPorKey.set(p.generationKey, p)
      vistos.add(p.generationKey)
    }
  }

  const merged: Piece[] = canonicas.map((c) => {
    const previa = c.generationKey ? actualesPorKey.get(c.generationKey) : undefined
    if (!previa) return c
    return {
      ...c,
      id: previa.id,
      color: previa.color,
      materialId: previa.materialCustom ? previa.materialId : c.materialId,
      materialCustom: previa.materialCustom,
      cantos: previa.cantosCustom ? previa.cantos : c.cantos,
      cantosCustom: previa.cantosCustom,
      nombre: previa.nombreCustom ? previa.nombre : c.nombre,
      nombreCustom: previa.nombreCustom,
    }
  })

  return [...merged, ...manuales]
}
