import { PillButton } from './parts.jsx'

/** Závěrečná výzva v neonovém rámečku — poslední věc, kterou má člověk vidět. */
export default function FinalCta() {
  return (
    <section className="relative z-10">
      <div className="mx-auto w-full max-w-[82rem] px-5 pb-24 pt-6 sm:px-8 lg:pb-32">
        <div
          className="lp-neon rounded-[1.75rem]"
          style={{
            '--lp-neon-width': '3px',
            '--lp-neon-blur': '18px',
            '--lp-neon-glow': '1',
            '--lp-neon-gradient':
              'linear-gradient(96deg,#ff1466 0%,#ff2fb0 24%,#c026d3 52%,#7c3aed 68%,#22d3ee 90%,#22d3ee 100%)',
          }}
        >
          {/* ořez drží dekorativní oblouk uvnitř rámečku — záři rámečku nesmí
              seříznout, ta patří ven */}
          <div className="relative flex flex-col gap-9 overflow-hidden rounded-[1.75rem] bg-[linear-gradient(104deg,rgb(10_7_20/0.95)_0%,rgb(8_8_20/0.95)_52%,rgb(6_12_26/0.95)_100%)] shadow-[inset_70px_0_110px_-80px_rgb(255_20_102/0.95),inset_-70px_0_110px_-80px_rgb(34_211_238/0.8)] px-8 py-12 sm:px-12 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:px-16 lg:py-16">
            {/* tyrkysový oblouk v pravé části rámečku */}
            <svg
              aria-hidden
              viewBox="0 0 600 260"
              preserveAspectRatio="none"
              fill="none"
              className="pointer-events-none absolute -right-10 bottom-0 h-full w-[38rem] opacity-70"
            >
              <defs>
                <linearGradient id="lp-cta-arc" x1="0" y1="1" x2="1" y2="0">
                  <stop offset="0" stopColor="#22d3ee" stopOpacity="0" />
                  <stop offset="0.6" stopColor="#22d3ee" stopOpacity="0.45" />
                  <stop offset="1" stopColor="#38bdf8" stopOpacity="0.15" />
                </linearGradient>
                <filter id="lp-cta-soft" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" />
                </filter>
              </defs>
              {/* na předloze to jsou měkké závany světla, ne tenké linky */}
              <g filter="url(#lp-cta-soft)">
                <path
                  d="M40 268 C 230 250, 420 190, 520 10"
                  stroke="url(#lp-cta-arc)"
                  strokeWidth="16"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M120 270 C 300 252, 470 196, 560 40"
                  stroke="url(#lp-cta-arc)"
                  strokeWidth="9"
                  strokeLinecap="round"
                  fill="none"
                />
              </g>
            </svg>

            <h2 className="relative text-[clamp(1.9rem,4.2vw,3rem)]">
              Pojďme nechat
              <br />
              rutinu <span className="text-[var(--lp-pink)]">makat samo.</span>
            </h2>

            <PillButton to="/kontakt" size="lg" className="relative shrink-0">
              Kontaktujte nás
            </PillButton>
          </div>
        </div>
      </div>
    </section>
  )
}
