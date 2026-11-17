import { Building2 } from 'lucide-react'
import { fakturace } from '../../data/site.js'
import Vizitka from './Vizitka.jsx'

/**
 * Spodní pruh kontaktní stránky: vlevo fakturační údaje i s adresou, vpravo
 * vizitka do telefonu. Jedno je pro účetní, druhé pro člověka — proto stojí
 * vedle sebe a dělí je linka jako na předloze.
 */
export default function ContactBilling() {
  return (
    <section className="relative z-10">
      <div className="mx-auto w-full max-w-[82rem] px-5 sm:px-8">
        <div aria-hidden className="h-px w-full bg-white/[0.09]" />

        <div className="grid gap-12 pt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,27rem)] lg:gap-0 lg:pt-14">
          {/* ── Fakturační údaje ───────────────────────────────────── */}
          <div className="lg:pr-12">
            <p className="lp-eyebrow flex items-center gap-4">
              Fakturační údaje
              <span aria-hidden className="h-px w-10 bg-[var(--lp-pink)]" />
            </p>

            <div className="mt-8 flex gap-5">
              <Building2
                size={30}
                strokeWidth={1.7}
                aria-hidden
                className="mt-1 shrink-0 text-[var(--lp-pink)]"
              />
              <dl>
                <dt className="text-[1.15rem] font-semibold text-white">{fakturace.nazev}</dt>

                <dd className="mt-2 text-[0.98rem] leading-[1.6] text-white/75">
                  {fakturace.ulice}
                  <br />
                  {fakturace.mesto}
                </dd>

                <dd className="mt-3 text-[0.98rem] text-white/75">
                  IČO: {fakturace.ico}
                  <span aria-hidden className="mx-3 text-white/25">
                    |
                  </span>
                  DIČ: {fakturace.dic}
                </dd>

                <dd className="mt-1.5 text-[0.95rem] text-white/60">
                  Spisová značka: {fakturace.spisovaZnacka}
                </dd>
                <dd className="mt-1.5 text-[0.95rem] text-white/60">{fakturace.dph}</dd>
              </dl>
            </div>
          </div>

          {/* ── Vizitka do telefonu ────────────────────────────────── */}
          <div className="lg:border-l lg:border-white/[0.09] lg:pl-12">
            <p className="lp-eyebrow flex items-center gap-4">
              Vizitka do telefonu
              <span aria-hidden className="h-px w-10 bg-[var(--lp-pink)]" />
            </p>

            <div className="mt-8">
              <Vizitka />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
