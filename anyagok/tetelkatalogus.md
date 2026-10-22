# Tételtípus-katalógus (A2 – jóváhagyva, 2026-10-08)

## Döntések
- Díjelőírás mezői: **Elvárás** és **Befizetés** (nincs külön „Összeg” oszlop).
- KI-AJ, KI-MK: katalógusban marad, a lakás/gépjármű forgatókönyvekben nem szerepel.
- Automata törlés utáni díjvisszautalás átfutása: **3 munkanap**.
- Advanced nézet: megtartja a „Könyvelt tranzakciók” + „Jövőbeni díjadatok” kétblokkos szerkezetet; ügyfél nézet: egy idővonal, felül a közelgő tételek.
- Arculat: Groupama Biztosító (www.groupama.hu).
- Díjváltozás (indexálás, bonus-malus) nem pénzügyi tétel, hanem **ES-DV esemény** + jelölés az érintett díjelváráson (A3 döntés).

Előjel-konvenció: **egyenleg = befizetések/jóváírások − előírások/kifizetések**.
Pozitív egyenleg = túlfizetés, negatív = hátralék. A kódok mock kódok, a valós rendszerkódokra cserélhetők.

## 1. Díjelőírás (DE) – „mit kell fizetni”
| Kód | Advanced név | Ügyfélnek | Ügyfél látja |
|---|---|---|---|
| DE-RD | Rendszeres díjelőírás (gyakoriság szerinti) | „Negyedéves díj – 2026. IV. negyedév” | igen |
| DE-TD | Töredékdíj előírás (kezdet → első fordulónap) | „Első, rövidebb időszak díja” | igen |
| DE-PD | Pótdíj / eseti díjelőírás (szerződésmódosítás) | „Pótdíj – szerződésmódosítás” | igen |

Előírás státuszai (= „díjelvárás típusa”): **Jövőbeni**, **Élő** (esedékes, határidőn belül), **Lejárt** (= díjhátralék), **Részben rendezett**, **Rendezett**, **Törölt** (storno).

## 2. Befizetés (BE) – „mit fizetett az ügyfél”
Egy típus, két attribútummal: **jogcím** és **fizetési mód**.
- Jogcím: gyakoriság szerinti díj · eseti díj · töredékdíj
- Fizetési mód (kód): BE-CSB csoportos beszedés (díjlehívás) · BE-UT átutalás · BE-CS postai csekk · BE-KK bankkártya

| Kód | Advanced név | Ügyfélnek | Ügyfél látja |
|---|---|---|---|
| BE-* | Befizetés (jogcím + mód) | „Befizetés megérkezett – csekk” | igen |
| BE-CSB-S | Sikertelen díjlehívás (+ ok: fedezethiány, limittúllépés, helytelen bankszámlaszám, megbízás visszavonva; banki visszatérési kód) | „Sikertelen díjlehívás – a bank fedezethiány miatt elutasította” | igen, köznyelvi ok, kód nélkül |

## 3. Kifizetés (KI) – „mit fizetett a biztosító”
| Kód | Advanced név | Ügyfélnek | Ügyfél látja |
|---|---|---|---|
| KI-DV | Díjvisszautalás (megszűnés/automata törlés, túlfizetés) | „Díjvisszatérítés a bankszámlájára” | igen |
| KI-AJ | Adójóváírás kifizetése | „Adójóváírás” | igen |
| KI-MK | Megtakarítási összeg kifizetése | „Megtakarítás kifizetése” | igen |

Kifizetés státuszai: **Elszámolás alatt** → **Engedélyezésre vár** (100 000 Ft felett) → **Utalás folyamatban** → **Teljesült** / **Sikertelen** (pl. hibás számlaszám).
Ügyfélnek minden nem teljesült státusznál látszik: miért vár, és várhatóan mikor kapja meg.
KI-AJ és KI-MK életbiztosítási típus: a katalógusban szerepel, a lakás/gépjármű forgatókönyvekben nem.

## 4. Átkönyvelés (AK)
| Kód | Advanced név | Ügyfélnek | Ügyfél látja |
|---|---|---|---|
| AK-KI | Átkönyvelés másik szerződésre (kimenő) | „Áthelyezve a 30012345 sz. KGFB szerződésre” | igen |
| AK-BE | Átkönyvelés másik szerződésről (bejövő) | „Jóváírás a 30098765 sz. casco szerződésről” | igen |
| AK-KD | Kárkifizetésből díjra (beszámítás) | „Kárkifizetésből rendezett díj – kárszám: K-2026-004512” | igen |

Javaslat a célszerződésen való megjelenítésre:
- A kimenő és a bejövő tétel **közös átkönyvelési azonosítót** kap (pl. ÁK-2026-000318), így párban látszanak.
- **Ügyfél, célszerződés**: zöld jóváírás ikonnal, „Jóváírás a … szerződésről”; kibontva: „Az Ön kérésére a … szerződés túlfizetését ide helyeztük át.” A forrásszerződés neve és száma látszik.
- **Ügyfél, forrásszerződés**: „Áthelyezve a … szerződésre” – ugyanaz a magyarázat.
- **Advanced** (mindkét oldalon): kattintható link a párszerződésre, kérelem dátuma, kérelem/ügyszám, ok (túlfizetés / ügyfélkérés / kárbeszámítás), átkönyvelési azonosító, rögzítő.
- **AK-KD**: a kárszám az ügyfélnek is látszik, a kárügy belső részletei csak advanced nézetben.

## 5. Díjhátralék és események (ES) – nem pénzmozgás
| Kód | Advanced név | Ügyfélnek | Ügyfél látja |
|---|---|---|---|
| (számított) | Díjhátralék = lejárt, nem rendezett előírások összege | „Nem rendezett díj: 7 000 Ft” | igen, kiemelve |
| ES-DV | Díjváltozás – indexálás / bonus-malus (régi díj → új díj, mérték %); az érintett díjelváráson is jelölve | „Díjváltozás (indexálás) – új díj: 8 460 Ft” + magyarázat | igen |
| ES-FS | Díjfelszólítás kiküldve (1./2. szint) | „Fizetési emlékeztetőt küldtünk” | igen (szint nélkül) |
| ES-AT | Automata törlés díjnemfizetés miatt | „A szerződés díjnemfizetés miatt megszűnt” | igen |
| ES-ML | Megszűnés várható dátuma (számított) | „Ha … -ig nem rendeződik, a szerződés megszűnik” | igen |

## 6. Technikai (TE) – csak advanced
| Kód | Advanced név | Ügyfélnek |
|---|---|---|
| TE-KR | Kerekítési különbözet | rejtett, az ügyfél nettó összeget lát |
| TE-ST | Storno / visszavezetés (+ újrakönyvelés) | rejtett, a pár nettósítva |
| TE-NA | Nem azonosított befizetés → szerződésre párosítva | csak a végeredményt látja: „Befizetés megérkezett” |

## A CC által gyakran magyarázott helyzetek → megjelenítés
| Helyzet | Ügyfél nézet | Advanced nézet |
|---|---|---|
| Automata törlés után napokig áll az összeg | „Díjvisszatérítés – elszámolás alatt, várható utalás: …” | szabály + lépések idővonala, várható dátum számítása |
| 100 000 Ft feletti, engedélyezésre váró kifizetés | „Jóváhagyás alatt – a nagyobb összegű kifizetéseket munkatársunk ellenőrzi” | engedélyezési lépés, beérkezés dátuma, felelős csoport |
| Régi csekkel fizetett az indexálás után | „Díjváltozás (indexálás)” tétel + „Nem rendezett díj” a különbözettel | előírás ↔ befizetés párosítás, a különbözet kiemelve |
| Sikertelen díjlehívás | köznyelvi ok | ok + banki visszatérési kód, megbízás állapota |
