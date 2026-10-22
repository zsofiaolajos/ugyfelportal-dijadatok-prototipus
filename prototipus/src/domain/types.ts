// Domain típusok – anyagok/adatmodell.md és anyagok/tetelkatalogus.md alapján.

export type Role = 'ugyfel' | 'advanced'

export type Product = 'LAKAS' | 'KGFB' | 'CASCO'

export type PaymentFrequency = 'havi' | 'negyedéves' | 'féléves' | 'éves'

export type PaymentMethod = 'csoportos beszedés' | 'átutalás' | 'postai csekk' | 'bankkártya'

export type ContractState = 'ELO' | 'DIJRENDEZETLEN' | 'MEGSZUNT'

export interface Contract {
  szerzodesszam: string
  termek: Product
  termekNev: string
  szerzodo: string
  /** lakás: kockázatviselés helye, gépjármű: rendszám + típus */
  biztositottTargy: string
  kockazatviselesKezdete: string // ISO dátum
  evfordulo: string // pl. "07.01."
  dijfizetesiGyakorisag: PaymentFrequency
  dijfizetesiMod: PaymentMethod
  lehivasiBankszamla?: string
  aktualisDij: number
  evesDij: number
  allapot: ContractState
  megszunesDatuma?: string
  megszunesOka?: string
}

// ---------- Díjelvárás („Jövőbeni díjadatok”) ----------

export type ElvarasTipus = 'DE-RD' | 'DE-TD' | 'DE-PD'

/** Számított, kivéve TOROLT (az tárolt: `torles`). */
export type ElvarasStatusz = 'JOVOBENI' | 'ELO' | 'LEJART' | 'RESZBEN_RENDEZETT' | 'RENDEZETT' | 'TOROLT'

export interface Dijvaltozas {
  regiDij: number
  ujDij: number
  ok: 'indexálás' | 'bonus-malus'
  /** százalék, pl. 5.75 */
  mertek: number
}

export interface DijElvaras {
  id: string
  szerzodesszam: string
  tipusKod: ElvarasTipus
  /** köznyelvi név, pl. "III. negyedéves díj" */
  megnevezes: string
  idoszakKezdete: string
  idoszakVege: string
  elvaras: number
  hatarido: string
  /** a számított díj egész Ft-ra kerekítése (pl. indexálás, időarányos díj) */
  kerekites?: number
  dijvaltozas?: Dijvaltozas
  torles?: { ok: string; helyettesitoElvaras?: string }
}

// ---------- Tranzakció („Könyvelt tranzakciók”) ----------

export type TranzakcioTipus =
  | 'BE-CSB' // csoportos beszedés
  | 'BE-CSB-S' // sikertelen díjlehívás
  | 'BE-UT' // átutalás
  | 'BE-CS' // postai csekk
  | 'BE-KK' // bankkártya
  | 'KI-DV' // díjvisszautalás
  | 'KI-AJ' // adójóváírás
  | 'KI-MK' // megtakarítás kifizetése
  | 'AK-KI' // átkönyvelés másik szerződésre
  | 'AK-BE' // átkönyvelés másik szerződésről
  | 'AK-KD' // kárkifizetésből díjra
  | 'TE-KR' // kerekítési különbözet
  | 'TE-ST' // storno / visszavezetés

export type TranzakcioStatusz =
  | 'TELJESULT'
  | 'ELSZAMOLAS_ALATT'
  | 'ENGEDELYEZESRE_VAR'
  | 'UTALAS_FOLYAMATBAN'
  | 'SIKERTELEN'
  | 'STORNOZVA'

export type Jogcim = 'gyakoriság szerinti díj' | 'eseti díj' | 'töredékdíj'

export interface Tranzakcio {
  id: string
  szerzodesszam: string
  tipusKod: TranzakcioTipus
  /** előjeles: + jóváírás, − terhelés (az egyenlegre gyakorolt hatás) */
  osszeg: number
  /** sikertelen díjlehívásnál a megkísérelt összeg (osszeg ilyenkor 0) */
  kiserletOsszeg?: number
  konyvelesDatuma: string
  /** értéknap; nem teljesült kifizetésnél nincs */
  teljesitesDatuma?: string
  statusz: TranzakcioStatusz
  varhatoTeljesites?: string
  /** bankszámla / kárszám / szerződésszám */
  kifizetesIranya?: string
  jogcim?: Jogcim
  kozlemeny?: string
  kerekites?: number
  sikertelenseg?: { ok: string; bankiKod: string; ugyfelSzoveg: string }
  engedelyezes?: { kerelemDatuma: string; felelosCsoport: string }
  atkonyveles?: {
    azonosito: string
    parSzerzodesszam: string
    parTranzakcioId: string
    ok: string
    kerelemszam: string
    kerelemDatuma: string
  }
  kar?: { karszam: string; leiras: string }
  /** storno tételnél: melyik tételt vezeti vissza */
  stornozottTetel?: string
  /** nem azonosított befizetés utólagos párosítása (TE-NA) */
  azonositas?: { parositva: string; parositotta: string }
  rogzito?: string
  megjegyzes?: string
}

// ---------- Párosítás ----------

export interface Parositas {
  tranzakcioId: string
  elvarasId: string
  osszeg: number
}

// ---------- Esemény (nem pénzmozgás) ----------

export type EsemenyTipus = 'ES-DV' | 'ES-FS' | 'ES-AT'

export interface Esemeny {
  id: string
  szerzodesszam: string
  tipusKod: EsemenyTipus
  datum: string
  /** felszólítási szint (ES-FS) */
  szint?: number
  dijvaltozas?: Dijvaltozas
  leiras?: string
}

// ---------- Egy szerződés teljes folyószámlája ----------

export interface Folyoszamla {
  szerzodes: Contract
  elvarasok: DijElvaras[]
  tranzakciok: Tranzakcio[]
  parositasok: Parositas[]
  esemenyek: Esemeny[]
}
