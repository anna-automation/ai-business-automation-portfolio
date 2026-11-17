import {
  DOMENY,
  FORMY,
  KANALY,
  POCTY_LIDI,
  ROZPOCTY,
  SLUZBY,
  TEMATA_DOTAZU,
  TERMINY,
  TYPY_SPOLUPRACE,
  UROVNE,
  VELIKOSTI,
  ZAMERY,
  ZDROJE,
} from './formularData.js'

/**
 * Mozek poptávkového formuláře: validace, našeptávání, rozepsaný koncept
 * a pomocník, který z jedné věty poskládá kostru zprávy.
 *
 * Všechno běží v prohlížeči. Žádný model se nevolá — „AI" části jsou poctivá
 * heuristika nad textem. Díky tomu web funguje i bez serveru a rozepsaná
 * poptávka nikam neodchází.
 */

const KLIC_KONCEPTU = 'makasamo-poptavka'

export const VYCHOZI_DATA = {
  zamer: null,
  // druhý krok — podle záměru se použije jen část
  velikost: null,
  rozpocetIdx: 1,
  rozpocetNevim: true,
  termin: null,
  tema: null,
  pocetLidi: null,
  uroven: null,
  forma: null,
  typSpoluprace: null,
  // zpráva
  zprava: '',
  loom: '',
  // kontakt
  jmeno: '',
  email: '',
  predvolba: '+420',
  telefon: '',
  firma: '',
  kanal: 'email',
  zdroj: null,
  slot: null,
  souhlas: false,
  newsletter: false,
  // past na roboty — člověk tohle pole nikdy nevyplní
  webUrl: '',
}

/* ── validace ─────────────────────────────────────────────────────────── */

export function jeEmail(hodnota) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(hodnota.trim())
}

/** Hlášky jsou krátké a lidské — nikdo nechce být na formuláři peskovaný. */
export function chybaPole(klic, data) {
  if (klic === 'jmeno' && !data.jmeno.trim()) return 'Jak vám máme říkat?'

  if (klic === 'email') {
    const v = data.email.trim()
    if (!v) return 'Bez e-mailu nemáme kam odpovědět.'
    if (!v.includes('@')) return 'Vypadá to, že chybí zavináč 🙂'
    if (!jeEmail(v)) return 'Za zavináčem ještě chybí doména, třeba seznam.cz.'
  }

  if (klic === 'souhlas' && !data.souhlas) return 'Bez souhlasu zprávu odeslat nejde.'

  if (klic === 'telefon' && data.telefon.trim()) {
    if (data.telefon.replace(/\D/g, '').length < 9) return 'Telefon vypadá o pár čísel kratší.'
  }

  return null
}

/** Zpráva je povinná, dokud nedorazí hlasovka — ta ji zastoupí. */
export function chybaZpravy(data, maHlasovku) {
  if (maHlasovku) return null
  if (!data.zprava.trim()) return 'Napište pár vět, ať víme, o co jde.'
  if (data.zprava.trim().length < 12) return 'Ještě kousek — stačí jedna celá věta.'
  return null
}

/* ── našeptávač překlepů v doméně ─────────────────────────────────────── */

/**
 * Vzdálenost dvou řetězců včetně prohození sousedních znaků — „gmial" je
 * od „gmail" jeden překlep, ne dva. Bez toho by nejčastější typ překlepu
 * propadl sítem.
 */
function vzdalenost(a, b) {
  const m = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 0; j <= b.length; j += 1) m[0][j] = j

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cena = a[i - 1] === b[j - 1] ? 0 : 1
      m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + cena)

      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        m[i][j] = Math.min(m[i][j], m[i - 2][j - 2] + 1)
      }
    }
  }
  return m[a.length][b.length]
}

/**
 * Vrátí opravený e-mail, pokud doména vypadá jako překlep té známé. Prahy
 * jsou schválně přísné — radši neporadit než hádat cizí firemní doménu.
 */
export function navrhEmailu(email) {
  const v = email.trim().toLowerCase()
  const zavinac = v.lastIndexOf('@')
  if (zavinac < 1) return null

  const mistni = v.slice(0, zavinac)
  const domena = v.slice(zavinac + 1)
  if (!domena || DOMENY.includes(domena)) return null

  let nejlepsi = null
  for (const kandidat of DOMENY) {
    const d = vzdalenost(domena, kandidat)
    const prah = kandidat.length > 6 ? 2 : 1
    if (d <= prah && (!nejlepsi || d < nejlepsi.d)) nejlepsi = { kandidat, d }
  }
  return nejlepsi ? `${mistni}@${nejlepsi.kandidat}` : null
}

/* ── telefon ──────────────────────────────────────────────────────────── */

/** Píše se po trojicích, jak je u českých čísel zvykem. */
export function formatTelefon(hodnota) {
  return hodnota
    .replace(/\D/g, '')
    .slice(0, 12)
    .replace(/(\d{3})(?=\d)/g, '$1 ')
    .trim()
}

/* ── rozepsaný koncept ────────────────────────────────────────────────── */

/** Přílohy ani hlasovka se neukládají — do úložiště patří jen text. */
export function ulozitKoncept(data) {
  try {
    const { webUrl, ...zbytek } = data
    window.localStorage.setItem(KLIC_KONCEPTU, JSON.stringify({ ulozeno: Date.now(), data: zbytek }))
  } catch {
    // soukromý režim nebo plné úložiště — formulář kvůli tomu padat nebude
  }
}

export function nacistKoncept() {
  try {
    const syrove = window.localStorage.getItem(KLIC_KONCEPTU)
    if (!syrove) return null

    const { ulozeno, data } = JSON.parse(syrove)
    // po týdnu už to není rozepsaná poptávka, ale smetí
    if (!data || Date.now() - ulozeno > 7 * 24 * 3600 * 1000) return null

    const plne = { ...VYCHOZI_DATA, ...data, webUrl: '' }
    return jePrazdny(plne) ? null : plne
  } catch {
    return null
  }
}

export function zapomenoutKoncept() {
  try {
    window.localStorage.removeItem(KLIC_KONCEPTU)
  } catch {
    // nevadí
  }
}

export function jePrazdny(data) {
  return !data.zamer && !data.zprava.trim() && !data.jmeno.trim() && !data.email.trim()
}

/* ── shrnutí před odesláním ───────────────────────────────────────────── */

const najdi = (seznam, id) => seznam.find((p) => p.id === id)?.label ?? null

/** Co z odpovědí ukázat v rekapitulaci. `krok` vede tlačítko „upravit". */
export function shrnuti(data) {
  const radky = []
  const zamer = ZAMERY.find((z) => z.id === data.zamer)
  if (zamer) radky.push({ popis: 'Záměr', hodnota: zamer.titulek, krok: 0 })

  if (data.zamer === 'kurz') {
    if (data.pocetLidi) radky.push({ popis: 'Počet lidí', hodnota: najdi(POCTY_LIDI, data.pocetLidi), krok: 1 })
    if (data.uroven) radky.push({ popis: 'Úroveň', hodnota: najdi(UROVNE, data.uroven), krok: 1 })
    if (data.forma) radky.push({ popis: 'Forma', hodnota: najdi(FORMY, data.forma), krok: 1 })
  }
  if (data.zamer === 'spoluprace' && data.typSpoluprace) {
    radky.push({ popis: 'Spolupráce', hodnota: najdi(TYPY_SPOLUPRACE, data.typSpoluprace), krok: 1 })
  }
  if (data.zamer === 'dotaz' && data.tema) {
    radky.push({ popis: 'Téma', hodnota: najdi(TEMATA_DOTAZU, data.tema), krok: 1 })
  }
  if (data.velikost) radky.push({ popis: 'Velikost firmy', hodnota: najdi(VELIKOSTI, data.velikost), krok: 1 })
  if (data.zamer === 'nabidka') {
    radky.push({
      popis: 'Rozpočet',
      hodnota: data.rozpocetNevim ? 'Zatím nevím' : ROZPOCTY[data.rozpocetIdx],
      krok: 1,
    })
  }
  if (data.termin) radky.push({ popis: 'Termín', hodnota: najdi(TERMINY, data.termin), krok: 1 })

  if (data.zprava.trim()) {
    const t = data.zprava.trim().replace(/\s+/g, ' ')
    radky.push({ popis: 'Zpráva', hodnota: t.length > 150 ? `${t.slice(0, 148)}…` : t, krok: 2 })
  }
  if (data.firma.trim()) radky.push({ popis: 'Firma', hodnota: data.firma.trim(), krok: 3 })

  radky.push({
    popis: 'Ozveme se',
    hodnota:
      data.kanal === 'email'
        ? data.email.trim() || '—'
        : `${najdi(KANALY, data.kanal)}: ${data.predvolba} ${data.telefon}`.trim(),
    krok: 3,
  })
  if (data.zdroj) radky.push({ popis: 'Odkud nás znáte', hodnota: najdi(ZDROJE, data.zdroj), krok: 3 })
  if (data.slot) radky.push({ popis: 'Navržený termín', hodnota: data.slot, krok: 3 })

  return radky.filter((r) => r.hodnota)
}

/* ── doporučení a doplňující otázka ───────────────────────────────────── */

/** Jednoduché počítání trefených kmenů — vyhrává služba s nejvíc shodami. */
export function doporucitSluzbu(text) {
  const t = text.toLowerCase()
  if (t.trim().length < 15) return null

  let nejlepsi = null
  for (const sluzba of SLUZBY) {
    const shody = sluzba.klice.filter((k) => t.includes(k)).length
    if (shody > 0 && (!nejlepsi || shody > nejlepsi.shody)) nejlepsi = { ...sluzba, shody }
  }
  return nejlepsi
}

const NASTROJE = [
  'excel',
  'sheet',
  'tabulk',
  'mail',
  'crm',
  'notion',
  'systém',
  'system',
  'papír',
  'papir',
  'word',
  'teams',
  'slack',
]

/**
 * Když ve zprávě chybí detail, na který se stejně budeme ptát, zeptáme se
 * rovnou tady. Vrací vždy jen jednu otázku — ne výslech.
 */
export function doplnujiciOtazka(data) {
  const text = data.zprava.trim()
  if (text.length < 20) return null

  const t = text.toLowerCase()
  if (!/\d/.test(t)) {
    return { otazka: 'Kolik takových případů vám projde za týden?', doplnek: 'Týdně to řešíme přibližně ' }
  }
  if (!NASTROJE.some((n) => t.includes(n))) {
    return { otazka: 'V čem to vedete teď — Excel, e-mail, nějaký systém?', doplnek: 'Teď to vedeme v ' }
  }
  if (text.length < 180) {
    return { otazka: 'Co se stane, když na to někdo zapomene?', doplnek: 'Když se na to zapomene, ' }
  }
  return null
}

/* ── pomocník s textem zprávy ─────────────────────────────────────────── */

const UVODY = {
  nabidka: 'Co bychom rádi zautomatizovali',
  dotaz: 'Na co se ptáme',
  kurz: 'Co se potřebujeme naučit',
  spoluprace: 'O jakou spolupráci jde',
}

/**
 * Z jedné věty a už vyplněných odpovědí poskládá kostru zprávy. Není to
 * vygenerovaný text — je to osnova, kterou člověk dopíše. Místa k doplnění
 * zůstávají schválně otevřená, aby bylo vidět, co nás zajímá.
 */
export function navrhZpravy(veta, data) {
  const jadro = veta.trim()
  if (!jadro) return ''

  const radky = [`${UVODY[data.zamer] ?? 'Co řešíme'}: ${jadro}`, '']

  if (data.zamer === 'kurz') {
    const kdo = najdi(POCTY_LIDI, data.pocetLidi) ?? '… lidí'
    const uroven = najdi(UROVNE, data.uroven)?.toLowerCase() ?? '…'
    radky.push(`Tým: ${kdo}, úroveň ${uroven}.`)
    radky.push('Nejvíc by nám pomohlo, kdyby po kurzu uměli …')
  } else {
    radky.push('Teď to děláme ručně a zabere to zhruba … hodin týdně.')
    radky.push('Používáme k tomu …')
    radky.push('Nejvíc by nám pomohlo, kdyby …')
  }

  if (data.termin === 'hned') radky.push('', 'Spěchá to — potřebovali bychom to co nejdřív.')
  return radky.join('\n')
}

/* ── ochrana proti robotům ────────────────────────────────────────────── */

/**
 * Místo captchy stačí dvojice: skryté pole, které vyplní jen robot, a čas.
 * Člověk formulář neprokliká za tři vteřiny. Kdyby to přestalo stačit, sem
 * patří Cloudflare Turnstile — do té doby nikoho neotravujeme.
 */
export const MINIMALNI_CAS_MS = 3000

export function vypadaJakoRobot(data, zacatek) {
  return Boolean(data.webUrl.trim()) || Date.now() - zacatek < MINIMALNI_CAS_MS
}

/* ── termíny konzultace ───────────────────────────────────────────────── */

const DNY = ['ne', 'po', 'út', 'st', 'čt', 'pá', 'so']

/** Čtyři nejbližší pracovní okna — stejná demo data jako rezervační ukázka. */
export function nabidkaTerminu(od = new Date()) {
  const sloty = []
  const den = new Date(od)
  den.setHours(0, 0, 0, 0)

  while (sloty.length < 4) {
    den.setDate(den.getDate() + 1)
    const dvt = den.getDay()
    if (dvt === 0 || dvt === 6) continue

    for (const cas of ['10:00', '15:00']) {
      if (sloty.length < 4) sloty.push(`${DNY[dvt]} ${den.getDate()}. ${den.getMonth() + 1}. · ${cas}`)
    }
  }
  return sloty
}
