import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, CornerDownLeft, Lightbulb, Loader2, Sparkles } from 'lucide-react'
import { Section } from '../ui/Section.jsx'
import { Button } from '../ui/Button.jsx'
import { Reveal } from '../ui/Reveal.jsx'
import { Badge } from '../ui/primitives.jsx'
import { useT } from '../../lib/i18n.jsx'
import { usePrefs } from '../../lib/prefs.jsx'
import { products } from '../../data/products.js'
import { cn, fold } from '../../lib/utils.js'

/**
 * Průvodce portfoliem. Návštěvník napíše, co ho tlačí, a dostane konkrétní
 * ukázky. Běží lokálně na klíčových slovech — žádné volání do modelu, což je
 * u dema upřímnější a navíc to funguje i offline.
 */

const KEYWORDS = {
  workflow: ['proces', 'propojit', 'workflow', 'automatizovat', 'napojit', 'integrace', 'spojit', 'process', 'connect', 'integrate'],
  inbox: ['mail', 'email', 'e-mail', 'posta', 'zpravy', 'odpovidat', 'inbox', 'spam', 'message', 'reply'],
  crm: ['crm', 'klient', 'zakaznik', 'kontakt', 'obchod', 'pipeline', 'prodej', 'customer', 'deal', 'sales', 'lead'],
  calculator: ['cena', 'cenik', 'kalkulace', 'kalkulacka', 'rozpocet', 'nacenit', 'price', 'quote', 'estimate', 'calculator'],
  booking: ['termin', 'rezervace', 'schuzka', 'kalendar', 'prohlidka', 'objednat', 'booking', 'appointment', 'calendar', 'schedule'],
  documents: ['faktura', 'doklad', 'pdf', 'ocr', 'sken', 'dokument', 'ucetnictvi', 'prepisovani', 'invoice', 'document', 'scan', 'receipt'],
  quote: ['nabidka', 'smlouva', 'dokument', 'sablona', 'word', 'proposal', 'contract', 'template'],
  assistant: ['chatbot', 'asistent', 'dotazy', 'znalosti', 'smernice', 'navod', 'zaměstnanci', 'zamestnanci', 'assistant', 'chatbot', 'knowledge', 'policy'],
  tasks: ['ukol', 'ukoly', 'kanban', 'termin', 'deadline', 'projekt', 'tym', 'task', 'project', 'team'],
  dashboard: ['report', 'reporting', 'prehled', 'statistika', 'cisla', 'dashboard', 'graf', 'data', 'numbers', 'chart'],
  // objednávky a reklamace vedou na kombinaci inbox + tasks
  _orders: ['objednavka', 'objednavky', 'reklamace', 'eshop', 'e-shop', 'order', 'orders', 'return', 'complaint'],
}

const EXAMPLES = [
  { cs: 'Potřebuji automatizovat objednávky', en: 'I need to automate orders' },
  { cs: 'Topím se v e-mailech', en: 'I am drowning in e-mail' },
  { cs: 'Přepisujeme faktury ručně do Excelu', en: 'We retype invoices into Excel by hand' },
  { cs: 'Chci přestat domlouvat schůzky telefonem', en: 'I want to stop booking meetings by phone' },
]

function recommend(query) {
  const q = fold(query)
  if (!q.trim()) return []

  const scores = new Map()

  const bump = (id, amount) => scores.set(id, (scores.get(id) ?? 0) + amount)

  for (const [id, words] of Object.entries(KEYWORDS)) {
    for (const word of words) {
      if (!q.includes(fold(word))) continue
      if (id === '_orders') {
        bump('inbox', 2)
        bump('tasks', 2)
        bump('crm', 1)
      } else {
        bump(id, 2)
      }
    }
  }

  // Doplňkové skóre z názvů a popisků — zachytí i slova, která nejsou ve slovníku.
  for (const product of products) {
    const haystack = fold(
      [product.title.cs, product.title.en, product.tagline.cs, product.tagline.en, ...product.stack].join(' ')
    )
    for (const token of q.split(/\s+/).filter((w) => w.length > 3)) {
      if (haystack.includes(token)) bump(product.id, 1)
    }
  }

  return [...scores.entries()]
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => products.find((p) => p.id === id))
    .filter(Boolean)
}

export default function Guide() {
  const { t, lang, pick } = useT()
  const { reducedMotion } = usePrefs()
  const [query, setQuery] = useState('')
  const [state, setState] = useState('idle')
  const [results, setResults] = useState([])
  const timer = useRef(null)

  const ask = (text) => {
    const value = text ?? query
    if (!value.trim()) return
    setQuery(value)
    setState('thinking')
    if (timer.current) clearTimeout(timer.current)
    const found = recommend(value)
    // Krátká prodleva, aby bylo vidět, že se něco děje.
    timer.current = setTimeout(
      () => {
        setResults(found)
        setState(found.length ? 'done' : 'empty')
      },
      reducedMotion ? 0 : 760
    )
  }

  return (
    <Section className="py-20 sm:py-24">
      <Reveal>
        <div className="card relative overflow-hidden p-6 sm:p-9">
          <div className="grid-paper absolute inset-0 opacity-40" aria-hidden />
          <div
            aria-hidden
            className="absolute -right-16 -top-16 size-64 rounded-full bg-violet/12 blur-[80px]"
          />

          <div className="relative">
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge tone="violet" icon={Sparkles}>
                {t('guide.title')}
              </Badge>
              <Badge tone="neutral">{t('demo.badge')}</Badge>
            </div>

            <h2 className="mt-5 max-w-2xl text-[clamp(1.6rem,4vw,2.5rem)] leading-[1.06]">
              {lang === 'en'
                ? 'Tell me what slows you down. I will point you to the right demo.'
                : 'Napište mi, co vás zdržuje. Pošlu vás na správnou ukázku.'}
            </h2>

            <form
              className="mt-7 flex flex-col gap-2 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault()
                ask()
              }}
            >
              <label className="sr-only" htmlFor="guide-input">
                {t('guide.placeholder')}
              </label>
              <div className="relative flex-1">
                <Lightbulb
                  size={16}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  id="guide-input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('guide.placeholder')}
                  className="h-13 w-full rounded-xl border border-line bg-surface py-3.5 pl-11 pr-4 text-[0.95rem] outline-none transition-colors placeholder:text-muted focus:border-violet"
                />
              </div>
              <Button type="submit" size="lg" variant="violet" icon={CornerDownLeft}>
                {t('guide.cta')}
              </Button>
            </form>

            {/* nabídka příkladů */}
            <div className="mt-3.5 flex flex-wrap gap-2">
              {EXAMPLES.map((example) => (
                <button
                  key={example.cs}
                  type="button"
                  onClick={() => ask(pick(example))}
                  className="rounded-full border border-line bg-surface-2/70 px-3 py-1.5 text-[0.78rem] text-text-soft transition-all duration-300 hover:border-violet/45 hover:text-text"
                >
                  {pick(example)}
                </button>
              ))}
            </div>

            {/* výsledek */}
            <div aria-live="polite" className="mt-7">
              <AnimatePresence mode="wait">
                {state === 'thinking' && (
                  <motion.p
                    key="thinking"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-[0.88rem] text-muted"
                  >
                    <Loader2 size={14} className="animate-spin" />
                    {t('guide.thinking')}
                  </motion.p>
                )}

                {state === 'empty' && (
                  <motion.p
                    key="empty"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="rounded-xl border border-warn/30 bg-warn/8 p-4 text-[0.88rem] text-text-soft"
                  >
                    {t('guide.noMatch')}
                  </motion.p>
                )}

                {state === 'done' && (
                  <motion.div
                    key={`done-${query}`}
                    initial={reducedMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <p className="label-mono">{t('guide.result')}</p>
                    <ul className="mt-3 grid gap-2.5 sm:grid-cols-3">
                      {results.map((product, i) => (
                        <motion.li
                          key={product.id}
                          initial={reducedMotion ? false : { opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.08 * i, duration: 0.4 }}
                        >
                          <Button
                            to={`/ukazky/${product.slug}`}
                            variant="quiet"
                            icon={ArrowRight}
                            magnetic={false}
                            className={cn('h-auto w-full flex-col items-start gap-1.5 p-4 text-left')}
                          >
                            <span className="label-mono">
                              {String(product.index).padStart(2, '0')}
                            </span>
                            <span className="font-display text-[1rem] font-semibold leading-tight">
                              {pick(product.title)}
                            </span>
                          </Button>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <p className="mt-6 text-[0.74rem] text-muted">{t('guide.disclaimer')}</p>
          </div>
        </div>
      </Reveal>
    </Section>
  )
}
