# Ügyfél Portál – Díjadatok prototípus

Kattintható prototípus, amely egy biztosítási szerződés folyószámláját (befizetések, kifizetések, díjelőírások, díjhátralék, speciális könyvelések) mutatja be két nézetben:

- **Ügyfél nézet** – egyszerű, kognitív terhelés nélküli: állapotsor („Rendben vagyok?”), idővonal, kattintásra köznyelvi magyarázat.
- **Ügyintézői nézet** (callcenter, tanácsadó) – a gyakori díjkérdések egy helyen: összesítő, főkönyvi tételtábla, kerekítés, kódok, storno, függő kifizetések.

> **Gyakorló projekt** egy AI képzés keretében. Nem hivatalos Groupama-anyag; az arculati elemek a groupama.hu nyilvános oldaláról származnak, minden név, szerződésszám, bankszámla és összeg **kitalált mintaadat**.

## Futtatás helyben

Előfeltétel: Node.js 24 LTS.

```bash
cd prototipus
npm install
npm run dev      # fejlesztői szerver: http://localhost:5173
npm test         # egységtesztek (Vitest)
npm run build    # statikus build a dist/ mappába
```

A **demósávban** (az oldal tetején) lehet forgatókönyvet és nézetet váltani. Minden állapot linkelhető, pl.
`#/szerzodes/30098765/dijadatok?szerep=advanced`.

## Forgatókönyvek

| # | Szerződés | Mit mutat be |
|---|---|---|
| 1 | Kovács Anna – Otthon (30012345) | indexálás után régi csekkel fizetett → díjelmaradás |
| 2 | Nagy Péter – Otthon (30054321) | sikertelen díjlehívás (limittúllépés), bejövő átkönyvelés |
| 3 | Kovács Anna – KGFB (30067890) | automata törlés, visszautalás elszámolás alatt |
| 4 | Nagy Péter – Casco (30098765) | megszűnés, kárból díjra, átkönyvelés, engedélyezésre váró visszautalás |

A prototípus „mai napja”: 2026. 10. 08.

## Mappaszerkezet

```
anyagok/        tételtípus-katalógus, adatmodell, láthatósági mátrix, mintaadat,
                folyamatábrák (Mermaid; mermaid/ alatt draw.io-ba másolható .mmd fájlok)
prototipus/     React + Vite + TypeScript alkalmazás
  src/data/       mockadat (szerződések, tételek)
  src/domain/     számítások, láthatósági szabályok (visibility.ts), nézetmodellek + tesztek
  src/components/ felületi elemek
prezentacio/    a folyamatot bemutató prezentáció (.pptx) és a generáló szkript
```

## Állapot

| Szakasz | Tartalom | Állapot |
|---|---|---|
| A | Tartalom és szabályok (kód nélkül) | kész |
| B | Alapok: projekt, arculat, adatréteg, demósáv | kész |
| C | Ügyfél nézet: állapotsor, idővonal, magyarázatok, mobil | kész |
| D | Ügyintézői nézet: összesítő (D1), tételtábla (D2), szűrés/keresés/rendezés/CSV-export (D3) kész; párosítás, speciális könyvelések, gyors válaszok (D4–D6) | folyamatban |
| E | Teljes végigkattintás, tesztforgatókönyvek, bemutató | hátra van |
