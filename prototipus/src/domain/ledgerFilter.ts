import type { Kategoria } from './labels'
import type { ElvarasSor, TranzakcioSor } from './ledgerTable'

/*
 * A főkönyvi tábla szűrése, keresése és rendezése (D3) – tiszta függvények, a komponens csak hívja őket.
 */

export type KategoriaSzuro = 'MIND' | Kategoria
export type StatuszSzuro = 'MIND' | 'TELJESULT' | 'FUGGO' | 'SIKERTELEN' | 'STORNOZVA'
export type RendezesMezo = 'konyveles' | 'teljesites' | 'osszeg'

export interface TranzakcioSzuro {
  kereses: string
  kategoria: KategoriaSzuro
  statusz: StatuszSzuro
  /** könyvelés dátuma, ISO; üres = nincs korlát */
  tol: string
  ig: string
  rendezes: { mezo: RendezesMezo; irany: 'asc' | 'desc' }
}

export const alapTranzakcioSzuro: TranzakcioSzuro = {
  kereses: '',
  kategoria: 'MIND',
  statusz: 'MIND',
  tol: '',
  ig: '',
  rendezes: { mezo: 'konyveles', irany: 'desc' },
}

export function aktivSzuro(sz: TranzakcioSzuro): boolean {
  return sz.kereses.trim() !== '' || sz.kategoria !== 'MIND' || sz.statusz !== 'MIND' || sz.tol !== '' || sz.ig !== ''
}

/** Kisbetű, ékezet nélkül, szóköz nélkül – így „24000”, „24 000” és „Átutalás”/„atutalas” is talál. */
export function normalizal(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[\s  ]+/g, '')
}

function keresoSzoveg(s: TranzakcioSor): string {
  return normalizal(
    [s.key, s.kod, s.nev, s.statusz.label, s.konyveles, s.teljesites, s.jovairas ?? '', s.terheles ?? '', String(Math.abs(s.nyers.osszeg)), ...s.reszletek].join('|'),
  )
}

const FUGGO = new Set(['ELSZAMOLAS_ALATT', 'ENGEDELYEZESRE_VAR', 'UTALAS_FOLYAMATBAN'])

function statuszIlleszkedik(s: TranzakcioSor, sz: StatuszSzuro): boolean {
  if (sz === 'MIND') return true
  if (sz === 'FUGGO') return FUGGO.has(s.nyers.statusz)
  return s.nyers.statusz === sz
}

export function szurTranzakciok(sorok: TranzakcioSor[], sz: TranzakcioSzuro): TranzakcioSor[] {
  const q = normalizal(sz.kereses)
  const szurt = sorok.filter(
    (s) =>
      (sz.kategoria === 'MIND' || s.nyers.kategoria === sz.kategoria) &&
      statuszIlleszkedik(s, sz.statusz) &&
      (!sz.tol || s.nyers.konyveles >= sz.tol) &&
      (!sz.ig || s.nyers.konyveles <= sz.ig) &&
      (q === '' || keresoSzoveg(s).includes(q)),
  )

  const { mezo, irany } = sz.rendezes
  const ertek = (s: TranzakcioSor): string | number =>
    mezo === 'osszeg' ? s.nyers.osszeg : mezo === 'teljesites' ? (s.nyers.teljesites ?? '') : s.nyers.konyveles
  const elojel = irany === 'asc' ? 1 : -1
  return [...szurt].sort((a, b) => {
    const va = ertek(a)
    const vb = ertek(b)
    const c = typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb))
    return c !== 0 ? c * elojel : a.key.localeCompare(b.key) * elojel
  })
}

// ---------- Díjelvárások ----------

export type ElvarasSzuro = 'MIND' | 'NYITOTT' | 'RENDEZETT' | 'JOVOBENI' | 'TOROLT'

export function szurElvarasok(sorok: ElvarasSor[], sz: ElvarasSzuro): ElvarasSor[] {
  switch (sz) {
    case 'MIND':
      return sorok
    case 'NYITOTT':
      return sorok.filter((s) => ['LEJART', 'RESZBEN_RENDEZETT', 'ELO'].includes(s.nyers.statusz))
    case 'RENDEZETT':
      return sorok.filter((s) => s.nyers.statusz === 'RENDEZETT')
    case 'JOVOBENI':
      return sorok.filter((s) => s.nyers.statusz === 'JOVOBENI')
    case 'TOROLT':
      return sorok.filter((s) => s.nyers.statusz === 'TOROLT')
  }
}
