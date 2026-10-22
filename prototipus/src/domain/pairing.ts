import type { Osszesito } from './account'
import { isKonyvelt } from './account'
import { formatDate, formatFt } from './format'
import { elvarasStatuszLabel, tranzakcioStatuszLabel, tranzakcioTipusok, type Tone } from './labels'
import type { Folyoszamla, Tranzakcio } from './types'

/*
 * Párosítás nézet (D4) – ügyintézőnek: melyik jóváírás melyik díjelvárást rendezte,
 * és a díjra nem párosított (túlfizetett) összeg hová került.
 * Közvetlenül a „befizettem, miért van hátralékom?” kérdésre ad választ.
 */

export interface ParositottTetel {
  trId: string
  nev: string
  datum: string
  osszeg: string
}

export interface ElvarasParositas {
  key: string
  nev: string
  idoszak: string
  hatarido: string
  elvaras: string
  befizetes: string
  nyitott: string
  nyitottVan: boolean
  /** 0–100, a kitöltöttségi sávhoz */
  szazalek: number
  statusz: { label: string; tone: Tone }
  tetelek: ParositottTetel[]
  megjegyzes?: string
}

export interface TulfizetesSor {
  trId: string
  nev: string
  datum: string
  osszeg: string
  statusz?: { label: string; tone: Tone }
}

export interface TulfizetesElszamolas {
  /** jóváírások díjra nem párosított része */
  forrasok: (TulfizetesSor & { parositott: string })[]
  forrasOsszeg: string
  /** hová került: kifizetés, átkönyvelés, storno (a függő tételek is) */
  felhasznalas: TulfizetesSor[]
  felhasznalasOsszeg: string
  maradek: number
  maradekSzoveg: string
}

export interface ParositasNezet {
  elvarasok: ElvarasParositas[]
  toroltDb: number
  tulfizetes?: TulfizetesElszamolas
}

function datumOf(t: Tranzakcio): string {
  return formatDate(t.teljesitesDatuma ?? t.konyvelesDatuma)
}

const FUGGO = ['ELSZAMOLAS_ALATT', 'ENGEDELYEZESRE_VAR', 'UTALAS_FOLYAMATBAN']

export function parositasNezet(fsz: Folyoszamla, osz: Osszesito): ParositasNezet {
  const tr = new Map(fsz.tranzakciok.map((t) => [t.id, t]))

  const elvarasok: ElvarasParositas[] = osz.elvarasAllapotok
    .filter((a) => a.statusz !== 'TOROLT')
    .sort((a, b) => b.elvaras.hatarido.localeCompare(a.elvaras.hatarido))
    .map((a) => {
      const e = a.elvaras
      const tetelek = fsz.parositasok
        .filter((p) => p.elvarasId === e.id)
        .map((p) => {
          const t = tr.get(p.tranzakcioId)!
          return { trId: t.id, nev: tranzakcioTipusok[t.tipusKod].advanced, datum: datumOf(t), osszeg: formatFt(p.osszeg) }
        })

      // Részleges rendezés oka: díjváltozás után a régi díjnak megfelelő befizetés
      let megjegyzes: string | undefined
      if (a.nyitott > 0 && a.befizetes > 0) {
        const dv = fsz.esemenyek
          .filter((ev) => ev.tipusKod === 'ES-DV' && ev.dijvaltozas && ev.datum <= e.hatarido)
          .sort((x, y) => y.datum.localeCompare(x.datum))[0]?.dijvaltozas
        if (dv && dv.ujDij === e.elvaras && a.befizetes === dv.regiDij) {
          const nevelo = /^[aáeéiíoóöőuúüű]/i.test(dv.ok) ? 'az' : 'a'
          megjegyzes = `a befizetés ${nevelo} ${dv.ok} előtti díjnak (${formatFt(dv.regiDij)}) felel meg – különbözet: ${formatFt(a.nyitott)}`
        } else {
          megjegyzes = `részleges befizetés – nyitott: ${formatFt(a.nyitott)}`
        }
      }

      return {
        key: e.id,
        nev: e.megnevezes,
        idoszak: `${formatDate(e.idoszakKezdete)} – ${formatDate(e.idoszakVege)}`,
        hatarido: formatDate(e.hatarido),
        elvaras: formatFt(e.elvaras),
        befizetes: formatFt(a.befizetes),
        nyitott: formatFt(a.nyitott),
        nyitottVan: a.nyitott > 0 && (a.statusz === 'LEJART' || a.statusz === 'RESZBEN_RENDEZETT'),
        szazalek: e.elvaras > 0 ? Math.min(100, Math.round((a.befizetes / e.elvaras) * 100)) : 0,
        statusz: a.eloreRendezve ? { label: 'Előre rendezve', tone: 'ok' } : elvarasStatuszLabel(a.statusz, 'advanced'),
        tetelek,
        megjegyzes,
      }
    })

  // Túlfizetés elszámolása: könyvelt jóváírások párosítatlan része → hová került
  const parositott = (id: string) => fsz.parositasok.filter((p) => p.tranzakcioId === id).reduce((s, p) => s + p.osszeg, 0)
  const forrasTetelek = fsz.tranzakciok.filter((t) => isKonyvelt(t) && t.osszeg > 0 && t.osszeg - parositott(t.id) > 0)

  let tulfizetes: TulfizetesElszamolas | undefined
  if (forrasTetelek.length > 0) {
    const felhasznalt = fsz.tranzakciok.filter((t) => t.osszeg < 0 && (isKonyvelt(t) || FUGGO.includes(t.statusz)))
    const forrasOsszeg = forrasTetelek.reduce((s, t) => s + t.osszeg - parositott(t.id), 0)
    const felhasznalasOsszeg = felhasznalt.reduce((s, t) => s - t.osszeg, 0)
    const maradek = forrasOsszeg - felhasznalasOsszeg
    tulfizetes = {
      forrasok: forrasTetelek.map((t) => ({
        trId: t.id,
        nev: tranzakcioTipusok[t.tipusKod].advanced,
        datum: datumOf(t),
        osszeg: formatFt(t.osszeg - parositott(t.id)),
        parositott: formatFt(parositott(t.id)),
        statusz: t.statusz === 'STORNOZVA' ? tranzakcioStatuszLabel(t.statusz, 'advanced') : undefined,
      })),
      forrasOsszeg: formatFt(forrasOsszeg),
      felhasznalas: felhasznalt.map((t) => ({
        trId: t.id,
        nev: tranzakcioTipusok[t.tipusKod].advanced,
        datum: formatDate(t.teljesitesDatuma ?? t.konyvelesDatuma),
        osszeg: `−${formatFt(-t.osszeg)}`,
        statusz: tranzakcioStatuszLabel(t.statusz, 'advanced'),
      })),
      felhasznalasOsszeg: `−${formatFt(felhasznalasOsszeg)}`,
      maradek,
      maradekSzoveg: formatFt(maradek),
    }
  }

  return {
    elvarasok,
    toroltDb: osz.elvarasAllapotok.filter((a) => a.statusz === 'TOROLT').length,
    tulfizetes,
  }
}
