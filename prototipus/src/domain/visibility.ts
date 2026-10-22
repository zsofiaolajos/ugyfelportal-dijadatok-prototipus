import type { ElvarasAllapot } from './account'
import type { DijElvaras, Esemeny, EsemenyTipus, Role, Tranzakcio, TranzakcioTipus } from './types'

/*
 * Szerepkör-láthatóság – anyagok/lathatosag.md (A4, jóváhagyva).
 * Ez az EGYETLEN hely, ahol eldől, mit lát az ügyfél. Az advanced nézet mindent lát.
 * Az üzlet ezeket a táblákat módosítja; a felület kódja nem dönt láthatóságról.
 */

export type Lathatosag = 'lathato' | 'atalakitott' | 'rejtett'

/** Tételtípusok az ügyfél nézetben. 'atalakitott' = köznyelvi szöveggel / mezők elhagyásával. */
export const tranzakcioTipusUgyfelnek: Record<TranzakcioTipus, Lathatosag> = {
  'BE-CSB': 'lathato',
  'BE-CSB-S': 'atalakitott',
  'BE-UT': 'lathato',
  'BE-CS': 'lathato',
  'BE-KK': 'lathato',
  'KI-DV': 'lathato',
  'KI-AJ': 'lathato',
  'KI-MK': 'lathato',
  'AK-KI': 'lathato',
  'AK-BE': 'lathato',
  'AK-KD': 'lathato',
  'TE-KR': 'rejtett',
  'TE-ST': 'rejtett',
}

export const esemenyTipusUgyfelnek: Record<EsemenyTipus, Lathatosag> = {
  'ES-DV': 'lathato',
  'ES-FS': 'atalakitott', // szint nélkül
  'ES-AT': 'lathato',
}

/** Az ügyfél elől elrejtett mezők (pontozott útvonal = beágyazott mező). */
export const rejtettMezokUgyfelnek = {
  tranzakcio: [
    'id',
    'kerekites',
    'konyvelesDatuma',
    'kozlemeny',
    'sikertelenseg.ok',
    'sikertelenseg.bankiKod',
    'engedelyezes',
    'atkonyveles.parTranzakcioId',
    'atkonyveles.kerelemDatuma',
    'kar.leiras',
    'stornozottTetel',
    'azonositas',
    'rogzito',
    'megjegyzes',
  ],
  elvaras: ['id', 'tipusKod', 'kerekites', 'torles'],
  esemeny: ['id', 'szint'],
} as const

/** Kivetített rekord: a rejtett mezők hiányozhatnak; `key` csak React-kulcs, nem jelenik meg. */
export type Kivetitett<T> = Partial<T> & { key: string }

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T
}

function torolMezok<T extends object>(obj: T, utvonalak: readonly string[]): Partial<T> {
  const masolat = deepClone(obj) as Record<string, unknown>
  for (const utvonal of utvonalak) {
    const reszek = utvonal.split('.')
    let cel: Record<string, unknown> | undefined = masolat
    for (const resz of reszek.slice(0, -1)) {
      const kov: unknown = cel?.[resz]
      cel = kov && typeof kov === 'object' ? (kov as Record<string, unknown>) : undefined
    }
    if (cel) delete cel[reszek[reszek.length - 1]]
  }
  return masolat as Partial<T>
}

export function lathatoTranzakciok(trs: Tranzakcio[], role: Role): Kivetitett<Tranzakcio>[] {
  if (role === 'advanced') return trs.map((t) => ({ ...t, key: t.id }))
  return trs
    .filter((t) => tranzakcioTipusUgyfelnek[t.tipusKod] !== 'rejtett' && t.statusz !== 'STORNOZVA')
    .map((t) => ({ ...torolMezok(t, rejtettMezokUgyfelnek.tranzakcio), key: t.id }))
}

export type KivetitettElvarasAllapot = Omit<ElvarasAllapot, 'elvaras'> & {
  key: string
  elvaras: Partial<DijElvaras>
}

export function lathatoElvarasok(allapotok: ElvarasAllapot[], role: Role): KivetitettElvarasAllapot[] {
  if (role === 'advanced') return allapotok.map((a) => ({ ...a, key: a.elvaras.id }))
  return allapotok
    .filter((a) => a.statusz !== 'TOROLT')
    .map((a) => ({ ...a, key: a.elvaras.id, elvaras: torolMezok(a.elvaras, rejtettMezokUgyfelnek.elvaras) }))
}

export function lathatoEsemenyek(evs: Esemeny[], role: Role): Kivetitett<Esemeny>[] {
  if (role === 'advanced') return evs.map((e) => ({ ...e, key: e.id }))
  return evs
    .filter((e) => esemenyTipusUgyfelnek[e.tipusKod] !== 'rejtett')
    .map((e) => ({ ...torolMezok(e, rejtettMezokUgyfelnek.esemeny), key: e.id }))
}
