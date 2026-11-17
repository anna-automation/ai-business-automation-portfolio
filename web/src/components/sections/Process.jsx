import { useRef } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import { Section, SectionHead } from '../ui/Section.jsx'
import { Reveal } from '../ui/Reveal.jsx'
import { Badge } from '../ui/primitives.jsx'
import { useT } from '../../lib/i18n.jsx'
import { usePrefs } from '../../lib/prefs.jsx'
import { profile } from '../../data/site.js'

/**
 * Jak probíhá spolupráce. Linka mezi kroky se vykresluje podle scrollování —
 * je to zároveň ukázka toho, co se dá se scroll animacemi dělat, a sekce,
 * kde je vidět, že proces mám vymyšlený do konce.
 */
export default function Process() {
  const { t, lang, pick } = useT()
  const { reducedMotion } = usePrefs()
  const ref = useRef(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 72%', 'end 55%'],
  })
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 26, restDelta: 0.001 })
  const height = useTransform(smooth, [0, 1], ['0%', '100%'])

  return (
    <Section className="py-20 sm:py-28">
      <SectionHead
        index={5}
        eyebrow={lang === 'en' ? 'How we work together' : 'Jak to probíhá'}
        title={
          lang === 'en' ? 'Four steps, no surprises' : 'Čtyři kroky a žádná překvapení'
        }
        subtitle={
          lang === 'en'
            ? 'I map the process before touching a tool, and I hand over something you can run without me.'
            : 'Než sáhnu po nástroji, nakreslím proces. A předávám to tak, abyste to zvládli i beze mě.'
        }
      />

      {/*
        Oba obaly mají position v inline stylu schválně: useScroll si měří
        offsety dřív, než se v dev režimu stihne načíst CSS, a bez positioned
        rodiče by spočítal špatný rozsah.
      */}
      <div style={{ position: 'relative' }}>
      <div ref={ref} style={{ position: 'relative' }} className="mt-14 pl-10 sm:pl-16">
        {/* kolej, po které se linka kreslí */}
        <div aria-hidden className="absolute bottom-0 left-[1.1rem] top-2 w-px bg-line sm:left-[2.1rem]" />
        <motion.div
          aria-hidden
          className="absolute left-[1.1rem] top-2 w-px origin-top bg-gradient-to-b from-accent via-accent to-violet sm:left-[2.1rem]"
          style={reducedMotion ? { height: '100%' } : { height }}
        />

        <ol className="space-y-12">
          {profile.process.map((step, i) => (
            <li key={step.id} className="relative">
              {/* uzel na lince */}
              <span
                aria-hidden
                className="absolute -left-10 top-1.5 grid size-5 place-items-center rounded-full border border-line-strong bg-bg sm:-left-16"
              >
                <span className="size-1.5 rounded-full bg-accent" />
              </span>

              <Reveal y={18} delay={0.04 * i}>
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="label-mono tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="text-[clamp(1.2rem,3vw,1.75rem)] leading-tight">
                    {pick(step.title)}
                  </h3>
                  <Badge tone="neutral">{pick(step.duration)}</Badge>
                </div>
                <p className="mt-2.5 max-w-xl text-[0.95rem] leading-relaxed text-text-soft">
                  {pick(step.body)}
                </p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
      </div>
    </Section>
  )
}
