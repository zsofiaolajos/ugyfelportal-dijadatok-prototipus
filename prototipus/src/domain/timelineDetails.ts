import { findContract } from '../data/contracts'
import type { ElvarasAllapot, Osszesito } from './account'
import { formatDateLong, formatDateNapon, formatFt } from './format'
import type { KivetitettElvarasAllapot, Kivetitett } from './visibility'
import type { Esemeny, Folyoszamla, Jogcim, Tranzakcio, TranzakcioTipus } from './types'

/*
 * Ügyfél idővonal – kibontott tételek köznyelvi magyarázata (C3).
 * Csak az ügyfél számára látható adatokra épít: azonosítót, rögzítőt, banki kódot, kerekítést nem ír ki.
 */

export interface Reszletek {
  magyarazat: string[]
  adatok: { cimke: string; ertek: string }[]
  /** kapcsolt szerződés díjadatai (átkönyvelés) */
  link?: { szerzodesszam: string; szoveg: string }
}

export interface Kornyezet {
  fsz: Folyoszamla
  osz: Osszesito
  /** eredeti (szűretlen) tranzakciók – csak dátumhoz és a párosítás eredményéhez */
  tranzakcio: Map<string, Tranzakcio>
  elvaras: Map<string, ElvarasAllapot>
}

const jogcimNev: Record<Jogcim, string> = {
  'gyakoriság szerinti díj': 'rendszeres díj',
  'eseti díj': 'eseti befizetés',
  töredékdíj: 'első, rövidebb időszak díja',
}

const fizetesiMod: Partial<Record<TranzakcioTipus, string>> = {
  'BE-CSB': 'csoportos beszedés',
  'BE-UT': 'átutalás',
  'BE-CS': 'postai csekk',
  'BE-KK': 'bankkártya',
}

function nevelo(szo: string): string {
  return /^[aáeéiíoóöőuúüű]/i.test(szo) ? 'az' : 'a'
}

export function szerzodesNev(szerzodesszam?: string): string {
  const c = findContract(szerzodesszam)
  return c ? `${c.termekNev} (${c.szerzodesszam})` : `${szerzodesszam ?? ''} sz.`
}

/** "a Casco (30098765)" / "az Otthonbiztosítás (30054321)" */
export function nevelovel(szerzodesszam?: string): string {
  const nev = szerzodesNev(szerzodesszam)
  return `${nevelo(nev)} ${nev}`
}

function idoszak(kezdet?: string, veg?: string): string {
  return kezdet && veg ? `${formatDateLong(kezdet)} – ${formatDateLong(veg)}` : ''
}

function tranzakcioRovidNev(t: Tranzakcio): string {
  const mod = fizetesiMod[t.tipusKod]
  if (mod) return `Befizetés (${mod})`
  if (t.tipusKod === 'AK-BE') return `Jóváírás ${nevelovel(t.atkonyveles?.parSzerzodesszam)} szerződésről`
  if (t.tipusKod === 'AK-KD') return 'Kárkifizetésből'
  return 'Jóváírás'
}

// ---------- Díj ----------

export function dijReszletek(a: KivetitettElvarasAllapot, k: Kornyezet): Reszletek {
  const e = a.elvaras
  const sz = k.fsz.szerzodes
  const magyarazat: string[] = []

  const rendezok = k.fsz.parositasok
    .filter((p) => p.elvarasId === a.key)
    .map((p) => {
      const t = k.tranzakcio.get(p.tranzakcioId)!
      return `${tranzakcioRovidNev(t)}, ${formatDateLong(t.teljesitesDatuma ?? t.konyvelesDatuma)} – ${formatFt(p.osszeg)}`
    })

  if (sz.megszunesDatuma && e.idoszakVege === sz.megszunesDatuma) {
    magyarazat.push(
      `A szerződés ${formatDateNapon(sz.megszunesDatuma)} megszűnt, ezért csak a megszűnésig tartó időszak díját kell megfizetni.`,
    )
  }

  if (a.statusz === 'LEJART' || a.statusz === 'RESZBEN_RENDEZETT') {
    magyarazat.push(
      a.befizetes > 0
        ? `Ebből ${formatFt(a.befizetes)} érkezett be, ${formatFt(a.nyitott)} még hiányzik.`
        : `Erre a díjra még nem érkezett befizetés.`,
    )
    // Tipikus eset: díjváltozás után a régi összeget fizette be (pl. régi csekk).
    const dv = k.fsz.esemenyek
      .filter((ev) => ev.tipusKod === 'ES-DV' && ev.datum <= e.hatarido! && ev.dijvaltozas)
      .sort((x, y) => y.datum.localeCompare(x.datum))[0]?.dijvaltozas
    if (dv && dv.ujDij === e.elvaras && a.befizetes === dv.regiDij) {
      magyarazat.push(
        `A díj ${formatFt(dv.regiDij)}-ról ${formatFt(dv.ujDij)}-ra változott (${dv.ok}), a befizetés még a korábbi összegnek felelt meg.` +
          (sz.dijfizetesiMod === 'postai csekk' ? ' Kérjük, a jövőben az új összeget fizesse be.' : ''),
      )
    }
  } else if (a.eloreRendezve) {
    magyarazat.push('Ezt a díjat már előre kifizette, nincs vele teendője.')
  } else if (a.statusz === 'RENDEZETT') {
    magyarazat.push('Ez a díj teljesen ki van fizetve.')
  } else if (a.statusz === 'JOVOBENI' || a.statusz === 'ELO') {
    // a hosszú dátum már ponttal végződik ("2027. január 1.")
    magyarazat.push(`Esedékes: ${formatDateLong(e.hatarido!)} Fizetési mód: ${sz.dijfizetesiMod}.`)
  }

  if (rendezok.length > 0) magyarazat.push(`Rendezte: ${rendezok.join('; ')}.`)

  const lejart = a.statusz === 'LEJART' || a.statusz === 'RESZBEN_RENDEZETT'
  const adatok = [
    { cimke: 'Időszak', ertek: idoszak(e.idoszakKezdete, e.idoszakVege) },
    { cimke: 'Díj', ertek: formatFt(e.elvaras!) },
  ]
  // még nem esedékes díjnál a „Befizetve: 0 Ft / Hiányzik” félrevezető lenne
  if (a.befizetes > 0 || lejart) adatok.push({ cimke: 'Befizetve', ertek: formatFt(a.befizetes) })
  if (a.nyitott > 0) adatok.push({ cimke: lejart ? 'Hiányzik' : 'Fizetendő', ertek: formatFt(a.nyitott) })
  adatok.push({ cimke: 'Határidő', ertek: formatDateLong(e.hatarido!) })

  return { magyarazat, adatok }
}

// ---------- Tranzakció ----------

export function tranzakcioReszletek(t: Kivetitett<Tranzakcio>, k: Kornyezet): Reszletek {
  const magyarazat: string[] = []
  const adatok: Reszletek['adatok'] = []
  let link: Reszletek['link']

  const parositasok = k.fsz.parositasok.filter((p) => p.tranzakcioId === t.key)
  const rendezett = parositasok.map((p) => k.elvaras.get(p.elvarasId)!.elvaras.megnevezes)
  const parositott = parositasok.reduce((s, p) => s + p.osszeg, 0)

  switch (t.tipusKod) {
    case 'BE-CSB-S': {
      const datum = k.tranzakcio.get(t.key)!.konyvelesDatuma
      magyarazat.push(`A bank a díjlehívást nem teljesítette. ${t.sikertelenseg?.ugyfelSzoveg ?? ''}`.trim())
      const erintett = k.fsz.elvarasok.find((e) => e.hatarido.slice(0, 7) === datum.slice(0, 7))
      const allapot = erintett && k.elvaras.get(erintett.id)
      if (allapot?.statusz === 'RENDEZETT') {
        magyarazat.push(`${allapot.elvaras.megnevezes.replace(/^./, (c) => c.toUpperCase())} azóta rendeződött, nincs teendője.`)
      }
      adatok.push({ cimke: 'Lehívott összeg', ertek: formatFt(t.kiserletOsszeg ?? 0) })
      if (k.fsz.szerzodes.lehivasiBankszamla) adatok.push({ cimke: 'Bankszámla', ertek: k.fsz.szerzodes.lehivasiBankszamla })
      break
    }

    case 'KI-DV':
    case 'KI-AJ':
    case 'KI-MK': {
      if (t.statusz === 'ENGEDELYEZESRE_VAR') {
        magyarazat.push('A túlfizetést visszautaljuk. A nagyobb összegű kifizetéseket munkatársunk ellenőrzi, utána indítjuk az utalást.')
      } else if (t.statusz === 'ELSZAMOLAS_ALATT' || t.statusz === 'UTALAS_FOLYAMATBAN') {
        magyarazat.push('A túlfizetést visszautaljuk a bankszámlájára. Az elszámolás néhány munkanapot vesz igénybe.')
      } else if (t.statusz === 'SIKERTELEN') {
        magyarazat.push('A visszautalás nem sikerült. Munkatársunk felveszi Önnel a kapcsolatot.')
      } else {
        magyarazat.push('Az összeget átutaltuk a bankszámlájára.')
      }
      if (t.kifizetesIranya) adatok.push({ cimke: 'Bankszámla', ertek: t.kifizetesIranya })
      if (t.varhatoTeljesites && t.statusz !== 'TELJESULT') {
        adatok.push({ cimke: 'Várható érkezés', ertek: formatDateLong(t.varhatoTeljesites) })
      }
      break
    }

    case 'AK-KI':
    case 'AK-BE': {
      const par = t.atkonyveles?.parSzerzodesszam
      magyarazat.push(
        t.tipusKod === 'AK-KI'
          ? `Az Ön kérésére ennek a szerződésnek a túlfizetéséből ${formatFt(-t.osszeg!)}-ot áthelyeztünk ${nevelovel(par)} szerződésre.`
          : `Az Ön kérésére ${nevelovel(par)} szerződés túlfizetését áthelyeztük erre a szerződésre.`,
      )
      if (t.atkonyveles?.azonosito) adatok.push({ cimke: 'Hivatkozási szám', ertek: t.atkonyveles.azonosito })
      if (t.atkonyveles?.kerelemszam) adatok.push({ cimke: 'Kérelem száma', ertek: t.atkonyveles.kerelemszam })
      if (par && findContract(par)) link = { szerzodesszam: par, szoveg: `${szerzodesNev(par)} díjadatai` }
      break
    }

    case 'AK-KD': {
      magyarazat.push('Az Ön kérésére a kárkifizetés egy részét a díj rendezésére fordítottuk.')
      if (t.kar?.karszam) adatok.push({ cimke: 'Kárszám', ertek: t.kar.karszam })
      break
    }

    default: {
      // befizetések
      const mod = fizetesiMod[t.tipusKod!]
      if (mod) adatok.push({ cimke: 'Fizetési mód', ertek: mod })
      if (t.jogcim) adatok.push({ cimke: 'Jogcím', ertek: jogcimNev[t.jogcim] })
    }
  }

  if (t.osszeg! > 0) {
    if (rendezett.length > 0) magyarazat.push(`Ezzel rendeztük: ${rendezett.join(', ')}.`)
    const maradek = t.osszeg! - parositott
    if (maradek > 0) magyarazat.push(`A fennmaradó ${formatFt(maradek)} túlfizetés lett – lásd a visszatérítést vagy az áthelyezést.`)
  }
  if (t.teljesitesDatuma) adatok.push({ cimke: 'Teljesítés dátuma', ertek: formatDateLong(t.teljesitesDatuma) })

  return { magyarazat, adatok, link }
}

// ---------- Esemény ----------

export function esemenyReszletek(e: Kivetitett<Esemeny>, k: Kornyezet): Reszletek {
  const sz = k.fsz.szerzodes
  if (e.tipusKod === 'ES-DV' && e.dijvaltozas) {
    const dv = e.dijvaltozas
    const magyarazat = [
      `${formatDateNapon(e.datum!)} a díj ${dv.ok} miatt ${dv.mertek.toLocaleString('hu-HU')}%-kal változott: ${formatFt(dv.regiDij)} helyett ${formatFt(dv.ujDij)}.`,
    ]
    if (sz.dijfizetesiMod === 'postai csekk') magyarazat.push('Ha csekkel fizet, kérjük, már az új összeget fizesse be.')
    if (sz.dijfizetesiMod === 'csoportos beszedés') {
      magyarazat.push('Ha a bankjánál összeghatárt állított be a díjlehívásra, ellenőrizze, hogy az új díj belefér-e.')
    }
    return { magyarazat, adatok: [] }
  }
  if (e.tipusKod === 'ES-FS') {
    return { magyarazat: ['Levélben emlékeztettük a nem rendezett díjra.'], adatok: [] }
  }
  return {
    magyarazat: [`A díj nem érkezett meg a megadott határidőig, ezért a szerződés ${formatDateNapon(e.datum!)} megszűnt.`],
    adatok: [],
  }
}
