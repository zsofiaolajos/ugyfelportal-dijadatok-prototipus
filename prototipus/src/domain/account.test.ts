import { describe, expect, it } from 'vitest'
import { getFolyoszamla } from '../data/ledger'
import { osszesito } from './account'
import { addWorkdays, daysBetween } from './dates'
import type { ElvarasStatusz } from './types'

// Elvárt értékek: anyagok/mintaadat.md
function osz(szerzodesszam: string) {
  const fsz = getFolyoszamla(szerzodesszam)
  if (!fsz) throw new Error(`nincs adat: ${szerzodesszam}`)
  return osszesito(fsz)
}

function statuszok(szerzodesszam: string): Record<string, ElvarasStatusz> {
  return Object.fromEntries(osz(szerzodesszam).elvarasAllapotok.map((a) => [a.elvaras.id, a.statusz]))
}

describe('dátumok', () => {
  it('3 munkanap 2026.10.07. (szerda) után = 2026.10.12. (hétfő)', () => {
    expect(addWorkdays('2026-10-07', 3)).toBe('2026-10-12')
  })
  it('napok száma', () => {
    expect(daysBetween('2026-07-01', '2026-10-08')).toBe(99)
  })
})

describe('1. Kovács Anna – Otthon 30012345 (régi csekk indexálás után)', () => {
  const o = osz('30012345')
  it('egyenleg és hátralék', () => {
    expect(o.egyenleg).toBe(-2760)
    expect(o.hatralek).toBe(2760)
    expect(o.hatralekKora).toBe(99)
    expect(o.tulfizetes).toBe(0)
    expect(o.felszolitasiSzint).toBe(1)
  })
  it('díjelvárás státuszok', () => {
    expect(statuszok('30012345')).toEqual({
      'DE-0101': 'RENDEZETT',
      'DE-0102': 'RENDEZETT',
      'DE-0103': 'LEJART',
      'DE-0104': 'LEJART',
      'DE-0105': 'JOVOBENI',
    })
  })
  it('következő esedékesség', () => {
    expect(o.kovetkezoEsedekesseg).toEqual({ datum: '2027-01-01', osszeg: 25380, megnevezes: 'I. negyedéves díj' })
  })
})

describe('2. Nagy Péter – Otthon 30054321 (sikertelen lehívás, bejövő átkönyvelés)', () => {
  const o = osz('30054321')
  it('egyenleg: előre fizetve', () => {
    expect(o.egyenleg).toBe(13748)
    expect(o.elorefizetes).toBe(13748)
    expect(o.hatralek).toBe(0)
    expect(o.tulfizetes).toBe(0)
    expect(o.kovetkezoEsedekesseg).toBeUndefined()
  })
  it('díjelvárás státuszok, novembertől előre rendezve', () => {
    expect(statuszok('30054321')).toEqual({
      'DE-0201': 'RENDEZETT',
      'DE-0202': 'RENDEZETT',
      'DE-0203': 'RENDEZETT',
      'DE-0204': 'RENDEZETT',
      'DE-0205': 'RENDEZETT',
      'DE-0206': 'RENDEZETT',
    })
    const elore = o.elvarasAllapotok.filter((a) => a.eloreRendezve).map((a) => a.elvaras.id)
    expect(elore).toEqual(['DE-0205', 'DE-0206'])
  })
})

describe('3. Kovács Anna – KGFB 30067890 (automata törlés, visszautalás)', () => {
  const o = osz('30067890')
  it('egyenleg = visszautalásra váró túlfizetés', () => {
    expect(o.egyenleg).toBe(6166)
    expect(o.tulfizetes).toBe(6166)
    expect(o.hatralek).toBe(0)
  })
  it('függő visszautalás 3 munkanappal', () => {
    expect(o.fuggoKifizetesek.map((t) => [t.osszeg, t.statusz, t.varhatoTeljesites])).toEqual([
      [-6166, 'ELSZAMOLAS_ALATT', '2026-10-12'],
    ])
  })
  it('az eredeti III. negyedév törölt, helyette időarányos díj', () => {
    expect(statuszok('30067890')).toEqual({
      'DE-0301': 'RENDEZETT',
      'DE-0302': 'RENDEZETT',
      'DE-0303': 'TOROLT',
      'DE-0304': 'RENDEZETT',
    })
  })
  it('megszűnt szerződésnél nincs várható megszűnés', () => {
    expect(o.varhatoMegszunes).toBeUndefined()
  })
})

describe('4. Nagy Péter – Casco 30098765 (megszűnés, kárból díjra, átkönyvelés, engedélyezés)', () => {
  const o = osz('30098765')
  it('egyenleg = engedélyezésre váró visszautalás', () => {
    expect(o.egyenleg).toBe(154959)
    expect(o.tulfizetes).toBe(154959)
    expect(o.hatralek).toBe(0)
  })
  it('függő visszautalás engedélyezésre vár', () => {
    expect(o.fuggoKifizetesek.map((t) => [t.osszeg, t.statusz, t.varhatoTeljesites])).toEqual([
      [-154959, 'ENGEDELYEZESRE_VAR', '2026-10-12'],
    ])
  })
})

describe('átkönyvelés párban', () => {
  it('a kimenő és bejövő tétel összege és azonosítója egyezik', () => {
    const ki = getFolyoszamla('30098765')!.tranzakciok.find((t) => t.tipusKod === 'AK-KI')!
    const be = getFolyoszamla('30054321')!.tranzakciok.find((t) => t.tipusKod === 'AK-BE')!
    expect(ki.osszeg).toBe(-be.osszeg)
    expect(ki.atkonyveles?.azonosito).toBe(be.atkonyveles?.azonosito)
    expect(ki.atkonyveles?.parTranzakcioId).toBe(be.id)
    expect(be.atkonyveles?.parTranzakcioId).toBe(ki.id)
  })
})

describe('párosítás konzisztencia', () => {
  it.each(['30012345', '30054321', '30067890', '30098765'])('%s: egy tranzakcióból sem párosítunk többet, mint az összege', (sz) => {
    const fsz = getFolyoszamla(sz)!
    for (const t of fsz.tranzakciok) {
      const parositott = fsz.parositasok.filter((p) => p.tranzakcioId === t.id).reduce((s, p) => s + p.osszeg, 0)
      expect(parositott).toBeLessThanOrEqual(Math.max(0, t.osszeg))
    }
  })
})
