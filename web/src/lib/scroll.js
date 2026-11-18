/**
 * Posouvání stránky, které respektuje omezení pohybu.
 *
 * `scrollTo({ behavior: 'smooth' })` si CSS pravidlem zakázat nejde — prohlížeč
 * ho provede vždycky. Proto všechna místa, která stránkou posouvají, používají
 * tyhle funkce místo volání nativního API napřímo.
 *
 * Stav se čte z DOM, ne z Reactu, aby šly funkce volat i mimo komponenty.
 */

/** Chce uživatel omezit pohyb? Systémové nastavení i přepínač v hlavičce. */
export function pohybOmezen() {
  if (typeof window === 'undefined') return false
  if (document.documentElement.dataset.motion === 'reduced') return true
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** 'smooth' nebo 'auto' podle nastavení. */
export function chovaniPosunu() {
  return pohybOmezen() ? 'auto' : 'smooth'
}

/** Nahoru na stránce. */
export function posunNahoru() {
  window.scrollTo({ top: 0, left: 0, behavior: chovaniPosunu() })
}

/** Na konkrétní prvek (kotva v URL, odkaz v obsahu). */
export function posunNaPrvek(el, options = {}) {
  if (!el) return
  el.scrollIntoView({ behavior: chovaniPosunu(), block: 'start', ...options })
}

/** O kus do strany — používají vodorovné seznamy karet. */
export function posunOKus(el, { left = 0, top = 0 } = {}) {
  if (!el) return
  el.scrollBy({ left, top, behavior: chovaniPosunu() })
}
