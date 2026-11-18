import { cn } from '../../lib/utils.js'

/**
 * Hlavička stránky s ukázkami. Vpravo svítí žárovka s mozkem — na předloze je
 * to fotorealistický render, tady je kreslená: drží neonovou paletu, škáluje
 * do libovolné velikosti a nestahuje se jako další obrázek.
 */
function Zarovka({ className }) {
  return (
    <svg viewBox="0 0 420 420" className={className} fill="none" aria-hidden>
      <defs>
        <radialGradient id="lp-zar-sklo" cx="0.38" cy="0.32" r="0.72">
          <stop offset="0" stopColor="#ff6aa5" stopOpacity="0.32" />
          <stop offset="0.55" stopColor="#ff1466" stopOpacity="0.12" />
          <stop offset="1" stopColor="#ff1466" stopOpacity="0.02" />
        </radialGradient>
        <linearGradient id="lp-zar-patice" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4a2340" />
          <stop offset="0.5" stopColor="#2a1428" />
          <stop offset="1" stopColor="#140a18" />
        </linearGradient>
        <filter id="lp-zar-zar" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        <filter id="lp-zar-zar-jemna" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* záře okolo */}
      <circle cx="210" cy="168" r="140" fill="url(#lp-zar-sklo)" />

      {/* patice */}
      <g transform="rotate(26 210 168)">
        <path
          d="M178 286h64v26a10 10 0 0 1-10 10h-44a10 10 0 0 1-10-10z"
          fill="url(#lp-zar-patice)"
          stroke="rgb(255 255 255 / 0.16)"
          strokeWidth="1.5"
        />
        {[0, 1, 2].map((i) => (
          <path
            key={i}
            d={`M180 ${292 + i * 9}h60`}
            stroke="rgb(255 255 255 / 0.14)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        ))}
        <path
          d="M186 322h48v16a14 14 0 0 1-14 14h-20a14 14 0 0 1-14-14z"
          fill="#1b0f1f"
          stroke="rgb(255 255 255 / 0.12)"
          strokeWidth="1.5"
        />

        {/* baňka */}
        <path
          d="M210 42c54 0 96 42 96 94 0 36-20 56-32 76-8 13-10 26-10 34h-108c0-8-2-21-10-34-12-20-32-40-32-76 0-52 42-94 96-94z"
          fill="rgb(255 255 255 / 0.03)"
          stroke="#ff1466"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M210 42c54 0 96 42 96 94 0 36-20 56-32 76-8 13-10 26-10 34h-108c0-8-2-21-10-34-12-20-32-40-32-76 0-52 42-94 96-94z"
          stroke="#ff4a8d"
          strokeWidth="6"
          strokeLinejoin="round"
          filter="url(#lp-zar-zar)"
          opacity="0.75"
        />
        {/* odlesk na skle */}
        <path
          d="M168 86c-14 12-22 30-22 48"
          stroke="rgb(255 255 255 / 0.45)"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* mozek uvnitř */}
        <g
          stroke="#ff1466"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#lp-zar-zar-jemna)"
        >
          <path d="M210 92v124" />
          <path d="M210 100c-10-12-28-10-34 2-12-2-22 8-20 20-12 6-14 22-4 30-6 12 2 26 15 27 2 12 15 19 26 14 5 6 13 8 17 5" />
          <path d="M210 100c10-12 28-10 34 2 12-2 22 8 20 20 12 6 14 22 4 30 6 12-2 26-15 27-2 12-15 19-26 14-5 6-13 8-17 5" />
          <path d="M186 124c8 2 13 9 12 18M234 124c-8 2-13 9-12 18M178 160c10-2 18 4 20 14M242 160c-10-2-18 4-20 14M192 196c6-4 13-3 18 2M228 196c-6-4-13-3-18 2" />
        </g>
      </g>
    </svg>
  )
}

export default function UkazkyHero({ className }) {
  return (
    <section className={cn('relative z-10 pt-28 sm:pt-32 lg:pt-36', className)}>
      <div className="mx-auto w-full max-w-[82rem] px-5 sm:px-8">
        <div className="relative">
          {/* žárovka leží za textem — nadpis přes ni na širokém displeji nejde */}
          <Zarovka
            className="pointer-events-none absolute -top-14 right-0 hidden w-[23rem] select-none lg:block xl:w-[26rem]"
          />

          <div className="relative max-w-[46rem]">
            <p className="lp-eyebrow flex items-center gap-4">
              Ukázky
              <span aria-hidden className="h-px w-10 bg-[var(--lp-pink)]" />
            </p>

            {/* na širokém displeji má věta zůstat na jednom řádku jako na předloze */}
            <h1 className="lp-jeden-radek mt-5 max-w-[58rem] text-[clamp(2.1rem,4vw,3.05rem)] leading-[1.06]">
              Inspirace, co už opravdu{' '}
              <span className="text-[var(--lp-pink)]">funguje</span>
            </h1>

            <p className="mt-6 max-w-[38rem] text-[clamp(1rem,1.3vw,1.12rem)] leading-[1.6] text-white/75">
              Prohlédněte si konkrétní automatizace, workflow a AI řešení z praxe. Filtrovat můžete
              podle cílové skupiny, kategorie nebo použitých nástrojů.
            </p>
          </div>

          {/* na úzkém displeji žárovka nezabírá místo vedle textu, ale pod ním */}
          <Zarovka className="mx-auto mt-10 w-[13rem] select-none sm:w-[15rem] lg:hidden" />
        </div>
      </div>
    </section>
  )
}
