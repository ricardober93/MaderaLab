import { useMemo } from 'react'
import { BoxGeometry, EdgesGeometry, Euler } from 'three'
import type { Piece } from '../types'
import { MATERIALES } from '../data/catalogs'
import { SCALE } from '../lib/constants'

interface PieceMeshProps {
  piece: Piece
  selected: boolean
  offsetY: number
  onClick: () => void
  useOwnTransform?: boolean
}

export function PieceMesh({ piece, selected, offsetY, onClick, useOwnTransform = true }: PieceMeshProps) {
  const { dimension, position, rotation, scale, materialId, color } = piece
  const mat = MATERIALES.find((m) => m.id === materialId)
  const fillColor = color || mat?.colorDefault || '#cccccc'

  const s = SCALE

  const scaledX = dimension.sizeX * s
  const scaledY = dimension.sizeY * s
  const scaledZ = dimension.sizeZ * s

  const groupPosition: [number, number, number] = useOwnTransform
    ? [
        (position.x + dimension.sizeX / 2) * s,
        (position.y + dimension.sizeY / 2) * s + offsetY,
        (position.z + dimension.sizeZ / 2) * s,
      ]
    : [0, offsetY, 0]

  const groupRotation: Euler = useOwnTransform
    ? new Euler(rotation.x, rotation.y, rotation.z)
    : new Euler(0, 0, 0)

  const groupScale: [number, number, number] = useOwnTransform
    ? [scale.x, scale.y, scale.z]
    : [1, 1, 1]

  const edgesGeometry = useMemo(() => {
    const geo = new BoxGeometry(scaledX, scaledY, scaledZ)
    const edges = new EdgesGeometry(geo)
    geo.dispose()
    return edges
  }, [scaledX, scaledY, scaledZ])

  return (
    <group position={groupPosition} rotation={groupRotation} scale={groupScale}>
      <mesh onClick={(e) => { e.stopPropagation(); onClick() }}>
        <boxGeometry args={[scaledX, scaledY, scaledZ]} />
        <meshStandardMaterial color={fillColor} opacity={selected ? 0.85 : 1} transparent={selected} />
      </mesh>
      {selected && (
        <lineSegments geometry={edgesGeometry}>
          <lineBasicMaterial color="#3b82f6" linewidth={2} />
        </lineSegments>
      )}
    </group>
  )
}