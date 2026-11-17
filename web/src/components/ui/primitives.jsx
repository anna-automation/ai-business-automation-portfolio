import { useId, useRef, useState } from 'react'
import { cn } from '../../lib/utils.js'

/** Malý mono label: "02 / WORKFLOW" */
export function Eyebrow({ children, index, className }) {
  return (
    <p className={cn('label-mono flex items-center gap-2.5', className)}>
      {index != null && (
        <>
          <span className="text-accent">{String(index).padStart(2, '0')}</span>
          <span aria-hidden className="h-px w-5 bg-line-strong" />
        </>
      )}
      {children}
    </p>
  )
}

const BADGE_TONES = {
  accent: 'bg-accent/14 text-text border-accent/35',
  violet: 'bg-violet/14 text-text border-violet/35',
  coral: 'bg-coral/14 text-text border-coral/35',
  neutral: 'bg-surface-2 text-text-soft border-line',
  ok: 'bg-ok/14 text-text border-ok/35',
  warn: 'bg-warn/16 text-text border-warn/40',
}

export function Badge({ children, tone = 'neutral', icon: Icon, className, dot }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[0.675rem] font-medium uppercase tracking-[0.1em]',
        BADGE_TONES[tone] ?? BADGE_TONES.neutral,
        className
      )}
    >
      {dot && (
        <span
          aria-hidden
          className={cn(
            'size-1.5 rounded-full',
            tone === 'ok' && 'bg-ok',
            tone === 'accent' && 'bg-accent',
            tone === 'violet' && 'bg-violet',
            tone === 'coral' && 'bg-coral',
            tone === 'warn' && 'bg-warn',
            tone === 'neutral' && 'bg-muted'
          )}
        />
      )}
      {Icon && <Icon size={11.5} strokeWidth={2.4} />}
      {children}
    </span>
  )
}

/** Živý indikátor "běží" — tečka s pulzujícím prstencem. */
export function LiveDot({ tone = 'ok', className }) {
  const color = tone === 'ok' ? 'bg-ok' : tone === 'accent' ? 'bg-accent' : 'bg-violet'
  return (
    <span className={cn('relative grid size-2 place-items-center', className)} aria-hidden>
      <span className={cn('absolute size-2 rounded-full opacity-60', color)}
        style={{ animation: 'abl-pulse-ring 2s ease-out infinite' }}
      />
      <span className={cn('size-2 rounded-full', color)} />
    </span>
  )
}

/** Klávesová zkratka: ⌘ K */
export function Kbd({ children, className }) {
  return (
    <kbd
      className={cn(
        'inline-flex h-5 min-w-5 items-center justify-center rounded-[5px] border border-line bg-surface-2 px-1.5 font-mono text-[0.65rem] font-medium text-muted',
        className
      )}
    >
      {children}
    </kbd>
  )
}

/** Vysvětlivka, která se objeví při najetí i při fokusu z klávesnice. */
export function Tooltip({ children, content, side = 'top', className }) {
  const [open, setOpen] = useState(false)
  const id = useId()

  const position = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }[side]

  return (
    <span
      className={cn('relative inline-flex', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <span aria-describedby={open ? id : undefined} className="inline-flex">
        {children}
      </span>
      <span
        id={id}
        role="tooltip"
        className={cn(
          'glass pointer-events-none absolute z-50 w-max max-w-[16rem] rounded-xl px-2.5 py-1.5 text-[0.76rem] leading-snug text-text shadow-[var(--shadow-lift)]',
          'origin-center transition-all duration-200 ease-[var(--ease-out-expo)]',
          position,
          open ? 'translate-y-0 scale-100 opacity-100' : 'scale-95 opacity-0'
        )}
      >
        {content}
      </span>
    </span>
  )
}

/** Karta s 3D náklonem podle pohybu myši. */
export function TiltCard({ children, className, strength = 7, glare = true, ...rest }) {
  const ref = useRef(null)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, mx: 50, my: 50, active: false })

  const onMove = (event) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (event.clientX - rect.left) / rect.width
    const py = (event.clientY - rect.top) / rect.height
    setTilt({
      rx: (0.5 - py) * strength * 2,
      ry: (px - 0.5) * strength * 2,
      mx: px * 100,
      my: py * 100,
      active: true,
    })
  }

  const onLeave = () => setTilt((t) => ({ ...t, rx: 0, ry: 0, active: false }))

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn('relative [transform-style:preserve-3d]', className)}
      style={{
        transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
        transition: tilt.active
          ? 'transform 80ms linear'
          : 'transform 700ms var(--ease-out-expo)',
      }}
      {...rest}
    >
      {children}
      {glare && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500"
          style={{
            opacity: tilt.active ? 0.5 : 0,
            background: `radial-gradient(420px circle at ${tilt.mx}% ${tilt.my}%, rgb(255 255 255 / 0.16), transparent 42%)`,
          }}
        />
      )}
    </div>
  )
}

/** Jemná oddělovací linka s mono popiskem uprostřed. */
export function LabeledRule({ children, className }) {
  return (
    <div className={cn('flex items-center gap-4', className)}>
      <span aria-hidden className="h-px flex-1 bg-line" />
      <span className="label-mono">{children}</span>
      <span aria-hidden className="h-px flex-1 bg-line" />
    </div>
  )
}

/** Přepínač ve stylu zbytku webu. */
export function Switch({ checked, onChange, label, description, id: idProp }) {
  const autoId = useId()
  const id = idProp ?? autoId
  return (
    <div className="flex items-start gap-3">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative mt-0.5 h-5 w-9 shrink-0 rounded-full border transition-colors duration-300',
          checked ? 'border-accent bg-accent' : 'border-line-strong bg-surface-2'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 size-3.5 rounded-full transition-all duration-300 ease-[var(--ease-spring)]',
            checked ? 'left-[1.1rem] bg-accent-ink' : 'left-0.5 bg-muted'
          )}
        />
      </button>
      {(label || description) && (
        <label htmlFor={id} className="cursor-pointer text-sm leading-snug">
          {label && <span className="font-medium">{label}</span>}
          {description && <span className="mt-0.5 block text-[0.8rem] text-muted">{description}</span>}
        </label>
      )}
    </div>
  )
}

/** Načítací blok — používáme při simulaci práce na pozadí. */
export function Skeleton({ className }) {
  return <span className={cn('skeleton block rounded-lg', className)} aria-hidden />
}
