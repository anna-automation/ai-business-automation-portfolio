import { twMerge } from 'tailwind-merge'

/**
 * Spojí classNames a vyřeší konflikty ve prospěch té poslední.
 *
 * Bez tohoto by `hidden` předané zvenku prohrálo s `inline-flex` zapsaným
 * v základu komponenty — obojí je `display` a ve stejné CSS vrstvě rozhoduje
 * pořadí v souboru, ne pořadí v atributu.
 */
export function cn(...parts) {
  return twMerge(parts.filter(Boolean).join(' '))
}

/** Omezí číslo do rozsahu. */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

/** 1234 → "1 234" (české dělení tisíců nezlomitelnou mezerou) */
export function num(value, locale = 'cs-CZ') {
  return new Intl.NumberFormat(locale).format(value)
}

/** 12900 → "12 900 Kč" */
export function czk(value, locale = 'cs-CZ') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'CZK',
    maximumFractionDigits: 0,
  }).format(value)
}

/** Minuty → "3 h 20 min" */
export function duration(minutes, lang = 'cs') {
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  const hUnit = lang === 'en' ? 'h' : 'h'
  const mUnit = lang === 'en' ? 'min' : 'min'
  if (h === 0) return `${m} ${mUnit}`
  if (m === 0) return `${h} ${hUnit}`
  return `${h} ${hUnit} ${m} ${mUnit}`
}

/** Čeká zadaný počet ms — pro simulaci běhu workflow. */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Náhodné id bez závislostí. */
export function uid(prefix = 'id') {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

/** Diakritiku dolů, malá písmena — pro vyhledávání v češtině. */
export function fold(text) {
  return String(text ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

/** Datum ve formátu 17. 11. 2026 */
export function formatDate(date, locale = 'cs-CZ') {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  }).format(date instanceof Date ? date : new Date(date))
}

/** Rozdělí nadpis na slova pro postupné odhalení. */
export function words(text) {
  return String(text).split(/(\s+)/).filter(Boolean)
}
