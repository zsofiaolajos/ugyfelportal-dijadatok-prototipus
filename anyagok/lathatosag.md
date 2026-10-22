# Szerepkör-láthatósági mátrix (A4 – jóváhagyva, 2026-10-08)

Döntések: várható megszűnés az ügyfélnek **nem** látszik (külön e-mail értesítőt kap, nem scope) · engedélyezésnél konkrét összeghatár nélkül · bankszámlaszám az ügyfélnek is **teljes**, maszkolás nélkül.

Jelölés: **●** látja · **◐** átalakítva látja (köznyelvi szöveg, maszkolás, összevonás) · **–** rejtett.
Az advanced nézet (CC + tanácsadó) minden mezőt lát. A prototípusban ez egy konfigurációs táblában (`visibility.ts`) lesz, könnyen módosítható.

## 1. Tételtípusok
| Tétel | Ügyfél | Megjegyzés |
|---|---|---|
| Díjelvárás (DE-RD, DE-TD, DE-PD) | ● | köznyelvi névvel |
| Befizetés (BE-*) | ● | |
| Sikertelen díjlehívás (BE-CSB-S) | ◐ | köznyelvi ok, banki kód nélkül |
| Kifizetés (KI-*) | ● | státusszal és várható dátummal |
| Átkönyvelés (AK-*) | ● | kimenő és bejövő oldalon is |
| Díjváltozás (ES-DV) | ● | régi → új díj, ok |
| Felszólítás (ES-FS) | ◐ | „Fizetési emlékeztetőt küldtünk”, szint nélkül |
| Automata törlés (ES-AT) | ● | |
| Kerekítés (TE-KR) | – | az ügyfél a kerekített végösszeget látja |
| Storno + újrakönyvelés (TE-ST) | – | az eredeti és a storno tétel is rejtett, csak a helyes tétel látszik |
| Nem azonosított befizetés párosítása (TE-NA) | ◐ | normál „Befizetés megérkezett” tételként, a befizetés napjával |

## 2. Szerződés
| Mező | Ügyfél | Megjegyzés |
|---|---|---|
| szerződésszám, termék, szerződő, biztosított tárgy, kockázatviselés kezdete, évforduló | ● | |
| díjfizetési gyakoriság és mód, aktuális díj, éves díj | ● | |
| lehívási bankszámla | ● | maszkolás nélkül |
| állapot | ◐ | Díjrendezetlen → „Díjfizetés elmaradt” |
| megszűnés dátuma, oka | ● | |

## 3. Díjelvárás
| Mező | Ügyfél | Megjegyzés |
|---|---|---|
| id | – | |
| típus | ◐ | csak a köznyelvi név |
| időszak, elvárás, befizetés, határidő | ● | |
| státusz | ◐ | Jövőbeni → „Közelgő” · Élő → „Fizetendő” · Lejárt → „Nem rendezett” · Részben rendezett → „Részben fizetve” · Rendezett → „Kifizetve” · Törölt → rejtett |
| díjváltozás (régi/új díj, ok, mérték) | ● | |

## 4. Tranzakció
| Mező | Ügyfél | Megjegyzés |
|---|---|---|
| id | – | |
| típus | ◐ | csak a köznyelvi név |
| irány | ◐ | színnel és előjellel (+ zöld / − semleges) |
| összeg | ● | |
| kerekítés | – | |
| könyvelés dátuma | – | |
| teljesítés dátuma | ● | |
| státusz | ◐ | Elszámolás alatt → „Feldolgozás alatt” · Engedélyezésre vár → „Jóváhagyás alatt” · Utalás folyamatban · Teljesült · Sikertelen · Stornózva → rejtett |
| várható teljesítés | ● | |
| kifizetés iránya | ● | bankszámla, kárszám, szerződésszám teljesen |
| jogcím, fizetési mód | ● | |
| közlemény | – | |
| sikertelenség oka | ◐ | csak köznyelvi szöveg |
| sikertelenség banki kódja | – | |
| engedélyezés | ◐ | csak a tény + várható dátum („a nagyobb összegű kifizetéseket munkatársunk ellenőrzi”); kérelem dátuma, felelős csoport, határérték rejtett |
| átkönyvelés: párszerződés, ok | ● | |
| átkönyvelés: azonosító, kérelemszám | ◐ | „Hivatkozási szám” néven, ha telefonon érdeklődne |
| átkönyvelés: pártranzakció | – | |
| storno hivatkozás, rögzítő, megjegyzés | – | |

## 5. Párosítás
| Mező | Ügyfél | Megjegyzés |
|---|---|---|
| párosítás nézet | – | |
| párosítás eredménye | ◐ | a befizetés kibontva: „Ezzel rendeztük: IV. negyedéves díj” |

## 6. Számított mezők
| Mező | Ügyfél | Megjegyzés |
|---|---|---|
| egyenleg | ◐ | állapotként: Rendezett / Nem rendezett díj / Túlfizetés |
| hátralék, túlfizetés | ● | |
| hátralék kora (nap) | – | helyette a határidő látszik |
| következő esedékesség | ● | |
| várható megszűnés | – | külön e-mail értesítő megy róla; advanced nézetben marad |
| felszólítási szint | – | |
