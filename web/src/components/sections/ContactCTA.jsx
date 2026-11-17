import { ArrowRight, Clock, Mail, MapPin } from 'lucide-react'
import FlowField from '../bg/FlowField.jsx'
import { Section } from '../ui/Section.jsx'
import { Button } from '../ui/Button.jsx'
import { KineticHeading, Reveal } from '../ui/Reveal.jsx'
import { useT } from '../../lib/i18n.jsx'
import { site } from '../../data/site.js'

export default function ContactCTA() {
  const { t, lang, pick } = useT()

  return (
    <Section className="py-20 sm:py-24" container={false}>
      <div className="mx-auto w-full max-w-[82rem] px-5 sm:px-7">
        <div className="relative overflow-hidden rounded-[1.75rem] border border-line bg-surface">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <FlowField density={0.7} opacity={0.6} />
            <div className="absolute -left-10 bottom-0 size-80 rounded-full bg-accent/10 blur-[90px]" />
            <div className="absolute -right-10 -top-10 size-72 rounded-full bg-violet/12 blur-[90px]" />
          </div>

          <div className="relative grid gap-10 p-7 sm:p-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="label-mono">{t('contact.eyebrow')}</p>
              <h2 className="mt-4 max-w-xl text-[clamp(1.9rem,5.2vw,3.2rem)] leading-[1.02]">
                <KineticHeading text={t('contact.title')} />
              </h2>
              <Reveal delay={0.1}>
                <p className="mt-5 max-w-lg text-[1rem] leading-relaxed text-text-soft">
                  {t('contact.sub')}
                </p>
              </Reveal>
              <Reveal delay={0.18}>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Button
                    to="/kontakt"
                    size="lg"
                    variant="primary"
                    icon={ArrowRight}
                    cursorLabel={lang === 'en' ? 'Write' : 'Napsat'}
                  >
                    {t('nav.cta')}
                  </Button>
                  <Button href={`mailto:${site.email}`} size="lg" variant="outline" icon={Mail} iconRight={false}>
                    {site.email}
                  </Button>
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.12}>
              <dl className="grid gap-4 border-t border-line pt-6 sm:grid-cols-2 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                <div>
                  <dt className="label-mono flex items-center gap-1.5">
                    <Clock size={11} />
                    {t('contact.availability')}
                  </dt>
                  <dd className="mt-1.5 text-[0.9rem] text-text-soft">
                    {t('contact.responseTime')}
                  </dd>
                </div>
                <div>
                  <dt className="label-mono flex items-center gap-1.5">
                    <MapPin size={11} />
                    {lang === 'en' ? 'Where' : 'Kde'}
                  </dt>
                  <dd className="mt-1.5 text-[0.9rem] text-text-soft">{pick(site.location)}</dd>
                </div>
              </dl>
            </Reveal>
          </div>
        </div>
      </div>
    </Section>
  )
}
