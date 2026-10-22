import type {
  ContractState,
  ElvarasStatusz,
  EsemenyTipus,
  PaymentFrequency,
  Role,
  TranzakcioStatusz,
  TranzakcioTipus,
} from './types'

// Megnevezések szerepkörönként – anyagok/tetelkatalogus.md és anyagok/lathatosag.md.

export type Tone = 'ok' | 'warn' | 'danger' | 'info' | 'neutral'

type Felirat = { ugyfel: string; advanced: string; tone: Tone }

function valaszt(entry: Felirat, role: Role) {
  return { label: entry[role], tone: entry.tone }
}

// ---------- Szerződés ----------

const contractStateLabels: Record<ContractState, Felirat> = {
  ELO: { ugyfel: 'Élő', advanced: 'Élő', tone: 'ok' },
  DIJRENDEZETLEN: { ugyfel: 'Díjfizetés elmaradt', advanced: 'Díjrendezetlen', tone: 'warn' },
  MEGSZUNT: { ugyfel: 'Megszűnt', advanced: 'Megszűnt', tone: 'neutral' },
}

export function contractStateLabel(state: ContractState, role: Role) {
  return valaszt(contractStateLabels[state], role)
}

/** "negyedéves" → "negyedév" – az aktuális díj mellé: "25 380 Ft / negyedév" */
export const frequencyUnit: Record<PaymentFrequency, string> = {
  havi: 'hó',
  negyedéves: 'negyedév',
  féléves: 'félév',
  éves: 'év',
}

// ---------- Tételtípusok ----------

export type Kategoria = 'Befizetés' | 'Kifizetés' | 'Átkönyvelés' | 'Technikai'

export const tranzakcioTipusok: Record<TranzakcioTipus, { kategoria: Kategoria; advanced: string; ugyfel: string }> = {
  'BE-CSB': { kategoria: 'Befizetés', advanced: 'Befizetés – csoportos beszedés', ugyfel: 'Díjlehívás bankszámláról' },
  'BE-CSB-S': { kategoria: 'Befizetés', advanced: 'Sikertelen díjlehívás', ugyfel: 'Sikertelen díjlehívás' },
  'BE-UT': { kategoria: 'Befizetés', advanced: 'Befizetés – átutalás', ugyfel: 'Befizetés megérkezett (átutalás)' },
  'BE-CS': { kategoria: 'Befizetés', advanced: 'Befizetés – postai csekk', ugyfel: 'Befizetés megérkezett (csekk)' },
  'BE-KK': { kategoria: 'Befizetés', advanced: 'Befizetés – bankkártya', ugyfel: 'Befizetés megérkezett (bankkártya)' },
  'KI-DV': { kategoria: 'Kifizetés', advanced: 'Díjvisszautalás', ugyfel: 'Díjvisszatérítés a bankszámlájára' },
  'KI-AJ': { kategoria: 'Kifizetés', advanced: 'Adójóváírás kifizetése', ugyfel: 'Adójóváírás' },
  'KI-MK': { kategoria: 'Kifizetés', advanced: 'Megtakarítási összeg kifizetése', ugyfel: 'Megtakarítás kifizetése' },
  'AK-KI': { kategoria: 'Átkönyvelés', advanced: 'Átkönyvelés másik szerződésre', ugyfel: 'Áthelyezve másik szerződésre' },
  'AK-BE': { kategoria: 'Átkönyvelés', advanced: 'Átkönyvelés másik szerződésről', ugyfel: 'Jóváírás másik szerződésről' },
  'AK-KD': { kategoria: 'Átkönyvelés', advanced: 'Kárkifizetésből díjra', ugyfel: 'Kárkifizetésből rendezett díj' },
  'TE-KR': { kategoria: 'Technikai', advanced: 'Kerekítési különbözet', ugyfel: '' },
  'TE-ST': { kategoria: 'Technikai', advanced: 'Storno / visszavezetés', ugyfel: '' },
}

export const esemenyTipusok: Record<EsemenyTipus, { advanced: string; ugyfel: string }> = {
  'ES-DV': { advanced: 'Díjváltozás', ugyfel: 'Díjváltozás' },
  'ES-FS': { advanced: 'Díjfelszólítás kiküldve', ugyfel: 'Fizetési emlékeztetőt küldtünk' },
  'ES-AT': { advanced: 'Automata törlés díjnemfizetés miatt', ugyfel: 'A szerződés díjnemfizetés miatt megszűnt' },
}

// ---------- Státuszok ----------

const tranzakcioStatuszok: Record<TranzakcioStatusz, Felirat> = {
  TELJESULT: { ugyfel: 'Teljesült', advanced: 'Teljesült', tone: 'ok' },
  ELSZAMOLAS_ALATT: { ugyfel: 'Feldolgozás alatt', advanced: 'Elszámolás alatt', tone: 'info' },
  ENGEDELYEZESRE_VAR: { ugyfel: 'Jóváhagyás alatt', advanced: 'Engedélyezésre vár', tone: 'info' },
  UTALAS_FOLYAMATBAN: { ugyfel: 'Utalás folyamatban', advanced: 'Utalás folyamatban', tone: 'info' },
  SIKERTELEN: { ugyfel: 'Sikertelen', advanced: 'Sikertelen', tone: 'danger' },
  STORNOZVA: { ugyfel: '', advanced: 'Stornózva', tone: 'neutral' },
}

export function tranzakcioStatuszLabel(statusz: TranzakcioStatusz, role: Role) {
  return valaszt(tranzakcioStatuszok[statusz], role)
}

const elvarasStatuszok: Record<ElvarasStatusz, Felirat> = {
  JOVOBENI: { ugyfel: 'Közelgő', advanced: 'Jövőbeni', tone: 'neutral' },
  ELO: { ugyfel: 'Fizetendő', advanced: 'Élő', tone: 'info' },
  LEJART: { ugyfel: 'Nem rendezett', advanced: 'Lejárt', tone: 'warn' },
  RESZBEN_RENDEZETT: { ugyfel: 'Részben fizetve', advanced: 'Részben rendezett', tone: 'warn' },
  RENDEZETT: { ugyfel: 'Kifizetve', advanced: 'Rendezett', tone: 'ok' },
  TOROLT: { ugyfel: '', advanced: 'Törölt', tone: 'neutral' },
}

export function elvarasStatuszLabel(statusz: ElvarasStatusz, role: Role) {
  return valaszt(elvarasStatuszok[statusz], role)
}
