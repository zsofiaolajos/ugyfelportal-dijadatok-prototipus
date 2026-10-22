# Mintaadat – 4 forgatókönyv (A5, jóváhagyásra vár)

A prototípus „mai napja”: **2026.10.08. (csütörtök)**. Minden név, cím, rendszám, bankszámla mock.
Két ügyfél, négy szerződés; a 2. és 4. forgatókönyv átkönyveléssel kapcsolódik egymáshoz.

| # | Ügyfél | Szerződés | Fő kérdés, amit bemutat |
|---|---|---|---|
| 1 | Kovács Anna | 30012345 – Otthonbiztosítás | „Mindig befizetem a csekket, miért van elmaradásom?” (indexálás után régi csekk) |
| 2 | Nagy Péter | 30054321 – Otthonbiztosítás | „Miért volt sikertelen a lehívás?” (limittúllépés) + bejövő átkönyvelés |
| 3 | Kovács Anna | 30067890 – KGFB | „Megszűnt a szerződés, befizettem – hol a pénzem?” (automata törlés, visszautalás 3 munkanap) |
| 4 | Nagy Péter | 30098765 – Casco | „Mennyi jár vissza és mikor?” (megszűnés, kárból díjra, átkönyvelés, 100 000 Ft feletti engedélyezés) |

---

## 1. Kovács Anna – Otthonbiztosítás 30012345
Fejléc: 1118 Budapest, Minta utca 12. · kezdet 2021.07.01. · évforduló 07.01. · negyedéves · postai csekk · aktuális díj **25 380 Ft** (éves 101 520 Ft) · állapot: **Díjrendezetlen**

**Díjelvárások**
| Id | Időszak | Elvárás | Befizetés | Határidő | Státusz | Ügyfél nézetben |
|---|---|---|---|---|---|---|
| DE-0101 | 2026.01.01.–03.31. | 24 000 | 24 000 | 01.01. | Rendezett | „I. negyedéves díj – Kifizetve” |
| DE-0102 | 2026.04.01.–06.30. | 24 000 | 24 000 | 04.01. | Rendezett | „II. negyedéves díj – Kifizetve” |
| DE-0103 | 2026.07.01.–09.30. | 25 380 *(díjváltozás)* | 24 000 | 07.01. | Lejárt (nyitott 1 380) | „III. negyedéves díj – Nem rendezett: 1 380 Ft” |
| DE-0104 | 2026.10.01.–12.31. | 25 380 | 24 000 | 10.01. | Lejárt (nyitott 1 380) | „IV. negyedéves díj – Nem rendezett: 1 380 Ft” |
| DE-0105 | 2027.01.01.–03.31. | 25 380 | 0 | 2027.01.01. | Jövőbeni | „Közelgő: I. negyedéves díj” |

**Könyvelt tranzakciók**
| Id | Típus | Összeg | Teljesítés / könyvelés | Státusz | Párosítva | Ügyfél nézetben |
|---|---|---|---|---|---|---|
| TR-1001 | BE-CS, gyakoriság szerinti díj | +24 000 | 01.03. / 01.05. | Teljesült | DE-0101 | „Befizetés megérkezett (csekk)” |
| TR-1002 | BE-CS | +24 000 | 03.30. / 03.31. | Teljesült | DE-0102 | ua. |
| TR-1003 | BE-CS | +24 000 | 07.03. / 07.06. | Teljesült | DE-0103 (részben) | ua. |
| TR-1004 | BE-CS (duplikált import) | +24 000 | 07.03. / 07.06. | Stornózva | – | rejtett |
| TR-1005 | TE-ST, TR-1004 visszavezetése | −24 000 | – / 07.08. | Teljesült | – | rejtett |
| TR-1006 | BE-CS | +24 000 | 10.02. / 10.05. | Teljesült | DE-0104 (részben) | „Befizetés megérkezett (csekk)” |

**Események**: ES-DV 2026.07.01. indexálás 24 000 → 25 380 Ft (+5,75%) · ES-FS 1. szint 2026.07.16.
**Számított**: egyenleg **−2 760 Ft** · hátralék 2 760 Ft · hátralék kora 99 nap · felszólítási szint 1 · következő esedékesség 2027.01.01.

---

## 2. Nagy Péter – Otthonbiztosítás 30054321
Fejléc: 2040 Budaörs, Példa utca 3. · kezdet 2022.08.01. · évforduló 08.01. · havi · csoportos beszedés, lehívás 5-én, számla 11773016-12345678, ügyfél által megadott limit 6 500 Ft · aktuális díj **6 874 Ft** · állapot: **Élő**

**Díjelvárások**
| Id | Időszak | Elvárás | Befizetés | Határidő | Státusz | Ügyfél nézetben |
|---|---|---|---|---|---|---|
| DE-0201 | 2026.07. | 6 500 | 6 500 | 07.05. | Rendezett | „Júliusi díj – Kifizetve” |
| DE-0202 | 2026.08. | 6 874 *(díjváltozás, kerekítés +0,25)* | 6 874 | 08.05. | Rendezett | „Augusztusi díj – Kifizetve” |
| DE-0203 | 2026.09. | 6 874 | 6 874 | 09.05. | Rendezett | „Szeptemberi díj – Kifizetve” |
| DE-0204 | 2026.10. | 6 874 | 6 874 | 10.05. | Rendezett | „Októberi díj – Kifizetve” |
| DE-0205 | 2026.11. | 6 874 | 6 874 | 11.05. | Jövőbeni (előre rendezve) | „Közelgő: novemberi díj – Előre kifizetve” |
| DE-0206 | 2026.12. | 6 874 | 6 874 | 12.05. | Jövőbeni (előre rendezve) | „Közelgő: decemberi díj – Előre kifizetve” |

**Könyvelt tranzakciók**
| Id | Típus | Összeg | Teljesítés / könyvelés | Státusz | Párosítva | Ügyfél nézetben |
|---|---|---|---|---|---|---|
| TR-2001 | BE-CSB | +6 500 | 07.06. / 07.06. | Teljesült | DE-0201 | „Díjlehívás bankszámláról” |
| TR-2002 | BE-CSB-S | 0 (6 874) | 08.05. / 08.06. | Sikertelen – limittúllépés, banki kód 0412 (mock) | – | „Sikertelen díjlehívás – a díj meghaladta a bankjánál beállított összeghatárt” |
| TR-2003 | BE-UT, nem azonosított → párosítva 08.22. (cc.toth), közlemény „lakasbizt aug” | +6 874 | 08.20. / 08.22. | Teljesült | DE-0202 | „Befizetés megérkezett (átutalás)” |
| TR-2004 | BE-CSB | +6 874 | 09.07. / 09.07. | Teljesült | DE-0203 | „Díjlehívás bankszámláról” |
| TR-2005 | AK-BE, ÁK-2026-000318, a 30098765 casco-ról, kérelem KR-2026-01877 (09.29.), ok: túlfizetés áthelyezése ügyfél kérésére | +20 622 | 10.02. / 10.02. | Teljesült | DE-0204, -0205, -0206 | „Jóváírás a 30098765 sz. casco szerződésről” |

**Események**: ES-DV 2026.08.01. indexálás 6 500 → 6 874 Ft (+5,75%, 6 873,75 kerekítve).
**Számított**: egyenleg **+13 748 Ft** (novemberi és decemberi díj előre rendezve) · hátralék 0 · túlfizetés 0 (minden párosítva) · következő esedékesség 2027.01.05. (nincs lehívás 2026 végéig).

---

## 3. Kovács Anna – KGFB 30067890
Fejléc: ABC-123, Suzuki Vitara · kezdet 2024.01.01. · évforduló 01.01. · negyedéves · átutalás · díj 18 300 Ft (éves 73 200 Ft) · állapot: **Megszűnt** 2026.08.30., díjnemfizetés miatt

**Díjelvárások**
| Id | Időszak | Elvárás | Befizetés | Határidő | Státusz | Ügyfél nézetben |
|---|---|---|---|---|---|---|
| DE-0301 | 2026.01.01.–03.31. | 18 300 | 18 300 | 01.01. | Rendezett | „I. negyedéves díj – Kifizetve” |
| DE-0302 | 2026.04.01.–06.30. | 18 300 | 18 300 | 04.01. | Rendezett | „II. negyedéves díj – Kifizetve” |
| DE-0303 | 2026.07.01.–09.30. | 18 300 | 0 | 07.01. | Törölt – megszűnés miatt újraszámolva → DE-0304 | rejtett |
| DE-0304 | 2026.07.01.–08.30. (61/92 nap) | 12 134 *(kerekítés +0,30)* | 12 134 | 07.01. | Rendezett (késve) | „Díj a megszűnésig (07.01.–08.30.) – Kifizetve” |

**Könyvelt tranzakciók**
| Id | Típus | Összeg | Teljesítés / könyvelés | Státusz | Párosítva | Ügyfél nézetben |
|---|---|---|---|---|---|---|
| TR-3001 | BE-UT | +18 300 | 01.05. / 01.05. | Teljesült | DE-0301 | „Befizetés megérkezett (átutalás)” |
| TR-3002 | BE-UT | +18 300 | 04.03. / 04.03. | Teljesült | DE-0302 | ua. |
| TR-3003 | BE-UT (megszűnés után érkezett) | +18 300 | 10.06. / 10.07. | Teljesült | DE-0304: 12 134, maradék 6 166 túlfizetés | ua. |
| TR-3004 | KI-DV, irány: 11600006-87654321 | −6 166 | – / 10.07. | **Elszámolás alatt**, várható 2026.10.12. (3 munkanap) | – | „Díjvisszatérítés – feldolgozás alatt, várhatóan 2026.10.12-ig megérkezik” |

**Események**: ES-FS 1. szint 07.16. · ES-FS 2. szint 08.15. (határidő + 45 nap) · ES-AT 08.30. automata törlés díjnemfizetés miatt.
**Számított**: egyenleg **+6 166 Ft** (visszautalás folyamatban; utána 0) · hátralék 0.

---

## 4. Nagy Péter – Casco 30098765
Fejléc: XYZ-987, Škoda Octavia · kezdet 2025.06.01. · évforduló 06.01. · éves · átutalás · éves díj 248 400 Ft · állapot: **Megszűnt** 2026.09.15., gépjármű eladása miatt

**Díjelvárások**
| Id | Időszak | Elvárás | Befizetés | Határidő | Státusz | Ügyfél nézetben |
|---|---|---|---|---|---|---|
| DE-0401 | 2026.06.01.–2027.05.31. | 248 400 | – | 06.01. | Törölt – megszűnés miatt újraszámolva → DE-0402 | rejtett |
| DE-0402 | 2026.06.01.–09.15. (107/365 nap) | 72 819 *(kerekítés +0,37)* | 72 819 | 06.01. | Rendezett | „Díj a megszűnésig (06.01.–09.15.) – Kifizetve” |

**Könyvelt tranzakciók**
| Id | Típus | Összeg | Teljesítés / könyvelés | Státusz | Párosítva | Ügyfél nézetben |
|---|---|---|---|---|---|---|
| TR-4001 | AK-KD, kár K-2026-004512 (jégkár), ügyfél kérésére | +26 000 | 05.29. / 05.29. | Teljesült | DE-0402 | „Kárkifizetésből rendezett díj – kárszám: K-2026-004512” |
| TR-4002 | BE-UT | +222 400 | 05.30. / 06.01. | Teljesült | DE-0402: 46 819, maradék 175 581 túlfizetés | „Befizetés megérkezett (átutalás)” |
| TR-4003 | AK-KI, ÁK-2026-000318 → 30054321 lakás, kérelem KR-2026-01877 | −20 622 | 10.02. / 10.02. | Teljesült | – | „Áthelyezve a 30054321 sz. otthonbiztosításra” |
| TR-4004 | KI-DV, irány: 11773016-12345678, kérelem 10.05., Pénzügyi jóváhagyás csoport | −154 959 | – / 10.05. | **Engedélyezésre vár**, várható 2026.10.12. | – | „Díjvisszatérítés – jóváhagyás alatt. A nagyobb összegű kifizetéseket munkatársunk ellenőrzi. Várhatóan 2026.10.12-ig megérkezik.” |

**Események**: megszűnés 09.15. (gépjármű eladása) – nem díjnemfizetés, ezért nincs ES-AT.
**Számított**: egyenleg **+154 959 Ft** (visszautalásra vár; utána 0) · hátralék 0.

---

## Feltételezések
1. A díjelvárás határideje az időszak első napja (havi díjnál a hónap 5-e, a lehívás napja).
2. Státusz: **Lejárt**, ha a határidő elmúlt és van nyitott összeg; **Részben rendezett**, ha még nem járt le, de van részbefizetés.
3. KGFB automata törlés az esedékességtől számított **60. napon** (advanced nézetben „várható megszűnés” ebből számolódik).
4. Megszűnéskor az időszakra **napi arányos díj** jár, egész forintra kerekítve; az eredeti elvárás Törölt, helyette új elvárás jön létre.
5. Díjvisszautalás automata törlés után: **3 munkanap**; 100 000 Ft feletti kifizetés engedélyezése: **5 munkanap** (feltételezés).
6. Túlfizetés automatikusan a következő elvárás(ok)ra párosul; kérésre átkönyvelhető vagy visszautalható.
7. Felszólítás: 1. szint határidő + 15 nap, 2. szint + 45 nap.
8. Csoportos beszedés hétvégén a következő munkanapon teljesül; ha az elvárás már rendezett, nincs lehívás.
9. Banki visszatérési kódok, kárszámok, kérelemszámok, rögzítő-azonosítók mock értékek.
