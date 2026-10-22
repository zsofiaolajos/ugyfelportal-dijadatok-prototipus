import { describe, expect, it } from 'vitest'
import { getFolyoszamla } from '../data/ledger'
import { osszesito } from './account'
import {
  lathatoElvarasok,
  lathatoEsemenyek,
  lathatoTranzakciok,
  rejtettMezokUgyfelnek,
  tranzakcioTipusUgyfelnek,
} from './visibility'

const SZERZODESEK = ['30012345', '30054321', '30067890', '30098765']

function van(obj: object, utvonal: string): boolean {
  let cel: unknown = obj
  for (const resz of utvonal.split('.')) {
    if (!cel || typeof cel !== 'object' || !(resz in cel)) return false
    cel = (cel as Record<string, unknown>)[resz]
  }
  return true
}

describe.each(SZERZODESEK)('ügyfél nézet – %s', (sz) => {
  const fsz = getFolyoszamla(sz)!
  const o = osszesito(fsz)

  it('egyetlen tranzakcióban sincs rejtett mező', () => {
    for (const t of lathatoTranzakciok(fsz.tranzakciok, 'ugyfel')) {
      for (const mezo of rejtettMezokUgyfelnek.tranzakcio) expect(van(t, mezo), `${t.key}.${mezo}`).toBe(false)
    }
  })

  it('nincs rejtett tételtípus és stornózott tétel', () => {
    for (const t of lathatoTranzakciok(fsz.tranzakciok, 'ugyfel')) {
      expect(tranzakcioTipusUgyfelnek[t.tipusKod!]).not.toBe('rejtett')
      expect(t.statusz).not.toBe('STORNOZVA')
    }
  })

  it('nincs törölt elvárás és rejtett elvárásmező', () => {
    for (const a of lathatoElvarasok(o.elvarasAllapotok, 'ugyfel')) {
      expect(a.statusz).not.toBe('TOROLT')
      for (const mezo of rejtettMezokUgyfelnek.elvaras) expect(van(a.elvaras, mezo), `${a.key}.${mezo}`).toBe(false)
    }
  })

  it('eseményeknél nincs felszólítási szint', () => {
    for (const e of lathatoEsemenyek(fsz.esemenyek, 'ugyfel')) {
      for (const mezo of rejtettMezokUgyfelnek.esemeny) expect(van(e, mezo)).toBe(false)
    }
  })

  it('a szűrés nem módosítja az eredeti adatot', () => {
    lathatoTranzakciok(fsz.tranzakciok, 'ugyfel')
    expect(fsz.tranzakciok.every((t) => typeof t.id === 'string')).toBe(true)
  })
})

describe('advanced nézet', () => {
  it('mindent lát (a tételszám egyezik a teljes adattal)', () => {
    for (const sz of SZERZODESEK) {
      const fsz = getFolyoszamla(sz)!
      expect(lathatoTranzakciok(fsz.tranzakciok, 'advanced')).toHaveLength(fsz.tranzakciok.length)
      expect(lathatoElvarasok(osszesito(fsz).elvarasAllapotok, 'advanced')).toHaveLength(fsz.elvarasok.length)
    }
  })
})

describe('1. forgatókönyv: storno pár csak advanced nézetben', () => {
  const fsz = getFolyoszamla('30012345')!
  it('ügyfél 4 csekkbefizetést lát, advanced 6 tételt', () => {
    expect(lathatoTranzakciok(fsz.tranzakciok, 'ugyfel').map((t) => t.key)).toEqual(['TR-1001', 'TR-1002', 'TR-1003', 'TR-1006'])
    expect(lathatoTranzakciok(fsz.tranzakciok, 'advanced')).toHaveLength(6)
  })
})
