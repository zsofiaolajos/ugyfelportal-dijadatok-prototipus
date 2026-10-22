import { describe, expect, it } from 'vitest'
import { getFolyoszamla } from '../data/ledger'
import { osszesito } from './account'
import { fokonyv } from './ledgerTable'

const norm = (s?: string) => s?.replace(/ | /g, ' ')

function tabla(sz: string) {
  const fsz = getFolyoszamla(sz)!
  const osz = osszesito(fsz)
  return { t: fokonyv(fsz, osz), osz, fsz }
}

describe('főkönyvi tábla', () => {
  it.each(['30012345', '30054321', '30067890', '30098765'])(
    '%s: utolsó könyvelt egyenleg − azóta esedékes díj = összesítő egyenleg',
    (sz) => {
      const { t, osz } = tabla(sz)
      const utolso = t.tranzakciok.find((s) => s.egyenleg !== undefined)!
      expect(t.zaro.utolsoKonyvelt).toBe(utolso.egyenleg)
      expect(t.zaro.utolsoKonyvelt - t.zaro.azotaEsedekes).toBe(osz.egyenleg)
      expect(t.zaro.egyenleg).toBe(osz.egyenleg)
    },
  )

  it('2. az októberi díj az utolsó könyvelés után vált esedékessé – a záró sor megmagyarázza', () => {
    const { t } = tabla('30054321')
    expect(t.zaro.utolsoKonyvelt).toBe(20622)
    expect(t.zaro.azotaEsedekes).toBe(6874)
    expect(norm(t.zaro.magyarazat)).toBe('utolsó könyvelt tétel után +20 622 Ft, azóta esedékessé vált díj: 6 874 Ft')
  })

  it.each(['30012345', '30054321', '30067890', '30098765'])('%s: az advanced tábla minden tételt mutat', (sz) => {
    const { t, fsz } = tabla(sz)
    expect(t.tranzakciok).toHaveLength(fsz.tranzakciok.length)
    expect(t.elvarasok).toHaveLength(fsz.elvarasok.length)
  })

  it('1. a duplikált import és a stornója látszik, a storno visszaállítja az egyenleget', () => {
    const { t } = tabla('30012345')
    const sorok = Object.fromEntries(t.tranzakciok.map((s) => [s.key, s]))
    expect(sorok['TR-1003'].egyenleg).toBe(-1380)
    expect(sorok['TR-1004'].statusz.label).toBe('Stornózva')
    expect(sorok['TR-1004'].egyenleg).toBe(22620)
    expect(sorok['TR-1005'].egyenleg).toBe(-1380)
    expect(sorok['TR-1005'].reszletek).toContain('visszavezeti: TR-1004')
  })

  it('2. a sikertelen lehívás nem könyvelt tétel: nincs egyenlege, látszik a banki kód', () => {
    const { t } = tabla('30054321')
    const s = t.tranzakciok.find((x) => x.key === 'TR-2002')!
    expect(s.egyenleg).toBeUndefined()
    expect(s.egyenlegSzoveg).toBe('–')
    expect(s.halvany).toBe(true)
    expect(s.reszletek).toContain('ok: limittúllépés (banki kód: 0412 (mock))')
    const elv = t.elvarasok.find((x) => x.key === 'DE-0202')!
    expect(norm(elv.kerekites)).toBe('+0,25 Ft')
    expect(norm(elv.reszletek[0])).toBe('indexálás: 6 500 Ft → 6 874 Ft (+5,75%)')
  })

  it('3. a törölt díjelvárás látszik, a helyettesítő hivatkozással', () => {
    const { t } = tabla('30067890')
    const torolt = t.elvarasok.find((x) => x.key === 'DE-0303')!
    expect(torolt.torolt).toBe(true)
    expect(torolt.reszletek).toEqual(['megszűnés miatt újraszámolva → DE-0304'])
    expect(norm(t.elvarasok.find((x) => x.key === 'DE-0304')!.kerekites)).toBe('+0,30 Ft')
  })

  it('4. sorrend: legújabb elöl; a függő visszautalásnak még nincs egyenlege', () => {
    const { t } = tabla('30098765')
    expect(t.tranzakciok.map((s) => s.key)).toEqual(['TR-4004', 'TR-4003', 'TR-4002', 'TR-4001'])
    expect(t.tranzakciok.map((s) => s.egyenleg)).toEqual([undefined, 154959, 175581, 26000])
    expect(t.zaro.azotaEsedekes).toBe(0)
  })
})
