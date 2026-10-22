import type { Osszesito } from './account'
import { formatDate, formatDateRovidIg, formatFt } from './format'
import { tranzakcioStatuszLabel, tranzakcioTipusok, type Tone } from './labels'
import type { Contract } from './types'

/*
 * Ügyintézői (advanced) összesítő panel nézetmodellje (D1).
 * Ugyanabból az Osszesito-ból épül, mint az ügyfél állapotsora – az egyenleg így mindkét nézetben azonos.
 * Itt láthatók az ügyfél elől rejtett számított mezők is: hátralék kora, felszólítási szint, várható megszűnés.
 */

export interface Csempe {
  kulcs: string
  cimke: string
  ertek: string
  tone: Tone
  sorok: string[]
}

export interface FuggoKifizetes {
  key: string
  tipus: string
  osszeg: string
  statusz: { label: string; tone: Tone }
  varhato?: string
  irany?: string
  engedelyezes?: string
}

export interface UgyintezoOsszesito {
  csempek: Csempe[]
  fuggo: FuggoKifizetes[]
}

function elojeles(n: number): string {
  if (n === 0) return formatFt(0)
  return n > 0 ? `+${formatFt(n)}` : `−${formatFt(-n)}`
}

export function ugyintezoOsszesito(szerzodes: Contract, o: Osszesito): UgyintezoOsszesito {
  const csempek: Csempe[] = []

  // Egyenleg
  csempek.push({
    kulcs: 'egyenleg',
    cimke: 'Egyenleg',
    ertek: elojeles(o.egyenleg),
    tone: o.egyenleg < 0 ? 'warn' : o.egyenleg > 0 ? 'info' : 'ok',
    sorok: [
      'könyvelt tételek − esedékes díjak',
      o.egyenleg < 0 ? 'hátralék' : o.egyenleg === 0 ? 'rendezett' : o.tulfizetes > 0 ? 'túlfizetés' : 'előrefizetés',
    ],
  })

  // Hátralék
  const lejart = o.elvarasAllapotok.filter((a) => a.statusz === 'LEJART')
  csempek.push({
    kulcs: 'hatralek',
    cimke: 'Hátralék',
    ertek: formatFt(o.hatralek),
    tone: o.hatralek > 0 ? 'warn' : 'ok',
    sorok:
      o.hatralek > 0
        ? [
            `${lejart.length} lejárt díjrészlet · legrégebbi ${o.hatralekKora} napja`,
            o.felszolitasiSzint > 0 ? `${o.felszolitasiSzint}. szintű felszólítás kiment` : 'felszólítás még nem ment ki',
          ]
        : ['nincs lejárt díj'],
  })

  // Túlfizetés / előrefizetés
  const eloreVege = o.elvarasAllapotok
    .filter((a) => a.eloreRendezve)
    .map((a) => a.elvaras.idoszakVege)
    .sort()
    .at(-1)
  if (o.tulfizetes > 0) {
    csempek.push({
      kulcs: 'tulfizetes',
      cimke: 'Túlfizetés',
      ertek: formatFt(o.tulfizetes),
      tone: 'info',
      sorok: ['díjra nem párosított összeg', o.fuggoKifizetesek.length > 0 ? 'visszautalás folyamatban' : 'rendelkezésre áll'],
    })
  } else {
    csempek.push({
      kulcs: 'tulfizetes',
      cimke: o.elorefizetes > 0 ? 'Előrefizetés' : 'Túlfizetés',
      ertek: formatFt(o.elorefizetes),
      tone: o.elorefizetes > 0 ? 'ok' : 'neutral',
      sorok: o.elorefizetes > 0 && eloreVege ? [`jövőbeni díjakra párosítva`, `${formatDateRovidIg(eloreVege)} rendezve`] : ['nincs'],
    })
  }

  // Következő esedékesség
  const k = o.kovetkezoEsedekesseg
  csempek.push({
    kulcs: 'kovetkezo',
    cimke: 'Következő esedékesség',
    ertek: k ? formatFt(k.osszeg) : '–',
    tone: 'neutral',
    sorok: k
      ? [k.megnevezes, `határidő: ${formatDate(k.datum)}`]
      : [szerzodes.allapot === 'MEGSZUNT' ? 'megszűnt szerződés' : eloreVege ? `nincs nyitott díj ${formatDateRovidIg(eloreVege)}` : 'nincs nyitott díj'],
  })

  // Megszűnés – megszűnt szerződésnél a tény, KGFB-nél a várható dátum
  if (szerzodes.megszunesDatuma) {
    csempek.push({
      kulcs: 'megszunes',
      cimke: 'Megszűnt',
      ertek: formatDate(szerzodes.megszunesDatuma),
      tone: 'neutral',
      sorok: [szerzodes.megszunesOka ?? ''],
    })
  } else if (o.varhatoMegszunes) {
    csempek.push({
      kulcs: 'megszunes',
      cimke: 'Várható megszűnés',
      ertek: formatDate(o.varhatoMegszunes),
      tone: 'danger',
      sorok: ['KGFB: esedékesség + 60. nap', 'ügyfélnek nem jelenik meg'],
    })
  }

  const fuggo: FuggoKifizetes[] = o.fuggoKifizetesek.map((t) => ({
    key: t.id,
    tipus: tranzakcioTipusok[t.tipusKod].advanced,
    osszeg: formatFt(-t.osszeg),
    statusz: tranzakcioStatuszLabel(t.statusz, 'advanced'),
    varhato: t.varhatoTeljesites && formatDate(t.varhatoTeljesites),
    irany: t.kifizetesIranya,
    engedelyezes: t.engedelyezes
      ? `${t.engedelyezes.felelosCsoport} · kérelem: ${formatDate(t.engedelyezes.kerelemDatuma)}`
      : undefined,
  }))

  return { csempek, fuggo }
}
