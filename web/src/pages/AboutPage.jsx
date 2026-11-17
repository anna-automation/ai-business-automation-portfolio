import { ArrowRight, Github, Linkedin, Mail } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader.jsx'
import AboutIntro from '../components/sections/AboutIntro.jsx'
import Process from '../components/sections/Process.jsx'
import ContactCTA from '../components/sections/ContactCTA.jsx'
import { Section, SectionHead } from '../components/ui/Section.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Badge } from '../components/ui/primitives.jsx'
import { Reveal } from '../components/ui/Reveal.jsx'
import { useT } from '../lib/i18n.jsx'
import { useDocumentTitle } from '../lib/useDocumentTitle.js'
import { site, toolbelt } from '../data/site.js'

/** Co dělám a co nedělám — tahle dvojice řekne o přístupu víc než odstavec chvály. */
const PRINCIPLES = [
  {
    do: { cs: 'Nejdřív zmapuju proces, pak otevřu nástroj.', en: 'Map the process first, open the tool second.' },
    dont: { cs: 'Nenasazuju automatizaci na proces, kterému nikdo nerozumí.', en: 'I will not automate a process nobody understands.' },
  },
  {
    do: { cs: 'Řeknu, když se automatizace nevyplatí.', en: 'I say so when automating does not pay off.' },
    dont: { cs: 'Neprodávám workflow, které ušetří dvě minuty měsíčně.', en: 'I will not sell a workflow that saves two minutes a month.' },
  },
  {
    do: { cs: 'Předám dokumentaci a naučím obsluhu.', en: 'I hand over documentation and train the operator.' },
    dont: { cs: 'Nestavím nic, co beze mě přestane fungovat.', en: 'I will not build something that dies without me.' },
  },
  {
    do: { cs: 'U AI vždy nechám poslední slovo člověku.', en: 'With AI, a human always gets the last word.' },
    dont: { cs: 'Nepustím model na data, která tam nemají co dělat.', en: 'I will not let a model near data that has no business being there.' },
  },
]

export default function AboutPage() {
  const { t, lang, pick } = useT()
  useDocumentTitle(`${t('about.title')} — ${t('brand.name')}`)

  return (
    <>
      <PageHeader
        eyebrow={t('about.eyebrow')}
        title={t('about.title')}
        subtitle={pick(site.claim)}
        breadcrumbs={[{ label: t('nav.home'), to: '/' }, { label: t('nav.about') }]}
        aside={
          <div className="flex flex-wrap gap-2">
            <Button href={`mailto:${site.email}`} variant="quiet" size="sm" icon={Mail} iconRight={false}>
              {site.email}
            </Button>
            <Button href={site.github} variant="outline" size="sm" icon={Github} iconRight={false}>
              GitHub
            </Button>
            <Button href={site.linkedin} variant="outline" size="sm" icon={Linkedin} iconRight={false}>
              LinkedIn
            </Button>
          </div>
        }
      />

      <AboutIntro full />

      {/* Zásady */}
      <Section tone="sunk" className="border-y border-line py-16 sm:py-20">
        <SectionHead
          index={2}
          eyebrow={lang === 'en' ? 'How I work' : 'Jak pracuju'}
          title={lang === 'en' ? 'What I do and what I refuse' : 'Co dělám a co odmítnu'}
          subtitle={
            lang === 'en'
              ? 'The second column matters more. It is what keeps the first one true.'
              : 'Důležitější je ten druhý sloupec. Právě on drží ten první v platnosti.'
          }
        />

        <ul className="mt-12 divide-y divide-line border-y border-line">
          {PRINCIPLES.map((item, i) => (
            <li key={i}>
              <Reveal y={14} delay={0.04 * i}>
                <div className="grid gap-3 py-5 sm:grid-cols-2 sm:gap-8">
                  <p className="flex items-start gap-3 text-[0.98rem] leading-relaxed">
                    <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                    <span>{pick(item.do)}</span>
                  </p>
                  <p className="flex items-start gap-3 text-[0.95rem] leading-relaxed text-muted sm:border-l sm:border-line sm:pl-8">
                    <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-coral" />
                    <span>{pick(item.dont)}</span>
                  </p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </Section>

      <Process />

      {/* Nástroje */}
      <Section tone="sunk" className="border-y border-line py-16 sm:py-20">
        <SectionHead
          index={6}
          eyebrow={lang === 'en' ? 'Toolbelt' : 'Čím pracuji'}
          title={lang === 'en' ? 'Tools, not religions' : 'Nástroje, ne vyznání'}
          subtitle={
            lang === 'en'
              ? 'I pick what the company can actually operate after I leave. Often that means a spreadsheet, not a platform.'
              : 'Vybírám to, co firma po mém odchodu zvládne obsluhovat. Často to znamená tabulku, ne platformu.'
          }
        />
        <Reveal className="mt-10">
          <ul className="flex flex-wrap gap-2">
            {toolbelt.map((tool) => (
              <li key={tool}>
                <Badge tone="neutral" className="text-[0.74rem]">
                  {tool}
                </Badge>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal className="mt-10" delay={0.1}>
          <Button to="/ukazky" size="lg" icon={ArrowRight}>
            {lang === 'en' ? 'See it working' : 'Podívat se, jak to funguje'}
          </Button>
        </Reveal>
      </Section>

      <ContactCTA />
    </>
  )
}
