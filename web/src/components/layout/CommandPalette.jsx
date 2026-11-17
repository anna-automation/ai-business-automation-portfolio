import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  CornerDownLeft,
  FolderGit2,
  Languages,
  LayoutGrid,
  Moon,
  Search,
  Sun,
  Waves,
} from 'lucide-react'
import automationsCatalog from 'virtual:automations'
import { cn, fold } from '../../lib/utils.js'
import { usePrefs } from '../../lib/prefs.jsx'
import { useT } from '../../lib/i18n.jsx'
import { products } from '../../data/products.js'
import { audiences } from '../../data/audiences.js'
import { Kbd } from '../ui/primitives.jsx'

/**
 * Ctrl/Cmd + K. Hledá napříč stránkami, ukázkami, automatizacemi i cílovkami
 * a nabízí rychlé akce (téma, jazyk, pohyb). Vyhledávání ignoruje diakritiku,
 * takže "ukazky" najde "ukázky".
 */

export default function CommandPalette({ open, onClose }) {
  const { t, lang, pick } = useT()
  const navigate = useNavigate()
  const { toggleTheme, toggleLang, theme, motion: motionPref, setMotion } = usePrefs()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  const groups = useMemo(() => {
    const pages = [
      { id: 'home', label: t('nav.home'), to: '/', icon: LayoutGrid },
      { id: 'products', label: t('nav.products'), to: '/ukazky', icon: LayoutGrid },
      { id: 'automations', label: t('nav.automations'), to: '/automatizace', icon: FolderGit2 },
      { id: 'audiences', label: t('nav.audiences'), to: '/pro-koho', icon: LayoutGrid },
      { id: 'learning', label: t('nav.learning'), to: '/skoleni', icon: LayoutGrid },
      { id: 'about', label: t('nav.about'), to: '/o-mne', icon: LayoutGrid },
      { id: 'contact', label: t('nav.contact'), to: '/kontakt', icon: LayoutGrid },
    ]

    const productItems = products.map((p) => ({
      id: `product-${p.id}`,
      label: pick(p.title),
      hint: pick(p.tagline),
      to: `/ukazky/${p.slug}`,
    }))

    const automationItems = automationsCatalog.map((a) => ({
      id: `automation-${a.slug}`,
      label: pick(a.title) || a.slug,
      hint: a.dir,
      to: `/automatizace/${a.slug}`,
    }))

    const audienceItems = audiences.map((a) => ({
      id: `audience-${a.id}`,
      label: pick(a.name),
      hint: t('nav.audiences'),
      to: `/pro-koho#${a.id}`,
    }))

    const actions = [
      {
        id: 'act-theme',
        label: theme === 'dark' ? 'Světlý režim / Light mode' : 'Tmavý režim / Dark mode',
        icon: theme === 'dark' ? Sun : Moon,
        run: toggleTheme,
      },
      {
        id: 'act-lang',
        label: lang === 'cs' ? 'Switch to English' : 'Přepnout do češtiny',
        icon: Languages,
        run: toggleLang,
      },
      {
        id: 'act-motion',
        label: motionPref === 'reduced' ? t('motion.on') : t('motion.off'),
        icon: Waves,
        run: () => setMotion(motionPref === 'reduced' ? 'full' : 'reduced'),
      },
    ]

    return [
      { key: 'palette.pages', items: [...pages, ...audienceItems] },
      { key: 'palette.products', items: productItems },
      { key: 'palette.automations', items: automationItems },
      { key: 'palette.actions', items: actions },
    ]
  }, [t, lang, pick, theme, motionPref, toggleTheme, toggleLang, setMotion])

  const filtered = useMemo(() => {
    const q = fold(query.trim())
    if (!q) return groups.map((g) => ({ ...g, items: g.items.slice(0, 6) }))
    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter(
          (item) => fold(item.label).includes(q) || fold(item.hint ?? '').includes(q)
        ),
      }))
      .filter((g) => g.items.length > 0)
  }, [groups, query])

  const flat = useMemo(() => filtered.flatMap((g) => g.items), [filtered])

  useEffect(() => setActive(0), [query, open])

  useEffect(() => {
    if (!open) return
    setQuery('')
    const timer = setTimeout(() => inputRef.current?.focus(), 60)
    return () => clearTimeout(timer)
  }, [open])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const run = (item) => {
    if (!item) return
    onClose()
    if (item.run) item.run()
    else if (item.to) navigate(item.to)
  }

  const onKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((i) => (i + 1) % Math.max(1, flat.length))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((i) => (i - 1 + flat.length) % Math.max(1, flat.length))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      run(flat[active])
    } else if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
    }
  }

  // Aktivní položku držíme ve výřezu.
  useEffect(() => {
    const el = listRef.current?.querySelector('[data-active="true"]')
    el?.scrollIntoView({ block: 'nearest' })
  }, [active])

  let cursor = -1

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="no-print fixed inset-0 z-[80] flex items-start justify-center p-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            aria-label={t('nav.close')}
            onClick={onClose}
            className="absolute inset-0 bg-bg-sunk/70 backdrop-blur-[3px]"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={t('nav.searchHint')}
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.985 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="glass relative w-full max-w-xl overflow-hidden rounded-2xl shadow-[var(--shadow-lift)]"
            onKeyDown={onKeyDown}
          >
            <div className="flex items-center gap-3 border-b border-line px-4 py-3.5">
              <Search size={17} className="shrink-0 text-muted" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('palette.placeholder')}
                className="w-full bg-transparent text-[0.95rem] outline-none placeholder:text-muted"
                aria-label={t('nav.searchHint')}
              />
              <Kbd>Esc</Kbd>
            </div>

            <div ref={listRef} className="hide-scrollbar max-h-[52vh] overflow-y-auto p-2">
              {flat.length === 0 && (
                <p className="px-3 py-8 text-center text-[0.85rem] text-muted">
                  {t('palette.empty')}
                </p>
              )}

              {filtered.map((group) => (
                <div key={group.key} className="mb-1">
                  <p className="label-mono px-3 py-2">{t(group.key)}</p>
                  {group.items.map((item) => {
                    cursor += 1
                    const isActive = cursor === active
                    const Icon = item.icon ?? ArrowRight
                    return (
                      <button
                        key={item.id}
                        type="button"
                        data-active={isActive}
                        onMouseEnter={() => setActive(cursor)}
                        onClick={() => run(item)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                          isActive ? 'bg-accent/14' : 'hover:bg-surface-2'
                        )}
                      >
                        <Icon
                          size={15}
                          className={cn('shrink-0', isActive ? 'text-accent' : 'text-muted')}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[0.88rem] font-medium">
                            {item.label}
                          </span>
                          {item.hint && (
                            <span className="block truncate text-[0.74rem] text-muted">
                              {item.hint}
                            </span>
                          )}
                        </span>
                        {isActive && <CornerDownLeft size={13} className="shrink-0 text-muted" />}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 border-t border-line px-4 py-2.5">
              <span className="flex items-center gap-1.5 text-[0.7rem] text-muted">
                <Kbd>↑</Kbd>
                <Kbd>↓</Kbd>
                {t('palette.navigate')}
              </span>
              <span className="flex items-center gap-1.5 text-[0.7rem] text-muted">
                <Kbd>↵</Kbd>
                {t('palette.select')}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
