import { cn } from '../../lib/utils.js'
import { Badge, LiveDot } from '../ui/primitives.jsx'
import { useT } from '../../lib/i18n.jsx'
import { RotateCcw } from 'lucide-react'

/**
 * Společný rámec všech interaktivních ukázek.
 *
 * Každé demo žije ve dvou režimech:
 *   compact — náhled v bento kartě na úvodu (malý, bez ovládání)
 *   plný    — na detailu produktu (celá interakce)
 *
 * Rámec drží jednotnou hlavičku, upozornění na simulaci a reset.
 */

export function DemoShell({
  title,
  subtitle,
  children,
  onReset,
  toolbar,
  live,
  compact = false,
  className,
  bodyClassName,
}) {
  const { t } = useT()

  return (
    <div
      className={cn(
        'card relative flex flex-col overflow-hidden',
        compact && 'h-full',
        className
      )}
    >
      {!compact && (
        <header className="flex flex-wrap items-center gap-3 border-b border-line bg-surface-2/60 px-4 py-3">
          <div className="flex items-center gap-2">
            <span aria-hidden className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-coral/70" />
              <span className="size-2.5 rounded-full bg-warn/70" />
              <span className="size-2.5 rounded-full bg-ok/70" />
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.82rem] font-semibold">{title}</p>
            {subtitle && <p className="truncate text-[0.72rem] text-muted">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            {live && (
              <span className="flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted">
                <LiveDot />
                {t('demo.simulated')}
              </span>
            )}
            {toolbar}
            {onReset && (
              <button
                type="button"
                onClick={onReset}
                className="flex items-center gap-1.5 rounded-lg border border-line px-2 py-1 font-mono text-[0.65rem] uppercase tracking-[0.1em] text-muted transition hover:border-line-strong hover:text-text"
              >
                <RotateCcw size={11} />
                {t('action.reset')}
              </button>
            )}
          </div>
        </header>
      )}

      <div className={cn('relative flex-1', compact ? 'p-3.5' : 'p-4 sm:p-5', bodyClassName)}>
        {children}
      </div>
    </div>
  )
}

/** Štítek "fiktivní data" na okraj ukázky. */
export function FakeDataNote({ className }) {
  const { t } = useT()
  return (
    <p className={cn('label-mono flex items-center gap-1.5', className)}>
      <span aria-hidden className="size-1 rounded-full bg-warn" />
      {t('demo.notice')}
    </p>
  )
}

/** Vodorovná lišta s kroky procesu — používá víc dem. */
export function StepTrail({ steps, current, className }) {
  return (
    <ol className={cn('flex items-center gap-1.5', className)}>
      {steps.map((step, i) => {
        const state = i < current ? 'done' : i === current ? 'active' : 'todo'
        return (
          <li key={step} className="flex min-w-0 flex-1 items-center gap-1.5">
            <span
              className={cn(
                'h-1 flex-1 rounded-full transition-all duration-500',
                state === 'done' && 'bg-accent',
                state === 'active' && 'bg-accent/50',
                state === 'todo' && 'bg-line'
              )}
            />
          </li>
        )
      })}
    </ol>
  )
}

/** Datová tabulka v jednotném stylu. */
export function MiniTable({ columns, rows, className, emptyLabel }) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full min-w-[22rem] border-collapse text-left">
        <thead>
          <tr className="border-b border-line">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'label-mono whitespace-nowrap py-2 pr-3 font-medium',
                  col.align === 'right' && 'text-right'
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="py-6 text-center text-[0.8rem] text-muted">
                {emptyLabel}
              </td>
            </tr>
          )}
          {rows.map((row, i) => (
            <tr key={row.id ?? i} className="border-b border-line/60 last:border-0">
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    'py-2 pr-3 align-middle text-[0.82rem]',
                    col.align === 'right' && 'text-right',
                    col.mono && 'font-mono text-[0.76rem]'
                  )}
                >
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Hodnota s popiskem — stavební kámen dashboardů v demech. */
export function StatTile({ label, value, delta, tone = 'neutral', icon: Icon, className }) {
  return (
    <div className={cn('rounded-xl border border-line bg-surface-2/60 p-3', className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="label-mono">{label}</p>
        {Icon && <Icon size={13} className="text-muted" />}
      </div>
      <p className="mt-1.5 font-display text-[1.45rem] font-semibold leading-none tabular-nums">
        {value}
      </p>
      {delta != null && (
        <p
          className={cn(
            'mt-1 font-mono text-[0.68rem]',
            tone === 'up' && 'text-ok',
            tone === 'down' && 'text-coral',
            tone === 'neutral' && 'text-muted'
          )}
        >
          {delta}
        </p>
      )}
    </div>
  )
}

/** Odznak u ukázky, že jde o simulaci. */
export function SimBadge() {
  const { t } = useT()
  return (
    <Badge tone="warn" dot>
      {t('demo.badge')}
    </Badge>
  )
}
