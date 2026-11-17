import Audiences from '../components/sections/Audiences.jsx'
import ContactCTA from '../components/sections/ContactCTA.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import ProductCard from '../components/sections/ProductCard.jsx'
import { Section } from '../components/ui/Section.jsx'
import { Reveal } from '../components/ui/Reveal.jsx'
import { useT } from '../lib/i18n.jsx'
import { useDocumentTitle } from '../lib/useDocumentTitle.js'
import { audiences } from '../data/audiences.js'
import { getProduct } from '../data/products.js'

/**
 * Pro koho. Nad interaktivní sekcí je ještě statický přehled všech oborů —
 * aby šlo sdílet odkaz s kotvou a návštěvník viděl celý rozsah naráz.
 */
export default function AudiencesPage() {
  const { t, pick } = useT()
  useDocumentTitle(`${t('audiences.title')} — ${t('brand.name')}`)

  return (
    <>
      <PageHeader
        eyebrow={t('audiences.eyebrow')}
        title={t('audiences.title')}
        subtitle={t('audiences.sub')}
        breadcrumbs={[{ label: t('nav.home'), to: '/' }, { label: t('nav.audiences') }]}
      />

      <Audiences full />

      {audiences.map((audience, index) => {
        const picks = audience.picks.map(getProduct).filter(Boolean)
        return (
          <Section
            key={audience.id}
            id={audience.id}
            tone={index % 2 === 1 ? 'sunk' : 'bg'}
            className="border-b border-line py-14 sm:py-16"
          >
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-2xl">
                <p className="label-mono">
                  {String(index + 1).padStart(2, '0')} · {t('audiences.eyebrow')}
                </p>
                <h2 className="mt-3 text-[clamp(1.5rem,3.8vw,2.3rem)] leading-tight">
                  {pick(audience.name)}
                </h2>
                <p className="mt-3 text-[0.98rem] leading-relaxed text-text-soft">
                  {pick(audience.tagline)}
                </p>
                <p className="mt-5 border-l-2 border-accent pl-4 text-[0.95rem] leading-relaxed text-text-soft">
                  {pick(audience.win)}
                </p>
              </div>
            </div>

            <Reveal className="mt-8" y={20}>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {picks.map((product) => (
                  <ProductCard key={product.id} product={product} showPreview={false} />
                ))}
              </div>
            </Reveal>
          </Section>
        )
      })}

      <ContactCTA />
    </>
  )
}
