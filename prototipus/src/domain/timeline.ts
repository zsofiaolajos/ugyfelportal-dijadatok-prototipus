import type { Osszesito } from './account'
import { dijReszletek, esemenyReszletek, nevelovel, tranzakcioReszletek, type Kornyezet, type Reszletek } from './timelineDetails'
import { MA } from './dates'
import { formatFt } from './format'
import { elvarasStatuszLabel, esemenyTipusok, tranzakcioStatuszLabel, tranzakcioTipusok, type Tone } from './labels'
import { lathatoElvarasok, lathatoEsemenyek, lathatoTranzakciok } from './visibility'
import type { Folyoszamla, Role, Tranzakcio } from './types'

/*
 * Ügyfél idővonal nézetmodellje. Csak a láthatósági szűrőn (visibility.ts) átjutott
 * tételekből épül, és csak megjelenítendő szövegeket/összegeket tartalmaz.
 */

export type IdovonalFajta =
  | 'dij' // díjelvárás
  | 'befizetes'
  | 'kifizetes'
  | 'atkonyveles'
  | 'sikertelen'
  | 'dijvaltozas'
  | 'emlekezteto'
  | 'megszunes'

export interface IdovonalTetel {
  key: string
  fajta: IdovonalFajta
  datum: string
  cim: string
  /** megjelenítendő összeg, előjellel ha pénzmozgás ("+24 000 Ft"), díjnál előjel nélkül */
  osszeg?: string
  /** a pénzmozgás iránya – a színezéshez */
  irany?: 'be' | 'ki' | 'semleges'
  statusz?: { label: string; tone: Tone }
  /** rövid másodsor, pl. "24 000 Ft → 25 380 Ft" */
  alcim?: string
  /** kibontáskor megjelenő magyarázat (C3) */
  reszletek: Reszletek
}

export interface IdovonalHonap {
  kulcs: string // "2026-10"
  cim: string // "2026. október"
  tetelek: IdovonalTetel[]
}

export interface Idovonal {
  kozelgo: IdovonalTetel[]
  honapok: IdovonalHonap[]
}

const honapFormatter = new Intl.DateTimeFormat('hu-HU', { year: 'numeric', month: 'long' })

function honapCim(kulcs: string): string {
  return honapFormatter.format(new Date(`${kulcs}-01T00:00:00`))
}

function elojeles(osszeg: number): string {
  return osszeg >= 0 ? `+${formatFt(osszeg)}` : `−${formatFt(-osszeg)}`
}

function fajtaTranzakcio(t: Partial<Tranzakcio>): IdovonalFajta {
  if (t.tipusKod === 'BE-CSB-S') return 'sikertelen'
  if (t.tipusKod?.startsWith('AK-')) return 'atkonyveles'
  if (t.tipusKod?.startsWith('KI-')) return 'kifizetes'
  return 'befizetes'
}

function tranzakcioCim(t: Partial<Tranzakcio>, role: Role): string {
  const par = t.atkonyveles?.parSzerzodesszam
  if (t.tipusKod === 'AK-KI') return `Áthelyezve ${nevelovel(par)} szerződésre`
  if (t.tipusKod === 'AK-BE') return `Jóváírás ${nevelovel(par)} szerződésről`
  return t.tipusKod ? tranzakcioTipusok[t.tipusKod][role] : ''
}

// Azonos napon belül: pénzmozgás, díj, esemény (felülről lefelé) – így az ok (pl. díjváltozás) a következmény alá kerül.
const sorrend: Record<IdovonalFajta, number> = {
  befizetes: 0,
  kifizetes: 0,
  atkonyveles: 0,
  sikertelen: 0,
  dij: 1,
  dijvaltozas: 2,
  emlekezteto: 2,
  megszunes: 2,
}

function csokkeno(a: IdovonalTetel, b: IdovonalTetel): number {
  return b.datum.localeCompare(a.datum) || sorrend[a.fajta] - sorrend[b.fajta]
}

export function idovonal(fsz: Folyoszamla, osz: Osszesito, role: Role, ma = MA): Idovonal {
  const tetelek: IdovonalTetel[] = []
  const k: Kornyezet = {
    fsz,
    osz,
    tranzakcio: new Map(fsz.tranzakciok.map((t) => [t.id, t])),
    elvaras: new Map(osz.elvarasAllapotok.map((a) => [a.elvaras.id, a])),
  }

  for (const a of lathatoElvarasok(osz.elvarasAllapotok, role)) {
    tetelek.push({
      key: a.key,
      fajta: 'dij',
      datum: a.elvaras.hatarido!,
      cim: a.elvaras.megnevezes!,
      osszeg: formatFt(a.elvaras.elvaras!),
      irany: 'semleges',
      // a „Közelgő” csoportban a „Közelgő” jelölő felesleges ismétlés lenne
      statusz: a.eloreRendezve
        ? { label: 'Előre kifizetve', tone: 'ok' }
        : a.statusz === 'JOVOBENI'
          ? undefined
          : elvarasStatuszLabel(a.statusz, role),
      reszletek: dijReszletek(a, k),
    })
  }

  // A dátumhoz az eredeti tételt használjuk (a könyvelés dátuma ügyfélnek nem jelenik meg, csak a sorrendet adja).
  for (const t of lathatoTranzakciok(fsz.tranzakciok, role)) {
    const e = k.tranzakcio.get(t.key)!
    const sikertelen = t.tipusKod === 'BE-CSB-S'
    tetelek.push({
      key: t.key,
      fajta: fajtaTranzakcio(t),
      datum: e.teljesitesDatuma ?? e.konyvelesDatuma,
      cim: tranzakcioCim(t, role),
      osszeg: sikertelen ? formatFt(t.kiserletOsszeg ?? 0) : elojeles(t.osszeg!),
      irany: sikertelen ? 'semleges' : t.osszeg! >= 0 ? 'be' : 'ki',
      statusz: t.statusz && t.statusz !== 'TELJESULT' ? tranzakcioStatuszLabel(t.statusz, role) : undefined,
      reszletek: tranzakcioReszletek(t, k),
    })
  }

  for (const e of lathatoEsemenyek(fsz.esemenyek, role)) {
    const fajta: IdovonalFajta = e.tipusKod === 'ES-DV' ? 'dijvaltozas' : e.tipusKod === 'ES-FS' ? 'emlekezteto' : 'megszunes'
    const dv = e.dijvaltozas
    tetelek.push({
      key: e.key,
      fajta,
      datum: e.datum!,
      cim: dv ? `Díjváltozás (${dv.ok})` : esemenyTipusok[e.tipusKod!][role],
      alcim: dv ? `${formatFt(dv.regiDij)} → ${formatFt(dv.ujDij)}` : undefined,
      reszletek: esemenyReszletek(e, k),
    })
  }

  const kozelgo = tetelek
    .filter((t) => t.fajta === 'dij' && t.datum > ma)
    .sort((a, b) => a.datum.localeCompare(b.datum))
  const kozelgoKulcsok = new Set(kozelgo.map((t) => t.key))

  const honapok = new Map<string, IdovonalTetel[]>()
  for (const t of tetelek.filter((t) => !kozelgoKulcsok.has(t.key)).sort(csokkeno)) {
    const kulcs = t.datum.slice(0, 7)
    honapok.set(kulcs, [...(honapok.get(kulcs) ?? []), t])
  }

  return {
    kozelgo,
    honapok: [...honapok].map(([kulcs, t]) => ({ kulcs, cim: honapCim(kulcs), tetelek: t })),
  }
}
