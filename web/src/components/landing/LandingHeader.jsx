import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { cn } from '../../lib/utils.js'
import { PillButton } from './parts.jsx'
import LandingPrepinace from './LandingPrepinace.jsx'

/**
 * Hlavička webu. Leží průhledně nad obsahem a pozadí si vezme až ve chvíli,
 * kdy pod ní začne ujíždět stránka.
 *
 * TODO Anna: „Ceník“ zatím nemá vlastní stránku — odkaz míří na kontakt.
 */
const NAV = [
  { to: '/ukazky', label: 'Ukázky' },
  { to: '/pro-koho', label: 'Pro koho' },
  { to: '/skoleni', label: 'Školení' },
  { to: '/kontakt', label: 'Ceník' },
]

export default function LandingHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header
      className={cn(
        'no-print fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
        scrolled
          ? 'border-b border-white/[0.07] bg-[rgb(7_6_15/0.82)] py-3 backdrop-blur-xl'
          : 'border-b border-transparent py-5'
      )}
    >
      <div className="mx-auto flex w-full max-w-[84rem] items-center gap-5 px-5 sm:px-6">
        <Link to="/" className="shrink-0" aria-label="MAKÁSAMO — domů">
          <img
            src="/media/makasamo-logo.png"
            alt="MAKÁSAMO"
            width={1592}
            height={264}
            className={cn(
              'h-auto w-[165px] transition-all duration-500 sm:w-[195px]',
              scrolled ? 'lg:w-[200px]' : 'lg:w-[230px]'
            )}
          />
        </Link>

        <nav className="ml-auto hidden items-center gap-8 lg:flex" aria-label="Hlavní navigace">
          {NAV.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'relative text-[0.97rem] font-medium transition-colors duration-300',
                  isActive ? 'text-white' : 'text-white/80 hover:text-white'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {item.label}
                  {isActive && (
                    <span
                      aria-hidden
                      className="absolute -bottom-1.5 left-0 h-[2px] w-full rounded-full bg-[var(--lp-pink)]"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LandingPrepinace />
          <LandingLang />
          <PillButton to="/kontakt" icon={false} className="h-11 px-6 text-[0.96rem]">
            Pojďme to probrat
          </PillButton>
        </div>

        <div className="ml-auto flex items-center gap-2.5 lg:hidden">
          <PillButton
            to="/kontakt"
            icon={false}
            className="hidden h-10 px-5 text-[0.92rem] sm:inline-flex"
          >
            Kontakt
          </PillButton>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Zavřít menu' : 'Otevřít menu'}
            aria-expanded={open}
            className="grid size-11 place-items-center rounded-xl border border-white/12 bg-white/[0.06] text-white transition-colors hover:bg-white/[0.12]"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden">
          <div className="mx-5 mt-4 rounded-2xl border border-white/[0.09] bg-[rgb(10_9_24/0.96)] p-3 backdrop-blur-xl sm:mx-6">
            <nav aria-label="Hlavní navigace">
              {NAV.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'block rounded-xl px-4 py-3.5 text-[1.05rem] font-medium transition-colors',
                      isActive
                        ? 'bg-white/[0.07] text-white'
                        : 'text-white/85 hover:bg-white/[0.06] hover:text-white'
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <NavLink
                to="/kontakt"
                onClick={() => setOpen(false)}
                className="block rounded-xl px-4 py-3.5 text-[1.05rem] font-medium text-[var(--lp-pink)] sm:hidden"
              >
                Kontakt
              </NavLink>
            </nav>

            <div className="mt-2 flex items-center justify-center gap-3 border-t border-white/[0.07] pt-3">
              <LandingPrepinace />
              <LandingLang />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
