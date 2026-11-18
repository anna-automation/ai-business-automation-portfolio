import { Building2 } from 'lucide-react'
import { fakturace } from '../../data/site.js'
import MapaSidla from './MapaSidla.jsx'
import Vizitka from './Vizitka.jsx'

/**
 * Spodek kontaktní stránky ve třech sloupcích: fakturační údaje, mapa sídla
 * a vizitka. Mapa stojí uprostřed — patří k adrese nalevo i ke kontaktu
 * napravo a v užším sloupci přestane přebíjet zbytek stránky.
 */
export default function ContactBilling() {
  return (
    <section className="relative z-10">
      <div className="mx-auto w-full max-w-[82rem] px-5 sm:px-8">
        <div aria-hidden className="h-px w-full bg-white/[0.09]" />

        <div className="grid gap-x-10 gap-y-12 pt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)_minmax(0,21rem)] lg:pt-14">
          {/* ── Fakturační údaje ───────────────────────────────────── */}
          <div>
            <p className="lp-eyebrow flex items-center gap-4">
              Fakturační údaje
              <span aria-hidden className="h-px w-10 bg-[var(--lp-pink)]" />
            </p>

            <div className="mt-7 flex gap-5">
              <Building2
                size={28}
                strokeWidth={1.7}
                aria-hidden
                className="mt-0.5 shrink-0 text-[#a78bfa]"
              />
              <dl className="grid gap-x-10 gap-y-5 text-[0.96rem] leading-[1.6]">
                <div>
                  <dt className="text-[1.08rem] font-semibold leading-snug text-white">
                    {fakturace.nazev}
                  </dt>
                  <dd className="mt-2 text-white/70">
                    {fakturace.ulice}
                    <br />
                    {fakturace.mesto}
                  </dd>
                </div>

                <div className="text-white/70">
                  <dt className="sr-only">Identifikace</dt>
                  <dd>
                    IČO: <span className="text-white/90">{fakturace.ico}</span>
                  </dd>
                  <dd>
                    DIČ: <span className="text-white/90">{fakturace.dic}</span>
                  </dd>
                  <dd className="mt-2 text-[0.88rem] text-white/45">
                    {fakturace.spisovaZnacka}
                    <br />
                    {fakturace.dph}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* ── Mapa sídla ─────────────────────────────────────────── */}
          <div className="lg:border-l lg:border-white/[0.09] lg:pl-10">
            <p className="lp-eyebrow flex items-center gap-4">
              Kde nás najdete
              <span aria-hidden className="h-px w-10 bg-[var(--lp-cyan)]" />
            </p>

            <div className="mt-7">
              <MapaSidla kompaktni />
            </div>
          </div>

          {/* ── Vizitka do telefonu ────────────────────────────────── */}
          <div className="lg:border-l lg:border-white/[0.09] lg:pl-10">
            <p className="lp-eyebrow flex items-center gap-4">
              Vizitka do telefonu
              <span aria-hidden className="h-px w-10 bg-[#a78bfa]" />
            </p>

            <div className="mt-7">
              <Vizitka />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
