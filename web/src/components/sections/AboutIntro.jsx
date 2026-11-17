import { ArrowRight, Ear, GitBranch, LayoutGrid, Sparkles } from 'lucide-react'
import { Section, SectionHead } from '../ui/Section.jsx'
import { Button } from '../ui/Button.jsx'
import { Reveal, RevealGroup, RevealItem } from '../ui/Reveal.jsx'
import { Badge, TiltCard } from '../ui/primitives.jsx'
import { useT } from '../../lib/i18n.jsx'
import { profile, site } from '../../data/site.js'
import { cn } from '../../lib/utils.js'

const ICONS = { GitBranch, Ear, LayoutGrid, Sparkles }

const TONE_RING = {
  accent: 'group-hover:border-accent/50',
  violet: 'group-hover:border-violet/50',
  coral: 'group-hover:border-coral/50',
}

const TONE_ICON = {
  accent: 'bg-accent/14 text-accent',
  violet: 'bg-violet/16 text-violet',
  coral: 'bg-coral/16 text-coral',
}

export default function AboutIntro({ full = false }) {
  const { t, pick } = useT()

  return (
    <Section id="o-mne" className={full ? 'py-14 sm:py-16' : 'py-20 sm:py-28'}>
      {/* Na vlastní stránce nadpis nese už hlavička — neopakujeme ho. */}
      {!full && (
        <SectionHead
          index={1}
          eyebrow={t('about.eyebrow')}
          title={t('about.title')}
          aside={
            <Button to="/o-mne" variant="quiet" size="sm" icon={ArrowRight}>
              {t('action.more')}
            </Button>
          }
        />
      )}

      <div
        className={cn(
          'grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16',
          full ? '' : 'mt-14'
        )}
      >
        {/* Osobní text */}
        <Reveal>
          <div className="relative">
            <div className="flex items-center gap-3">
              {/* iniciála místo fotky — fotka se doplní později */}
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-accent font-display text-[1.6rem] font-semibold text-accent-ink">
                A
              </span>
              <div>
                <p className="font-display text-[1.15rem] font-semibold">{site.person}</p>
                <p className="text-[0.82rem] text-muted">{t('about.role')}</p>
              </div>
            </div>

            <p className="mt-7 text-[1.02rem] leading-relaxed text-text-soft">
              {pick(profile.intro)}
            </p>

            <blockquote className="mt-7 border-l-2 border-accent pl-5">
              <p className="font-display text-[1.25rem] leading-snug">{pick(site.claim)}</p>
            </blockquote>

            <div className="mt-7 flex flex-wrap gap-2">
              <Badge tone="accent">n8n</Badge>
              <Badge tone="violet">Claude &amp; ChatGPT</Badge>
              <Badge tone="neutral">MS Office</Badge>
              <Badge tone="coral">Vibecoding</Badge>
              <Badge tone="neutral">GDPR &amp; AI Act</Badge>
            </div>
          </div>
        </Reveal>

        {/* Čtyři vlastnosti jako karty */}
        <RevealGroup className="grid gap-4 sm:grid-cols-2">
          {profile.traits.map((trait) => {
            const Icon = ICONS[trait.icon] ?? Sparkles
            return (
              <RevealItem key={trait.id}>
                <TiltCard strength={5} className="h-full">
                  <article
                    className={cn(
                      'card group h-full border-line p-5 transition-colors duration-500',
                      TONE_RING[trait.tone]
                    )}
                  >
                    <span
                      className={cn(
                        'grid size-9 place-items-center rounded-xl transition-transform duration-500 ease-[var(--ease-spring)] group-hover:scale-110',
                        TONE_ICON[trait.tone]
                      )}
                    >
                      <Icon size={17} strokeWidth={2.1} />
                    </span>
                    <h3 className="mt-4 text-[1.05rem] leading-snug">{pick(trait.title)}</h3>
                    <p className="mt-2 text-[0.87rem] leading-relaxed text-muted">
                      {pick(trait.body)}
                    </p>
                  </article>
                </TiltCard>
              </RevealItem>
            )
          })}
        </RevealGroup>
      </div>
    </Section>
  )
}
