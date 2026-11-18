import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, Mail, Phone } from 'lucide-react'
import { site } from '../../data/site.js'
import LandingSearch from './LandingSearch.jsx'

/**
 * Pata webu. Nese to, co v hlavičce není: hledání napříč webem, odběr novinek
 * a informační odkazy. Záložky z hlavičky se tu schválně neopakují — kdo
 * doscrolluje až sem, hledá něco jiného než hlavní menu.
 *
 * Všechny sloupce mají stejnou váhu: žádné velké nadpisy, jen mikro-labely,
 * aby pata zůstala patou a nepřetlačila obsah stránky.
 */
const INFORMACE = [
  { to: '/ochrana-osobnich-udaju', label: 'Ochrana osobních údajů' },
  { to: '/podminky', label: 'Podmínky použití' },
  { to: '/cookies', label: 'Cookies' },
  { to: '/pristupnost', label: 'Přístupnost' },
  { to: '/bezpecnost-ai', label: 'Bezpečnost a AI' },
  { to: '/odstoupeni-od-smlouvy', label: 'Odstoupení od smlouvy' },
]

export default function LandingFooter() {
  const [email, setEmail] = useState('')
  const [odeslano, setOdeslano] = useState(false)
  const [chyba, setChyba] = useState('')

  const prihlasit = (e) => {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setChyba('Zkontrolujte formát e-mailu.')
      return
    }
    setChyba('')
    setOdeslano(true)
  }

  return (
    <footer className="no-print relative z-10 mt-20 border-t border-white/[0.07]">
      <div className="mx-auto w-full max-w-[84rem] px-5 py-12 sm:px-6">
        <div className="grid gap-x-12 gap-y-9 lg:grid-cols-[1.3fr_1fr_1fr]">
          {/* značka a pod ní hledání */}
          <div>
            <Link to="/" aria-label="MAKÁSAMO — domů">
              <img
                src="/media/makasamo-logo.png"
                alt="MAKÁSAMO"
                width={1592}
                height={264}
                className="h-auto w-[165px]"
              />
            </Link>
            <p className="mt-4 max-w-[22rem] text-[0.85rem] leading-relaxed text-white/50">
              Automatizace firemních procesů — od zmapování po nasazení. Ukázky běží na demo
              datech.
            </p>
            <div className="mt-6 max-w-[18rem]">
              <LandingSearch smerVzhuru maly />
              <p className="mt-2 text-[0.78rem] leading-snug text-white/35">
                Našeptávač rozumí i skloňování.
              </p>
            </div>
          </div>

          {/* kontakt a odběr novinek */}
          <div>
            <p className="lp-eyebrow">Kontakt</p>
            <ul className="mt-3.5 space-y-2">
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="flex items-center gap-2 text-[0.86rem] text-white/65 transition-colors hover:text-white"
                >
                  <Mail size={14} strokeWidth={2} aria-hidden className="shrink-0 text-white/35" />
                  {site.email}
                </a>
              </li>
              <li className="flex items-center gap-2 text-[0.86rem] text-white/50">
                <Phone size={14} strokeWidth={2} aria-hidden className="shrink-0 text-white/35" />
                {site.phone}
              </li>
            </ul>

            <p className="lp-eyebrow mt-7">Novinky</p>
            {odeslano ? (
              <p className="mt-3.5 flex items-start gap-2 text-[0.84rem] leading-snug text-white/65">
                <Check
                  size={15}
                  strokeWidth={2.6}
                  aria-hidden
                  className="mt-0.5 shrink-0 text-[var(--lp-pink)]"
                />
                Díky — v demu se ale nic neodeslalo.
              </p>
            ) : (
              <form onSubmit={prihlasit} noValidate className="mt-3.5">
                <label htmlFor="newsletter-email" className="sr-only">
                  Váš e-mail
                </label>
                <div className="lp-search lp-search-maly">
                  <Mail size={15} strokeWidth={2.1} aria-hidden className="shrink-0 text-white/45" />
                  <input
                    id="newsletter-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setChyba('')
                    }}
                    placeholder="vas@email.cz"
                    aria-invalid={Boolean(chyba)}
                    autoComplete="email"
                    className="w-full bg-transparent text-[0.86rem] text-white outline-none placeholder:text-white/40"
                  />
                  <button
                    type="submit"
                    aria-label="Přihlásit k odběru"
                    className="-mr-1.5 grid size-7 shrink-0 place-items-center rounded-full bg-[var(--lp-pink)] text-white transition-transform duration-300 hover:scale-105"
                  >
                    <ArrowRight size={14} strokeWidth={2.6} />
                  </button>
                </div>
                <p className="mt-2 text-[0.78rem] leading-snug text-white/35">
                  {chyba ? (
                    <span className="text-[#ff8aa8]">{chyba}</span>
                  ) : (
                    'Jeden e-mail měsíčně, odhlášení jedním klikem.'
                  )}
                </p>
              </form>
            )}
          </div>

          {/* informace */}
          <nav aria-label="Informace">
            <p className="lp-eyebrow">Informace</p>
            <ul className="mt-3.5 grid gap-x-5 gap-y-2 sm:grid-cols-2 lg:grid-cols-1">
              {INFORMACE.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-[0.85rem] text-white/65 transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="mt-10 border-t border-white/[0.07] pt-6 text-[0.78rem] text-white/40">
          © {new Date().getFullYear()} MAKÁSAMO · {site.person} · Demo portfolio, data jsou
          fiktivní.
        </p>
      </div>
    </footer>
  )
}
