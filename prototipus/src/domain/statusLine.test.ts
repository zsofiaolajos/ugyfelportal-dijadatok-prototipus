import { describe, expect, it } from 'vitest'
import { getFolyoszamla } from '../data/ledger'
import { osszesito } from './account'
import { ugyfelAllapotsor } from './statusLine'

// Az Intl a magyar ezres tagolásnál nem törő szóközt használ – normalizáljuk az összehasonlításhoz.
const norm = (s?: string) => s?.replace(/ | /g, ' ')

function sor(sz: string) {
  const a = ugyfelAllapotsor(osszesito(getFolyoszamla(sz)!))
  return { tone: a.tone, cim: norm(a.cim), reszlet: norm(a.reszlet) }
}

describe('ügyfél állapotsor', () => {
  it('1. hátralék', () => {
    expect(sor('30012345')).toEqual({
      tone: 'warn',
      cim: 'Nem rendezett díj: 2 760 Ft',
      reszlet: '2 díjrészlet nincs teljesen kifizetve. A részleteket lent, az idővonalon találja.',
    })
  })
  it('2. előre fizetve', () => {
    expect(sor('30054321')).toEqual({
      tone: 'ok',
      cim: 'Rendezett',
      reszlet: 'A díjat 2026. december 31-ig előre kifizette.',
    })
  })
  it('3. visszatérítés folyamatban', () => {
    expect(sor('30067890')).toEqual({
      tone: 'info',
      cim: 'Visszatérítés folyamatban: 6 166 Ft',
      reszlet: 'Várhatóan 2026. október 12-ig megérkezik a bankszámlájára.',
    })
  })
  it('4. visszatérítés jóváhagyás alatt, összeghatár nélkül', () => {
    const s = sor('30098765')
    expect(s.tone).toBe('info')
    expect(s.cim).toBe('Visszatérítés jóváhagyás alatt: 154 959 Ft')
    expect(s.reszlet).not.toMatch(/100 000/)
  })
})
