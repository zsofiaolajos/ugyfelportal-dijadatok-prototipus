import { describe, expect, it } from 'vitest'
import { getFolyoszamla } from '../data/ledger'
import { osszesito } from './account'
import { csv, elvarasCsv, tranzakcioCsv } from './csv'
import { alapTranzakcioSzuro, aktivSzuro, normalizal, szurElvarasok, szurTranzakciok, type TranzakcioSzuro } from './ledgerFilter'
import { fokonyv } from './ledgerTable'

function tabla(sz: string) {
  const fsz = getFolyoszamla(sz)!
  return fokonyv(fsz, osszesito(fsz))
}

const kulcsok = (sorok: { key: string }[]) => sorok.map((s) => s.key)
const sz = (r: Partial<TranzakcioSzuro>): TranzakcioSzuro => ({ ...alapTranzakcioSzuro, ...r })

describe('normalizálás', () => {
  it('ékezet, kisbetű és szóköz független', () => {
    expect(normalizal('Átutalás 24 000 Ft')).toBe('atutalas24000ft')
    expect(normalizal('24 000')).toBe('24000')
  })
})

describe('tranzakció szűrés', () => {
  const t = tabla('30012345').tranzakciok

  it('alapállapot: minden tétel, könyvelés szerint legújabb elöl', () => {
    expect(aktivSzuro(alapTranzakcioSzuro)).toBe(false)
    expect(kulcsok(szurTranzakciok(t, alapTranzakcioSzuro))).toEqual(['TR-1006', 'TR-1005', 'TR-1004', 'TR-1003', 'TR-1002', 'TR-1001'])
  })

  it('kategória: technikai = a storno', () => {
    expect(kulcsok(szurTranzakciok(t, sz({ kategoria: 'Technikai' })))).toEqual(['TR-1005'])
  })

  it('státusz: stornózott', () => {
    expect(kulcsok(szurTranzakciok(t, sz({ statusz: 'STORNOZVA' })))).toEqual(['TR-1004'])
  })

  it('időszak a könyvelés dátumára', () => {
    expect(kulcsok(szurTranzakciok(t, sz({ tol: '2026-07-01', ig: '2026-07-31' })))).toEqual(['TR-1005', 'TR-1004', 'TR-1003'])
  })

  it('keresés: azonosító, közlemény-szöveg, összeg szóközzel vagy anélkül', () => {
    expect(kulcsok(szurTranzakciok(t, sz({ kereses: 'tr-1004' })))).toEqual(['TR-1005', 'TR-1004']) // a storno is hivatkozik rá
    expect(kulcsok(szurTranzakciok(t, sz({ kereses: 'duplikalt' })))).toEqual(['TR-1005', 'TR-1004'])
    expect(szurTranzakciok(t, sz({ kereses: '24 000' }))).toHaveLength(6)
    expect(szurTranzakciok(t, sz({ kereses: '24000' }))).toHaveLength(6)
  })

  it('rendezés összeg szerint növekvő', () => {
    const r = szurTranzakciok(t, sz({ rendezes: { mezo: 'osszeg', irany: 'asc' } }))
    expect(r[0].key).toBe('TR-1005') // −24 000
  })

  it('függő kifizetések szűrője', () => {
    expect(kulcsok(szurTranzakciok(tabla('30098765').tranzakciok, sz({ statusz: 'FUGGO' })))).toEqual(['TR-4004'])
    expect(kulcsok(szurTranzakciok(tabla('30054321').tranzakciok, sz({ statusz: 'SIKERTELEN' })))).toEqual(['TR-2002'])
  })

  it('keresés kárszámra és átkönyvelési azonosítóra', () => {
    expect(kulcsok(szurTranzakciok(tabla('30098765').tranzakciok, sz({ kereses: 'K-2026-004512' })))).toEqual(['TR-4001'])
    expect(kulcsok(szurTranzakciok(tabla('30098765').tranzakciok, sz({ kereses: 'ák-2026-000318' })))).toEqual(['TR-4003'])
  })
})

describe('díjelvárás szűrés', () => {
  it('nyitott, rendezett, jövőbeni, törölt', () => {
    const e1 = tabla('30012345').elvarasok
    expect(kulcsok(szurElvarasok(e1, 'NYITOTT'))).toEqual(['DE-0104', 'DE-0103'])
    expect(kulcsok(szurElvarasok(e1, 'JOVOBENI'))).toEqual(['DE-0105'])
    expect(kulcsok(szurElvarasok(tabla('30067890').elvarasok, 'TOROLT'))).toEqual(['DE-0303'])
  })
})

describe('CSV', () => {
  it('pontosvessző, BOM, idézőjelezés', () => {
    expect(csv(['a', 'b'], [['x;y', 'mondta: "hé"'], [1, 0.25]])).toBe('﻿a;b\r\n"x;y";"mondta: ""hé"""\r\n1;0,25\r\n')
  })

  it('tranzakció export: nyers összegek és ISO dátumok', () => {
    const sorok = tranzakcioCsv(tabla('30012345').tranzakciok).split('\r\n')
    expect(sorok[0]).toBe('﻿Azonosító;Könyvelés;Teljesítés;Kód;Tétel;Összeg (Ft);Egyenleg a tétel után (Ft);Státusz;Részletek')
    expect(sorok[1].startsWith('TR-1006;2026-10-05;2026-10-02;BE-CS;Befizetés – postai csekk;24000;-2760;Teljesült;')).toBe(true)
  })

  it('díjelvárás export: kerekítés tizedesvesszővel', () => {
    const sorok = elvarasCsv(tabla('30054321').elvarasok).split('\r\n')
    const aug = sorok.find((s) => s.startsWith('DE-0202'))!
    expect(aug).toContain(';6874;6874;0;0,25;2026-08-05;Rendezett;')
  })
})
