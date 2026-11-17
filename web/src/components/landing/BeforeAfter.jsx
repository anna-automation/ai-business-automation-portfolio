import { Check, ChevronsRight } from 'lucide-react'
import { cn } from '../../lib/utils.js'
import { SectionLead } from './parts.jsx'

const BEFORE = ['Ruční vyplňování', 'Přepisování dat', 'Ztráta času']
const AFTER = ['Automaticky', 'Okamžitě', 'Bez námahy']

/** Štítek, který sedí obkročmo na horní hraně karty. */
function Tab({ children, tone }) {
  return (
    <span
      className={cn(
        'absolute -top-4 left-1/2 z-10 -translate-x-1/2 rounded-full px-6 py-2 text-[0.95rem] font-bold',
        tone === 'pink'
          ? 'bg-[linear-gradient(135deg,#ff3b7f,#ff0f5f)] text-white shadow-[0_8px_26px_-8px_rgb(255_20_102/0.9)]'
          : 'border border-white/12 bg-[#20233a] text-white/90 shadow-[0_8px_26px_-14px_rgb(0_0_0/0.9)]'
      )}
    >
      {children}
    </span>
  )
}

function Row({ children, tone }) {
  return (
    <li className="flex items-center gap-4">
      <span
        className={cn(
          'grid size-7 shrink-0 place-items-center rounded-[0.5rem] border',
          tone === 'pink'
            ? 'border-[rgb(255_20_102/0.55)] bg-[rgb(255_20_102/0.18)] text-[var(--lp-pink-bright)] shadow-[0_0_16px_-4px_rgb(255_20_102/0.8)]'
            : 'border-white/22 bg-white/[0.04] text-white/85'
        )}
      >
        <Check size={16} strokeWidth={3} />
      </span>
      <span className="text-[1rem] text-white/90">{children}</span>
    </li>
  )
}

/** Hodiny s rychlostními čárami — „stejná práce, zlomek času“. */
function FastClock({ className }) {
  return (
    <svg viewBox="0 0 86 64" fill="none" className={className} aria-hidden>
      <defs>
        {/* userSpaceOnUse — vodorovné čáry mají nulovou výšku a s poměrovým
            gradientem by se vůbec nevykreslily */}
        <linearGradient id="lp-clock" x1="0" y1="56" x2="80" y2="6" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ff1466" />
          <stop offset="0.55" stopColor="#c026d3" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <g stroke="url(#lp-clock)" strokeWidth="3.4" strokeLinecap="round">
        <path d="M2 20h18" />
        <path d="M0 32h22" />
        <path d="M4 44h16" />
      </g>
      <circle
        cx="56"
        cy="32"
        r="22"
        stroke="url(#lp-clock)"
        strokeWidth="3.4"
        strokeDasharray="112 26"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M56 18v14l10 7"
        stroke="url(#lp-clock)"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

export default function BeforeAfter() {
  return (
    <section className="relative z-10">
      <div className="mx-auto w-full max-w-[82rem] px-5 py-12 sm:px-8 lg:py-16">
        <div className="grid items-center gap-x-7 gap-y-16 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_minmax(0,22rem)]">
          {/* --- před --- */}
          <div className="relative">
            <Tab>Před</Tab>
            <div className="lp-card overflow-hidden px-7 pb-9 pt-11 sm:px-9">
              <ul className="space-y-5">
                {BEFORE.map((item) => (
                  <Row key={item}>{item}</Row>
                ))}
              </ul>
              {/* studený odlesk v pravém dolním rohu jako na předloze */}
              <span
                aria-hidden
                className="pointer-events-none absolute -bottom-24 -right-24 size-56 rounded-full bg-[radial-gradient(circle,rgb(34_211_238/0.3)_0%,transparent_65%)] blur-[6px]"
              />
            </div>
          </div>

          {/* --- šipka --- */}
          <div className="flex justify-center lg:px-2">
            <ChevronsRight
              size={54}
              strokeWidth={2.6}
              className="lp-arrows lp-glow-cyan rotate-90 lg:rotate-0"
              aria-hidden
            />
          </div>

          {/* --- po --- */}
          <div className="lp-neon relative rounded-[1.5rem]">
            <Tab tone="pink">Po</Tab>
            <div className="flex items-center gap-5 rounded-[1.5rem] bg-[rgb(12_10_26/0.72)] px-7 pb-9 pt-11 sm:px-9">
              <ul className="space-y-5">
                {AFTER.map((item) => (
                  <Row key={item} tone="pink">
                    {item}
                  </Row>
                ))}
              </ul>
              <FastClock className="ml-auto hidden w-[6.6rem] shrink-0 sm:block" />
            </div>
          </div>

          {/* --- výsledek --- */}
          <SectionLead
            eyebrow="Výsledek"
            title={
              <>
                Více času
                <br />
                na to, <span className="text-[var(--lp-pink)]">co má smysl.</span>
              </>
            }
          />
        </div>
      </div>
    </section>
  )
}
