import {
  ArrowRight,
  ClipboardList,
  Container,
  GraduationCap,
  MessageSquareHeart,
  NotebookPen,
  Presentation,
  ShieldCheck,
  TrendingDown,
} from 'lucide-react'
import PageHeader from '../components/ui/PageHeader.jsx'
import ContactCTA from '../components/sections/ContactCTA.jsx'
import { Section, SectionHead } from '../components/ui/Section.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Badge, TiltCard } from '../components/ui/primitives.jsx'
import { Counter } from '../components/ui/Counter.jsx'
import { Reveal, RevealGroup, RevealItem } from '../components/ui/Reveal.jsx'
import { useT } from '../lib/i18n.jsx'
import { useDocumentTitle } from '../lib/useDocumentTitle.js'
import { caseStudies, courses, materials } from '../data/learning.js'
import { cn } from '../lib/utils.js'

const MATERIAL_ICONS = {
  Presentation,
  ClipboardList,
  NotebookPen,
  MessageSquareHeart,
  Container,
  ShieldCheck,
}

const TONE = {
  accent: { border: 'border-accent/35', bg: 'bg-accent/8', text: 'text-accent' },
  violet: { border: 'border-violet/35', bg: 'bg-violet/8', text: 'text-violet' },
  coral: { border: 'border-coral/35', bg: 'bg-coral/8', text: 'text-coral' },
}

export default function LearningPage() {
  const { t, lang, pick } = useT()
  useDocumentTitle(`${t('learning.title')} — ${t('brand.name')}`)

  return (
    <>
      <PageHeader
        eyebrow={t('learning.eyebrow')}
        title={t('learning.title')}
        subtitle={
          lang === 'en'
            ? 'Two ready courses, materials for the trainer and an environment every participant can boot in five minutes.'
            : 'Dva hotové kurzy, materiály pro lektora a prostředí, které si každý účastník rozjede za pět minut.'
        }
        breadcrumbs={[{ label: t('nav.home'), to: '/' }, { label: t('nav.learning') }]}
        aside={
          <Badge tone="accent" icon={GraduationCap}>
            {lang === 'en' ? 'Ready to run' : 'Připraveno k odučení'}
          </Badge>
        }
      />

      {/* Kurzy */}
      <Section className="py-16 sm:py-20">
        <div className="grid gap-6 lg:grid-cols-2">
          {courses.map((course, index) => {
            const tone = TONE[course.tone] ?? TONE.accent
            return (
              <Reveal key={course.id} y={22} delay={0.06 * index}>
                <article className={cn('card h-full overflow-hidden p-6 sm:p-7', tone.border)}>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Badge tone={course.tone}>{pick(course.length)}</Badge>
                  </div>

                  <h2 className="mt-4 text-[clamp(1.4rem,3.2vw,1.9rem)] leading-tight">
                    {pick(course.title)}
                  </h2>

                  <dl className="mt-5 space-y-3.5">
                    <div>
                      <dt className="label-mono">{lang === 'en' ? 'For whom' : 'Pro koho'}</dt>
                      <dd className="mt-1 text-[0.9rem] leading-relaxed text-text-soft">
                        {pick(course.audience)}
                      </dd>
                    </div>
                    <div>
                      <dt className="label-mono">{lang === 'en' ? 'Outcome' : 'Výsledek'}</dt>
                      <dd
                        className={cn(
                          'mt-1 rounded-xl border p-3.5 text-[0.9rem] leading-relaxed text-text-soft',
                          tone.border,
                          tone.bg
                        )}
                      >
                        {pick(course.outcome)}
                      </dd>
                    </div>
                  </dl>

                  <h3 className="label-mono mt-7">{lang === 'en' ? 'Programme' : 'Program'}</h3>
                  <ol className="mt-3">
                    {course.blocks.map((block, i) => (
                      <li
                        key={i}
                        className="flex gap-4 border-b border-line py-3 last:border-0"
                      >
                        <span className="label-mono w-[5.2rem] shrink-0 tabular-nums">
                          {block.time}
                        </span>
                        <span className="flex-1 text-[0.89rem] leading-relaxed text-text-soft">
                          {pick({ cs: block.cs, en: block.en })}
                        </span>
                      </li>
                    ))}
                  </ol>
                </article>
              </Reveal>
            )
          })}
        </div>
      </Section>

      {/* Materiály */}
      <Section tone="sunk" className="border-y border-line py-16 sm:py-20">
        <SectionHead
          index={2}
          eyebrow={lang === 'en' ? 'What comes with it' : 'Co k tomu patří'}
          title={lang === 'en' ? 'Materials, not promises' : 'Materiály, ne slibované materiály'}
          subtitle={
            lang === 'en'
              ? 'A trainer who hands over documentation is a trainer a company can repeat the course with.'
              : 'Lektorka, která předá i dokumentaci, je lektorka, se kterou si firma kurz zopakuje sama.'
          }
        />

        <RevealGroup className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {materials.map((material) => {
            const Icon = MATERIAL_ICONS[material.icon] ?? ClipboardList
            return (
              <RevealItem key={material.id}>
                <TiltCard strength={5} className="h-full">
                  <article className="card group h-full p-5">
                    <span className="grid size-9 place-items-center rounded-xl bg-accent/12 text-accent transition-transform duration-500 ease-[var(--ease-spring)] group-hover:scale-110">
                      <Icon size={17} strokeWidth={2.1} />
                    </span>
                    <h3 className="mt-4 text-[1.02rem] leading-snug">{pick(material.title)}</h3>
                    <p className="mt-2 text-[0.86rem] leading-relaxed text-muted">
                      {pick(material.body)}
                    </p>
                  </article>
                </TiltCard>
              </RevealItem>
            )
          })}
        </RevealGroup>
      </Section>

      {/* Případové studie */}
      <Section className="py-16 sm:py-20">
        <SectionHead
          index={3}
          eyebrow={lang === 'en' ? 'Case studies' : 'Případové studie'}
          title={lang === 'en' ? 'Before, after, and the hours' : 'Před, po a kolik to vzalo'}
          subtitle={
            lang === 'en'
              ? 'Three fictional small companies. The numbers are modelled, not measured — and labelled as such.'
              : 'Tři fiktivní malé firmy. Čísla jsou modelovaná, nikoliv naměřená — a je to tak napsané.'
          }
        />

        <div className="mt-12 space-y-5">
          {caseStudies.map((study, index) => {
            const tone = TONE[study.tone] ?? TONE.accent
            return (
              <Reveal key={study.id} y={20} delay={0.05 * index}>
                <article className="card overflow-hidden">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line bg-surface-2/50 p-5">
                    <div className="flex items-center gap-3">
                      <span className="label-mono tabular-nums">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <h3 className="text-[1.15rem] leading-tight">{pick(study.company)}</h3>
                    </div>
                    <p className={cn('flex items-baseline gap-2', tone.text)}>
                      <TrendingDown size={15} className="self-center" />
                      <span className="font-display text-[1.6rem] font-semibold leading-none tabular-nums">
                        <Counter to={study.saved.hours} />
                      </span>
                      <span className="text-[0.78rem] text-muted">{pick(study.saved.unit)}</span>
                    </p>
                  </div>

                  <div className="grid divide-y divide-line sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                    <div className="p-5">
                      <p className="label-mono flex items-center gap-1.5">
                        <span aria-hidden className="size-1.5 rounded-full bg-coral" />
                        {lang === 'en' ? 'Before' : 'Před'}
                      </p>
                      <p className="mt-2.5 text-[0.9rem] leading-relaxed text-muted">
                        {pick(study.before)}
                      </p>
                    </div>
                    <div className={cn('p-5', tone.bg)}>
                      <p className="label-mono flex items-center gap-1.5">
                        <span aria-hidden className={cn('size-1.5 rounded-full', 'bg-ok')} />
                        {lang === 'en' ? 'After' : 'Po'}
                      </p>
                      <p className="mt-2.5 text-[0.9rem] leading-relaxed text-text-soft">
                        {pick(study.after)}
                      </p>
                    </div>
                  </div>
                </article>
              </Reveal>
            )
          })}
        </div>

        <Reveal className="mt-10">
          <Button to="/kontakt" size="lg" icon={ArrowRight}>
            {lang === 'en' ? 'Ask about a course for your team' : 'Zeptat se na kurz pro váš tým'}
          </Button>
        </Reveal>
      </Section>

      <ContactCTA />
    </>
  )
}
