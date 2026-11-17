import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Languages, Menu, Moon, Search, Sun, Waves, X } from 'lucide-react'
import { cn } from '../../lib/utils.js'
import { usePrefs } from '../../lib/prefs.jsx'
import { useT } from '../../lib/i18n.jsx'
import { Button, IconButton } from '../ui/Button.jsx'
import { Kbd, Tooltip } from '../ui/primitives.jsx'
import { Wordmark } from '../ui/Logo.jsx'

const NAV = [
  { to: '/ukazky', key: 'nav.products' },
  { to: '/automatizace', key: 'nav.automations' },
  { to: '/pro-koho', key: 'nav.audiences' },
  { to: '/skoleni', key: 'nav.learning' },
  { to: '/o-mne', key: 'nav.about' },
]

export default function Header({ onOpenPalette }) {
  const { t, lang } = useT()
  const { theme, toggleTheme, toggleLang, motion: motionPref, setMotion, reducedMotion } = usePrefs()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Při přechodu na jinou stránku mobilní menu zavřeme.
  useEffect(() => setOpen(false), [location.pathname])

  // Otevřené menu nesmí nechat scrollovat stránku pod sebou.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <header
        className={cn(
          'no-print fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-[var(--ease-out-expo)]',
          scrolled ? 'py-2' : 'py-3.5'
        )}
      >
        <div className="mx-auto w-full max-w-[82rem] px-5 sm:px-7">
          <div
            className={cn(
              'flex items-center gap-3 rounded-2xl transition-all duration-500 ease-[var(--ease-out-expo)]',
              scrolled ? 'glass px-3 py-2 shadow-[var(--shadow-soft)]' : 'px-1 py-1.5'
            )}
          >
            <Link to="/" className="group flex shrink-0 items-center" aria-label={`${t('brand.name')} — domů`}>
              <Wordmark
                alt={t('brand.name')}
                className="w-[9rem] transition-opacity duration-300 group-hover:opacity-85 sm:w-[11rem]"
              />
            </Link>

            <nav className="ml-2 hidden items-center gap-0.5 lg:flex" aria-label={t('nav.menu')}>
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'relative rounded-lg px-3 py-2 text-[0.86rem] font-medium transition-colors duration-300',
                      isActive ? 'text-text' : 'text-muted hover:text-text'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {t(item.key)}
                      {isActive && (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-x-2.5 -bottom-0.5 h-[2px] rounded-full bg-accent"
                          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                onClick={onOpenPalette}
                aria-label={t('nav.searchHint')}
                className="group flex h-9 items-center gap-2 rounded-xl border border-line bg-surface-2/70 px-2.5 text-muted transition-all duration-300 hover:border-line-strong hover:text-text sm:pr-2"
              >
                <Search size={15} strokeWidth={2.2} />
                <span className="hidden text-[0.8rem] md:inline">{t('nav.search')}</span>
                <Kbd className="hidden md:inline-flex">Ctrl K</Kbd>
              </button>

              <Tooltip content={reducedMotion ? t('motion.off') : t('motion.on')}>
                <IconButton
                  icon={Waves}
                  label={t('motion.toggle')}
                  active={motionPref === 'reduced'}
                  onClick={() => setMotion(motionPref === 'reduced' ? 'full' : 'reduced')}
                  className="hidden sm:grid"
                />
              </Tooltip>

              <Tooltip content={t('lang.toggle')}>
                <button
                  type="button"
                  onClick={toggleLang}
                  aria-label={t('lang.toggle')}
                  className="flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-text-soft transition-all duration-300 hover:bg-surface-2 hover:text-text"
                >
                  <Languages size={15.5} strokeWidth={2} />
                  <span className="font-mono text-[0.72rem] font-semibold uppercase">{lang}</span>
                </button>
              </Tooltip>

              <Tooltip content={t('theme.toggle')}>
                <IconButton
                  icon={theme === 'dark' ? Sun : Moon}
                  label={t('theme.toggle')}
                  onClick={toggleTheme}
                />
              </Tooltip>

              <Button
                to="/kontakt"
                size="sm"
                variant="primary"
                className="ml-1 hidden md:inline-flex"
                magnetic={false}
              >
                {t('nav.cta')}
              </Button>

              <IconButton
                icon={open ? X : Menu}
                label={open ? t('nav.close') : t('nav.menu')}
                onClick={() => setOpen((v) => !v)}
                className="lg:hidden"
              />
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="no-print fixed inset-0 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              aria-label={t('nav.close')}
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-bg/80 backdrop-blur-sm"
            />
            <motion.nav
              aria-label={t('nav.menu')}
              initial={{ y: -24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="glass absolute inset-x-4 top-20 overflow-hidden rounded-2xl p-2 shadow-[var(--shadow-lift)]"
            >
              {[{ to: '/', key: 'nav.home' }, ...NAV, { to: '/kontakt', key: 'nav.contact' }].map(
                (item, i) => (
                  <motion.div
                    key={item.to}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * i, duration: 0.35 }}
                  >
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center justify-between rounded-xl px-3.5 py-3 font-display text-[1.05rem] font-medium transition-colors',
                          isActive ? 'bg-surface-2 text-text' : 'text-text-soft hover:bg-surface-2'
                        )
                      }
                    >
                      {t(item.key)}
                      <span className="label-mono">{String(i).padStart(2, '0')}</span>
                    </NavLink>
                  </motion.div>
                )
              )}
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
