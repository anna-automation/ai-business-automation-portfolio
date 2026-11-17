import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { cn } from '../../lib/utils.js'
import { PillButton } from './parts.jsx'

/**
 * Hlavička landing page. Leží průhledně nad hero a pozadí si vezme až ve chvíli,
 * kdy pod ní začne ujíždět obsah.
 *
 * TODO Anna: „Ceník“ zatím nemá vlastní stránku — odkaz míří na kontakt.
 */
const NAV = [
  { to: '/automatizace', label: 'Co umíme' },
  { to: '/ukazky', label: 'Ukázky' },
  { to: '/skoleni', label: 'Jak na to' },
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
      <div className="mx-auto flex w-full max-w-[82rem] items-center gap-6 px-5 sm:px-8">
        <Link to="/" className="shrink-0" aria-label="MAKÁSAMO — domů">
          <img
            src="/media/makasamo-logo.png"
            alt="MAKÁSAMO"
            width={1592}
            height={264}
            className={cn(
              'h-auto w-[190px] transition-all duration-500 sm:w-[240px]',
              scrolled ? 'lg:w-[240px]' : 'lg:w-[280px]'
            )}
          />
        </Link>

        <nav className="ml-auto hidden items-center gap-9 lg:flex" aria-label="Hlavní navigace">
          {NAV.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className="text-[0.97rem] font-medium text-white/85 transition-colors duration-300 hover:text-white"
            >
              {item.label}
            </NavLink>
          ))}
          <PillButton to="/kontakt" icon={false} className="h-11 px-7 text-[1.02rem]">
            Kontakt
          </PillButton>
        </nav>

        <div className="ml-auto flex items-center gap-3 lg:hidden">
          <PillButton to="/kontakt" icon={false} className="hidden h-10 px-5 text-[0.95rem] sm:inline-flex">
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
          <nav
            aria-label="Hlavní navigace"
            className="mx-5 mt-4 rounded-2xl border border-white/[0.09] bg-[rgb(10_9_24/0.96)] p-2 backdrop-blur-xl sm:mx-8"
          >
            {NAV.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-4 py-3.5 text-[1.05rem] font-medium text-white/85 transition-colors hover:bg-white/[0.06] hover:text-white"
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
        </div>
      )}
    </header>
  )
}
