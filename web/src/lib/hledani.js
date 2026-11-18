import automationsCatalog from 'virtual:automations'
import { fold } from './utils.js'
import { products } from '../data/products.js'
import { audiences } from '../data/audiences.js'
import { pillars } from '../data/pillars.js'

/**
 * Vyhledávání pro našeptávač v hlavičce.
 *
 * Čeština skloňuje, takže porovnávat celá slova nestačí — „automatizaci“,
 * „automatizací“ a „automatizace“ musí najít totéž. Proto se každé slovo
 * ořeže na kmen a teprve kmeny se porovnávají. Zároveň se hledá prefixově,
 * aby našeptávač reagoval už po pár písmenech.
 */

/**
 * České koncovky od nejdelších po nejkratší. Seznam je schválně krátký:
 * delší by začal ukrajovat i z kmene a slova by se slévala dohromady.
 */
const KONCOVKY = [
  'ovanim',
  'ovani',
  'ovych',
  'ovymi',
  'ovat',
  'ejsi',
  'ami',
  'ach',
  'emi',
  'ech',
  'ich',
  'ych',
  'ymi',
  'ovi',
  'ove',
  'eho',
  'emu',
  'ost',
  'am',
  'em',
  'im',
  'om',
  'um',
  'ou',
  'ym',
  'mi',
  'a',
  'e',
  'i',
  'o',
  'u',
  'y',
]

const MIN_KMEN = 4

/** Ořeže slovo na kmen: bez diakritiky, bez koncovky. */
export function kmen(slovo) {
  const s = fold(slovo)
  if (s.length <= MIN_KMEN) return s
  for (const k of KONCOVKY) {
    if (s.endsWith(k) && s.length - k.length >= MIN_KMEN) {
      return s.slice(0, -k.length)
    }
  }
  return s
}

/** Rozpadne text na kmeny jednotlivých slov. */
function kmeny(text) {
  return fold(text)
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 1)
    .map(kmen)
}

const STRANKY = [
  { nazev: 'Ukázky', popis: 'Interaktivní ukázky automatizací', cesta: '/ukazky' },
  { nazev: 'Pro koho', popis: 'Řešení podle oboru a velikosti firmy', cesta: '/pro-koho' },
  { nazev: 'Školení', popis: 'Kurzy, workshopy a materiály pro tým', cesta: '/skoleni' },
  { nazev: 'Ceník', popis: 'Kolik to stojí a co za to dostanete', cesta: '/kontakt' },
  { nazev: 'Automatizace', popis: 'Katalog hotových workflow', cesta: '/automatizace' },
  { nazev: 'O mně', popis: 'Kdo za MAKÁSAMO stojí', cesta: '/o-mne' },
  { nazev: 'Kontakt', popis: 'Napište nám, ozveme se do 24 hodin', cesta: '/kontakt' },
  { nazev: 'Ochrana osobních údajů', popis: 'Jak nakládáme s daty', cesta: '/ochrana-osobnich-udaju' },
  { nazev: 'Přístupnost', popis: 'Ovládání klávesnicí a omezení pohybu', cesta: '/pristupnost' },
  { nazev: 'Bezpečnost a AI', popis: 'Co nevkládat do AI nástrojů, AI Act', cesta: '/bezpecnost-ai' },
]

/**
 * Index se staví jednou. Každá položka nese kmeny svého názvu zvlášť od
 * kmenů popisu — shoda v názvu váží víc.
 */
function postavIndex() {
  const polozky = []

  const pridej = (p) => {
    polozky.push({
      ...p,
      kmenyNazev: kmeny(p.nazev),
      kmenyPopis: kmeny([p.popis, ...(p.klicova ?? [])].join(' ')),
    })
  }

  for (const s of STRANKY) pridej({ ...s, druh: 'Stránka' })

  for (const p of products) {
    pridej({
      druh: 'Ukázka',
      nazev: p.title.cs,
      popis: p.tagline.cs,
      klicova: [...p.stack, ...(p.categories ?? [])],
      cesta: `/ukazky/${p.slug}`,
    })
  }

  for (const a of automationsCatalog) {
    pridej({
      druh: 'Automatizace',
      nazev: a.title?.cs ?? a.slug,
      popis: a.summary?.cs ?? '',
      klicova: [...(a.tools ?? []), ...(a.tags ?? [])],
      cesta: `/automatizace/${a.slug}`,
    })
  }

  for (const a of audiences) {
    pridej({
      druh: 'Pro koho',
      nazev: a.name.cs,
      popis: a.tagline.cs,
      cesta: `/pro-koho#${a.id}`,
    })
  }

  for (const p of pillars) {
    pridej({
      druh: 'Oblast',
      nazev: p.title.cs,
      popis: p.summary.cs,
      cesta: '/skoleni',
    })
  }

  return polozky
}

let index = null
const dejIndex = () => (index ??= postavIndex())

/** Délka společného začátku dvou řetězců. */
function spolecnyZacatek(a, b) {
  let i = 0
  while (i < a.length && i < b.length && a[i] === b[i]) i++
  return i
}

/**
 * Jsou to tvary téhož slova? Kmeny se můžou lišit v poslední hlásce kvůli
 * měkčení („kalkulačka“ → kalkulack, ale „kalkulačce“ → kalkulacc) nebo
 * příponou („realitky“ vs „realitní“). Stačí tedy dost dlouhý společný
 * začátek, který pokrývá většinu obou kmenů.
 */
function pribuzne(a, b) {
  const spolecne = spolecnyZacatek(a, b)
  if (spolecne < 5) return false
  return spolecne / Math.min(a.length, b.length) >= 0.7
}

/**
 * Skóre jedné položky vůči dotazu. Vyšší je lepší, nula znamená „nehodí se“.
 * Každé slovo dotazu musí někde sednout, jinak položka vypadne — jinak by
 * dvouslovný dotaz vracel všechno, co odpovídá jen prvnímu slovu.
 */
function skore(polozka, dotazKmeny, dotazSyrovy) {
  let soucet = 0

  for (const dk of dotazKmeny) {
    let nej = 0
    for (const k of polozka.kmenyNazev) {
      if (k === dk) nej = Math.max(nej, 10)
      else if (k.startsWith(dk)) nej = Math.max(nej, 7)
      else if (dk.startsWith(k) && k.length >= MIN_KMEN) nej = Math.max(nej, 5)
      else if (pribuzne(k, dk)) nej = Math.max(nej, 4)
    }
    for (const k of polozka.kmenyPopis) {
      if (k === dk) nej = Math.max(nej, 4)
      else if (k.startsWith(dk)) nej = Math.max(nej, 3)
      else if (pribuzne(k, dk)) nej = Math.max(nej, 2)
    }
    if (nej === 0) return 0
    soucet += nej
  }

  // Název začínající dotazem má přednost — tak se chovají našeptávače.
  if (fold(polozka.nazev).startsWith(dotazSyrovy)) soucet += 6
  // Kratší název znamená přesnější trefu.
  soucet += Math.max(0, 3 - polozka.nazev.length / 20)

  return soucet
}

/**
 * Vrátí nejlepší návrhy pro dotaz.
 * @param {string} dotaz co uživatel napsal
 * @param {number} limit kolik návrhů vrátit
 */
export function hledej(dotaz, limit = 7) {
  const syrovy = fold(dotaz).trim()
  if (syrovy.length < 2) return []

  const dotazKmeny = kmeny(dotaz)
  if (dotazKmeny.length === 0) return []

  return dejIndex()
    .map((p) => ({ polozka: p, skore: skore(p, dotazKmeny, syrovy) }))
    .filter((v) => v.skore > 0)
    .sort((a, b) => b.skore - a.skore)
    .slice(0, limit)
    .map((v) => v.polozka)
}

/**
 * Rozdělí text na úseky, které se shodují s dotazem, a ty ostatní —
 * našeptávač pak shodu zvýrazní.
 */
export function zvyrazni(text, dotaz) {
  const dotazKmeny = kmeny(dotaz).filter(Boolean)
  if (dotazKmeny.length === 0) return [{ text, shoda: false }]

  const casti = []
  const slova = text.split(/(\s+)/)

  for (const slovo of slova) {
    if (/^\s+$/.test(slovo)) {
      casti.push({ text: slovo, shoda: false })
      continue
    }
    const k = kmen(slovo)
    const sedi = dotazKmeny.some((dk) => k.startsWith(dk) || dk.startsWith(k))
    if (!sedi) {
      casti.push({ text: slovo, shoda: false })
      continue
    }
    // Zvýrazní se jen tolik znaků, kolik uživatel napsal.
    const delka = Math.min(
      slovo.length,
      Math.max(...dotazKmeny.map((dk) => (k.startsWith(dk) ? dk.length : k.length)))
    )
    casti.push({ text: slovo.slice(0, delka), shoda: true })
    if (delka < slovo.length) casti.push({ text: slovo.slice(delka), shoda: false })
  }

  return casti
}
