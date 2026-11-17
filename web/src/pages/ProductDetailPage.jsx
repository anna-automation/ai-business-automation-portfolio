import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react'
import PageHeader from '../components/ui/PageHeader.jsx'
import ProductCard from '../components/sections/ProductCard.jsx'
import ContactCTA from '../components/sections/ContactCTA.jsx'
import { Section } from '../components/ui/Section.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Badge } from '../components/ui/primitives.jsx'
import { Reveal } from '../components/ui/Reveal.jsx'
import { Demo } from '../components/demos/index.jsx'
import NotFoundPage from './NotFoundPage.jsx'
import { useT } from '../lib/i18n.jsx'
import { useDocumentTitle, useMetaDescription } from '../lib/useDocumentTitle.js'
import { getProduct, products } from '../data/products.js'
import { audiences } from '../data/audiences.js'

const TONE_BADGE = { accent: 'accent', violet: 'violet', coral: 'coral' }

export default function ProductDetailPage() {
  const { slug } = useParams()
  const { t, pick } = useT()
  const product = getProduct(slug)

  useDocumentTitle(product ? `${pick(product.title)} — ${t('brand.name')}` : null)
  useMetaDescription(product ? pick(product.tagline) : null)

  if (!product) return <NotFoundPage />

  const related = (product.related ?? [])
    .map(getProduct)
    .filter(Boolean)
    .concat(products.filter((p) => p.id !== product.id).slice(0, 3))
    .filter((p, i, list) => list.findIndex((x) => x.id === p.id) === i && p.id !== product.id)
    .slice(0, 3)

  const forWhom = product.forWhom.map((id) => audiences.find((a) => a.id === id)).filter(Boolean)

  return (
    <>
      <PageHeader
        eyebrow={`${String(product.index).padStart(2, '0')} · ${t('products.detail')}`}
        title={pick(product.title)}
        subtitle={pick(product.tagline)}
        breadcrumbs={[
          { label: t('nav.home'), to: '/' },
          { label: t('nav.products'), to: '/ukazky' },
          { label: pick(product.title) },
        ]}
        aside={
          <div className="flex flex-col gap-3">
            <Badge tone={TONE_BADGE[product.tone] ?? 'accent'} icon={Clock}>
              {t('products.saves')} {product.saves.amount} {pick(product.saves.unit)}
            </Badge>
            <Badge tone="warn" dot>
              {t('demo.notice')}
            </Badge>
          </div>
        }
      />

      {/* Plná interaktivní ukázka */}
      <Section className="py-12 sm:py-14">
        <Reveal y={24}>
          <Demo name={product.demo} />
        </Reveal>
      </Section>

      {/* Popis, kroky, stack */}
      <Section tone="sunk" className="border-y border-line py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div>
            <h2 className="text-[clamp(1.5rem,3.6vw,2.2rem)] leading-tight">
              {t('products.howItWorks')}
            </h2>
            <p className="mt-5 text-[1rem] leading-relaxed text-text-soft">
              {pick(product.description)}
            </p>

            <h3 className="label-mono mt-10">{t('products.steps')}</h3>
            <ol className="mt-4 space-y-0">
              {product.steps.map((step, i) => (
                <Reveal key={i} y={14} delay={0.03 * i}>
                  <li className="flex gap-4 border-b border-line py-4 last:border-0">
                    <span className="label-mono mt-0.5 w-6 shrink-0 tabular-nums text-accent">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-[0.95rem] leading-relaxed text-text-soft">
                      {pick(step)}
                    </span>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>

          <aside className="space-y-6">
            <div className="card p-5">
              <h3 className="label-mono flex items-center gap-2">
                <Layers size={12} />
                {t('products.stack')}
              </h3>
              <ul className="mt-3.5 flex flex-wrap gap-2">
                {product.stack.map((tech) => (
                  <li key={tech}>
                    <Badge tone="neutral">{tech}</Badge>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card p-5">
              <h3 className="label-mono flex items-center gap-2">
                <Building2 size={12} />
                {t('products.forWhom')}
              </h3>
              <ul className="mt-3.5 space-y-2">
                {forWhom.map((audience) => (
                  <li key={audience.id}>
                    <Link
                      to={`/pro-koho#${audience.id}`}
                      className="group flex items-center gap-2 text-[0.88rem] text-text-soft transition-colors hover:text-text"
                    >
                      <Check size={13} className="shrink-0 text-accent" />
                      <span className="link-underline">{pick(audience.name)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card border-accent/30 bg-accent/8 p-5">
              <h3 className="label-mono flex items-center gap-2">
                <Sparkles size={12} />
                {pick({ cs: 'Chcete to u sebe?', en: 'Want this in-house?' })}
              </h3>
              <p className="mt-2.5 text-[0.88rem] leading-relaxed text-text-soft">
                {pick({
                  cs: 'Napište mi, jak to máte dnes. Řeknu vám, jestli se to vyplatí automatizovat — i když odpověď bude ne.',
                  en: 'Tell me how you do it today. I will tell you whether automating pays off — even if the answer is no.',
                })}
              </p>
              <Button to="/kontakt" size="sm" variant="primary" icon={ArrowRight} className="mt-4">
                {t('action.contactMe')}
              </Button>
            </div>
          </aside>
        </div>
      </Section>

      {/* Související */}
      <Section className="py-16 sm:py-20">
        <div className="flex items-end justify-between gap-6">
          <h2 className="text-[clamp(1.4rem,3.4vw,2rem)] leading-tight">
            {t('products.related')}
          </h2>
          <Button to="/ukazky" variant="ghost" size="sm" icon={ArrowLeft} iconRight={false}>
            {t('action.allProducts')}
          </Button>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((item) => (
            <ProductCard key={item.id} product={item} showPreview={false} />
          ))}
        </div>
      </Section>

      <ContactCTA />
    </>
  )
}
