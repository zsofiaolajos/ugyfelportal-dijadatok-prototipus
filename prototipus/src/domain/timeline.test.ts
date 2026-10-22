import { describe, expect, it } from 'vitest'
import { getFolyoszamla } from '../data/ledger'
import { osszesito } from './account'
import { idovonal } from './timeline'

const norm = (s?: string) => s?.replace(/ | /g, ' ')

function iv(sz: string) {
  const fsz = getFolyoszamla(sz)!
  return idovonal(fsz, osszesito(fsz), 'ugyfel')
}

describe('ügyfél idővonal', () => {
  it('1. közelgő: a 2027-es díj; a múlt havonta, csökkenő sorrendben', () => {
    const v = iv('30012345')
    expect(v.kozelgo.map((t) => t.cim)).toEqual(['I. negyedéves díj'])
    expect(v.honapok.map((h) => h.kulcs)).toEqual(['2026-10', '2026-07', '2026-04', '2026-03', '2026-01'])
    expect(v.honapok[0].cim).toBe('2026. október')
  })

  it('1. a storno pár nem jelenik meg, a díjváltozás a díj alatt van', () => {
    const v = iv('30012345')
    const julius = v.honapok.find((h) => h.kulcs === '2026-07')!.tetelek
    expect(julius.map((t) => t.fajta)).toEqual(['emlekezteto', 'befizetes', 'dij', 'dijvaltozas'])
    expect(norm(julius.find((t) => t.fajta === 'dijvaltozas')?.alcim)).toBe('24 000 Ft → 25 380 Ft')
    const osszes = v.honapok.flatMap((h) => h.tetelek)
    expect(osszes.filter((t) => t.fajta === 'befizetes')).toHaveLength(4)
  })

  it('1. a nem rendezett díjak státusza', () => {
    const okt = iv('30012345').honapok[0].tetelek
    expect(okt.find((t) => t.fajta === 'dij')?.statusz).toEqual({ label: 'Nem rendezett', tone: 'warn' })
  })

  it('2. sikertelen lehívás és bejövő átkönyvelés; nov–dec előre kifizetve a közelgőkben', () => {
    const v = iv('30054321')
    const osszes = v.honapok.flatMap((h) => h.tetelek)
    const sikertelen = osszes.find((t) => t.fajta === 'sikertelen')!
    expect(norm(sikertelen.osszeg)).toBe('6 874 Ft')
    expect(sikertelen.statusz?.label).toBe('Sikertelen')
    expect(osszes.find((t) => t.fajta === 'atkonyveles')?.cim).toBe('Jóváírás a Casco (30098765) szerződésről')
    expect(v.kozelgo.map((t) => t.statusz?.label)).toEqual(['Előre kifizetve', 'Előre kifizetve'])
  })

  it('3. törölt díj rejtve, visszatérítés feldolgozás alatt', () => {
    const osszes = iv('30067890').honapok.flatMap((h) => h.tetelek)
    expect(osszes.filter((t) => t.fajta === 'dij').map((t) => t.cim)).toEqual([
      'Díj a megszűnésig',
      'II. negyedéves díj',
      'I. negyedéves díj',
    ])
    const vissza = osszes.find((t) => t.fajta === 'kifizetes')!
    expect(norm(vissza.osszeg)).toBe('−6 166 Ft')
    expect(vissza.statusz?.label).toBe('Feldolgozás alatt')
    expect(osszes.some((t) => t.fajta === 'megszunes')).toBe(true)
  })

  it('4. kimenő átkönyvelés névelővel, visszatérítés jóváhagyás alatt', () => {
    const osszes = iv('30098765').honapok.flatMap((h) => h.tetelek)
    expect(osszes.find((t) => t.key === 'TR-4003')?.cim).toBe('Áthelyezve az Otthonbiztosítás (30054321) szerződésre')
    expect(osszes.find((t) => t.key === 'TR-4004')?.statusz?.label).toBe('Jóváhagyás alatt')
  })
})
