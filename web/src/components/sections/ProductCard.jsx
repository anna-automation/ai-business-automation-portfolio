import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Activity,
  ArrowUpRight,
  Bot,
  CalendarCheck,
  Calculator,
  Clock,
  FileText,
  KanbanSquare,
  MailCheck,
  ScanLine,
  Users,
  Workflow,
} from 'lucide-react'
import { cn } from '../../lib/utils.js'
import { useT } from '../../lib/i18n.jsx'
import { usePrefs } from '../../lib/prefs.jsx'
import { Badge, TiltCard } from '../ui/primitives.jsx'
import { Demo } from '../demos/index.jsx'
import ProductSketch from './ProductSketch.jsx'

const ICONS = {
  Workflow,
  MailCheck,
  Users,
  Calculator,
  CalendarCheck,
  ScanLine,
  FileText,
  Bot,
  KanbanSquare,
  Activity,
}

const TONE = {
  accent: {
    icon: 'bg-accent/14 text-accent',
    ring: 'hover:border-accent/45',
    glow: 'group-hover:shadow-[0_0_0_1px_var(--accent)]',
  },
  violet: { icon: 'bg-violet/16 text-violet', ring: 'hover:border-violet/45', glow: '' },
  coral: { icon: 'bg-coral/16 text-coral', ring: 'hover:border-coral/45', glow: '' },
}

/**
 * Karta ukázky. Klidový stav drží přehled, po najetí se v ní rozjede živý
 * náhled dema — ten se mountuje až na hover, aby se na úvodu nespustilo
 * deset animací naráz.
 */
export default function ProductCard({ product, className, size = 'md', showPreview = true }) {
  const { t, pick } = useT()
  const { reducedMotion, hasPointer } = usePrefs()
  const [preview, setPreview] = useState(false)
  const timer = useRef(null)

  const Icon = ICONS[product.icon] ?? Workflow
  const tone = TONE[product.tone] ?? TONE.accent
  const canPreview = showPreview && hasPointer && !reducedMotion

  const onEnter = () => {
    if (!canPreview) return
    // krátká prodleva, aby se náhled nespouštěl při přejetí kurzorem
    timer.current = setTimeout(() => setPreview(true), 180)
  }

  const onLeave = () => {
    if (timer.current) clearTimeout(timer.current)
    setPreview(false)
  }

  return (
    <TiltCard strength={size === 'lg' ? 4 : 6} className={cn('h-full', className)}>
      <Link
        to={`/ukazky/${product.slug}`}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onFocus={onEnter}
        onBlur={onLeave}
        data-cursor-label={t('action.try')}
        className={cn(
          'card group relative flex h-full flex-col overflow-hidden transition-all duration-500 ease-[var(--ease-out-expo)]',
          'hover:shadow-[var(--shadow-lift)]',
          tone.ring,
          size === 'lg' ? 'p-6' : 'p-5'
        )}
      >
        {/* hlavička karty */}
        <div className="relative z-10 flex items-start gap-3">
          <span
            className={cn(
              'grid size-10 shrink-0 place-items-center rounded-xl transition-transform duration-500 ease-[var(--ease-spring)] group-hover:scale-110',
              tone.icon
            )}
          >
            <Icon size={18} strokeWidth={2.1} />
          </span>

          <div className="min-w-0 flex-1">
            <p className="label-mono">
              {String(product.index).padStart(2, '0')} · {t('products.interactive')}
            </p>
            <h3
              className={cn(
                'mt-1 leading-tight tracking-[-0.02em]',
                size === 'lg' ? 'text-[1.5rem]' : 'text-[1.12rem]'
              )}
            >
              {pick(product.title)}
            </h3>
          </div>

          <ArrowUpRight
            size={16}
            className="mt-1 shrink-0 text-muted transition-all duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-text"
          />
        </div>

        <p
          className={cn(
            'relative z-10 mt-3 leading-relaxed text-muted',
            size === 'lg' ? 'max-w-md text-[0.95rem]' : 'text-[0.87rem]'
          )}
        >
          {pick(product.tagline)}
        </p>

        {/* Náhled: v klidu nákres, při najetí živé demo. */}
        <div
          className={cn(
            'relative mt-4 flex-1 overflow-hidden rounded-xl border border-line bg-bg-sunk',
            size === 'lg' ? 'min-h-[14rem]' : 'min-h-[10rem]'
          )}
        >
          <AnimatePresence mode="wait">
            {preview ? (
              <motion.div
                key="live"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 overflow-hidden"
              >
                <Demo name={product.demo} compact />
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="grid-paper-fine absolute inset-0"
              >
                <ProductSketch name={product.demo} />
                {canPreview && (
                  <span className="label-mono absolute inset-x-0 bottom-2 flex items-center justify-center gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <span aria-hidden className="size-1.5 rounded-full bg-accent" />
                    {t('action.tryDemo')}
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* patička karty */}
        <div className="relative z-10 mt-4 flex flex-wrap items-center gap-2">
          <Badge tone="neutral" icon={Clock}>
            {t('products.saves')} {product.saves.amount} {pick(product.saves.unit)}
          </Badge>
          {product.stack.slice(0, size === 'lg' ? 3 : 1).map((tech) => (
            <Badge key={tech} tone="neutral">
              {tech}
            </Badge>
          ))}
        </div>

        {/* jemná akcentní záře zdola při hoveru */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 translate-y-6 bg-gradient-to-t from-accent/10 to-transparent opacity-0 transition-all duration-700 group-hover:translate-y-0 group-hover:opacity-100"
        />
      </Link>
    </TiltCard>
  )
}
