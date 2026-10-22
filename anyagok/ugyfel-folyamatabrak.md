# Díjadatok – ügyfél nézet: felhasználói utak

Az ábrák a prototípus **ügyfél nézetét** mutatják be a 4 tesztforgatókönyvön keresztül: mit lát az ügyfél, hova kattint, milyen magyarázatot kap, és hogyan jut el a válaszig CC-hívás nélkül.
A szövegek a prototípusban megjelenő szövegek; a prototípus „mai napja” 2026. 10. 08.

**Jelmagyarázat**

| Szín | Jelentés |
|---|---|
| szürke, szaggatott | a prototípuson kívüli lépés (Ügyfél Portál) |
| sárga | figyelmeztetés (nem rendezett díj) |
| kék | folyamatban lévő tétel (visszatérítés) |
| zöld | rendezett állapot |
| piros | sikertelen tétel |
| lila háttér | kibontott tétel – köznyelvi magyarázat |
| piros szaggatott | háttéradat, amely **nem** jelenik meg az ügyfélnek (csak az ügyintézői nézetben) |
| sötétzöld / sötétkék | kimenet: kérdés megválaszolva / önálló teendő |

---

## 0. Áttekintés – a Díjadatok oldal általános útja

Az állapotsor mindig egyetlen üzenetet mutat, ebben a sorrendben: **nem rendezett díj → folyamatban lévő visszatérítés → előrefizetés → rendezett**.

```mermaid
flowchart TD
  start(["Ügyfél belép az Ügyfél Portálra"]):::outside --> list["Szerződéseim"]:::outside
  list --> pick["Szerződés kiválasztása"]:::outside
  pick --> menu["„Díjadatok” menüpont"]
  menu --> status{"Állapotsor<br/>„Rendben vagyok?”"}

  status -->|"lejárt, nem rendezett díj"| s1["⚠ Nem rendezett díj: X Ft<br/>N díjrészlet nincs teljesen kifizetve"]:::warn
  status -->|"folyamatban lévő visszatérítés"| s2["ℹ Visszatérítés folyamatban / jóváhagyás alatt<br/>összeg és várható érkezés"]:::info
  status -->|"előre fizetett díj"| s3["✓ Rendezett<br/>előre kifizetve …-ig"]:::ok
  status -->|"minden rendben"| s4["✓ Rendezett<br/>következő díj: összeg, esedékesség"]:::ok

  s1 --> header
  s2 --> header
  s3 --> header
  s4 --> header
  header["Szerződés fő adatai<br/>biztosított tárgy · díjfizetés módja · aktuális díj"]
  header -.->|"igény szerint"| more["További szerződésadatok"]
  header --> tl["Idővonal<br/>Közelgő díjak + havi bontás, legújabb elöl"]
  tl --> q{"Érthető a tétel<br/>önmagában?"}
  q -->|"igen"| done(["Kérdés megválaszolva<br/>CC-hívás nélkül"]):::result
  q -->|"nem"| expand["Tételre kattint<br/>köznyelvi magyarázat + adatok"]:::expl
  expand --> act{"Van teendője?"}
  act -->|"nincs"| done
  act -->|"van"| todo(["Önálló teendő<br/>pl. új díjösszeg befizetése, banki limit emelése"]):::action
  expand -.->|"átkönyvelésnél"| link["Link a kapcsolt szerződés díjadataira"]
  link -.-> menu

  classDef outside fill:#f0f2f5,stroke:#9aa5b1,color:#4a545e,stroke-dasharray:4 3
  classDef warn fill:#fff4d6,stroke:#c08a00,color:#5c3d00
  classDef info fill:#eef0f8,stroke:#283168,color:#283168
  classDef ok fill:#e6f7f1,stroke:#00875f,color:#00573d
  classDef expl fill:#f3f0fb,stroke:#7c6bb0,color:#30373d
  classDef result fill:#00875f,stroke:#00875f,color:#ffffff
  classDef action fill:#283168,stroke:#283168,color:#ffffff
```

---

## 1. Kovács Anna – Otthonbiztosítás (30012345): régi csekk indexálás után

**Kiinduló kérdés:** „Mindig befizetem a csekket, miért van elmaradásom?”
**Kiváltott CC-hívás:** a díjelmaradás oka (indexálás után a régi csekk összegét fizette).

```mermaid
flowchart TD
  q(["Kovács Anna kérdése:<br/>„Mindig befizetem a csekket,<br/>miért van elmaradásom?”"]):::question
  q --> open["Díjadatok megnyitása<br/>Otthonbiztosítás · 30012345"]
  open --> st["⚠ Nem rendezett díj: 2 760 Ft<br/>2 díjrészlet nincs teljesen kifizetve.<br/>A részleteket lent, az idővonalon találja."]:::warn
  st --> hd["Szerződés fő adatai<br/>Díjfizetés módja: postai csekk<br/>Aktuális díj: 25 380 Ft / negyedév"]
  hd --> tl

  subgraph tl["Idővonal"]
    direction TB
    up["KÖZELGŐ · I. negyedéves díj<br/>2027. január 1. · 25 380 Ft"]:::item
    o1["OKTÓBER 2. · Befizetés megérkezett (csekk)<br/>+24 000 Ft"]:::item
    o2["OKTÓBER 1. · IV. negyedéves díj<br/>25 380 Ft · ⚠ Nem rendezett"]:::warn
    j1["JÚLIUS 16. · Fizetési emlékeztetőt küldtünk"]:::item
    j2["JÚLIUS 3. · Befizetés megérkezett (csekk)<br/>+24 000 Ft"]:::item
    j3["JÚLIUS 1. · III. negyedéves díj<br/>25 380 Ft · ⚠ Nem rendezett"]:::warn
    j4["JÚLIUS 1. · Díjváltozás (indexálás)<br/>24 000 Ft → 25 380 Ft"]:::item
    old["ÁPRILIS – JANUÁR<br/>I–II. negyedéves díj · ✓ Kifizetve"]:::item
    up --> o1 --> o2 --> j1 --> j2 --> j3 --> j4 --> old
  end

  o2 -->|"kattint"| e1["Ebből 24 000 Ft érkezett be, 1 380 Ft még hiányzik.<br/>A díj 24 000 Ft-ról 25 380 Ft-ra változott (indexálás),<br/>a befizetés még a korábbi összegnek felelt meg.<br/>Kérjük, a jövőben az új összeget fizesse be.<br/>─<br/>Díj: 25 380 Ft · Befizetve: 24 000 Ft · Hiányzik: 1 380 Ft"]:::expl
  j4 -->|"kattint"| e2["2026. július 1-jén a díj indexálás miatt<br/>5,75%-kal változott: 24 000 Ft helyett 25 380 Ft.<br/>Ha csekkel fizet, kérjük, már az új összeget fizesse be."]:::expl
  o1 -->|"kattint"| e3["Ezzel rendeztük: IV. negyedéves díj.<br/>Fizetési mód: postai csekk · Jogcím: rendszeres díj"]:::expl

  e1 --> aha{"Felismeri:<br/>a régi csekket használta"}
  e2 --> aha
  aha --> res(["Befizeti a hiányzó 2 × 1 380 Ft-ot,<br/>a jövőben 25 380 Ft-ot fizet<br/>→ nincs CC-hívás"]):::result

  subgraph hidden["Nem jelenik meg az ügyfélnek"]
    direction TB
    h1["Duplikált csekkimport és stornója<br/>– csak a helyes befizetés látszik"]:::hidden
    h2["Felszólítási szint (1.)<br/>és hátralék kora (99 nap)"]:::hidden
  end
  st ~~~ hidden
  style tl fill:#fafafc,stroke:#dae1e9,color:#283168
  style hidden fill:#fff8f7,stroke:#c0392b,color:#7a2a20,stroke-dasharray:5 4

  classDef question fill:#ffffff,stroke:#283168,color:#283168,stroke-width:2px
  classDef warn fill:#fff4d6,stroke:#c08a00,color:#5c3d00
  classDef item fill:#ffffff,stroke:#dae1e9,color:#30373d
  classDef expl fill:#f3f0fb,stroke:#7c6bb0,color:#30373d
  classDef hidden fill:#ffffff,stroke:#c0392b,color:#7a2a20,stroke-dasharray:5 4
  classDef result fill:#00875f,stroke:#00875f,color:#ffffff
```

---

## 2. Nagy Péter – Otthonbiztosítás (30054321): sikertelen lehívás és bejövő átkönyvelés

**Kiinduló kérdés:** „Augusztusban sikertelen volt a díjlehívás – rendben vagyok? És mi ez a jóváírás?”
**Kiváltott CC-hívás:** a sikertelen lehívás oka; egy ismeretlen jóváírás eredete.

```mermaid
flowchart TD
  q(["Nagy Péter kérdése:<br/>„Sikertelen volt a díjlehívás – rendben vagyok?<br/>És mi ez a jóváírás?”"]):::question
  q --> open["Díjadatok megnyitása<br/>Otthonbiztosítás · 30054321"]
  open --> st["✓ Rendezett<br/>A díjat 2026. december 31-ig előre kifizette."]:::ok
  st --> hd["Szerződés fő adatai<br/>Díjfizetés módja: csoportos beszedés<br/>Aktuális díj: 6 874 Ft / hó"]
  hd --> tl

  subgraph tl["Idővonal"]
    direction TB
    u1["KÖZELGŐ · Novemberi díj · 6 874 Ft<br/>✓ Előre kifizetve"]:::ok
    u2["KÖZELGŐ · Decemberi díj · 6 874 Ft<br/>✓ Előre kifizetve"]:::ok
    o1["OKTÓBER 5. · Októberi díj · 6 874 Ft<br/>✓ Kifizetve"]:::item
    o2["OKTÓBER 2. · Jóváírás a Casco (30098765)<br/>szerződésről · +20 622 Ft"]:::item
    s1["SZEPTEMBER 7. · Díjlehívás bankszámláról<br/>+6 874 Ft"]:::item
    a1["AUGUSZTUS 20. · Befizetés megérkezett (átutalás)<br/>+6 874 Ft"]:::item
    a2["AUGUSZTUS 5. · ✕ Sikertelen díjlehívás<br/>6 874 Ft (áthúzva)"]:::fail
    a3["AUGUSZTUS 1. · Díjváltozás (indexálás)<br/>6 500 Ft → 6 874 Ft"]:::item
    u1 --> u2 --> o1 --> o2 --> s1 --> a1 --> a2 --> a3
  end

  o2 -->|"kattint"| e1["Az Ön kérésére a Casco (30098765) szerződés<br/>túlfizetését áthelyeztük erre a szerződésre.<br/>Ezzel rendeztük: Októberi, Novemberi, Decemberi díj.<br/>─<br/>Hivatkozási szám: ÁK-2026-000318"]:::expl
  e1 -->|"Casco (30098765) díjadatai →"| sc4(["4. forgatókönyv:<br/>a forrásszerződés díjadatai"]):::link

  a2 -->|"kattint"| e2["A bank a díjlehívást nem teljesítette.<br/>A díj meghaladta a bankjánál beállított összeghatárt.<br/>Augusztusi díj azóta rendeződött, nincs teendője.<br/>─<br/>Lehívott összeg: 6 874 Ft · Bankszámla: 11773016-12345678"]:::expl
  a3 -->|"kattint"| e3["2026. augusztus 1-jén a díj indexálás miatt<br/>5,75%-kal változott: 6 500 Ft helyett 6 874 Ft.<br/>Ha a bankjánál összeghatárt állított be a díjlehívásra,<br/>ellenőrizze, hogy az új díj belefér-e."]:::expl

  e1 --> res1(["Érti a jóváírás eredetét<br/>→ nincs CC-hívás"]):::result
  e2 --> aha{"Felismeri: a banki limit<br/>alacsonyabb az új díjnál"}
  e3 --> aha
  aha --> res2(["Megemeli a banki limitet<br/>(önálló teendő a bankjánál)<br/>→ nincs CC-hívás"]):::action

  subgraph hidden["Nem jelenik meg az ügyfélnek"]
    direction TB
    h1["Banki visszatérési kód (0412)<br/>és a belső ok-kód („limittúllépés”)"]:::hidden
    h2["Az augusztusi átutalás közlemény nélkül érkezett,<br/>utólag párosították (párosító munkatárs)"]:::hidden
    h3["Kerekítés: 6 873,75 Ft → 6 874 Ft"]:::hidden
  end
  st ~~~ hidden
  style tl fill:#fafafc,stroke:#dae1e9,color:#283168
  style hidden fill:#fff8f7,stroke:#c0392b,color:#7a2a20,stroke-dasharray:5 4

  classDef question fill:#ffffff,stroke:#283168,color:#283168,stroke-width:2px
  classDef ok fill:#e6f7f1,stroke:#00875f,color:#00573d
  classDef fail fill:#fdecea,stroke:#c0392b,color:#7a2a20
  classDef item fill:#ffffff,stroke:#dae1e9,color:#30373d
  classDef expl fill:#f3f0fb,stroke:#7c6bb0,color:#30373d
  classDef hidden fill:#ffffff,stroke:#c0392b,color:#7a2a20,stroke-dasharray:5 4
  classDef result fill:#00875f,stroke:#00875f,color:#ffffff
  classDef action fill:#283168,stroke:#283168,color:#ffffff
  classDef link fill:#e3f4f8,stroke:#0b7285,color:#0b5563
```

---

## 3. Kovács Anna – KGFB (30067890): automata törlés, visszautalás folyamatban

**Kiinduló kérdés:** „Megszűnt a KGFB-m, de befizettem a díjat – hol a pénzem?”
**Kiváltott CC-hívás:** mennyi jár vissza, mikor és hova érkezik (automata törlés után napokig „ott áll” az összeg).

```mermaid
flowchart TD
  q(["Kovács Anna kérdése:<br/>„Megszűnt a KGFB-m, de befizettem a díjat –<br/>hol a pénzem?”"]):::question
  q --> open["Díjadatok megnyitása<br/>Kötelező gépjármű-felelősségbiztosítás · 30067890"]
  open --> st["ℹ Visszatérítés folyamatban: 6 166 Ft<br/>Várhatóan 2026. október 12-ig<br/>megérkezik a bankszámlájára."]:::info
  st --> hd["Szerződés fő adatai<br/>Gépjármű: ABC-123 · Suzuki Vitara<br/>Megszűnés: 2026. 08. 30. – díjnemfizetés"]
  hd --> tl

  subgraph tl["Idővonal"]
    direction TB
    o1["OKTÓBER 7. · Díjvisszatérítés a bankszámlájára<br/>−6 166 Ft · ℹ Feldolgozás alatt"]:::info
    o2["OKTÓBER 6. · Befizetés megérkezett (átutalás)<br/>+18 300 Ft"]:::item
    a1["AUGUSZTUS 30. · A szerződés díjnemfizetés<br/>miatt megszűnt"]:::item
    a2["AUGUSZTUS 15. · Fizetési emlékeztetőt küldtünk"]:::item
    j1["JÚLIUS 16. · Fizetési emlékeztetőt küldtünk"]:::item
    j2["JÚLIUS 1. · Díj a megszűnésig<br/>12 134 Ft · ✓ Kifizetve"]:::ok
    old["ÁPRILIS – JANUÁR<br/>I–II. negyedéves díj · ✓ Kifizetve"]:::item
    o1 --> o2 --> a1 --> a2 --> j1 --> j2 --> old
  end

  o1 -->|"kattint"| e1["A túlfizetést visszautaljuk a bankszámlájára.<br/>Az elszámolás néhány munkanapot vesz igénybe.<br/>─<br/>Bankszámla: 11600006-87654321<br/>Várható érkezés: 2026. október 12."]:::expl
  o2 -->|"kattint"| e2["Ezzel rendeztük: Díj a megszűnésig.<br/>A fennmaradó 6 166 Ft túlfizetés lett –<br/>lásd a visszatérítést."]:::expl
  j2 -->|"kattint"| e3["A szerződés 2026. augusztus 30-án megszűnt,<br/>ezért csak a megszűnésig tartó időszak díját<br/>kell megfizetni.<br/>─<br/>Időszak: 2026. július 1. – augusztus 30.<br/>Díj: 12 134 Ft · Befizetve: 12 134 Ft"]:::expl

  e2 --> calc["Az ügyfél a tételekből összerakja:<br/>18 300 Ft befizetés<br/>− 12 134 Ft díj a megszűnésig<br/>= 6 166 Ft visszajár"]:::calc
  e3 --> calc
  e1 --> wait{"Megérkezett<br/>október 12-ig?"}
  calc --> wait
  wait -->|"igen"| res(["Tudja, mennyit, mikor és hova kap<br/>→ nincs CC-hívás"]):::result
  wait -->|"nem"| cc(["CC-hez fordul<br/>(ügyintézői nézet – D szakasz)"]):::outside

  subgraph hidden["Nem jelenik meg az ügyfélnek"]
    direction TB
    h1["Az eredeti III. negyedéves díj (18 300 Ft)<br/>– törölve, megszűnés miatt újraszámolva"]:::hidden
    h2["Időarányos díj kerekítése (+0,30 Ft)"]:::hidden
    h3["Felszólítási szintek (1., 2.)<br/>és a 3 munkanapos visszautalási szabály"]:::hidden
  end
  st ~~~ hidden
  style tl fill:#fafafc,stroke:#dae1e9,color:#283168
  style hidden fill:#fff8f7,stroke:#c0392b,color:#7a2a20,stroke-dasharray:5 4

  classDef question fill:#ffffff,stroke:#283168,color:#283168,stroke-width:2px
  classDef info fill:#eef0f8,stroke:#283168,color:#283168
  classDef ok fill:#e6f7f1,stroke:#00875f,color:#00573d
  classDef item fill:#ffffff,stroke:#dae1e9,color:#30373d
  classDef expl fill:#f3f0fb,stroke:#7c6bb0,color:#30373d
  classDef calc fill:#fafafc,stroke:#4a545e,color:#30373d,stroke-dasharray:2 2
  classDef hidden fill:#ffffff,stroke:#c0392b,color:#7a2a20,stroke-dasharray:5 4
  classDef result fill:#00875f,stroke:#00875f,color:#ffffff
  classDef outside fill:#f0f2f5,stroke:#9aa5b1,color:#4a545e,stroke-dasharray:4 3
```

---

## 4. Nagy Péter – Casco (30098765): megszűnés, kárból díjra, átkönyvelés, jóváhagyás alatt álló visszatérítés

**Kiinduló kérdés:** „Eladtam az autót – mennyi jár vissza és mikor kapom meg?”
**Kiváltott CC-hívás:** a visszajáró összeg levezetése; miért nem érkezett még meg (100 000 Ft feletti kifizetés jóváhagyása).

```mermaid
flowchart TD
  q(["Nagy Péter kérdése:<br/>„Eladtam az autót – mennyi jár vissza<br/>és mikor kapom meg?”"]):::question
  q --> open["Díjadatok megnyitása<br/>Casco · 30098765"]
  open --> st["ℹ Visszatérítés jóváhagyás alatt: 154 959 Ft<br/>A nagyobb összegű kifizetéseket munkatársunk ellenőrzi.<br/>Várhatóan 2026. október 12-ig megérkezik."]:::info
  st --> hd["Szerződés fő adatai<br/>Gépjármű: XYZ-987 · Škoda Octavia<br/>Megszűnés: 2026. 09. 15. – gépjármű eladása"]
  hd --> tl

  subgraph tl["Idővonal"]
    direction TB
    o1["OKTÓBER 5. · Díjvisszatérítés a bankszámlájára<br/>−154 959 Ft · ℹ Jóváhagyás alatt"]:::info
    o2["OKTÓBER 2. · Áthelyezve az Otthonbiztosítás<br/>(30054321) szerződésre · −20 622 Ft"]:::item
    j1["JÚNIUS 1. · Díj a megszűnésig<br/>72 819 Ft · ✓ Kifizetve"]:::ok
    m1["MÁJUS 30. · Befizetés megérkezett (átutalás)<br/>+222 400 Ft"]:::item
    m2["MÁJUS 29. · Kárkifizetésből rendezett díj<br/>+26 000 Ft"]:::item
    o1 --> o2 --> j1 --> m1 --> m2
  end

  o1 -->|"kattint"| e1["A túlfizetést visszautaljuk. A nagyobb összegű<br/>kifizetéseket munkatársunk ellenőrzi,<br/>utána indítjuk az utalást.<br/>─<br/>Bankszámla: 11773016-12345678<br/>Várható érkezés: 2026. október 12."]:::expl
  o2 -->|"kattint"| e2["Az Ön kérésére ennek a szerződésnek a túlfizetéséből<br/>20 622 Ft-ot áthelyeztünk az Otthonbiztosítás<br/>(30054321) szerződésre.<br/>─<br/>Hivatkozási szám: ÁK-2026-000318"]:::expl
  e2 -->|"Otthonbiztosítás (30054321) díjadatai →"| sc2(["2. forgatókönyv:<br/>a célszerződés díjadatai"]):::link
  j1 -->|"kattint"| e3["A szerződés 2026. szeptember 15-én megszűnt,<br/>ezért csak a megszűnésig tartó időszak díját kell megfizetni.<br/>Rendezte: Kárkifizetésből – 26 000 Ft;<br/>Befizetés (átutalás) – 46 819 Ft."]:::expl
  m1 -->|"kattint"| e4["Ezzel rendeztük: Díj a megszűnésig.<br/>A fennmaradó 175 581 Ft túlfizetés lett."]:::expl
  m2 -->|"kattint"| e5["Az Ön kérésére a kárkifizetés egy részét<br/>a díj rendezésére fordítottuk.<br/>─<br/>Kárszám: K-2026-004512"]:::expl

  e3 --> calc["Az ügyfél a tételekből összerakja:<br/>26 000 + 222 400 = 248 400 Ft befizetve<br/>− 72 819 Ft díj a megszűnésig<br/>= 175 581 Ft túlfizetés<br/>− 20 622 Ft áthelyezés a lakásbiztosításra<br/>= 154 959 Ft visszatérítés"]:::calc
  e4 --> calc
  e5 --> calc
  e2 --> calc
  calc --> res(["Érti az összeget és a határidőt<br/>→ nincs CC-hívás"]):::result
  e1 --> res

  subgraph hidden["Nem jelenik meg az ügyfélnek"]
    direction TB
    h1["100 000 Ft-os engedélyezési határ<br/>és a jóváhagyó csoport neve"]:::hidden
    h2["Az eredeti éves díj (248 400 Ft)<br/>– törölve, megszűnés miatt újraszámolva"]:::hidden
    h3["Időarányos díj kerekítése (+0,37 Ft)<br/>és a kár leírása"]:::hidden
  end
  st ~~~ hidden
  style tl fill:#fafafc,stroke:#dae1e9,color:#283168
  style hidden fill:#fff8f7,stroke:#c0392b,color:#7a2a20,stroke-dasharray:5 4

  classDef question fill:#ffffff,stroke:#283168,color:#283168,stroke-width:2px
  classDef info fill:#eef0f8,stroke:#283168,color:#283168
  classDef ok fill:#e6f7f1,stroke:#00875f,color:#00573d
  classDef item fill:#ffffff,stroke:#dae1e9,color:#30373d
  classDef expl fill:#f3f0fb,stroke:#7c6bb0,color:#30373d
  classDef calc fill:#fafafc,stroke:#4a545e,color:#30373d,stroke-dasharray:2 2
  classDef hidden fill:#ffffff,stroke:#c0392b,color:#7a2a20,stroke-dasharray:5 4
  classDef result fill:#00875f,stroke:#00875f,color:#ffffff
  classDef link fill:#e3f4f8,stroke:#0b7285,color:#0b5563
```

---

## Összefoglaló – mely CC-kérdéseket válaszolja meg a felület

| # | Ügyfélkérdés | Hol kapja meg a választ | Kimenet |
|---|---|---|---|
| 1 | Miért van elmaradásom, ha mindig fizetek? | Állapotsor → nem rendezett díj kibontása → díjváltozás | befizeti a különbözetet, új összeggel fizet |
| 2 | Miért volt sikertelen a lehívás? Mi ez a jóváírás? | Sikertelen lehívás kibontása; átkönyvelés kibontása + link | banki limitet emel; érti a jóváírást |
| 3 | Megszűnt a szerződés – hol a pénzem? | Állapotsor (összeg + dátum) → visszatérítés kibontása | megvárja a jelzett dátumot |
| 4 | Mennyi jár vissza és mikor? | Állapotsor → díj a megszűnésig, befizetés, átkönyvelés kibontása | érti a levezetést és a határidőt |

**Megfigyelés a teszteléshez:** a 3. és 4. forgatókönyvben a visszajáró összeg **levezetését** az ügyfélnek több tételből kell összeraknia (szaggatott „összerakja” csomópont). Felhasználói teszten érdemes mérni, hogy ez megy-e segítség nélkül. Ha nem, egy „Hogyan jött ki ez az összeg?” magyarázat a visszatérítés tételénél csökkentheti a hívásokat.
