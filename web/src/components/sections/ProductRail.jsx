import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, LayoutGrid } from 'lucide-react'
import { Section, SectionHead } from '../ui/Section.jsx'
import { Button, IconButton } from '../ui/Button.jsx'
import { Reveal } from '../ui/Reveal.jsx'
import ProductCard from './ProductCard.jsx'
import { useT } from '../../lib/i18n.jsx'
import { posunOKus } from '../../lib/scroll.js'
import { products } from '../../data/products.js'
import { cn } from '../../lib/utils.js'

/**
 * Vodorovný seznam ochutnávek. Scrolluje se tahem, kolečkem i tlačítky,
 * karty zapadají na místo (scroll-snap) a stav tlačítek odpovídá tomu,
 * kam se dá ještě posunout.
 */
export default function ProductRail() {
  const { t } = useT()
  const railRef = useRef(null)
  const [edges, setEdges] = useState({ start: true, end: false })

  const measure = useCallback(() => {
    const el = railRef.current
    if (!el) return
    setEdges({
      start: el.scrollLeft < 8,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8,
    })
  }, [])

  useEffect(() => {
    measure()
    const el = railRef.current
    if (!el) return
    el.addEventListener('scroll', measure, { passive: true })
    window.addEventListener('resize', measure)
    return () => {
      el.removeEventListener('scroll', measure)
      window.removeEventListener('resize', measure)
    }
  }, [measure])

  const nudge = (direction) => {
    const el = railRef.current
    if (!el) return
    const card = el.querySelector('[data-rail-item]')
    const step = card ? card.clientWidth + 20 : el.clientWidth * 0.8
    posunOKus(el, { left: direction * step })
  }

  return (
    <Section id="ukazky" className="py-20 sm:py-28">
      <SectionHead
        index={3}
        eyebrow={t('products.eyebrow')}
        title={t('products.title')}
        subtitle={t('products.sub')}
        aside={
          <div className="flex items-center gap-2">
            <IconButton
              icon={ArrowLeft}
              label={t('action.prev')}
              onClick={() => nudge(-1)}
              className={cn('border border-line', edges.start && 'opacity-40')}
            />
            <IconButton
              icon={ArrowRight}
              label={t('action.next')}
              onClick={() => nudge(1)}
              className={cn('border border-line', edges.end && 'opacity-40')}
            />
            <Button to="/ukazky" variant="quiet" size="sm" icon={LayoutGrid} iconRight={false}>
              {t('action.allProducts')}
            </Button>
          </div>
        }
      />

      <Reveal className="mt-12" y={28}>
        <div
          ref={railRef}
          className="hide-scrollbar -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 sm:-mx-7 sm:px-7"
          role="region"
          aria-label={t('products.eyebrow')}
          tabIndex={0}
        >
          {products.map((product) => (
            <div
              key={product.id}
              data-rail-item
              className="w-[20rem] shrink-0 snap-start sm:w-[22rem]"
            >
              <ProductCard product={product} />
            </div>
          ))}

          {/* dlaždice na konci — pokračování na plný přehled */}
          <div data-rail-item className="w-[20rem] shrink-0 snap-start sm:w-[22rem]">
            <Button
              to="/ukazky"
              variant="quiet"
              className="grid-paper-fine h-full w-full flex-col items-start justify-end gap-3 rounded-[var(--radius-card)] border border-dashed border-line-strong p-6 text-left"
              magnetic={false}
              icon={ArrowRight}
            >
              <span className="block font-display text-[1.3rem] font-semibold leading-tight">
                {t('action.allProducts')}
              </span>
            </Button>
          </div>
        </div>
      </Reveal>

      {/* ukazatel postupu seznamu */}
      <div aria-hidden className="mt-2 flex items-center gap-3">
        <span className="label-mono">
          {products.length} {t('products.eyebrow')}
        </span>
        <span className="h-px flex-1 bg-line" />
      </div>
    </Section>
  )
}
