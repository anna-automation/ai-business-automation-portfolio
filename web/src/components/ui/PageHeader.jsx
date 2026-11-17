import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import FlowField from '../bg/FlowField.jsx'
import { Eyebrow } from './primitives.jsx'
import { KineticText, Reveal } from './Reveal.jsx'
import { cn } from '../../lib/utils.js'

/**
 * Hlavička vnitřních stránek. Drží stejný rytmus jako hero, ale je nižší,
 * aby se obsah dostal rychle do pohledu.
 */
export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  breadcrumbs,
  aside,
  children,
  flow = true,
  className,
}) {
  return (
    <header className={cn('relative overflow-hidden border-b border-line', className)}>
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="grid-paper absolute inset-0 opacity-70" />
        {flow && <FlowField density={0.65} opacity={0.5} />}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-bg to-transparent" />
      </div>

      <div className="relative mx-auto w-full max-w-[82rem] px-5 pb-14 pt-10 sm:px-7 sm:pb-16 sm:pt-14">
        {breadcrumbs && (
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-1.5">
              {breadcrumbs.map((crumb, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  {i > 0 && <ChevronRight size={12} className="text-muted" />}
                  {crumb.to ? (
                    <Link
                      to={crumb.to}
                      className="link-underline font-mono text-[0.7rem] uppercase tracking-[0.1em] text-muted hover:text-text"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-text-soft">
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div className={cn(aside && 'lg:flex lg:items-end lg:justify-between lg:gap-12')}>
          <div className="max-w-3xl">
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
            <h1 className="mt-3.5 font-display text-[clamp(2rem,5.6vw,3.6rem)] font-semibold leading-[1.0] tracking-[-0.035em]">
              <KineticText text={title} />
            </h1>
            {subtitle && (
              <Reveal delay={0.15}>
                <p className="mt-5 max-w-2xl text-[1.02rem] leading-relaxed text-text-soft">
                  {subtitle}
                </p>
              </Reveal>
            )}
          </div>
          {aside && (
            <Reveal delay={0.2} className="mt-8 shrink-0 lg:mt-0">
              {aside}
            </Reveal>
          )}
        </div>

        {children && <div className="mt-8">{children}</div>}
      </div>
    </header>
  )
}
