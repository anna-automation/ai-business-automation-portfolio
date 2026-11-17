import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDown, ArrowRight, MousePointerClick, Sparkles } from 'lucide-react'
import FlowField from '../bg/FlowField.jsx'
import { Button } from '../ui/Button.jsx'
import { Badge } from '../ui/primitives.jsx'
import { KineticText } from '../ui/Reveal.jsx'
import { Counter } from '../ui/Counter.jsx'
import { Demo } from '../demos/index.jsx'
import { useT } from '../../lib/i18n.jsx'
import { usePrefs } from '../../lib/prefs.jsx'
import { stats } from '../../data/site.js'

/**
 * Hero stojí na rotujícím seznamu konkrétní nudné práce. Místo obecného
 * "automatizuji procesy" je hned vidět, o čem to je — a slovo se mění, takže
 * stránka žije od první sekundy.
 */

const CHORES = [
  { cs: 'Přepisování faktur', en: 'Retyping invoices' },
  { cs: 'Třídění e-mailů', en: 'Sorting e-mail' },
  { cs: 'Psaní nabídek', en: 'Writing quotes' },
  { cs: 'Týdenní reporty', en: 'Weekly reports' },
  { cs: 'Domlouvání schůzek', en: 'Booking meetings' },
  { cs: 'Onboarding nováčků', en: 'Onboarding new hires' },
]

const ROTATE_MS = 2600

function RotatingChore() {
  const { lang } = useT()
  const { reducedMotion } = usePrefs()
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (reducedMotion) return
    const timer = setInterval(() => setIndex((i) => (i + 1) % CHORES.length), ROTATE_MS)
    return () => clearInterval(timer)
  }, [reducedMotion])

  const text = CHORES[index][lang] ?? CHORES[index].cs

  if (reducedMotion) {
    return <span className="text-accent">{CHORES[0][lang] ?? CHORES[0].cs}</span>
  }

  return (
    <span className="relative inline-block align-top">
      <AnimatePresence mode="wait">
        <motion.span
          key={`${lang}-${index}`}
          initial={{ y: '0.42em', opacity: 0, filter: 'blur(7px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          exit={{ y: '-0.42em', opacity: 0, filter: 'blur(7px)' }}
          transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block text-accent"
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

export default function Hero() {
  const { t, lang } = useT()
  const { reducedMotion } = usePrefs()

  return (
    <section className="relative overflow-hidden pb-14 pt-10 sm:pt-16 lg:pb-20">
      {/* pozadí: mřížka + tekoucí data */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="grid-paper absolute inset-0" />
        <FlowField density={1.15} opacity={0.85} />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-bg to-transparent" />
        {/* dvě barevné mlhy, aby plocha nebyla plochá */}
        <div className="absolute -left-24 top-0 size-[32rem] rounded-full bg-accent/8 blur-[110px]" />
        <div className="absolute -right-20 top-40 size-[26rem] rounded-full bg-violet/10 blur-[110px]" />
      </div>

      <div className="relative mx-auto w-full max-w-[82rem] px-5 sm:px-7">
        {/* grid-cols-1 je povinné: `grid` bez cols dává sloupec šířky `auto`,
            který by se roztáhl podle nejširšího obsahu místo podle okna */}
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          {/* Levá strana: sdělení */}
          <div>
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap items-center gap-2.5"
            >
              <Badge tone="accent" dot>
                {t('hero.eyebrow')}
              </Badge>
              <Badge tone="warn">{t('demo.badge')}</Badge>
            </motion.div>

            <h1 className="mt-6 font-display text-[clamp(2.3rem,7.2vw,4.6rem)] font-semibold leading-[0.98] tracking-[-0.035em]">
              <span className="block">
                <RotatingChore />
              </span>
              <span className="block text-text">
                <KineticText
                  text={lang === 'en' ? 'is not a job' : 'už nemusí dělat'}
                  delay={0.15}
                />
              </span>
              <span className="block">
                <KineticText
                  text={lang === 'en' ? 'for a human.' : 'člověk.'}
                  delay={0.32}
                  className="text-text"
                />
              </span>
            </h1>

            <motion.p
              initial={reducedMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="mt-7 max-w-xl text-[1.05rem] leading-relaxed text-text-soft"
            >
              {t('hero.sub')}
            </motion.p>

            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.62, ease: [0.16, 1, 0.3, 1] }}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <Button
                to="/ukazky"
                size="lg"
                variant="primary"
                icon={ArrowRight}
                cursorLabel={t('action.try')}
              >
                {t('hero.cta1')}
              </Button>
              <Button to="/o-mne" size="lg" variant="outline" icon={Sparkles} iconRight={false}>
                {t('hero.cta2')}
              </Button>
            </motion.div>

            {/* Čísla */}
            <motion.dl
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mt-12 grid max-w-xl grid-cols-2 gap-x-6 gap-y-5 border-t border-line pt-7 sm:grid-cols-4"
            >
              {stats.map((item) => (
                <div key={item.id}>
                  <dt className="label-mono text-[0.62rem] leading-tight">{t(item.labelKey)}</dt>
                  <dd className="mt-1.5 font-display text-[1.8rem] font-semibold leading-none tabular-nums">
                    <Counter to={item.value} suffix={item.suffix} />
                  </dd>
                </div>
              ))}
            </motion.dl>
          </div>

          {/* Pravá strana: živá ukázka */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.95, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="card relative h-[20rem] overflow-hidden sm:h-[21.5rem]">
              <div className="flex items-center gap-2.5 border-b border-line bg-surface-2/60 px-4 py-2.5">
                <span aria-hidden className="flex gap-1.5">
                  <span className="size-2.5 rounded-full bg-coral/70" />
                  <span className="size-2.5 rounded-full bg-warn/70" />
                  <span className="size-2.5 rounded-full bg-ok/70" />
                </span>
                <p className="label-mono ml-1 truncate">
                  {lang === 'en' ? 'live workflow · simulation' : 'živé workflow · simulace'}
                </p>
              </div>
              <div className="h-[calc(100%-2.8rem)]">
                <Demo name="workflow" compact />
              </div>
            </div>

            {/* Popiska pod ukázkou, ne přes ni — log v demu musí zůstat čitelný. */}
            <div className="mt-3 flex items-center gap-2.5 px-1">
              <MousePointerClick size={14} className="shrink-0 text-accent" />
              <p className="text-[0.74rem] text-muted">
                {lang === 'en'
                  ? 'Everything here is clickable — this is a live simulation, not a screenshot.'
                  : 'Všechno tady jde rozklikat — je to živá simulace, ne obrázek.'}
              </p>
            </div>
          </motion.div>
        </div>

        {/* scroll indikátor */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-16 flex items-center gap-3 lg:mt-20"
        >
          <span className="label-mono">{t('hero.scroll')}</span>
          <span aria-hidden className="h-px flex-1 bg-line" />
          <ArrowDown
            size={15}
            className="text-muted"
            style={reducedMotion ? undefined : { animation: 'abl-float 2.6s ease-in-out infinite' }}
          />
        </motion.div>
      </div>
    </section>
  )
}
