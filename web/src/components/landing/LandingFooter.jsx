import { Link } from 'react-router-dom'
import { site } from '../../data/site.js'

/**
 * Pata landing page. Na předloze není, ale stránka nemůže skončit do prázdna —
 * drží proto stejný tmavý ladění a nese jen to nutné: značku, rozcestí a právo.
 */
const SECTIONS = [
  { to: '/automatizace', label: 'Co umíme' },
  { to: '/ukazky', label: 'Ukázky' },
  { to: '/skoleni', label: 'Jak na to' },
  { to: '/o-mne', label: 'O mně' },
  { to: '/kontakt', label: 'Kontakt' },
]

const LEGAL = [
  { to: '/ochrana-osobnich-udaju', label: 'Ochrana osobních údajů' },
  { to: '/podminky', label: 'Podmínky' },
  { to: '/cookies', label: 'Cookies' },
  { to: '/pristupnost', label: 'Přístupnost' },
]

export default function LandingFooter() {
  return (
    <footer className="no-print relative z-10 border-t border-white/[0.07]">
      <div className="mx-auto w-full max-w-[82rem] px-5 py-12 sm:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-sm">
            <Link to="/" aria-label="MAKÁSAMO — domů">
              <img
                src="/media/makasamo-logo.png"
                alt="MAKÁSAMO"
                width={1592}
                height={264}
                className="h-auto w-[190px]"
              />
            </Link>
            <p className="mt-5 text-[0.88rem] leading-relaxed text-white/55">
              Automatizace firemních procesů — od zmapování po nasazení. Ukázky na webu běží na
              demo datech.
            </p>
          </div>

          <nav aria-label="Sekce" className="min-w-[9rem]">
            <p className="lp-eyebrow">Sekce</p>
            <ul className="mt-4 space-y-2.5">
              {SECTIONS.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-[0.88rem] text-white/70 transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Právo" className="min-w-[12rem]">
            <p className="lp-eyebrow">Právo</p>
            <ul className="mt-4 space-y-2.5">
              {LEGAL.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-[0.88rem] text-white/70 transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="min-w-[11rem]">
            <p className="lp-eyebrow">Spojení</p>
            <ul className="mt-4 space-y-2.5">
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="text-[0.88rem] text-white/70 transition-colors hover:text-white"
                >
                  {site.email}
                </a>
              </li>
              <li className="text-[0.88rem] text-white/55">{site.phone}</li>
            </ul>
          </div>
        </div>

        <p className="mt-12 border-t border-white/[0.07] pt-6 text-[0.78rem] text-white/45">
          © {new Date().getFullYear()} MAKÁSAMO · {site.person}
        </p>
      </div>
    </footer>
  )
}
