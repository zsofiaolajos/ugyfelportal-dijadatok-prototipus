import type { ElvarasSor, TranzakcioSor } from './ledgerTable'

/*
 * CSV-export a főkönyvi táblából (D3), magyar Excel-barát formában:
 * pontosvessző elválasztó, CRLF sorvég, UTF-8 BOM, ISO dátumok, tagolás nélküli egész összegek,
 * tizedesvessző a kerekítésnél.
 */

type Cella = string | number | undefined

function cella(v: Cella): string {
  if (v === undefined) return ''
  const s = typeof v === 'number' ? (Number.isInteger(v) ? String(v) : String(v).replace('.', ',')) : v
  return /[;"\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function csv(fejlec: string[], sorok: Cella[][]): string {
  return '﻿' + [fejlec, ...sorok].map((sor) => sor.map(cella).join(';')).join('\r\n') + '\r\n'
}

export function tranzakcioCsv(sorok: TranzakcioSor[]): string {
  return csv(
    ['Azonosító', 'Könyvelés', 'Teljesítés', 'Kód', 'Tétel', 'Összeg (Ft)', 'Egyenleg a tétel után (Ft)', 'Státusz', 'Részletek'],
    sorok.map((s) => [
      s.key,
      s.nyers.konyveles,
      s.nyers.teljesites,
      s.kod,
      s.nev,
      s.nyers.osszeg,
      s.egyenleg,
      s.statusz.label,
      s.reszletek.join(' · '),
    ]),
  )
}

export function elvarasCsv(sorok: ElvarasSor[]): string {
  return csv(
    ['Azonosító', 'Időszak kezdete', 'Időszak vége', 'Kód', 'Megnevezés', 'Elvárás (Ft)', 'Befizetés (Ft)', 'Nyitott (Ft)', 'Kerekítés (Ft)', 'Határidő', 'Státusz', 'Részletek'],
    sorok.map((s) => [
      s.key,
      s.nyers.idoszakKezdete,
      s.nyers.idoszakVege,
      s.kod,
      s.nev,
      s.nyers.elvaras,
      s.nyers.befizetes,
      s.nyers.nyitott,
      s.nyers.kerekites,
      s.nyers.hatarido,
      s.statusz.label,
      s.reszletek.join(' · '),
    ]),
  )
}
