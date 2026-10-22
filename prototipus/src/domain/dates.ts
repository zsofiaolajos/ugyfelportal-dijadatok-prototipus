// Dátumkezelés ISO (YYYY-MM-DD) szövegekkel – így lexikografikusan is összehasonlíthatók.

/** A prototípus „mai napja” (anyagok/mintaadat.md). */
export const MA = '2026-10-08'

function toUtc(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`)
}

function toIso(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export function addDays(iso: string, days: number): string {
  const d = toUtc(iso)
  d.setUTCDate(d.getUTCDate() + days)
  return toIso(d)
}

/** Munkanapok hozzáadása (hétvége kihagyva; ünnepnapokkal a prototípus nem számol). */
export function addWorkdays(iso: string, workdays: number): string {
  const d = toUtc(iso)
  let added = 0
  while (added < workdays) {
    d.setUTCDate(d.getUTCDate() + 1)
    const day = d.getUTCDay()
    if (day !== 0 && day !== 6) added++
  }
  return toIso(d)
}

export function daysBetween(fromIso: string, toIsoDate: string): number {
  return Math.round((toUtc(toIsoDate).getTime() - toUtc(fromIso).getTime()) / 86_400_000)
}
