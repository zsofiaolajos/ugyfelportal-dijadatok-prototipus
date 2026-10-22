// 'always': pénzügyi felületen a 4 jegyű összegek is tagolva ("6 166 Ft"), hogy oszlopban egységesek legyenek.
const ftFormatter = new Intl.NumberFormat('hu-HU', { maximumFractionDigits: 0, useGrouping: 'always' })
const ftDecimalFormatter = new Intl.NumberFormat('hu-HU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const dateFormatter = new Intl.DateTimeFormat('hu-HU', { year: 'numeric', month: '2-digit', day: '2-digit' })

/** 25380 → "25 380 Ft" */
export function formatFt(amount: number): string {
  // nem törő szóköz: az összeg és a "Ft" ne kerüljön külön sorba
  return `${ftFormatter.format(amount)} Ft`
}

/** Kerekítéshez: 0.3 → "0,30 Ft" */
export function formatFtDecimal(amount: number): string {
  return `${ftDecimalFormatter.format(amount)} Ft`
}

const longDateFormatter = new Intl.DateTimeFormat('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })

/** "2026-10-08" → "2026. 10. 08." */
export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(`${iso}T00:00:00`))
}

/** Rövid dátum határidőhöz: "2026-12-31" → "2026. 12. 31-ig" */
export function formatDateRovidIg(iso: string): string {
  return `${formatDate(iso).replace(/\.$/, '')}-ig`
}

/** Ügyfélszövegekhez: "2026-10-12" → "2026. október 12." */
export function formatDateLong(iso: string): string {
  return longDateFormatter.format(new Date(`${iso}T00:00:00`))
}

// A nap sorszámnevének -n ragja (elsején, másodikán, … harmincegyedikén).
const napRag = [
  '', 'jén', 'án', 'án', 'én', 'én', 'án', 'én', 'án', 'én', 'én',
  'én', 'én', 'án', 'én', 'én', 'án', 'én', 'án', 'én', 'án',
  'én', 'én', 'án', 'én', 'én', 'án', 'én', 'án', 'én', 'án', 'én',
]

/** Időpont-határozó: "2026-09-15" → "2026. szeptember 15-én" */
export function formatDateNapon(iso: string): string {
  const nap = Number(iso.slice(8, 10))
  return `${formatDateLong(iso).replace(/\.$/, '')}-${napRag[nap]}`
}

/** Határidős szöveghez: "2026-10-12" → "2026. október 12-ig" */
export function formatDateIg(iso: string): string {
  return `${formatDateLong(iso).replace(/\.$/, '')}-ig`
}
