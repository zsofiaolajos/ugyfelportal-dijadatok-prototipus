import { addDays, daysBetween, MA } from './dates'
import { KGFB_MEGSZUNES_NAP } from './rules'
import type { DijElvaras, ElvarasStatusz, Folyoszamla, Parositas, Tranzakcio } from './types'

// Egyenleg-, hátralék- és státuszszámítás. Mindkét nézet ugyanezt használja,
// így az ügyfél és az advanced nézet egyenlege garantáltan azonos.

/** Az egyenlegbe számító (könyvelt) tranzakciók: a stornózott tétel is könyvelt, a storno párja vezeti vissza. */
export function isKonyvelt(t: Tranzakcio): boolean {
  return t.statusz === 'TELJESULT' || t.statusz === 'STORNOZVA'
}

export function elvarasBefizetes(elvaras: DijElvaras, parositasok: Parositas[]): number {
  return parositasok.filter((p) => p.elvarasId === elvaras.id).reduce((s, p) => s + p.osszeg, 0)
}

export interface ElvarasAllapot {
  elvaras: DijElvaras
  befizetes: number
  nyitott: number
  statusz: ElvarasStatusz
  /** a díj időszaka még nem kezdődött el, de már rendezett */
  eloreRendezve: boolean
}

export function elvarasAllapot(elvaras: DijElvaras, parositasok: Parositas[], ma = MA): ElvarasAllapot {
  const befizetes = elvarasBefizetes(elvaras, parositasok)
  const nyitott = Math.max(0, elvaras.elvaras - befizetes)
  let statusz: ElvarasStatusz
  if (elvaras.torles) statusz = 'TOROLT'
  else if (nyitott === 0) statusz = 'RENDEZETT'
  else if (elvaras.hatarido < ma) statusz = 'LEJART'
  else if (befizetes > 0) statusz = 'RESZBEN_RENDEZETT'
  else if (elvaras.idoszakKezdete > ma) statusz = 'JOVOBENI'
  else statusz = 'ELO'
  return {
    elvaras,
    befizetes,
    nyitott: statusz === 'TOROLT' ? 0 : nyitott,
    statusz,
    eloreRendezve: statusz === 'RENDEZETT' && elvaras.idoszakKezdete > ma,
  }
}

export interface Osszesito {
  /** könyvelt tranzakciók − esedékes (határidős) elvárások; negatív = hátralék */
  egyenleg: number
  /** lejárt elvárások nyitott összege */
  hatralek: number
  /** napok a legrégebbi lejárt határidő óta (0, ha nincs hátralék) */
  hatralekKora: number
  /** elvárásra nem párosított, könyvelt összeg (pl. visszautalásra vár) */
  tulfizetes: number
  /** még nem esedékes, de már rendezett elvárások összege */
  elorefizetes: number
  /** legközelebbi nyitott, még nem lejárt elvárás */
  kovetkezoEsedekesseg?: { datum: string; osszeg: number; megnevezes: string }
  /** csak KGFB-nél, élő szerződés lejárt hátralékával; ügyfélnek nem látszik */
  varhatoMegszunes?: string
  felszolitasiSzint: number
  /** folyamatban lévő (nem teljesült) kifizetések */
  fuggoKifizetesek: Tranzakcio[]
  elvarasAllapotok: ElvarasAllapot[]
}

export function osszesito(fsz: Folyoszamla, ma = MA): Osszesito {
  const allapotok = fsz.elvarasok.map((e) => elvarasAllapot(e, fsz.parositasok, ma))
  const ervenyes = allapotok.filter((a) => a.statusz !== 'TOROLT')

  const konyveltOsszeg = fsz.tranzakciok.filter(isKonyvelt).reduce((s, t) => s + t.osszeg, 0)
  const esedekes = ervenyes.filter((a) => a.elvaras.hatarido <= ma).reduce((s, a) => s + a.elvaras.elvaras, 0)
  const parositott = fsz.parositasok.reduce((s, p) => s + p.osszeg, 0)

  const lejartak = ervenyes.filter((a) => a.statusz === 'LEJART')
  const hatralek = lejartak.reduce((s, a) => s + a.nyitott, 0)
  const legregebbiLejart = lejartak.map((a) => a.elvaras.hatarido).sort()[0]

  const kovetkezo = ervenyes
    .filter((a) => a.nyitott > 0 && a.elvaras.hatarido >= ma)
    .sort((a, b) => a.elvaras.hatarido.localeCompare(b.elvaras.hatarido))[0]

  const felszolitasok = fsz.esemenyek.filter((e) => e.tipusKod === 'ES-FS').sort((a, b) => a.datum.localeCompare(b.datum))

  return {
    egyenleg: konyveltOsszeg - esedekes,
    hatralek,
    hatralekKora: legregebbiLejart ? daysBetween(legregebbiLejart, ma) : 0,
    tulfizetes: Math.max(0, konyveltOsszeg - parositott),
    elorefizetes: ervenyes.filter((a) => a.elvaras.hatarido > ma).reduce((s, a) => s + a.befizetes, 0),
    kovetkezoEsedekesseg: kovetkezo && {
      datum: kovetkezo.elvaras.hatarido,
      osszeg: kovetkezo.nyitott,
      megnevezes: kovetkezo.elvaras.megnevezes,
    },
    varhatoMegszunes:
      fsz.szerzodes.termek === 'KGFB' && fsz.szerzodes.allapot !== 'MEGSZUNT' && legregebbiLejart
        ? addDays(legregebbiLejart, KGFB_MEGSZUNES_NAP)
        : undefined,
    felszolitasiSzint: hatralek > 0 ? (felszolitasok.at(-1)?.szint ?? 0) : 0,
    fuggoKifizetesek: fsz.tranzakciok.filter(
      (t) => t.osszeg < 0 && ['ELSZAMOLAS_ALATT', 'ENGEDELYEZESRE_VAR', 'UTALAS_FOLYAMATBAN'].includes(t.statusz),
    ),
    elvarasAllapotok: allapotok,
  }
}
