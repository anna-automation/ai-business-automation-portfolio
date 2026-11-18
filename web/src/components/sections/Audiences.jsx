import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  ArrowRight,
  Briefcase,
  Building2,
  Check,
  Receipt,
  ShoppingBag,
  Sparkles,
  UserPlus,
  Wrench,
  X,
} from 'lucide-react'
import { Section, SectionHead } from '../ui/Section.jsx'
import { Button } from '../ui/Button.jsx'
import { Reveal } from '../ui/Reveal.jsx'
import { Badge } from '../ui/primitives.jsx'
import { useT } from '../../lib/i18n.jsx'
import { usePrefs } from '../../lib/prefs.jsx'
import { useToast } from '../../lib/toast.jsx'
import { audiences } from '../../data/audiences.js'
import { getProduct } from '../../data/products.js'
import { cn } from '../../lib/utils.js'

const ICONS = { Building2, UserPlus, Receipt, Wrench, ShoppingBag, Briefcase }

const TONE = {
  accent: 'bg-accent/14 text-accent',
  violet: 'bg-violet/16 text-violet',
  coral: 'bg-coral/16 text-coral',
}

/**
 * Pro koho. Návštěvník klikne na svůj obor a uvidí jeho konkrétní bolesti
 * i doporučené ukázky. Volbu si web zapamatuje a dál podle ní zvýrazňuje obsah
 * — personalizace bez jediného sledovacího skriptu.
 */
export default function Audiences({ full = false }) {
  const { t, pick } = useT()
  const { role, setRole, reducedMotion } = usePrefs()
  const { push } = useToast()
  const [activeId, setActiveId] = useState(role ?? audiences[0].id)

  const active = audiences.find((a) => a.id === activeId) ?? audiences[0]
  const Icon = ICONS[active.icon] ?? Building2

  const claim = () => {
    if (role === active.id) {
      setRole(null)
      push({ title: t('audiences.clear'), variant: 'info' })
    } else {
      setRole(active.id)
      push({
        title: t('audiences.personalized'),
        description: pick(active.name),
        variant: 'success',
      })
    }
  }

  return (
    <Section
      id="pro-koho"
      tone="sunk"
      className={cn('border-y border-line', full ? 'py-12 sm:py-14' : 'py-20 sm:py-28')}
    >
      {/* Na vlastní stránce nadpis nese už hlavička — neopakujeme ho. */}
      {!full && (
        <SectionHead
          index={4}
          eyebrow={t('audiences.eyebrow')}
          title={t('audiences.title')}
          subtitle={t('audiences.sub')}
          aside={
            role && (
              <button
                type="button"
                onClick={() => setRole(null)}
                className="flex items-center gap-2 rounded-xl border border-accent/40 bg-accent/10 px-3 py-2 text-[0.8rem] transition hover:bg-accent/16"
              >
                <Sparkles size={13} className="text-accent" />
                {t('audiences.personalized')}
                <X size={13} className="text-muted" />
              </button>
            )
          }
        />
      )}

      {/* volba oboru */}
      <Reveal className={full ? '' : 'mt-12'}>
        <div
          role="tablist"
          aria-label={t('audiences.eyebrow')}
          className="hide-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
        >
          {audiences.map((audience) => {
            const TabIcon = ICONS[audience.icon] ?? Building2
            const isActive = audience.id === activeId
            return (
              <button
                key={audience.id}
                role="tab"
                aria-selected={isActive}
                id={audience.id}
                onClick={() => setActiveId(audience.id)}
                className={cn(
                  'flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2.5 text-[0.85rem] font-medium transition-all duration-300 ease-[var(--ease-out-expo)]',
                  isActive
                    ? 'border-accent/50 bg-accent/12 text-text'
                    : 'border-line bg-surface text-text-soft hover:border-line-strong hover:text-text'
                )}
              >
                <TabIcon size={15} strokeWidth={2.1} />
                {pick(audience.name)}
                {role === audience.id && (
                  <span aria-hidden className="size-1.5 rounded-full bg-accent" />
                )}
              </button>
            )
          })}
        </div>
      </Reveal>

      {/* obsah vybraného oboru */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active.id}
          initial={reducedMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 grid gap-5 lg:grid-cols-[1fr_1fr]"
        >
          {/* bolesti */}
          <div className="card p-6">
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  'grid size-10 shrink-0 place-items-center rounded-xl',
                  TONE[active.tone] ?? TONE.accent
                )}
              >
                <Icon size={18} strokeWidth={2.1} />
              </span>
              <div>
                <h3 className="text-[1.3rem] leading-tight">{pick(active.name)}</h3>
                <p className="mt-1.5 text-[0.9rem] leading-relaxed text-muted">
                  {pick(active.tagline)}
                </p>
              </div>
            </div>

            <p className="label-mono mt-7">{t('audiences.pains')}</p>
            <ul className="mt-3 space-y-2.5">
              {active.pains.map((pain, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <AlertCircle size={14} className="mt-0.5 shrink-0 text-coral" />
                  <span className="text-[0.88rem] leading-relaxed text-text-soft">
                    {pick(pain)}
                  </span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={claim}
              className={cn(
                'mt-7 flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-[0.85rem] font-medium transition-all duration-300',
                role === active.id
                  ? 'border-accent bg-accent text-accent-ink'
                  : 'border-line-strong hover:bg-surface-2'
              )}
            >
              {role === active.id ? <Check size={14} /> : <Sparkles size={14} />}
              {role === active.id ? t('audiences.personalized') : t('audiences.personalize')}
            </button>
          </div>

          {/* výsledek + doporučené ukázky */}
          <div className="flex flex-col gap-5">
            <div
              className={cn(
                'relative overflow-hidden rounded-[var(--radius-card)] border border-accent/30 bg-accent/8 p-6'
              )}
            >
              <div className="grid-paper-fine absolute inset-0 opacity-50" aria-hidden />
              <p className="label-mono relative">
                {pick({ cs: 'Jak to vypadá potom', en: 'What it looks like after' })}
              </p>
              <p className="relative mt-3 font-display text-[1.1rem] leading-snug">
                {pick(active.win)}
              </p>
            </div>

            <div>
              <p className="label-mono">{t('audiences.picks')}</p>
              <ul className="mt-3 space-y-2.5">
                {active.picks.map((id) => {
                  const product = getProduct(id)
                  if (!product) return null
                  return (
                    <li key={id}>
                      <Button
                        to={`/ukazky/${product.slug}`}
                        variant="quiet"
                        className="w-full justify-between"
                        icon={ArrowRight}
                        magnetic={false}
                      >
                        <span className="truncate text-left">{pick(product.title)}</span>
                      </Button>
                    </li>
                  )
                })}
              </ul>
            </div>

            {!full && (
              <Button to="/pro-koho" variant="ghost" size="sm" icon={ArrowRight} className="self-start">
                {t('action.more')}
              </Button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </Section>
  )
}

/** Štítek "doporučeno pro váš obor" — používá se na kartách ukázek. */
export function RoleHint({ productId, className }) {
  const { role } = usePrefs()
  const { t, pick } = useT()
  if (!role) return null
  const audience = audiences.find((a) => a.id === role)
  if (!audience?.picks.includes(productId)) return null
  return (
    <Badge tone="accent" icon={Sparkles} className={className}>
      {pick({ cs: 'Pro váš obor', en: 'For your field' })}
    </Badge>
  )
}
