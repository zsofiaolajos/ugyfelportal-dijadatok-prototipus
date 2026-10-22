// Prezentáció: AI-val támogatott prototípus-készítés – Ügyfél Portál Díjadatok (gyakorló projekt)
const path = require('path')
const pptxgen = require('pptxgenjs')
const sharp = require('sharp')
const React = require('react')
const RDS = require('react-dom/server')
const fi = require('react-icons/fi')
const { applyTheme } = require('./apply_theme.js')

const OUT = process.argv[2] || path.join(__dirname, 'deck.pptx')
const IMG = (f) => path.join(__dirname, 'img', f)

// Groupama-arculat (groupama.hu nyilvános oldaláról kinyert értékek)
const NAVY = '283168'
const GREEN = '45C396'
const GREEN_DK = '00875F'
const TEAL = '00B08A'
const YELLOW = 'FFD36F'
const TEXT = '30373D'
const TEXT2 = '4A545E'
const MUTED = '6C7B8A'
const LINE = 'DAE1E9'
const BG = 'FAFAFC'
const BG_ALT = 'F3F3F9'
const OK_BG = 'E6F7F1'
const WARN_BG = 'FFF4D6'
const WARN = '8A5A00'
const RED = 'C0392B'
const RED_BG = 'FDECEA'
const WHITE = 'FFFFFF'

const HEAD = 'Century Gothic'
const BODY = 'Calibri'

const THEME = {
  name: 'Groupama prezentáció',
  headFontFace: HEAD,
  bodyFontFace: BODY,
  colors: {
    dk1: TEXT, lt1: WHITE, dk2: NAVY, lt2: BG_ALT,
    accent1: GREEN, accent2: NAVY, accent3: TEAL, accent4: YELLOW, accent5: RED, accent6: MUTED,
    hlink: TEAL, folHlink: NAVY,
  },
}

// ---------- segédek ----------

async function icon(Comp, color, size = 256) {
  const svg = RDS.renderToStaticMarkup(React.createElement(Comp, { size: String(size) }))
    .replace(/currentColor/g, '#' + color)
  const buf = await sharp(Buffer.from(svg)).png().toBuffer()
  return 'image/png;base64,' + buf.toString('base64')
}

// A prototípus egyszerű márkajele (navy/zöld osztott négyzet) – nem a hivatalos logó.
async function brandMark() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 28 28">
    <defs><clipPath id="c"><rect width="28" height="28" rx="6"/></clipPath></defs>
    <g clip-path="url(#c)"><rect width="28" height="28" fill="#${GREEN}"/><polygon points="0,0 28,0 28,9 0,17" fill="#${NAVY}"/></g></svg>`
  const buf = await sharp(Buffer.from(svg)).png().toBuffer()
  return 'image/png;base64,' + buf.toString('base64')
}
async function brandMarkOnDark() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 28 28">
    <defs><clipPath id="c"><rect width="28" height="28" rx="6"/></clipPath></defs>
    <g clip-path="url(#c)"><rect width="28" height="28" fill="#${GREEN}"/><polygon points="0,0 28,0 28,9 0,17" fill="#FFFFFF"/></g></svg>`
  const buf = await sharp(Buffer.from(svg)).png().toBuffer()
  return 'image/png;base64,' + buf.toString('base64')
}

async function aspect(file) {
  const m = await sharp(file).metadata()
  return m.width / m.height
}

function iconCircle(slide, data, x, y, d, bg, name) {
  slide.addShape('ellipse', { x, y, w: d, h: d, fill: { color: bg }, line: { color: bg }, objectName: name + ' kör' })
  const p = d * 0.25
  slide.addImage({ data, x: x + p, y: y + p, w: d - 2 * p, h: d - 2 * p, objectName: name + ' ikon' })
}

// Telefonkeret: navy lekerekített keret, benne a képernyőkép
function phone(slide, file, ar, x, y, h, name) {
  const bez = 0.07
  const w = h * ar
  slide.addShape('roundRect', {
    x: x - bez, y: y - bez, w: w + 2 * bez, h: h + 2 * bez, rectRadius: 0.16,
    fill: { color: NAVY }, line: { color: NAVY },
    shadow: { type: 'outer', color: '1A1F3A', opacity: 0.25, blur: 8, offset: 3, angle: 90 },
    objectName: name + ' keret',
  })
  slide.addImage({ path: file, x, y, w, h, objectName: name })
  return w + 2 * bez
}

function card(slide, x, y, w, h, opts = {}) {
  slide.addShape('roundRect', {
    x, y, w, h, rectRadius: opts.r ?? 0.12,
    fill: { color: opts.fill ?? WHITE },
    line: { color: opts.line ?? LINE, width: opts.lineW ?? 0.75 },
    shadow: opts.shadow === false ? undefined : { type: 'outer', color: NAVY, opacity: 0.08, blur: 6, offset: 2, angle: 90 },
    objectName: opts.name,
  })
}

function text(slide, t, o) {
  slide.addText(t, { isTextBox: true, margin: 0, fontFace: BODY, color: TEXT, valign: 'top', ...o })
}

// ---------- prezentáció ----------

async function main() {
  const pres = new pptxgen()
  pres.layout = 'LAYOUT_16x9' // 10 × 5.625 hüvelyk
  pres.theme = { headFontFace: HEAD, bodyFontFace: BODY }
  pres.title = 'Prototípus AI-val, lépésről lépésre'
  pres.subject = 'Ügyfél Portál – Díjadatok gyakorló projekt'
  pres.author = 'AI képzés – gyakorló projekt'

  const mark = await brandMark()
  const markDark = await brandMarkOnDark()

  // Layoutok
  pres.defineSlideMaster({
    title: 'Sötét nyitó és záró',
    background: { color: NAVY },
    objects: [{ image: { data: markDark, x: 0.5, y: 0.42, w: 0.36, h: 0.36 } }],
    placeholders: [],
  })
  pres.defineSlideMaster({
    title: 'Tartalom',
    background: { color: BG },
    objects: [
      { image: { data: mark, x: 9.14, y: 0.36, w: 0.34, h: 0.34 } },
      { text: { text: 'AI képzés · Ügyfél Portál – Díjadatok prototípus', options: { x: 0.5, y: 5.22, w: 6, h: 0.25, fontFace: BODY, fontSize: 9, color: MUTED, margin: 0 } } },
    ],
    slideNumber: { x: 9.0, y: 5.22, w: 0.5, h: 0.25, fontFace: BODY, fontSize: 9, color: MUTED, align: 'right' },
  })

  // Diacím minden tartalmi dián azonos helyen és stílusban
  const title = (s, t) =>
    s.addText(t, { isTextBox: true, x: 0.5, y: 0.32, w: 8.4, h: 0.55, margin: 0, fontFace: HEAD, fontSize: 26, bold: true, color: NAVY, valign: 'top', objectName: 'Cím' })

  const ic = {
    target: await icon(fi.FiTarget, WHITE),
    check: await icon(fi.FiCheck, GREEN_DK),
    x: await icon(fi.FiX, RED),
    card: await icon(fi.FiCreditCard, NAVY),
    cal: await icon(fi.FiCalendar, NAVY),
    alert: await icon(fi.FiAlertCircle, NAVY),
    swap: await icon(fi.FiRepeat, NAVY),
    user: await icon(fi.FiUser, WHITE),
    headset: await icon(fi.FiHeadphones, WHITE),
    map: await icon(fi.FiMap, WHITE),
    edit: await icon(fi.FiEdit3, WHITE),
    eye: await icon(fi.FiEye, WHITE),
    thumbs: await icon(fi.FiThumbsUp, WHITE),
    msg: await icon(fi.FiMessageSquare, NAVY),
    cpu: await icon(fi.FiCpu, NAVY),
    userN: await icon(fi.FiUserCheck, NAVY),
    file: await icon(fi.FiFileText, GREEN_DK),
    terminal: await icon(fi.FiTerminal, NAVY),
    droplet: await icon(fi.FiDroplet, NAVY),
    database: await icon(fi.FiDatabase, NAVY),
    shield: await icon(fi.FiShield, NAVY),
    sliders: await icon(fi.FiSliders, NAVY),
    search: await icon(fi.FiSearch, WARN),
    compass: await icon(fi.FiCompass, WHITE),
    layers: await icon(fi.FiLayers, WHITE),
    book: await icon(fi.FiBookOpen, WHITE),
    clip: await icon(fi.FiClipboard, WHITE),
    checkW: await icon(fi.FiCheckCircle, WHITE),
    flag: await icon(fi.FiFlag, WHITE),
  }

  const arStatus = await aspect(IMG('phone-status.jpg'))
  const arExp = await aspect(IMG('phone-expanded.jpg'))
  const arFail = await aspect(IMG('phone-failed.jpg'))
  const arDia = await aspect(IMG('diagram1.png'))

  // ===== 1. Nyitó =====
  pres.addSection({ title: 'Nyitás' })
  {
    const s = pres.addSlide({ masterName: 'Sötét nyitó és záró', sectionTitle: 'Nyitás' })
    text(s, 'AI KÉPZÉS · GYAKORLÓ PROJEKT', { x: 0.5, y: 1.25, w: 5.6, h: 0.3, fontSize: 12, color: GREEN, bold: true, charSpacing: 2 })
    text(s, 'Prototípus AI-val, lépésről lépésre', { x: 0.5, y: 1.65, w: 5.6, h: 1.4, fontFace: HEAD, fontSize: 34, bold: true, color: WHITE })
    text(s, 'Ügyfél Portál – Díjadatok: a feladatleírástól a tesztelhető prototípusig', { x: 0.5, y: 3.2, w: 5.3, h: 0.7, fontSize: 16, color: 'D7DBEE' })
    text(s, '2026. október', { x: 0.5, y: 4.75, w: 3, h: 0.3, fontSize: 12, color: 'AEB5D6' })
    phone(s, IMG('phone-status.jpg'), arStatus, 6.95, 0.45, 4.7, 'Prototípus – ügyfél nézet')
    s.addNotes(
      'Időkeret: kb. 30 másodperc.\n' +
        'Sziasztok! Az AI képzés gyakorló feladataként egy valódi üzleti problémán próbáltam ki, hogyan lehet AI-val prototípust építeni. ' +
        'A téma az Ügyfél Portál díjadatai: egy felület, amelyen az ügyfél és a kollégák is látják egy szerződés befizetéseit, díjait és hátralékait. ' +
        'Nem a kódról fogok beszélni, hanem a folyamatról: hogyan dolgoztunk együtt az AI-val, és mit tanultam belőle.'
    )
  }

  // ===== 2. Kiinduló állapot =====
  pres.addSection({ title: 'Kiindulás' })
  {
    const s = pres.addSlide({ masterName: 'Tartalom', sectionTitle: 'Kiindulás' })
    title(s, 'Kiinduló állapot')
    text(s, 'Egy rövid feladatleírásból és egy üres mappából indultunk.', { x: 0.5, y: 0.95, w: 8.4, h: 0.35, fontSize: 15, color: TEXT2 })

    // Feladat kártya
    card(s, 0.5, 1.5, 4.25, 3.45, { fill: NAVY, line: NAVY, name: 'Feladat kártya' })
    iconCircle(s, ic.target, 0.8, 1.78, 0.55, GREEN, 'Feladat')
    text(s, 'A FELADAT', { x: 1.5, y: 1.93, w: 3, h: 0.3, fontSize: 12, bold: true, color: GREEN, charSpacing: 2 })
    text(
      s,
      'Kattintható prototípus, amely egy biztosítási szerződés folyószámláját mutatja: egy egyszerű nézet az ügyfélnek, egy részletes a callcenternek és a tanácsadóknak.',
      { x: 0.8, y: 2.55, w: 3.7, h: 1.5, fontSize: 15, color: WHITE, italic: true }
    )
    text(s, 'Cél: felhasználói teszt és üzleti bemutató', { x: 0.8, y: 4.35, w: 3.7, h: 0.3, fontSize: 12, color: 'C9CEEA' })

    // Megvolt / hiányzott
    const colX = [5.05, 7.1]
    const cols = [
      { t: 'Ami megvolt', ico: ic.check, bg: OK_BG, items: ['Az ötlet és a két célcsoport', 'Példák a tételtípusokra', 'Szakmai tudás a díjkérdésekről'] },
      { t: 'Ami hiányzott', ico: ic.x, bg: RED_BG, items: ['Képernyőtervek', 'Üzleti szabályok', 'Mintaadat', 'Fejlesztői környezet a gépen'] },
    ]
    cols.forEach((c, i) => {
      const x = colX[i]
      card(s, x, 1.5, 1.9, 3.45, { name: c.t + ' kártya' })
      text(s, c.t, { x: x + 0.2, y: 1.68, w: 1.6, h: 0.3, fontFace: HEAD, fontSize: 13, bold: true, color: NAVY })
      c.items.forEach((it, j) => {
        const y = 2.15 + j * 0.66
        iconCircle(s, c.ico, x + 0.18, y, 0.32, c.bg, c.t + ' ' + (j + 1))
        text(s, it, { x: x + 0.6, y: y - 0.02, w: 1.2, h: 0.6, fontSize: 12, color: TEXT })
      })
    })
    s.addNotes(
      'Időkeret: kb. 40 másodperc.\n' +
        'A kiinduló pont egy pár mondatos feladatleírás volt: kattintható prototípus a szerződés folyószámlájáról, két nézettel. ' +
        'Az ügyfélnek egyszerű, kognitív terhelés nélküli nézet kell, a callcenternek és a tanácsadóknak pedig egy részletes, ahol egy helyen megvan minden díjjal kapcsolatos információ. ' +
        'Ami fontos: nem volt képernyőterv, nem voltak leírt üzleti szabályok, nem volt mintaadat, és a gépen még fejlesztői környezet sem. Ez tipikus helyzet egy ötlet elején.'
    )
  }

  // ===== 3. A kísérleti projekt =====
  {
    const s = pres.addSlide({ masterName: 'Tartalom', sectionTitle: 'Kiindulás' })
    title(s, 'A kísérleti projekt: Ügyfél Portál – Díjadatok')
    text(s, 'Egy szerződés díjadatai egy helyen – két különböző felhasználónak.', { x: 0.5, y: 0.95, w: 8.4, h: 0.35, fontSize: 15, color: TEXT2 })

    const tiles = [
      { ico: ic.card, t: 'Befizetések, kifizetések' },
      { ico: ic.cal, t: 'Díjelőírások' },
      { ico: ic.alert, t: 'Díjhátralék' },
      { ico: ic.swap, t: 'Speciális könyvelések', d: 'pl. átkönyvelés, kárból díjra' },
    ]
    const tw = 2.0
    const tg = 0.133
    tiles.forEach((t, i) => {
      const x = 0.5 + i * (tw + tg)
      card(s, x, 1.45, tw, 1.1, { name: t.t + ' csempe' })
      iconCircle(s, t.ico, x + 0.18, 1.62, 0.42, BG_ALT, t.t)
      text(s, t.t, { x: x + 0.7, y: 1.62, w: tw - 0.82, h: 0.5, fontSize: 13, bold: true, color: NAVY, valign: 'middle' })
      if (t.d) text(s, t.d, { x: x + 0.18, y: 2.15, w: tw - 0.3, h: 0.3, fontSize: 11, color: MUTED })
    })

    const views = [
      { ico: ic.user, bg: GREEN, t: 'Ügyfél nézet', q: '„Rendben vagyok?”', d: 'Egy állapotsor, egy idővonal, kattintásra köznyelvi magyarázat. Technikai részletek nélkül.' },
      { ico: ic.headset, bg: NAVY, t: 'Ügyintézői nézet', q: '„Mit kérdez az ügyfél?”', d: 'CC és tanácsadók: a gyakori díjkérdések egy helyen – kerekítés, kódok, párosítás, storno.' },
    ]
    views.forEach((v, i) => {
      const x = 0.5 + i * 4.3
      card(s, x, 2.8, 4.1, 1.95, { name: v.t + ' kártya' })
      iconCircle(s, v.ico, x + 0.25, 3.02, 0.55, v.bg, v.t)
      text(s, v.t, { x: x + 0.95, y: 3.0, w: 3.0, h: 0.32, fontFace: HEAD, fontSize: 14, bold: true, color: NAVY })
      text(s, v.q, { x: x + 0.95, y: 3.32, w: 3.0, h: 0.3, fontSize: 13, italic: true, color: GREEN_DK })
      text(s, v.d, { x: x + 0.25, y: 3.8, w: 3.65, h: 0.8, fontSize: 13, color: TEXT })
    })
    text(s, 'Termékek: lakásbiztosítás, KGFB, casco · 4 tesztforgatókönyv mintaadattal · fókusz: a díjakkal kapcsolatos ügyfélhívások csökkentése', { x: 0.5, y: 4.88, w: 9, h: 0.28, fontSize: 11, color: MUTED })
    s.addNotes(
      'Időkeret: kb. 40 másodperc.\n' +
        'A felület négy dolgot mutat: befizetéseket és kifizetéseket, díjelőírásokat, hátralékot és a speciális könyveléseket, például az átkönyvelést másik szerződésre. ' +
        'A lényeg a két nézet. Az ügyfél egyetlen kérdésre keres választ: rendben vagyok-e. Az ügyintéző viszont az ügyfél kérdésére keres választ, ehhez neki látnia kell a kerekítést, a könyvelési kódokat, a párosítást. ' +
        'A szerepkörök közti határt az érzékenység és az érthetőség jelöli ki.'
    )
  }

  // ===== 4. Munkamódszer =====
  pres.addSection({ title: 'A folyamat' })
  {
    const s = pres.addSlide({ masterName: 'Tartalom', sectionTitle: 'A folyamat' })
    title(s, 'A módszer: terv, kis lépések, kontrollpontok')
    text(s, 'Minden allépés végén az AI bemutatja az eredményt – csak jóváhagyás után megy tovább.', { x: 0.5, y: 0.95, w: 8.4, h: 0.35, fontSize: 15, color: TEXT2 })

    const steps = [
      { ico: ic.compass, t: 'Terv és tisztázó kérdések', d: 'Mi a cél, mi nem része, milyen anyag van?' },
      { ico: ic.edit, t: 'Egy allépés', d: 'Kis, áttekinthető darab' },
      { ico: ic.eye, t: 'Bemutatás', d: 'Képernyőkép, teszt, összefoglaló' },
      { ico: ic.thumbs, t: 'Jóváhagyás vagy korrekció', d: 'Az ember dönt' },
    ]
    const sw = 1.95
    const gap = 0.28
    steps.forEach((st, i) => {
      const x = 0.5 + i * (sw + gap)
      card(s, x, 1.45, sw, 1.7, { name: st.t + ' lépés' })
      iconCircle(s, st.ico, x + 0.18, 1.6, 0.44, i === 3 ? GREEN : NAVY, st.t)
      text(s, st.t, { x: x + 0.18, y: 2.12, w: sw - 0.3, h: 0.46, fontSize: 13, bold: true, color: NAVY, valign: 'bottom' })
      text(s, st.d, { x: x + 0.18, y: 2.64, w: sw - 0.3, h: 0.46, fontSize: 11, color: MUTED })
      if (i < 3) {
        s.addShape('rightArrow', { x: x + sw + 0.04, y: 2.17, w: 0.2, h: 0.25, fill: { color: GREEN }, line: { color: GREEN }, objectName: 'nyíl ' + (i + 1) })
      }
    })
    // visszacsatolás: a jóváhagyás után a következő allépés
    const c2 = 0.5 + (sw + gap) + sw / 2
    const c4 = 0.5 + 3 * (sw + gap) + sw / 2
    s.addShape('line', { x: c2, y: 3.3, w: c4 - c2, h: 0, line: { color: GREEN, width: 1.5, dashType: 'dash', beginArrowType: 'triangle' }, objectName: 'visszacsatolás' })
    text(s, 'következő allépés', { x: (c2 + c4) / 2 - 1.1, y: 3.35, w: 2.2, h: 0.25, fontSize: 11, italic: true, color: GREEN_DK, align: 'center' })

    // Szakaszok
    text(s, 'Szakaszok', { x: 0.5, y: 3.7, w: 3, h: 0.3, fontFace: HEAD, fontSize: 13, bold: true, color: NAVY })
    const phases = [
      { k: 'A', t: 'Tartalom, szabályok', s: 'kész', done: true },
      { k: 'B', t: 'Alapok', s: 'kész', done: true },
      { k: 'C', t: 'Ügyfél nézet', s: 'kész', done: true },
      { k: 'D', t: 'Ügyintézői nézet', s: 'következik', done: false },
      { k: 'E', t: 'Teszt és bemutató', s: 'következik', done: false },
    ]
    const pw = 1.68
    phases.forEach((p, i) => {
      const x = 0.5 + i * (pw + 0.1)
      s.addShape('roundRect', {
        x, y: 4.08, w: pw, h: 0.82, rectRadius: 0.41,
        fill: { color: p.done ? OK_BG : WHITE }, line: { color: p.done ? GREEN : LINE, width: 1 }, objectName: 'szakasz ' + p.k,
      })
      s.addShape('ellipse', { x: x + 0.12, y: 4.22, w: 0.54, h: 0.54, fill: { color: p.done ? GREEN_DK : 'C9CFDA' }, line: { color: p.done ? GREEN_DK : 'C9CFDA' }, objectName: 'szakasz betű ' + p.k })
      text(s, p.k, { x: x + 0.12, y: 4.22, w: 0.54, h: 0.54, fontFace: HEAD, fontSize: 16, bold: true, color: WHITE, align: 'center', valign: 'middle' })
      text(s, p.t, { x: x + 0.74, y: 4.2, w: pw - 0.82, h: 0.36, fontSize: 11, bold: true, color: NAVY, valign: 'middle' })
      text(s, p.s, { x: x + 0.74, y: 4.53, w: pw - 0.82, h: 0.25, fontSize: 10, color: p.done ? GREEN_DK : MUTED })
    })
    s.addNotes(
      'Időkeret: kb. 50 másodperc.\n' +
        'Ez a legfontosabb dia. Nem azt kértem, hogy „csináld meg”, hanem az AI először tervet készített, és tisztázó kérdéseket tett fel: milyen anyagaim vannak, milyen formában kell, milyen szerepkörök legyenek. ' +
        'A tervet többször visszadobtam: szűkítettem a scope-ot, és kértem, hogy bontsa további allépésekre. Ebből lett öt szakasz, A-tól E-ig, összesen húsznál több kis lépéssel. ' +
        'Minden lépés végén az AI megmutatta az eredményt, és csak jóváhagyás után ment tovább. Így végig nálam maradt az irányítás. Jelenleg az első három szakasz kész.'
    )
  }

  // ===== 5. Állomás 1: tartalom =====
  {
    const s = pres.addSlide({ masterName: 'Tartalom', sectionTitle: 'A folyamat' })
    title(s, '1. állomás: a tartalom előbb, mint a képernyő')
    text(s, 'A mintaadatot és a szabályokat közösen alakítottuk ki – kód nélkül.', { x: 0.5, y: 0.95, w: 8.4, h: 0.35, fontSize: 15, color: TEXT2 })

    const chain = [
      { ico: ic.msg, t: 'Az én példáim', d: 'tételtípusok, gyakori hívások, valós tételsor' },
      { ico: ic.cpu, t: 'AI javaslat', d: 'katalógus, adatmodell, nyitott kérdések' },
      { ico: ic.userN, t: 'Döntés', d: 'jóváhagyás vagy módosítás' },
    ]
    const cw = 2.7
    chain.forEach((c, i) => {
      const x = 0.5 + i * (cw + 0.33)
      card(s, x, 1.45, cw, 0.95, { name: c.t })
      iconCircle(s, c.ico, x + 0.15, 1.62, 0.6, BG_ALT, c.t)
      text(s, c.t, { x: x + 0.9, y: 1.6, w: cw - 1.0, h: 0.3, fontSize: 14, bold: true, color: NAVY })
      text(s, c.d, { x: x + 0.9, y: 1.9, w: cw - 1.0, h: 0.45, fontSize: 11, color: MUTED })
      if (i < 2) s.addShape('rightArrow', { x: x + cw + 0.06, y: 1.8, w: 0.21, h: 0.25, fill: { color: GREEN }, line: { color: GREEN }, objectName: 'lánc nyíl ' + (i + 1) })
    })

    // Elkészült anyagok
    text(s, 'Elkészült anyagok', { x: 0.5, y: 2.65, w: 4, h: 0.3, fontFace: HEAD, fontSize: 13, bold: true, color: NAVY })
    const docs = ['Tételtípus-katalógus', 'Adatmodell', 'Láthatósági mátrix (ügyfél / ügyintéző)', '4 forgatókönyv + feltételezések']
    docs.forEach((d, i) => {
      const y = 3.05 + i * 0.5
      card(s, 0.5, y, 4.1, 0.4, { r: 0.2, shadow: false, name: 'anyag ' + (i + 1) })
      s.addImage({ data: ic.file, x: 0.65, y: y + 0.08, w: 0.24, h: 0.24, objectName: 'dokumentum ikon ' + (i + 1) })
      text(s, d, { x: 1.02, y: y + 0.05, w: 3.5, h: 0.3, fontSize: 13, color: TEXT, valign: 'middle' })
    })

    // Döntések
    card(s, 4.9, 2.65, 4.6, 2.4, { fill: WARN_BG, line: 'F0D58A', name: 'döntések kártya' })
    text(s, 'Példák az emberi döntésekre', { x: 5.15, y: 2.8, w: 4.2, h: 0.3, fontFace: HEAD, fontSize: 13, bold: true, color: WARN })
    text(
      s,
      [
        { text: 'A díjváltozás esemény legyen, ne külön tétel', options: { bullet: true, breakLine: true } },
        { text: 'A visszautalás átfutása: 3 munkanap', options: { bullet: true, breakLine: true } },
        { text: 'A bankszámlaszám ne legyen maszkolva', options: { bullet: true, breakLine: true } },
        { text: 'A várható megszűnést az ügyfél ne lássa – e-mailt kap róla', options: { bullet: true } },
      ],
      { x: 5.15, y: 3.2, w: 4.2, h: 1.75, fontSize: 13, color: TEXT, paraSpaceAfter: 6 }
    )
    s.addNotes(
      'Időkeret: kb. 45 másodperc.\n' +
        'Az első szakaszban egy sor kód sem született. Én adtam példákat: milyen tételtípusok vannak, mi miatt telefonálnak az ügyfelek, hogyan néz ki egy valós tételsor. ' +
        'Ebből az AI javaslatot tett, nyitott kérdésekkel, és én döntöttem. Négy anyag lett belőle: tételtípus-katalógus, adatmodell, láthatósági mátrix és négy forgatókönyv. ' +
        'A jobb oldalon látszik, milyen döntések voltak ezek: az AI felvetette őket, de az üzleti választ nekem kellett megadnom. Amit nem tudtam, azt az AI feltételezésként jelölte.'
    )
  }

  // ===== 6. Állomás 2: alapok =====
  {
    const s = pres.addSlide({ masterName: 'Tartalom', sectionTitle: 'A folyamat' })
    title(s, '2. állomás: működő alapok, ellenőrizhetően')
    text(s, 'A látható felület előtt elkészült minden, amire épülni fog.', { x: 0.5, y: 0.95, w: 8.4, h: 0.35, fontSize: 15, color: TEXT2 })

    const rows = [
      { ico: ic.terminal, t: 'Fejlesztői környezet', d: 'Az AI telepítette a szükséges eszközöket és létrehozta a projektet' },
      { ico: ic.droplet, t: 'Arculat', d: 'Színek, formák, gombstílus a groupama.hu nyilvános oldaláról' },
      { ico: ic.database, t: 'Adatréteg', d: 'Egyenleg, hátralék, párosítás: egy számítás mindkét nézetnek' },
      { ico: ic.shield, t: 'Láthatóság', d: 'Egyetlen szabálytábla dönti el, mit lát az ügyfél' },
      { ico: ic.sliders, t: 'Demósáv', d: 'Forgatókönyv- és nézetváltó a teszteléshez' },
    ]
    rows.forEach((r, i) => {
      const y = 1.45 + i * 0.72
      iconCircle(s, r.ico, 0.5, y, 0.52, BG_ALT, r.t)
      text(s, r.t, { x: 1.2, y: y - 0.02, w: 4.4, h: 0.28, fontSize: 14, bold: true, color: NAVY })
      text(s, r.d, { x: 1.2, y: y + 0.26, w: 4.6, h: 0.3, fontSize: 12, color: TEXT2 })
    })

    card(s, 6.2, 1.45, 3.3, 3.5, { fill: NAVY, line: NAVY, name: 'tesztek kártya' })
    text(s, '65', { x: 6.45, y: 1.7, w: 2.8, h: 1.1, fontFace: HEAD, fontSize: 66, bold: true, color: GREEN })
    text(s, 'automatikus teszt', { x: 6.45, y: 2.8, w: 2.8, h: 0.35, fontSize: 17, bold: true, color: WHITE })
    text(s, 'Minden lépés után lefut: egyenlegek, státuszok, és hogy az ügyfél nézetbe ne kerüljön rejtett adat.', { x: 6.45, y: 3.2, w: 2.85, h: 0.9, fontSize: 12, color: 'D7DBEE' })
    text(s, '4 forgatókönyv · 2 szerepkör · 13 tranzakciótípus', { x: 6.45, y: 4.35, w: 2.9, h: 0.4, fontSize: 11, color: 'AEB5D6' })
    s.addNotes(
      'Időkeret: kb. 40 másodperc.\n' +
        'A második szakasz az alapokról szólt. Az AI telepítette a fejlesztői környezetet, a Groupama nyilvános honlapjáról kinyerte az arculati elemeket, és megírta az adatréteget. ' +
        'Két döntést emelnék ki. Egy: az egyenleget egyetlen számítás adja mindkét nézetnek, így nem fordulhat elő, hogy az ügyfél mást lát, mint a callcenter. ' +
        'Kettő: hogy mit lát az ügyfél, azt egyetlen szabálytábla dönti el, amit az üzlet is tud módosítani. ' +
        'Mindezt 65 automatikus teszt ellenőrzi, és ezek minden lépés után lefutnak.'
    )
  }

  // ===== 7. Állomás 3: ügyfél nézet =====
  {
    const s = pres.addSlide({ masterName: 'Tartalom', sectionTitle: 'A folyamat' })
    title(s, '3. állomás: az ügyfél nézet')
    text(s, 'Egy kérdés, egy válasz – a részletek csak kattintásra.', { x: 0.5, y: 0.95, w: 8.4, h: 0.35, fontSize: 15, color: TEXT2 })

    const phones = [
      { f: 'phone-status.jpg', ar: arStatus, t: 'Állapotsor', d: '„Rendben vagyok?” – azonnal látszik' },
      { f: 'phone-expanded.jpg', ar: arExp, t: 'Kibontott tétel', d: 'Miért hiányzik 1 380 Ft? Indexálás, régi csekk' },
      { f: 'phone-failed.jpg', ar: arFail, t: 'Sikertelen lehívás', d: 'Mi az oka, és van-e teendő?' },
    ]
    const ph = 2.95
    const slotW = 3.0
    phones.forEach((p, i) => {
      const w = ph * p.ar
      const slotX = 0.5 + i * slotW
      const x = slotX + (slotW - w) / 2
      phone(s, IMG(p.f), p.ar, x, 1.45, ph, p.t)
      text(s, p.t, { x: slotX + 0.1, y: 4.55, w: slotW - 0.2, h: 0.26, fontSize: 13, bold: true, color: NAVY, align: 'center' })
      text(s, p.d, { x: slotX + 0.1, y: 4.8, w: slotW - 0.2, h: 0.24, fontSize: 11, color: MUTED, align: 'center' })
    })
    s.addNotes(
      'Időkeret: kb. 45 másodperc.\n' +
        'Így néz ki az ügyfél nézet mobilon. Bal oldalt az állapotsor: egyetlen mondat arról, hogy rendben van-e a szerződés. Itt 2 760 forint nem rendezett díj. ' +
        'Középen egy kibontott tétel: az ügyfél rákattint, és köznyelven megkapja a választ – a díjat indexálták, ő még a régi csekkel fizetett. Ez pontosan az a kérdés, ami miatt ma telefonálnak. ' +
        'Jobbra egy sikertelen díjlehívás: a bank miért utasította el, és hogy azóta rendeződött, nincs teendője. A kerekítés, a belső kódok, a banki hibakód rejtve maradnak.'
    )
  }

  // ===== 8. Állomás 4: folyamatábrák =====
  {
    const s = pres.addSlide({ masterName: 'Tartalom', sectionTitle: 'A folyamat' })
    title(s, '4. állomás: az üzlet nyelvén')
    text(s, 'A prototípusból folyamatábrák lettek a bemutatóhoz.', { x: 0.5, y: 0.95, w: 5, h: 0.35, fontSize: 15, color: TEXT2 })

    const pts = [
      { ico: ic.map, bg: NAVY, t: '5 folyamatábra', d: 'Áttekintés és a 4 forgatókönyv felhasználói útja' },
      { ico: ic.layers, bg: GREEN, t: 'Mit lát, hova kattint, mit olvas', d: 'A dobozokban a prototípus valódi szövegei' },
      { ico: ic.eye, bg: RED, t: 'Amit az ügyfél nem lát', d: 'Külön blokk minden ábrán: a szerepkör-szabályok is láthatók' },
      { ico: ic.clip, bg: TEAL, t: 'Mermaid kód', d: 'Bemásolható draw.io-ba, Confluence-be, prezentációba' },
    ]
    pts.forEach((p, i) => {
      const y = 1.5 + i * 0.86
      iconCircle(s, p.ico, 0.5, y, 0.52, p.bg, p.t)
      text(s, p.t, { x: 1.2, y: y - 0.02, w: 4.0, h: 0.28, fontSize: 14, bold: true, color: NAVY })
      text(s, p.d, { x: 1.2, y: y + 0.26, w: 4.1, h: 0.45, fontSize: 12, color: TEXT2 })
    })

    const dh = 3.95
    const dw = dh * arDia
    card(s, 5.6, 1.15, 3.9, 3.95, { fill: WHITE, name: 'folyamatábra kártya' })
    const iw = Math.min(3.7, dw)
    const ih = iw / arDia
    s.addImage({ path: IMG('diagram1.png'), x: 5.6 + (3.9 - iw) / 2, y: 1.15 + (3.95 - ih) / 2, w: iw, h: ih, objectName: 'Folyamatábra – 1. forgatókönyv' })
    s.addNotes(
      'Időkeret: kb. 40 másodperc.\n' +
        'Az üzletnek nem a kódot kell megmutatni, hanem a felhasználói utat. Az AI a kész prototípusból öt folyamatábrát készített: egy áttekintőt és forgatókönyvenként egyet. ' +
        'Jobbra az első forgatókönyv látszik: Kovács Anna kérdésétől a magyarázatig és a kimenetig. A piros szaggatott blokk mutatja, mit nem lát az ügyfél – így a szerepkör-szabályokat is egyben bemutatja. ' +
        'Mermaid kódban készültek, ezért bemásolhatók draw.io-ba vagy Confluence-be is.'
    )
  }

  // ===== 9. Amit az ellenőrzés kiszűrt =====
  pres.addSection({ title: 'Tanulságok' })
  {
    const s = pres.addSlide({ masterName: 'Tartalom', sectionTitle: 'Tanulságok' })
    title(s, 'Amit a lépésenkénti ellenőrzés kiszűrt')
    text(s, 'Az AI is hibázik – de a saját tesztjei és böngészős ellenőrzése még a bemutatás előtt megtalálta ezeket.', { x: 0.5, y: 0.95, w: 8.6, h: 0.35, fontSize: 15, color: TEXT2 })

    const items = [
      { t: 'Félrevezető szöveg', a: '„Hiányzik: 25 380 Ft” egy még nem esedékes díjnál', b: '„Fizetendő: 25 380 Ft”' },
      { t: 'Apró tipográfiai hibák', a: '„január 1.. Fizetési mód”, „6166 Ft”', b: 'egy pont, egységes „6 166 Ft”' },
      { t: 'Mobil tördelés', a: 'Három sorba törő tételcímek', b: 'az összeg a dátum sorába került' },
      { t: 'Elakadt fejlesztői szerver', a: 'Üres oldal egy módosítás után', b: 'újraindítás, újraellenőrzés' },
    ]
    const cw2 = 4.4
    const ch2 = 1.65
    items.forEach((it, i) => {
      const x = 0.5 + (i % 2) * (cw2 + 0.2)
      const y = 1.45 + Math.floor(i / 2) * (ch2 + 0.2)
      card(s, x, y, cw2, ch2, { name: it.t })
      iconCircle(s, ic.search, x + 0.2, y + 0.2, 0.46, WARN_BG, it.t)
      text(s, it.t, { x: x + 0.82, y: y + 0.27, w: cw2 - 1.0, h: 0.32, fontSize: 14, bold: true, color: NAVY })
      text(s, [
        { text: 'Előtte: ', options: { bold: true, color: RED } },
        { text: it.a, options: { color: TEXT, breakLine: true } },
        { text: 'Utána: ', options: { bold: true, color: GREEN_DK } },
        { text: it.b, options: { color: TEXT } },
      ], { x: x + 0.82, y: y + 0.68, w: cw2 - 1.0, h: 0.88, fontSize: 12, paraSpaceAfter: 6 })
    })
    s.addNotes(
      'Időkeret: kb. 40 másodperc.\n' +
        'Fontos, hogy őszinte legyek: az AI is hibázik. A jó hír az, hogy ha megkérjük, ellenőrzi is a saját munkáját. ' +
        'Ezt a négy hibát nem én vettem észre, hanem az AI, a tesztek és a böngészős végigkattintás közben. A legérdekesebb az első: egy még nem esedékes díjnál azt írta ki, hogy „Hiányzik”, ami egy ügyfelet megijesztene. ' +
        'Tanulság: kérjük meg, hogy minden lépés után ellenőrizzen, és mutassa meg, mit nézett meg.'
    )
  }

  // ===== 10. Tanulságok =====
  {
    const s = pres.addSlide({ masterName: 'Tartalom', sectionTitle: 'Tanulságok' })
    title(s, 'Tanulságok')

    const tk = [
      { ico: ic.compass, t: 'Tervvel kezdj, ne kóddal', d: 'Tisztázó kérdések és jóváhagyott terv: a scope már az elején szűkült.' },
      { ico: ic.layers, t: 'Kis lépések, kontrollpontok', d: 'Minden allépés után bemutatás – az irányítás végig nálad van.' },
      { ico: ic.book, t: 'Tartalom előbb, mint a UI', d: 'A mintaadat és a szabályok a saját példáidból épüljenek.' },
      { ico: ic.edit, t: 'Feltételezések írásban', d: 'Amit nem tudsz, az AI jelölje feltételezésként – te hagyod jóvá.' },
      { ico: ic.checkW, t: 'Ellenőriztess is', d: 'Tesztek és végigkattintás: az AI a saját hibáit is megtalálja.' },
      { ico: ic.flag, t: 'A döntés emberi', d: 'Az AI javasol, te döntesz: scope, láthatóság, hangnem.' },
    ]
    const w = 2.87
    const h = 1.85
    tk.forEach((t, i) => {
      const x = 0.5 + (i % 3) * (w + 0.2)
      const y = 1.15 + Math.floor(i / 3) * (h + 0.2)
      card(s, x, y, w, h, { name: t.t })
      iconCircle(s, t.ico, x + 0.22, y + 0.22, 0.52, i === 5 ? GREEN : NAVY, t.t)
      text(s, t.t, { x: x + 0.22, y: y + 0.88, w: w - 0.4, h: 0.32, fontSize: 14, bold: true, color: NAVY })
      text(s, t.d, { x: x + 0.22, y: y + 1.2, w: w - 0.4, h: 0.6, fontSize: 12, color: TEXT2 })
    })
    s.addNotes(
      'Időkeret: kb. 60 másodperc.\n' +
        'Hat tanulságot vinnék haza. Egy: tervvel kezdjünk, ne kóddal – az AI tisztázó kérdései többet értek, mint egy gyors első verzió. ' +
        'Kettő: kis lépések és kontrollpontok, így végig mi irányítunk. Három: először a tartalom, a mintaadat és a szabályok, utána a képernyő. ' +
        'Négy: amit nem tudunk, azt írassuk le feltételezésként, így később cserélhető. Öt: kérjük az ellenőrzést is, mert az AI a saját hibáit is megtalálja. ' +
        'És hat, a legfontosabb: a döntés emberi. Az AI javasol, de a scope-ot, a láthatóságot és a hangnemet nekünk kell meghatározni.'
    )
  }

  // ===== 11. Zárás =====
  {
    const s = pres.addSlide({ masterName: 'Sötét nyitó és záró', sectionTitle: 'Tanulságok' })
    text(s, 'HOGYAN TOVÁBB', { x: 0.5, y: 1.25, w: 4.5, h: 0.3, fontSize: 12, bold: true, color: GREEN, charSpacing: 2 })
    const next = [
      { k: 'D', t: 'Ügyintézői nézet', d: 'Összesítő, tételtábla, párosítás, gyors válaszok' },
      { k: 'E', t: 'Felhasználói teszt és bemutató', d: 'Tesztfeladatok, bemutató-forgatókönyv, megosztható build' },
    ]
    next.forEach((n, i) => {
      const y = 1.8 + i * 1.15
      s.addShape('ellipse', { x: 0.5, y, w: 0.62, h: 0.62, fill: { color: GREEN }, line: { color: GREEN }, objectName: 'szakasz ' + n.k })
      text(s, n.k, { x: 0.5, y, w: 0.62, h: 0.62, fontFace: HEAD, fontSize: 20, bold: true, color: WHITE, align: 'center', valign: 'middle' })
      text(s, n.t, { x: 1.35, y: y + 0.0, w: 3.8, h: 0.32, fontSize: 16, bold: true, color: WHITE })
      text(s, n.d, { x: 1.35, y: y + 0.33, w: 3.8, h: 0.5, fontSize: 12, color: 'C9CEEA' })
    })
    text(s, 'Köszönöm!', { x: 5.6, y: 1.9, w: 3.9, h: 0.9, fontFace: HEAD, fontSize: 40, bold: true, color: WHITE })
    text(s, 'Kérdések?', { x: 5.6, y: 2.85, w: 3.9, h: 0.6, fontFace: HEAD, fontSize: 24, color: GREEN })
    text(s, 'A prototípus, a folyamatábrák és a munkaanyagok a projektmappában érhetők el.', { x: 5.6, y: 3.7, w: 3.9, h: 0.6, fontSize: 12, color: 'AEB5D6' })
    s.addNotes(
      'Időkeret: kb. 30 másodperc, utána kérdések.\n' +
        'Hogyan tovább: a következő szakasz az ügyintézői nézet, utána jön a felhasználói teszt és az üzleti bemutató. ' +
        'Ugyanígy fogjuk csinálni: kis lépésekben, kontrollpontokkal. Köszönöm a figyelmet, várom a kérdéseket!'
    )
  }

  await pres.writeFile({ fileName: OUT })
  await applyTheme(OUT, THEME)
  console.log('kész:', OUT)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
