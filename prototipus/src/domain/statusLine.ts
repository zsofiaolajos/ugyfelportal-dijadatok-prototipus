import type { Osszesito } from './account'
import { formatDateIg, formatDateLong, formatFt } from './format'
import type { Tone } from './labels'

export interface Allapotsor {
  tone: Tone
  cim: string
  reszlet?: string
}

/**
 * Az ügyfél nézet egysoros állapota – „Rendben vagyok-e?”.
 * Prioritás: hátralék > folyamatban lévő visszatérítés > előrefizetés > rendezett.
 * Szándékosan nem mutat: hátralék korát, felszólítási szintet, várható megszűnést (lathatosag.md).
 */
export function ugyfelAllapotsor(o: Osszesito): Allapotsor {
  if (o.hatralek > 0) {
    const nyitottDb = o.elvarasAllapotok.filter((a) => a.statusz === 'LEJART').length
    return {
      tone: 'warn',
      cim: `Nem rendezett díj: ${formatFt(o.hatralek)}`,
      reszlet:
        nyitottDb === 1
          ? 'Egy díjrészlet nincs teljesen kifizetve. A részleteket lent, az idővonalon találja.'
          : `${nyitottDb} díjrészlet nincs teljesen kifizetve. A részleteket lent, az idővonalon találja.`,
    }
  }

  const fuggo = o.fuggoKifizetesek[0]
  if (fuggo) {
    const osszeg = formatFt(-fuggo.osszeg)
    const mikor = fuggo.varhatoTeljesites ? ` Várhatóan ${formatDateIg(fuggo.varhatoTeljesites)} megérkezik a bankszámlájára.` : ''
    return fuggo.statusz === 'ENGEDELYEZESRE_VAR'
      ? {
          tone: 'info',
          cim: `Visszatérítés jóváhagyás alatt: ${osszeg}`,
          reszlet: `A nagyobb összegű kifizetéseket munkatársunk ellenőrzi.${mikor}`,
        }
      : { tone: 'info', cim: `Visszatérítés folyamatban: ${osszeg}`, reszlet: mikor.trim() || undefined }
  }

  const eloreRendezett = o.elvarasAllapotok.filter((a) => a.eloreRendezve).map((a) => a.elvaras.idoszakVege).sort()
  if (eloreRendezett.length > 0) {
    return {
      tone: 'ok',
      cim: 'Rendezett',
      reszlet: `A díjat ${formatDateIg(eloreRendezett[eloreRendezett.length - 1])} előre kifizette.`,
    }
  }

  return {
    tone: 'ok',
    cim: 'Rendezett',
    reszlet: o.kovetkezoEsedekesseg
      ? `Következő díj: ${formatFt(o.kovetkezoEsedekesseg.osszeg)}, esedékes: ${formatDateLong(o.kovetkezoEsedekesseg.datum)}`
      : undefined,
  }
}
