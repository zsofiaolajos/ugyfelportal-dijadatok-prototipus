import type { Osszesito } from './account'
import { isKonyvelt } from './account'
import { MA } from './dates'
import { formatDate, formatFt, formatFtDecimal } from './format'
import { elvarasStatuszLabel, tranzakcioStatuszLabel, tranzakcioTipusok, type Kategoria, type Tone } from './labels'
import type { ElvarasStatusz, Folyoszamla, TranzakcioStatusz } from './types'

/*
 * Ügyintézői főkönyvi tábla (D2) – a megszokott kétblokkos szerkezet:
 * „Könyvelt tranzakciók” és „Díjelvárások (jövőbeni díjadatok)”.
 * Futó egyenleg = az adott tétel könyveléséig könyvelt tételek − az addig esedékessé vált (nem törölt) díjak.
 * Így az utolsó érték megegyezik az összesítő egyenlegével.
 */

export interface TranzakcioSor {
  key: string
  konyveles: string
  teljesites: string
  nev: string
  kod: string
  jovairas?: string
  terheles?: string
  /** egyenleg a tétel könyvelése után; nem könyvelt (függő/sikertelen) tételnél nincs */
  egyenleg?: number
  egyenlegSzoveg: string
  statusz: { label: string; tone: Tone }
  reszletek: string[]
  halvany: boolean
  /** nyers értékek szűréshez, rendezéshez és exporthoz (D3) */
  nyers: {
    konyveles: string
    teljesites?: string
    osszeg: number
    kategoria: Kategoria
    statusz: TranzakcioStatusz
  }
}

export interface ElvarasSor {
  key: string
  idoszakKezdete: string
  idoszakVege: string
  nev: string
  kod: string
  elvaras: string
  befizetes: string
  nyitott: string
  /** csak lejárt / részben rendezett díjnál emeljük ki – a jövőbeni díj nyitott összege nem hátralék */
  nyitottKiemelt: boolean
  kerekites?: string
  hatarido: string
  statusz: { label: string; tone: Tone }
  reszletek: string[]
  torolt: boolean
  nyers: {
    idoszakKezdete: string
    idoszakVege: string
    elvaras: number
    befizetes: number
    nyitott: number
    kerekites?: number
    hatarido: string
    statusz: ElvarasStatusz
  }
}

/** Záró sor: az utolsó könyvelt tétel óta esedékessé vált díjakkal együtt a mai egyenleg. */
export interface Zaro {
  datum: string
  utolsoKonyvelt: number
  azotaEsedekes: number
  egyenleg: number
  egyenlegSzoveg: string
  magyarazat: string
}

export interface Fokonyv {
  tranzakciok: TranzakcioSor[]
  elvarasok: ElvarasSor[]
  zaro: Zaro
}

function elojeles(n: number): string {
  if (n === 0) return formatFt(0)
  return n > 0 ? `+${formatFt(n)}` : `−${formatFt(-n)}`
}

export function fokonyv(fsz: Folyoszamla, osz: Osszesito): Fokonyv {
  const ervenyesElvarasok = fsz.elvarasok.filter((e) => !e.torles)
  const esedekesIg = (datum: string) =>
    ervenyesElvarasok.filter((e) => e.hatarido <= datum).reduce((s, e) => s + e.elvaras, 0)

  // Futó egyenleg időrendben (könyvelés dátuma, majd azonosító szerint)
  const idorend = [...fsz.tranzakciok].sort(
    (a, b) => a.konyvelesDatuma.localeCompare(b.konyvelesDatuma) || a.id.localeCompare(b.id),
  )
  let konyvelt = 0
  let utolsoKonyveltDatum = ''
  let utolsoKonyvelt = 0
  const sorok: TranzakcioSor[] = idorend.map((t) => {
    const szamit = isKonyvelt(t)
    let egyenleg: number | undefined
    if (szamit) {
      konyvelt += t.osszeg
      egyenleg = konyvelt - esedekesIg(t.konyvelesDatuma)
      utolsoKonyveltDatum = t.konyvelesDatuma
      utolsoKonyvelt = egyenleg
    }

    const reszletek: string[] = []
    if (t.jogcim) reszletek.push(`jogcím: ${t.jogcim}`)
    if (t.kozlemeny) reszletek.push(`közlemény: ${t.kozlemeny}`)
    if (t.kiserletOsszeg) reszletek.push(`lehívott: ${formatFt(t.kiserletOsszeg)}`)
    if (t.sikertelenseg) reszletek.push(`ok: ${t.sikertelenseg.ok} (banki kód: ${t.sikertelenseg.bankiKod})`)
    if (t.kifizetesIranya && !t.atkonyveles) reszletek.push(`irány: ${t.kifizetesIranya}`)
    if (t.atkonyveles) reszletek.push(`${t.atkonyveles.azonosito} · párszerződés: ${t.atkonyveles.parSzerzodesszam} (${t.atkonyveles.parTranzakcioId})`)
    if (t.kar) reszletek.push(`kárszám: ${t.kar.karszam} (${t.kar.leiras})`)
    if (t.stornozottTetel) reszletek.push(`visszavezeti: ${t.stornozottTetel}`)
    if (t.azonositas) reszletek.push(`nem azonosított → párosítva ${formatDate(t.azonositas.parositva)} (${t.azonositas.parositotta})`)
    if (t.kerekites) reszletek.push(`kerekítés: ${formatFtDecimal(t.kerekites)}`)
    if (t.megjegyzes) reszletek.push(t.megjegyzes)
    if (t.rogzito) reszletek.push(`rögzítő: ${t.rogzito}`)

    const osszeg = t.osszeg
    return {
      key: t.id,
      konyveles: formatDate(t.konyvelesDatuma),
      teljesites: t.teljesitesDatuma ? formatDate(t.teljesitesDatuma) : '–',
      nev: tranzakcioTipusok[t.tipusKod].advanced,
      kod: t.tipusKod,
      jovairas: osszeg > 0 ? `+${formatFt(osszeg)}` : undefined,
      terheles: osszeg < 0 ? `−${formatFt(-osszeg)}` : undefined,
      egyenleg,
      egyenlegSzoveg: egyenleg === undefined ? '–' : elojeles(egyenleg),
      statusz: tranzakcioStatuszLabel(t.statusz, 'advanced'),
      reszletek,
      halvany: !szamit,
      nyers: {
        konyveles: t.konyvelesDatuma,
        teljesites: t.teljesitesDatuma,
        osszeg,
        kategoria: tranzakcioTipusok[t.tipusKod].kategoria,
        statusz: t.statusz,
      },
    }
  })

  const elvarasSorok: ElvarasSor[] = [...osz.elvarasAllapotok]
    .sort((a, b) => b.elvaras.hatarido.localeCompare(a.elvaras.hatarido) || b.elvaras.id.localeCompare(a.elvaras.id))
    .map((a) => {
      const e = a.elvaras
      const reszletek: string[] = []
      if (e.dijvaltozas) {
        const d = e.dijvaltozas
        reszletek.push(`${d.ok}: ${formatFt(d.regiDij)} → ${formatFt(d.ujDij)} (+${d.mertek.toLocaleString('hu-HU')}%)`)
      }
      if (e.torles) reszletek.push(`${e.torles.ok}${e.torles.helyettesitoElvaras ? ` → ${e.torles.helyettesitoElvaras}` : ''}`)
      if (a.eloreRendezve) reszletek.push('előre rendezve')
      return {
        key: e.id,
        idoszakKezdete: formatDate(e.idoszakKezdete),
        idoszakVege: formatDate(e.idoszakVege),
        nev: e.megnevezes,
        kod: e.tipusKod,
        elvaras: formatFt(e.elvaras),
        befizetes: formatFt(a.befizetes),
        nyitott: formatFt(a.nyitott),
        nyitottKiemelt: a.nyitott > 0 && (a.statusz === 'LEJART' || a.statusz === 'RESZBEN_RENDEZETT'),
        kerekites: e.kerekites ? `+${formatFtDecimal(e.kerekites)}` : undefined,
        hatarido: formatDate(e.hatarido),
        statusz: elvarasStatuszLabel(a.statusz, 'advanced'),
        reszletek,
        torolt: a.statusz === 'TOROLT',
        nyers: {
          idoszakKezdete: e.idoszakKezdete,
          idoszakVege: e.idoszakVege,
          elvaras: e.elvaras,
          befizetes: a.befizetes,
          nyitott: a.nyitott,
          kerekites: e.kerekites,
          hatarido: e.hatarido,
          statusz: a.statusz,
        },
      }
    })

  const azotaEsedekes = esedekesIg(MA) - (utolsoKonyveltDatum ? esedekesIg(utolsoKonyveltDatum) : 0)
  const zaro: Zaro = {
    datum: formatDate(MA),
    utolsoKonyvelt,
    azotaEsedekes,
    egyenleg: osz.egyenleg,
    egyenlegSzoveg: elojeles(osz.egyenleg),
    magyarazat:
      azotaEsedekes > 0
        ? `utolsó könyvelt tétel után ${elojeles(utolsoKonyvelt)}, azóta esedékessé vált díj: ${formatFt(azotaEsedekes)}`
        : 'azóta nem vált esedékessé díj',
  }

  return { tranzakciok: sorok.reverse(), elvarasok: elvarasSorok, zaro }
}
