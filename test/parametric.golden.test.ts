import { describe, expect, it } from 'vitest'
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dumpSeries } from './golden'

const here = dirname(fileURLToPath(import.meta.url))
const fixturesDir = join(here, 'fixtures')
const geometryPath = join(fixturesDir, 'geometry.json')
const hardwarePath = join(fixturesDir, 'hardware.json')
const designPath = join(fixturesDir, 'design.json')

const updateMode = process.env.UPDATE_GOLDEN === '1'

/*
  Invariantes congeladas (no se reescriben si ya existen):
  - geometry.json  → nombre/kind/dimension/position de cada pieza
  - hardware.json  → id/nombre/especificacion/cantidad de cada herraje
  design.json (mutable) rastrea generationKey.
  Para regenerar invariante: borrar el fixture correspondiente y
  UPDATE_GOLDEN=1 npm test
*/

describe('golden dumps paramétrico', () => {
  it('geometría y herrajes no cambian ante refactors', () => {
    const { all, hardware } = dumpSeries()

    if (updateMode) {
      mkdirSync(fixturesDir, { recursive: true })
      if (!existsSync(geometryPath)) {
        writeFileSync(geometryPath, JSON.stringify(all.geometry, null, 2) + '\n')
      }
      if (!existsSync(hardwarePath)) {
        writeFileSync(hardwarePath, JSON.stringify(hardware, null, 2) + '\n')
      }
      writeFileSync(designPath, JSON.stringify(all.design, null, 2) + '\n')
      return
    }

    expect(existsSync(geometryPath), 'falta test/fixtures/geometry.json').toBe(true)
    expect(existsSync(hardwarePath), 'falta test/fixtures/hardware.json').toBe(true)
    expect(all.geometry).toEqual(JSON.parse(readFileSync(geometryPath, 'utf-8')))
    expect(hardware).toEqual(JSON.parse(readFileSync(hardwarePath, 'utf-8')))

    if (existsSync(designPath)) {
      expect(all.design).toEqual(JSON.parse(readFileSync(designPath, 'utf-8')))
    }
  })
})
