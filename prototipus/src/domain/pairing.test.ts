import { describe, expect, it } from 'vitest'
import { getFolyoszamla } from '../data/ledger'
import { osszesito } from './account'
import { parositasNezet } from './pairing'

const norm = (s?: string) => s?.replace(/ | /g, ' ')

function nezet(sz: string) {
  const fsz = getFolyoszamla(sz)!
  return parositasNezet(fsz, osszesito(fsz))
}

describe('párosítás nézet', () => {
  it('1. a részleges rendezés oka: régi díjnak megfelelő befizetés', () => {
    const n = nezet('30012345')
    const iii = n.elvarasok.find((e) => e.key === 'DE-0103')!
    expect(iii.tetelek.map((t) => [t.trId, norm(t.osszeg)])).toEqual([['TR-1003', '24 000 Ft']])
    expect(iii.szazalek).toBe(95)
    expect(iii.nyitottVan).toBe(true)
    expect(norm(iii.megjegyzes)).toBe('a befizetés az indexálás előtti díjnak (24 000 Ft) felel meg – különbözet: 1 380 Ft')
  })

  it('1. a duplikált import párosítatlan, a storno elszámolja – maradék 0', () => {
    const t = nezet('30012345').tulfizetes!
    expect(t.forrasok.map((f) => [f.trId, norm(f.osszeg), f.statusz?.label])).toEqual([['TR-1004', '24 000 Ft', 'Stornózva']])
    expect(t.felhasznalas.map((f) => f.trId)).toEqual(['TR-1005'])
    expect(t.maradek).toBe(0)
  })

  it('2. egy átkönyvelés három havi díjat rendez; nincs túlfizetés', () => {
    const n = nezet('30054321')
    for (const id of ['DE-0204', 'DE-0205', 'DE-0206']) {
      expect(n.elvarasok.find((e) => e.key === id)!.tetelek.map((t) => t.trId)).toEqual(['TR-2005'])
    }
    expect(n.elvarasok.find((e) => e.key === 'DE-0205')!.statusz.label).toBe('Előre rendezve')
    expect(n.tulfizetes).toBeUndefined()
  })

  it('3. megszűnés után befizetett díj: a többlet visszautalásra vár', () => {
    const n = nezet('30067890')
    expect(n.toroltDb).toBe(1)
    const t = n.tulfizetes!
    expect(t.forrasok.map((f) => [f.trId, norm(f.parositott), norm(f.osszeg)])).toEqual([['TR-3003', '12 134 Ft', '6 166 Ft']])
    expect(t.felhasznalas.map((f) => [f.trId, f.statusz?.label])).toEqual([['TR-3004', 'Elszámolás alatt']])
    expect(t.maradek).toBe(0)
  })

  it('4. kárból díjra + átutalás rendezi a díjat; a túlfizetés átkönyvelésre és visszautalásra megy', () => {
    const n = nezet('30098765')
    const dij = n.elvarasok.find((e) => e.key === 'DE-0402')!
    expect(dij.tetelek.map((t) => [t.trId, norm(t.osszeg)])).toEqual([
      ['TR-4001', '26 000 Ft'],
      ['TR-4002', '46 819 Ft'],
    ])
    const t = n.tulfizetes!
    expect(norm(t.forrasOsszeg)).toBe('175 581 Ft')
    expect(t.felhasznalas.map((f) => f.trId)).toEqual(['TR-4003', 'TR-4004'])
    expect(norm(t.felhasznalasOsszeg)).toBe('−175 581 Ft')
    expect(t.maradek).toBe(0)
  })
})
