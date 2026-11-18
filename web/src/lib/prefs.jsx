import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

/**
 * Jedno místo pro všechna uživatelská nastavení: téma, jazyk, pohyb, kurzor, role.
 * Všechno se pamatuje v localStorage — volba uživatele má přednost před efekty.
 */

const KEYS = {
  theme: 'abl-theme',
  lang: 'abl-lang',
  motion: 'abl-motion',
  cursor: 'abl-cursor',
  role: 'abl-role',
  cookies: 'abl-cookies',
}

function read(key, fallback) {
  try {
    return localStorage.getItem(key) ?? fallback
  } catch {
    return fallback
  }
}

function write(key, value) {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    /* privátní režim — nastavení prostě nepřežije reload */
  }
}

const PrefsContext = createContext(null)

export function PrefsProvider({ children }) {
  const [theme, setTheme] = useState(() => read(KEYS.theme, document.documentElement.dataset.theme || 'dark'))
  const [lang, setLang] = useState(() => read(KEYS.lang, 'cs'))
  const [motion, setMotion] = useState(() => read(KEYS.motion, 'full'))
  const [cursor, setCursor] = useState(() => read(KEYS.cursor, 'custom'))
  const [role, setRole] = useState(() => read(KEYS.role, null))
  const [cookies, setCookies] = useState(() => read(KEYS.cookies, null))

  // Systémová preference pohybu přebije "full" i bez zásahu uživatele.
  const [systemReducedMotion, setSystemReducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = (e) => setSystemReducedMotion(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const reducedMotion = systemReducedMotion || motion === 'reduced'

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    write(KEYS.theme, theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.lang = lang
    write(KEYS.lang, lang)
  }, [lang])

  useEffect(() => {
    document.documentElement.dataset.motion = reducedMotion ? 'reduced' : 'full'
    write(KEYS.motion, motion)
  }, [motion, reducedMotion])

  // Vlastní kurzor jen na zařízeních s myší a jen když ho uživatel chce.
  const [hasPointer, setHasPointer] = useState(
    () => window.matchMedia('(hover: hover) and (pointer: fine)').matches
  )
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    const onChange = (e) => setHasPointer(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const cursorActive = cursor === 'custom' && hasPointer && !reducedMotion

  useEffect(() => {
    document.documentElement.dataset.cursor = cursorActive ? 'custom' : 'native'
    write(KEYS.cursor, cursor)
  }, [cursor, cursorActive])

  useEffect(() => write(KEYS.role, role), [role])
  useEffect(() => write(KEYS.cookies, cookies), [cookies])

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
      setTheme,
      lang,
      setLang,
      toggleLang: () => setLang((l) => (l === 'cs' ? 'en' : 'cs')),
      motion,
      setMotion,
      reducedMotion,
      cursor,
      setCursor,
      cursorActive,
      hasPointer,
      role,
      setRole,
      cookies,
      setCookies,
    }),
    [theme, lang, motion, reducedMotion, cursor, cursorActive, hasPointer, role, cookies]
  )

  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>
}

export function usePrefs() {
  const ctx = useContext(PrefsContext)
  if (!ctx) throw new Error('usePrefs musí být uvnitř <PrefsProvider>')
  return ctx
}

/** Zkratka pro komponenty, které jen potřebují vědět, jestli smí animovat. */
export function useReducedMotion() {
  return usePrefs().reducedMotion
}

/** Stabilní callback na změnu jazyka s rozlišením locale pro Intl. */
export function useLocale() {
  const { lang } = usePrefs()
  return useCallback(() => (lang === 'en' ? 'en-US' : 'cs-CZ'), [lang])()
}
