import { addDays, addWorkdays } from '../domain/dates'
import { DIJVISSZAUTALAS_MUNKANAP, ENGEDELYEZES_MUNKANAP, FELSZOLITAS_NAPOK } from '../domain/rules'
import type { DijElvaras, Esemeny, Folyoszamla, Parositas, Tranzakcio } from '../domain/types'
import { findContract } from './contracts'

// Folyószámla mockadat – anyagok/mintaadat.md, 1–4. forgatókönyv.

const ATKONYVELES_318 = {
  azonosito: 'ÁK-2026-000318',
  ok: 'túlfizetés áthelyezése ügyfél kérésére',
  kerelemszam: 'KR-2026-01877',
  kerelemDatuma: '2026-09-29',
}

export const elvarasok: DijElvaras[] = [
  // 1. Kovács Anna – Otthon 30012345
  { id: 'DE-0101', szerzodesszam: '30012345', tipusKod: 'DE-RD', megnevezes: 'I. negyedéves díj', idoszakKezdete: '2026-01-01', idoszakVege: '2026-03-31', elvaras: 24000, hatarido: '2026-01-01' },
  { id: 'DE-0102', szerzodesszam: '30012345', tipusKod: 'DE-RD', megnevezes: 'II. negyedéves díj', idoszakKezdete: '2026-04-01', idoszakVege: '2026-06-30', elvaras: 24000, hatarido: '2026-04-01' },
  {
    id: 'DE-0103', szerzodesszam: '30012345', tipusKod: 'DE-RD', megnevezes: 'III. negyedéves díj', idoszakKezdete: '2026-07-01', idoszakVege: '2026-09-30', elvaras: 25380, hatarido: '2026-07-01',
    dijvaltozas: { regiDij: 24000, ujDij: 25380, ok: 'indexálás', mertek: 5.75 },
  },
  { id: 'DE-0104', szerzodesszam: '30012345', tipusKod: 'DE-RD', megnevezes: 'IV. negyedéves díj', idoszakKezdete: '2026-10-01', idoszakVege: '2026-12-31', elvaras: 25380, hatarido: '2026-10-01' },
  { id: 'DE-0105', szerzodesszam: '30012345', tipusKod: 'DE-RD', megnevezes: 'I. negyedéves díj', idoszakKezdete: '2027-01-01', idoszakVege: '2027-03-31', elvaras: 25380, hatarido: '2027-01-01' },

  // 2. Nagy Péter – Otthon 30054321
  { id: 'DE-0201', szerzodesszam: '30054321', tipusKod: 'DE-RD', megnevezes: 'Júliusi díj', idoszakKezdete: '2026-07-01', idoszakVege: '2026-07-31', elvaras: 6500, hatarido: '2026-07-05' },
  {
    id: 'DE-0202', szerzodesszam: '30054321', tipusKod: 'DE-RD', megnevezes: 'Augusztusi díj', idoszakKezdete: '2026-08-01', idoszakVege: '2026-08-31', elvaras: 6874, hatarido: '2026-08-05', kerekites: 0.25,
    dijvaltozas: { regiDij: 6500, ujDij: 6874, ok: 'indexálás', mertek: 5.75 },
  },
  { id: 'DE-0203', szerzodesszam: '30054321', tipusKod: 'DE-RD', megnevezes: 'Szeptemberi díj', idoszakKezdete: '2026-09-01', idoszakVege: '2026-09-30', elvaras: 6874, hatarido: '2026-09-05', kerekites: 0.25 },
  { id: 'DE-0204', szerzodesszam: '30054321', tipusKod: 'DE-RD', megnevezes: 'Októberi díj', idoszakKezdete: '2026-10-01', idoszakVege: '2026-10-31', elvaras: 6874, hatarido: '2026-10-05', kerekites: 0.25 },
  { id: 'DE-0205', szerzodesszam: '30054321', tipusKod: 'DE-RD', megnevezes: 'Novemberi díj', idoszakKezdete: '2026-11-01', idoszakVege: '2026-11-30', elvaras: 6874, hatarido: '2026-11-05', kerekites: 0.25 },
  { id: 'DE-0206', szerzodesszam: '30054321', tipusKod: 'DE-RD', megnevezes: 'Decemberi díj', idoszakKezdete: '2026-12-01', idoszakVege: '2026-12-31', elvaras: 6874, hatarido: '2026-12-05', kerekites: 0.25 },

  // 3. Kovács Anna – KGFB 30067890
  { id: 'DE-0301', szerzodesszam: '30067890', tipusKod: 'DE-RD', megnevezes: 'I. negyedéves díj', idoszakKezdete: '2026-01-01', idoszakVege: '2026-03-31', elvaras: 18300, hatarido: '2026-01-01' },
  { id: 'DE-0302', szerzodesszam: '30067890', tipusKod: 'DE-RD', megnevezes: 'II. negyedéves díj', idoszakKezdete: '2026-04-01', idoszakVege: '2026-06-30', elvaras: 18300, hatarido: '2026-04-01' },
  {
    id: 'DE-0303', szerzodesszam: '30067890', tipusKod: 'DE-RD', megnevezes: 'III. negyedéves díj', idoszakKezdete: '2026-07-01', idoszakVege: '2026-09-30', elvaras: 18300, hatarido: '2026-07-01',
    torles: { ok: 'megszűnés miatt újraszámolva', helyettesitoElvaras: 'DE-0304' },
  },
  // 18 300 × 61/92 nap = 12 133,70 → 12 134
  { id: 'DE-0304', szerzodesszam: '30067890', tipusKod: 'DE-RD', megnevezes: 'Díj a megszűnésig', idoszakKezdete: '2026-07-01', idoszakVege: '2026-08-30', elvaras: 12134, hatarido: '2026-07-01', kerekites: 0.3 },

  // 4. Nagy Péter – Casco 30098765
  {
    id: 'DE-0401', szerzodesszam: '30098765', tipusKod: 'DE-RD', megnevezes: 'Éves díj', idoszakKezdete: '2026-06-01', idoszakVege: '2027-05-31', elvaras: 248400, hatarido: '2026-06-01',
    torles: { ok: 'megszűnés (gépjármű eladása) miatt újraszámolva', helyettesitoElvaras: 'DE-0402' },
  },
  // 248 400 × 107/365 nap = 72 818,63 → 72 819
  { id: 'DE-0402', szerzodesszam: '30098765', tipusKod: 'DE-RD', megnevezes: 'Díj a megszűnésig', idoszakKezdete: '2026-06-01', idoszakVege: '2026-09-15', elvaras: 72819, hatarido: '2026-06-01', kerekites: 0.37 },
]

export const tranzakciok: Tranzakcio[] = [
  // 1. Kovács Anna – Otthon 30012345
  { id: 'TR-1001', szerzodesszam: '30012345', tipusKod: 'BE-CS', osszeg: 24000, teljesitesDatuma: '2026-01-03', konyvelesDatuma: '2026-01-05', statusz: 'TELJESULT', jogcim: 'gyakoriság szerinti díj', kozlemeny: '30012345', rogzito: 'rendszer' },
  { id: 'TR-1002', szerzodesszam: '30012345', tipusKod: 'BE-CS', osszeg: 24000, teljesitesDatuma: '2026-03-30', konyvelesDatuma: '2026-03-31', statusz: 'TELJESULT', jogcim: 'gyakoriság szerinti díj', kozlemeny: '30012345', rogzito: 'rendszer' },
  { id: 'TR-1003', szerzodesszam: '30012345', tipusKod: 'BE-CS', osszeg: 24000, teljesitesDatuma: '2026-07-03', konyvelesDatuma: '2026-07-06', statusz: 'TELJESULT', jogcim: 'gyakoriság szerinti díj', kozlemeny: '30012345', rogzito: 'rendszer', megjegyzes: 'régi (24 000 Ft-os) csekken fizetve' },
  { id: 'TR-1004', szerzodesszam: '30012345', tipusKod: 'BE-CS', osszeg: 24000, teljesitesDatuma: '2026-07-03', konyvelesDatuma: '2026-07-06', statusz: 'STORNOZVA', jogcim: 'gyakoriság szerinti díj', kozlemeny: '30012345', rogzito: 'rendszer', megjegyzes: 'duplikált csekkimport' },
  { id: 'TR-1005', szerzodesszam: '30012345', tipusKod: 'TE-ST', osszeg: -24000, teljesitesDatuma: '2026-07-08', konyvelesDatuma: '2026-07-08', statusz: 'TELJESULT', stornozottTetel: 'TR-1004', rogzito: 'penzugy.szabo', megjegyzes: 'TR-1004 duplikált import visszavezetése' },
  { id: 'TR-1006', szerzodesszam: '30012345', tipusKod: 'BE-CS', osszeg: 24000, teljesitesDatuma: '2026-10-02', konyvelesDatuma: '2026-10-05', statusz: 'TELJESULT', jogcim: 'gyakoriság szerinti díj', kozlemeny: '30012345', rogzito: 'rendszer', megjegyzes: 'régi (24 000 Ft-os) csekken fizetve' },

  // 2. Nagy Péter – Otthon 30054321
  { id: 'TR-2001', szerzodesszam: '30054321', tipusKod: 'BE-CSB', osszeg: 6500, teljesitesDatuma: '2026-07-06', konyvelesDatuma: '2026-07-06', statusz: 'TELJESULT', jogcim: 'gyakoriság szerinti díj', rogzito: 'rendszer' },
  {
    id: 'TR-2002', szerzodesszam: '30054321', tipusKod: 'BE-CSB-S', osszeg: 0, kiserletOsszeg: 6874, konyvelesDatuma: '2026-08-05', statusz: 'SIKERTELEN', jogcim: 'gyakoriság szerinti díj', rogzito: 'rendszer',
    sikertelenseg: { ok: 'limittúllépés', bankiKod: '0412 (mock)', ugyfelSzoveg: 'A díj meghaladta a bankjánál beállított összeghatárt.' },
  },
  {
    id: 'TR-2003', szerzodesszam: '30054321', tipusKod: 'BE-UT', osszeg: 6874, teljesitesDatuma: '2026-08-20', konyvelesDatuma: '2026-08-22', statusz: 'TELJESULT', jogcim: 'gyakoriság szerinti díj', kozlemeny: 'lakasbizt aug',
    azonositas: { parositva: '2026-08-22', parositotta: 'cc.toth' }, rogzito: 'cc.toth', megjegyzes: 'nem azonosított befizetés, közlemény alapján párosítva',
  },
  { id: 'TR-2004', szerzodesszam: '30054321', tipusKod: 'BE-CSB', osszeg: 6874, teljesitesDatuma: '2026-09-07', konyvelesDatuma: '2026-09-07', statusz: 'TELJESULT', jogcim: 'gyakoriság szerinti díj', rogzito: 'rendszer' },
  {
    id: 'TR-2005', szerzodesszam: '30054321', tipusKod: 'AK-BE', osszeg: 20622, teljesitesDatuma: '2026-10-02', konyvelesDatuma: '2026-10-02', statusz: 'TELJESULT', kifizetesIranya: '30098765',
    atkonyveles: { ...ATKONYVELES_318, parSzerzodesszam: '30098765', parTranzakcioId: 'TR-4003' }, rogzito: 'cc.kiss',
  },

  // 3. Kovács Anna – KGFB 30067890
  { id: 'TR-3001', szerzodesszam: '30067890', tipusKod: 'BE-UT', osszeg: 18300, teljesitesDatuma: '2026-01-05', konyvelesDatuma: '2026-01-05', statusz: 'TELJESULT', jogcim: 'gyakoriság szerinti díj', kozlemeny: '30067890', rogzito: 'rendszer' },
  { id: 'TR-3002', szerzodesszam: '30067890', tipusKod: 'BE-UT', osszeg: 18300, teljesitesDatuma: '2026-04-03', konyvelesDatuma: '2026-04-03', statusz: 'TELJESULT', jogcim: 'gyakoriság szerinti díj', kozlemeny: '30067890', rogzito: 'rendszer' },
  { id: 'TR-3003', szerzodesszam: '30067890', tipusKod: 'BE-UT', osszeg: 18300, teljesitesDatuma: '2026-10-06', konyvelesDatuma: '2026-10-07', statusz: 'TELJESULT', jogcim: 'gyakoriság szerinti díj', kozlemeny: '30067890', rogzito: 'rendszer', megjegyzes: 'a megszűnés után érkezett' },
  {
    id: 'TR-3004', szerzodesszam: '30067890', tipusKod: 'KI-DV', osszeg: -6166, konyvelesDatuma: '2026-10-07', statusz: 'ELSZAMOLAS_ALATT',
    varhatoTeljesites: addWorkdays('2026-10-07', DIJVISSZAUTALAS_MUNKANAP), kifizetesIranya: '11600006-87654321', rogzito: 'rendszer', megjegyzes: 'automata törlés utáni túlfizetés visszautalása',
  },

  // 4. Nagy Péter – Casco 30098765
  {
    id: 'TR-4001', szerzodesszam: '30098765', tipusKod: 'AK-KD', osszeg: 26000, teljesitesDatuma: '2026-05-29', konyvelesDatuma: '2026-05-29', statusz: 'TELJESULT', kifizetesIranya: 'K-2026-004512',
    kar: { karszam: 'K-2026-004512', leiras: 'jégkár' }, rogzito: 'kar.nemeth', megjegyzes: 'ügyfél kérésére a kárkifizetésből',
  },
  { id: 'TR-4002', szerzodesszam: '30098765', tipusKod: 'BE-UT', osszeg: 222400, teljesitesDatuma: '2026-05-30', konyvelesDatuma: '2026-06-01', statusz: 'TELJESULT', jogcim: 'gyakoriság szerinti díj', kozlemeny: '30098765', rogzito: 'rendszer' },
  {
    id: 'TR-4003', szerzodesszam: '30098765', tipusKod: 'AK-KI', osszeg: -20622, teljesitesDatuma: '2026-10-02', konyvelesDatuma: '2026-10-02', statusz: 'TELJESULT', kifizetesIranya: '30054321',
    atkonyveles: { ...ATKONYVELES_318, parSzerzodesszam: '30054321', parTranzakcioId: 'TR-2005' }, rogzito: 'cc.kiss',
  },
  {
    id: 'TR-4004', szerzodesszam: '30098765', tipusKod: 'KI-DV', osszeg: -154959, konyvelesDatuma: '2026-10-05', statusz: 'ENGEDELYEZESRE_VAR',
    varhatoTeljesites: addWorkdays('2026-10-05', ENGEDELYEZES_MUNKANAP), kifizetesIranya: '11773016-12345678',
    engedelyezes: { kerelemDatuma: '2026-10-05', felelosCsoport: 'Pénzügyi jóváhagyás csoport' }, rogzito: 'rendszer', megjegyzes: 'megszűnés utáni túlfizetés visszautalása',
  },
]

export const parositasok: Parositas[] = [
  { tranzakcioId: 'TR-1001', elvarasId: 'DE-0101', osszeg: 24000 },
  { tranzakcioId: 'TR-1002', elvarasId: 'DE-0102', osszeg: 24000 },
  { tranzakcioId: 'TR-1003', elvarasId: 'DE-0103', osszeg: 24000 },
  { tranzakcioId: 'TR-1006', elvarasId: 'DE-0104', osszeg: 24000 },

  { tranzakcioId: 'TR-2001', elvarasId: 'DE-0201', osszeg: 6500 },
  { tranzakcioId: 'TR-2003', elvarasId: 'DE-0202', osszeg: 6874 },
  { tranzakcioId: 'TR-2004', elvarasId: 'DE-0203', osszeg: 6874 },
  { tranzakcioId: 'TR-2005', elvarasId: 'DE-0204', osszeg: 6874 },
  { tranzakcioId: 'TR-2005', elvarasId: 'DE-0205', osszeg: 6874 },
  { tranzakcioId: 'TR-2005', elvarasId: 'DE-0206', osszeg: 6874 },

  { tranzakcioId: 'TR-3001', elvarasId: 'DE-0301', osszeg: 18300 },
  { tranzakcioId: 'TR-3002', elvarasId: 'DE-0302', osszeg: 18300 },
  { tranzakcioId: 'TR-3003', elvarasId: 'DE-0304', osszeg: 12134 },

  { tranzakcioId: 'TR-4001', elvarasId: 'DE-0402', osszeg: 26000 },
  { tranzakcioId: 'TR-4002', elvarasId: 'DE-0402', osszeg: 46819 },
]

export const esemenyek: Esemeny[] = [
  { id: 'EV-101', szerzodesszam: '30012345', tipusKod: 'ES-DV', datum: '2026-07-01', dijvaltozas: { regiDij: 24000, ujDij: 25380, ok: 'indexálás', mertek: 5.75 } },
  { id: 'EV-102', szerzodesszam: '30012345', tipusKod: 'ES-FS', datum: addDays('2026-07-01', FELSZOLITAS_NAPOK[0]), szint: 1 },

  { id: 'EV-201', szerzodesszam: '30054321', tipusKod: 'ES-DV', datum: '2026-08-01', dijvaltozas: { regiDij: 6500, ujDij: 6874, ok: 'indexálás', mertek: 5.75 } },

  { id: 'EV-301', szerzodesszam: '30067890', tipusKod: 'ES-FS', datum: addDays('2026-07-01', FELSZOLITAS_NAPOK[0]), szint: 1 },
  { id: 'EV-302', szerzodesszam: '30067890', tipusKod: 'ES-FS', datum: addDays('2026-07-01', FELSZOLITAS_NAPOK[1]), szint: 2 },
  { id: 'EV-303', szerzodesszam: '30067890', tipusKod: 'ES-AT', datum: '2026-08-30', leiras: 'automata törlés díjnemfizetés miatt' },
]

/** Egy szerződés teljes (szűretlen) folyószámlája. */
export function getFolyoszamla(szerzodesszam: string | undefined): Folyoszamla | undefined {
  const szerzodes = findContract(szerzodesszam)
  if (!szerzodes) return undefined
  const sajat = <T extends { szerzodesszam: string }>(t: T) => t.szerzodesszam === szerzodesszam
  const elv = elvarasok.filter(sajat)
  const trs = tranzakciok.filter(sajat)
  const trIds = new Set(trs.map((t) => t.id))
  return {
    szerzodes,
    elvarasok: elv,
    tranzakciok: trs,
    parositasok: parositasok.filter((p) => trIds.has(p.tranzakcioId)),
    esemenyek: esemenyek.filter(sajat),
  }
}
