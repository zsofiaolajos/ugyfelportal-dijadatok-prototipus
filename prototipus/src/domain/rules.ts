// Üzleti feltételezések egy helyen – anyagok/mintaadat.md „Feltételezések”.

/** Díjvisszautalás automata törlés után (munkanap). */
export const DIJVISSZAUTALAS_MUNKANAP = 3

/** Ekkora összeg felett a kifizetést engedélyezni kell (Ft). Ügyfélnek nem jelenik meg. */
export const ENGEDELYEZESI_HATAR = 100_000

/** Engedélyezés várható átfutása (munkanap) – feltételezés. */
export const ENGEDELYEZES_MUNKANAP = 5

/** KGFB automata törlés az esedékességtől számított napon. */
export const KGFB_MEGSZUNES_NAP = 60

/** Felszólítási szintek: határidő + nap. */
export const FELSZOLITAS_NAPOK = [15, 45] as const
