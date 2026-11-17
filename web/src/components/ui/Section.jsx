import { cn } from '../../lib/utils.js'
import { Eyebrow } from './primitives.jsx'
import { KineticHeading, Reveal } from './Reveal.jsx'

/** Obsahový pás s konzistentním odsazením. */
export function Section({ id, children, className, container = true, tone = 'bg' }) {
  return (
    <section
      id={id}
      className={cn(
        'relative scroll-mt-24',
        tone === 'sunk' && 'bg-bg-sunk',
        tone === 'surface' && 'bg-surface',
        className
      )}
    >
      {container ? <div className="mx-auto w-full max-w-[82rem] px-5 sm:px-7">{children}</div> : children}
    </section>
  )
}

/** Hlavička sekce: index, mono label, velký nadpis, podtitul. */
export function SectionHead({
  index,
  eyebrow,
  title,
  subtitle,
  align = 'left',
  aside,
  className,
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-6',
        align === 'center' && 'items-center text-center',
        aside && 'lg:flex-row lg:items-end lg:justify-between lg:gap-12',
        className
      )}
    >
      <div className={cn('max-w-3xl', align === 'center' && 'mx-auto')}>
        {eyebrow && <Reveal><Eyebrow index={index}>{eyebrow}</Eyebrow></Reveal>}
        <h2 className="mt-4 text-[clamp(1.9rem,5vw,3.4rem)] leading-[1.02]">
          <KineticHeading text={title} />
        </h2>
        {subtitle && (
          <Reveal delay={0.1}>
            <p className="mt-5 max-w-2xl text-[1.02rem] leading-relaxed text-text-soft">
              {subtitle}
            </p>
          </Reveal>
        )}
      </div>
      {aside && <Reveal delay={0.15} className="shrink-0">{aside}</Reveal>}
    </div>
  )
}

/** Tenká vodorovná linka zarovnaná na mřížku sekce. */
export function Rule({ className }) {
  return <div aria-hidden className={cn('h-px w-full bg-line', className)} />
}
