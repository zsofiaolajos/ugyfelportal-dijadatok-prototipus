import { describe, expect, it } from 'vitest'
import { getFolyoszamla } from '../data/ledger'
import { osszesito } from './account'
import { formatDateNapon } from './format'
import { idovonal, type IdovonalTetel } from './timeline'

const norm = (s: string) => s.replace(/ | /g, ' ')

function tetelek(sz: string): IdovonalTetel[] {
  const fsz = getFolyoszamla(sz)!
  const v = idovonal(fsz, osszesito(fsz), 'ugyfel')
  return [...v.kozelgo, ...v.honapok.flatMap((h) => h.tetelek)]
}

function szoveg(t: IdovonalTetel): string {
  return norm(t.reszletek.magyarazat.join(' '))
}

function adat(t: IdovonalTetel, cimke: string): string | undefined {
  const a = t.reszletek.adatok.find((x) => x.cimke === cimke)
  return a && norm(a.ertek)
}

describe('dátum -n raggal', () => {
  it.each([
    ['2026-07-01', '2026. július 1-jén'],
    ['2026-08-30', '2026. augusztus 30-án'],
    ['2026-09-15', '2026. szeptember 15-én'],
    ['2026-10-02', '2026. október 2-án'],
  ])('%s → %s', (iso, vart) => expect(formatDateNapon(iso)).toBe(vart))
})

describe('kibontott tételek – ügyfél', () => {
  it('1. a nem rendezett díj megmagyarázza a régi csekket', () => {
    const iv = tetelek('30012345').find((t) => t.key === 'DE-0104')!
    expect(szoveg(iv)).toContain('Ebből 24 000 Ft érkezett be, 1 380 Ft még hiányzik.')
    expect(szoveg(iv)).toContain('A díj 24 000 Ft-ról 25 380 Ft-ra változott (indexálás)')
    expect(szoveg(iv)).toContain('Kérjük, a jövőben az új összeget fizesse be.')
    expect(adat(iv, 'Hiányzik')).toBe('1 380 Ft')
  })

  it('1. a közelgő díjnál nincs „Hiányzik”, csak „Fizetendő”', () => {
    const kozelgo = tetelek('30012345').find((t) => t.key === 'DE-0105')!
    expect(szoveg(kozelgo)).toBe('Esedékes: 2027. január 1. Fizetési mód: postai csekk.')
    expect(adat(kozelgo, 'Hiányzik')).toBeUndefined()
    expect(adat(kozelgo, 'Befizetve')).toBeUndefined()
    expect(adat(kozelgo, 'Fizetendő')).toBe('25 380 Ft')
  })

  it('1. a befizetés megmondja, mit rendezett', () => {
    const be = tetelek('30012345').find((t) => t.key === 'TR-1006')!
    expect(szoveg(be)).toContain('Ezzel rendeztük: IV. negyedéves díj.')
    expect(adat(be, 'Fizetési mód')).toBe('postai csekk')
    expect(adat(be, 'Jogcím')).toBe('rendszeres díj')
  })

  it('2. sikertelen lehívás: köznyelvi ok + azóta rendeződött', () => {
    const s = tetelek('30054321').find((t) => t.fajta === 'sikertelen')!
    expect(szoveg(s)).toContain('A díj meghaladta a bankjánál beállított összeghatárt.')
    expect(szoveg(s)).toContain('Augusztusi díj azóta rendeződött, nincs teendője.')
    expect(adat(s, 'Bankszámla')).toBe('11773016-12345678')
  })

  it('2. bejövő átkönyvelés: hivatkozási szám és link a forrásszerződésre', () => {
    const ak = tetelek('30054321').find((t) => t.fajta === 'atkonyveles')!
    expect(adat(ak, 'Hivatkozási szám')).toBe('ÁK-2026-000318')
    expect(szoveg(ak)).toContain('Ezzel rendeztük: Októberi díj, Novemberi díj, Decemberi díj.')
    expect(ak.reszletek.link?.szerzodesszam).toBe('30098765')
  })

  it('3. megszűnés miatti díj és a visszatérítés várható dátuma', () => {
    const tt = tetelek('30067890')
    expect(szoveg(tt.find((t) => t.key === 'DE-0304')!)).toContain('A szerződés 2026. augusztus 30-án megszűnt')
    expect(szoveg(tt.find((t) => t.key === 'TR-3003')!)).toContain('A fennmaradó 6 166 Ft túlfizetés lett')
    const vissza = tt.find((t) => t.key === 'TR-3004')!
    expect(adat(vissza, 'Várható érkezés')).toBe('2026. október 12.')
    expect(adat(vissza, 'Bankszámla')).toBe('11600006-87654321')
  })

  it('4. kárból díjra: kárszám látszik, a kár leírása nem', () => {
    const kd = tetelek('30098765').find((t) => t.key === 'TR-4001')!
    expect(adat(kd, 'Kárszám')).toBe('K-2026-004512')
    expect(JSON.stringify(kd.reszletek)).not.toContain('jégkár')
  })

  it.each(['30012345', '30054321', '30067890', '30098765'])(
    '%s: a magyarázatokban nincs belső adat (azonosító, rögzítő, banki kód, összeghatár)',
    (sz) => {
      const json = norm(JSON.stringify(tetelek(sz).map((t) => t.reszletek)))
      expect(json).not.toMatch(/TR-\d|DE-\d|EV-\d|cc\.|penzugy\.|kar\.nemeth|\brendszer\b|0412|100 000|limittúllépés|Pénzügyi jóváhagyás/)
    },
  )
})
