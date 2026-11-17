import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { LayoutGrid, Rows3 } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader.jsx'
import ProductCard from '../components/sections/ProductCard.jsx'
import ContactCTA from '../components/sections/ContactCTA.jsx'
import { Section } from '../components/ui/Section.jsx'
import { IconButton } from '../components/ui/Button.jsx'
import { Badge } from '../components/ui/primitives.jsx'
import { useT } from '../lib/i18n.jsx'
import { usePrefs } from '../lib/prefs.jsx'
import { useDocumentTitle } from '../lib/useDocumentTitle.js'
import { categories, products } from '../data/products.js'
import { audiences } from '../data/audiences.js'
import { cn } from '../lib/utils.js'

/**
 * Přehled všech ukázek. Bento mřížka drží nepravidelný rytmus (velká karta,
 * dvě menší), v režimu seznam je totéž jako rovnoměrná mřížka — někomu sedne
 * přehlednost víc než efekt.
 */
export default function ProductsPage() {
  const { t, pick } = useT()
  const { role, reducedMotion } = usePrefs()
  const [category, setCategory] = useState('all')
  const [layout, setLayout] = useState('bento')

  useDocumentTitle(`${t('products.title')} — ${t('brand.name')}`)

  const audience = audiences.find((a) => a.id === role) ?? null

  const visible = useMemo(() => {
    const list = category === 'all' ? products : products.filter((p) => p.categories.includes(category))
    if (!audience) return list
    // Doporučené pro zvolený obor dáme dopředu, ostatní zůstanou.
    return [...list].sort((a, b) => {
      const aPick = audience.picks.includes(a.id) ? 0 : 1
      const bPick = audience.picks.includes(b.id) ? 0 : 1
      return aPick - bPick
    })
  }, [category, audience])

  return (
    <>
      <PageHeader
        eyebrow={t('products.eyebrow')}
        title={t('products.title')}
        subtitle={t('products.sub')}
        breadcrumbs={[{ label: t('nav.home'), to: '/' }, { label: t('nav.products') }]}
        aside={
          <div className="flex items-center gap-2">
            <IconButton
              icon={LayoutGrid}
              label="Bento"
              active={layout === 'bento'}
              onClick={() => setLayout('bento')}
              className="border border-line"
            />
            <IconButton
              icon={Rows3}
              label={t('products.filterAll')}
              active={layout === 'grid'}
              onClick={() => setLayout('grid')}
              className="border border-line"
            />
          </div>
        }
      >
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCategory(item.id)}
              className={cn(
                'rounded-xl border px-3.5 py-2 text-[0.82rem] font-medium transition-all duration-300',
                category === item.id
                  ? 'border-accent/50 bg-accent/12 text-text'
                  : 'border-line bg-surface text-text-soft hover:border-line-strong hover:text-text'
              )}
            >
              {pick(item.label)}
            </button>
          ))}

          {audience && (
            <Badge tone="accent" className="ml-1">
              {pick(audience.name)}
            </Badge>
          )}
        </div>
      </PageHeader>

      <Section className="py-14 sm:py-16">
        <motion.div
          layout={!reducedMotion}
          className={cn(
            'grid gap-5',
            layout === 'bento' ? 'grid-cols-12' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          )}
        >
          {visible.map((product, i) => (
            <motion.div
              key={product.id}
              layout={!reducedMotion}
              initial={reducedMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: Math.min(0.05 * i, 0.4), ease: [0.16, 1, 0.3, 1] }}
              className={layout === 'bento' ? product.span : undefined}
            >
              <ProductCard
                product={product}
                size={layout === 'bento' && product.featured ? 'lg' : 'md'}
              />
            </motion.div>
          ))}
        </motion.div>

        {visible.length === 0 && (
          <p className="py-16 text-center text-muted">{t('palette.empty')}</p>
        )}
      </Section>

      <ContactCTA />
    </>
  )
}
