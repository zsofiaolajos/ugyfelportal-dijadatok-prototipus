import { describe, expect, it } from 'vitest'
import { getFolyoszamla } from '../data/ledger'
import { osszesito } from './account'
import { ugyintezoOsszesito } from './advancedSummary'

const norm = (s?: string) => s?.replace(/ | /g, ' ')

function panel(sz: string) {
  const fsz = getFolyoszamla(sz)!
  const p = ugyintezoOsszesito(fsz.szerzodes, osszesito(fsz))
  const cs = Object.fromEntries(p.csempek.map((c) => [c.kulcs, { ...c, ertek: norm(c.ertek), sorok: c.sorok.map((s) => norm(s)) }]))
  return { cs, fuggo: p.fuggo }
}

describe('ügyintézői összesítő', () => {
  it('1. hátralék kora és felszólítási szint látszik', () => {
    const { cs, fuggo } = panel('30012345')
    expect(cs.egyenleg.ertek).toBe('−2 760 Ft')
    expect(cs.egyenleg.tone).toBe('warn')
    expect(cs.hatralek.ertek).toBe('2 760 Ft')
    expect(cs.hatralek.sorok).toEqual(['2 lejárt díjrészlet · legrégebbi 99 napja', '1. szintű felszólítás kiment'])
    expect(cs.kovetkezo.ertek).toBe('25 380 Ft')
    expect(cs.megszunes).toBeUndefined() // lakás: nincs KGFB-szabály
    expect(fuggo).toEqual([])
  })

  it('2. előrefizetés december végéig', () => {
    const { cs } = panel('30054321')
    expect(cs.egyenleg.ertek).toBe('+13 748 Ft')
    expect(cs.tulfizetes.cimke).toBe('Előrefizetés')
    expect(cs.tulfizetes.ertek).toBe('13 748 Ft')
    expect(cs.tulfizetes.sorok[1]).toBe('2026. 12. 31-ig rendezve')
    expect(cs.kovetkezo.ertek).toBe('–')
  })

  it('3. megszűnt KGFB, visszautalás elszámolás alatt', () => {
    const { cs, fuggo } = panel('30067890')
    expect(cs.tulfizetes.ertek).toBe('6 166 Ft')
    expect(cs.megszunes.cimke).toBe('Megszűnt')
    expect(cs.megszunes.sorok).toEqual(['díjnemfizetés'])
    expect(fuggo).toHaveLength(1)
    expect(norm(fuggo[0].osszeg)).toBe('6 166 Ft')
    expect(fuggo[0].statusz.label).toBe('Elszámolás alatt')
    expect(fuggo[0].varhato).toBe('2026. 10. 12.')
    expect(fuggo[0].irany).toBe('11600006-87654321')
  })

  it('4. engedélyezésre váró visszautalás a felelős csoporttal', () => {
    const { fuggo } = panel('30098765')
    expect(fuggo[0].statusz.label).toBe('Engedélyezésre vár')
    expect(fuggo[0].engedelyezes).toBe('Pénzügyi jóváhagyás csoport · kérelem: 2026. 10. 05.')
  })
})
