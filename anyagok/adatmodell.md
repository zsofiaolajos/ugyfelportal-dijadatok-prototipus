# Adatmodell (A3 – jóváhagyva, 2026-10-08)

Döntések: díjváltozás = ES-DV esemény + `dijvaltozas` mező az elváráson; két dátum (könyvelés + teljesítés), ügyfél csak a teljesítést látja.

Négy tárolt entitás + számított mezők. A láthatóságot (ügyfél / advanced) az A4 lépés rögzíti.

```
Szerződés 1 ──< Díjelvárás >──┐
          1 ──< Tranzakció >──┴── Párosítás (melyik befizetés melyik elvárást mennyiből rendezte)
          1 ──< Esemény
Tranzakció ── Átkönyvelés-kapcsolat ── Tranzakció (másik szerződésen)
```

## 1. Szerződés
| Mező | Példa | Megjegyzés |
|---|---|---|
| szerzodesszam | 30012345 | |
| termek | LAKAS / KGFB / CASCO | |
| termekNev | Groupama Otthonbiztosítás | mock termékneveket használunk |
| szerzodo | Kovács Anna | mock |
| biztositottTargy | 1111 Budapest, Minta u. 1. / ABC-123 | lakás: cím, gépjármű: rendszám |
| kockazatviselesKezdete | 2024.03.01. | |
| evforduló | 03.01. | |
| dijfizetesiGyakorisag | havi / negyedéves / féléves / éves | |
| dijfizetesiMod | csoportos beszedés / átutalás / csekk / kártya | |
| lehivasiBankszamla | 11773016-12345678 | csoportos beszedésnél |
| aktualisDij | 8 460 Ft | gyakoriság szerinti díj |
| evesDij | 33 840 Ft | |
| allapot | Élő / Díjrendezetlen / Megszűnt | |
| megszunesDatuma, megszunesOka | 2026.09.30., díjnemfizetés | csak megszűnt szerződésnél |

## 2. Díjelvárás („Jövőbeni díjadatok”)
| Mező | Példa | Megjegyzés |
|---|---|---|
| id | DE-000981 | belső azonosító |
| tipusKod | DE-RD / DE-TD / DE-PD | katalógus szerint |
| idoszak | 2026.09.08.–2026.10.08. | |
| elvaras | 15 460 Ft | |
| befizetes | 0 Ft | **számított** a párosításokból |
| hatarido | 2026.10.08. | |
| statusz | Jövőbeni / Élő / Lejárt / Részben rendezett / Rendezett / Törölt | **számított** (kivéve Törölt) a határidő + befizetés alapján |
| dijvaltozas | {regiDij, ujDij, ok: indexálás / bonus-malus, merteke %} | csak ha ebben az időszakban változott a díj |
| kerekites | +0,25 Ft | számított díj (pl. indexált vagy időarányos) egész Ft-ra kerekítése (A5 kiegészítés) |
| torlesOka, helyettesitoElvaras | megszűnés miatt újraszámolva → DE-0304 | Törölt elvárásnál (A5 kiegészítés) |

## 3. Tranzakció („Könyvelt tranzakciók”)
| Mező | Példa | Megjegyzés |
|---|---|---|
| id | TR-2026-0004417 | belső azonosító |
| tipusKod | BE-CS / KI-DV / AK-KD / TE-KR … | katalógus szerint |
| irany | jóváírás (+) / terhelés (−) | az egyenlegre gyakorolt hatás |
| osszeg | 15 460 Ft | könyvelt összeg |
| kerekites | −0,40 Ft | kerekítési különbözet |
| konyvelesDatuma | 2026.03.25. | mikor könyveltük |
| teljesitesDatuma | 2026.03.24. | „Teljesítés dátuma” (értéknap) |
| statusz | Teljesült / Elszámolás alatt / Engedélyezésre vár / Utalás folyamatban / Sikertelen / Stornózva | |
| varhatoTeljesites | 2026.03.27. | nem teljesült kifizetésnél; automata törlésnél + 3 munkanap |
| kifizetesIranya | 12345678-12345678 / K-2026-004512 | bankszámla, ill. kárszám / célszerződés |
| jogcim | gyakoriság szerinti díj / eseti díj / töredékdíj | befizetésnél |
| fizetesiMod | csoportos beszedés / átutalás / csekk / kártya | befizetésnél |
| kozlemeny | 30012345 | befizetésnél |
| sikertelenseg | {ok: limittúllépés, bankiKod: „MS03”, ugyfelSzoveg} | sikertelen díjlehívásnál |
| engedelyezes | {kerelemDatuma, felelosCsoport, hatarertek: 100 000 Ft} | 100 000 Ft feletti kifizetésnél |
| atkonyveles | {azonosito: ÁK-2026-000318, parSzerzodes, parTranzakcio, ok, kerelemszam} | AK-* tételeknél |
| stornozottTetel | TR-2026-0003120 | storno tételnél: mit vezet vissza |
| azonositas | {nemAzonositott: true, parositva: 2026.08.22., parositotta: „cc.toth”} | TE-NA: nem azonosított befizetés utólagos párosítása (A5 kiegészítés) |
| rogzito, megjegyzes | „cc.kiss”, „ügyfél telefonos kérése” | |

## 4. Párosítás
| Mező | Példa |
|---|---|
| tranzakcioId | TR-2026-0004417 |
| elvarasId | DE-000981 |
| osszeg | 8 460 Ft |

Ez adja az advanced „Párosítás” nézetet, és ebből számolódik az elvárások befizetése/státusza (részleges rendezés, túlfizetés).

## 5. Esemény (nem pénzmozgás)
| Mező | Példa |
|---|---|
| tipusKod | ES-FS / ES-AT / ES-DV |
| datum | 2026.09.15. |
| reszletek | {szint: 2} / {regiDij, ujDij} |

## Számított mezők (szerződés szinten)
- **egyenleg** = Σ jóváírás − Σ terhelés (teljesült tételek)
- **hatralek** = Σ (elvárás − befizetés) a lejárt elvárásokon
- **hatralekKora** = napok a legrégebbi lejárt határidő óta
- **tulfizetes** = pozitív egyenleg, ami nincs elvárásra párosítva
- **kovetkezoEsedekesseg** = legközelebbi Élő/Jövőbeni elvárás
- **varhatoMegszunes** = legrégebbi lejárt határidő + 60 nap (feltételezés)
- **felszolitasiSzint** = legutóbbi ES-FS szintje
