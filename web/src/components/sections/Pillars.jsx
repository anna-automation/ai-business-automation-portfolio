import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Bot,
  Check,
  FileSpreadsheet,
  GraduationCap,
  LineChart,
  MessageSquareCode,
  Minus,
  Package,
  Plus,
  ShieldCheck,
  Users,
  Workflow,
} from 'lucide-react'
import { Section, SectionHead } from '../ui/Section.jsx'
import { Reveal } from '../ui/Reveal.jsx'
import { Badge } from '../ui/primitives.jsx'
import { useT } from '../../lib/i18n.jsx'
import { usePrefs } from '../../lib/prefs.jsx'
import { pillars } from '../../data/pillars.js'
import { cn } from '../../lib/utils.js'

const ICONS = {
  MessageSquareCode,
  Workflow,
  Users,
  FileSpreadsheet,
  Bot,
  GraduationCap,
  ShieldCheck,
  LineChart,
}

const TONE = {
  accent: { icon: 'text-accent', bg: 'bg-accent/12', rule: 'bg-accent' },
  violet: { icon: 'text-violet', bg: 'bg-violet/14', rule: 'bg-violet' },
  coral: { icon: 'text-coral', bg: 'bg-coral/14', rule: 'bg-coral' },
}

/**
 * Osm oblastí jako rozbalovací seznam. Zavřený řádek drží přehled, otevřený
 * ukáže konkrétní výstupy. Otevřená může být jen jedna — seznam tak zůstane
 * čitelný i na mobilu.
 */
export default function Pillars() {
  const { t, pick } = useT()
  const { reducedMotion } = usePrefs()
  const [open, setOpen] = useState(pillars[1].id)

  return (
    <Section id="sluzby" tone="sunk" className="border-y border-line py-20 sm:py-28">
      <SectionHead
        index={2}
        eyebrow={t('pillars.eyebrow')}
        title={t('pillars.title')}
        subtitle={t('pillars.sub')}
      />

      <ul className="mt-14 divide-y divide-line border-y border-line">
        {pillars.map((pillar) => {
          const Icon = ICONS[pillar.icon] ?? Workflow
          const tone = TONE[pillar.tone] ?? TONE.accent
          const isOpen = open === pillar.id

          return (
            <li key={pillar.id}>
              <Reveal y={14}>
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : pillar.id)}
                    aria-expanded={isOpen}
                    aria-controls={`pillar-${pillar.id}`}
                    className="group flex w-full items-start gap-4 py-6 text-left sm:gap-6"
                  >
                    <span className="label-mono mt-1.5 w-7 shrink-0 tabular-nums">
                      {String(pillar.index).padStart(2, '0')}
                    </span>

                    <span
                      className={cn(
                        'mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl transition-all duration-500 ease-[var(--ease-spring)]',
                        tone.bg,
                        tone.icon,
                        'group-hover:scale-105'
                      )}
                    >
                      <Icon size={18} strokeWidth={2.1} />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-[clamp(1.15rem,2.6vw,1.6rem)] font-semibold leading-tight tracking-[-0.02em] transition-colors duration-300 group-hover:text-text">
                        {pick(pillar.title)}
                      </span>
                      <span className="mt-1.5 block max-w-2xl text-[0.9rem] leading-relaxed text-muted">
                        {pick(pillar.summary)}
                      </span>
                    </span>

                    <span className="mt-1 hidden shrink-0 sm:block">
                      <Badge tone="neutral">{pick(pillar.deliverable)}</Badge>
                    </span>

                    <span
                      className={cn(
                        'mt-1.5 grid size-7 shrink-0 place-items-center rounded-lg border transition-all duration-400',
                        isOpen
                          ? 'border-accent bg-accent text-accent-ink'
                          : 'border-line text-muted group-hover:border-line-strong group-hover:text-text'
                      )}
                    >
                      {isOpen ? <Minus size={13} /> : <Plus size={13} />}
                    </span>
                  </button>
                </h3>
              </Reveal>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`pillar-${pillar.id}`}
                    initial={reducedMotion ? { height: 'auto' } : { height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={reducedMotion ? { height: 'auto' } : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="pb-8 sm:pl-[4.2rem]">
                      <ul className="grid gap-2.5 sm:grid-cols-2">
                        {pillar.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <Check
                              size={14}
                              strokeWidth={2.6}
                              className={cn('mt-1 shrink-0', tone.icon)}
                            />
                            <span className="text-[0.88rem] leading-relaxed text-text-soft">
                              {pick(item)}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {pillar.highlight && (
                        <p
                          className={cn(
                            'mt-5 flex items-start gap-2.5 rounded-xl border border-line bg-surface p-4 text-[0.86rem] leading-relaxed text-text-soft'
                          )}
                        >
                          <Package size={15} className={cn('mt-0.5 shrink-0', tone.icon)} />
                          {pick(pillar.highlight)}
                        </p>
                      )}

                      <p className="mt-5 flex items-center gap-2 sm:hidden">
                        <Badge tone="neutral">{pick(pillar.deliverable)}</Badge>
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          )
        })}
      </ul>
    </Section>
  )
}
