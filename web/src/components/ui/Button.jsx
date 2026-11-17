import { forwardRef, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { cn, uid } from '../../lib/utils.js'
import { useReducedMotion } from '../../lib/prefs.jsx'

/**
 * Jedno tlačítko pro celý web — magnetické přitažení ke kurzoru + ripple.
 * Oba efekty se vypnou, když uživatel omezí pohyb.
 *
 *   <Button to="/ukazky" variant="primary" icon={ArrowRight}>Vyzkoušet</Button>
 */

const VARIANTS = {
  primary:
    'bg-accent text-accent-ink hover:brightness-105 shadow-[0_1px_0_rgb(255_255_255/0.25)_inset,0_10px_30px_-12px_var(--accent)]',
  solid: 'bg-text text-bg hover:opacity-90',
  violet: 'bg-violet text-white hover:brightness-110',
  outline: 'border border-line-strong bg-transparent text-text hover:bg-surface-2',
  ghost: 'bg-transparent text-text-soft hover:bg-surface-2 hover:text-text',
  quiet: 'bg-surface-2 text-text border border-line hover:border-line-strong',
}

const SIZES = {
  sm: 'h-9 px-3.5 text-[0.82rem] gap-1.5 rounded-xl',
  md: 'h-11 px-5 text-[0.9rem] gap-2 rounded-xl',
  lg: 'h-14 px-7 text-[1rem] gap-2.5 rounded-2xl',
}

const MAGNET_STRENGTH = 0.28
const MAGNET_MAX = 9

export const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    icon: Icon,
    iconRight = true,
    to,
    href,
    magnetic = true,
    ripple = true,
    className,
    cursorLabel,
    onClick,
    ...rest
  },
  forwardedRef
) {
  const reduced = useReducedMotion()
  const innerRef = useRef(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [ripples, setRipples] = useState([])

  const allowMagnet = magnetic && !reduced

  const handleMove = (event) => {
    if (!allowMagnet) return
    const el = innerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const dx = event.clientX - (rect.left + rect.width / 2)
    const dy = event.clientY - (rect.top + rect.height / 2)
    setOffset({
      x: Math.max(-MAGNET_MAX, Math.min(MAGNET_MAX, dx * MAGNET_STRENGTH)),
      y: Math.max(-MAGNET_MAX, Math.min(MAGNET_MAX, dy * MAGNET_STRENGTH)),
    })
  }

  const handleLeave = () => setOffset({ x: 0, y: 0 })

  const handleClick = (event) => {
    if (ripple && !reduced) {
      const el = innerRef.current
      if (el) {
        const rect = el.getBoundingClientRect()
        const id = uid('ripple')
        setRipples((list) => [
          ...list,
          { id, x: event.clientX - rect.left, y: event.clientY - rect.top },
        ])
        setTimeout(() => setRipples((list) => list.filter((r) => r.id !== id)), 650)
      }
    }
    onClick?.(event)
  }

  const setRefs = (node) => {
    innerRef.current = node
    if (typeof forwardedRef === 'function') forwardedRef(node)
    else if (forwardedRef) forwardedRef.current = node
  }

  const content = (
    <>
      {Icon && !iconRight && <Icon size={size === 'lg' ? 19 : 16} strokeWidth={2.2} />}
      <span className="relative z-10">{children}</span>
      {Icon && iconRight && (
        <Icon
          size={size === 'lg' ? 19 : 16}
          strokeWidth={2.2}
          className="relative z-10 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1"
        />
      )}
      {ripples.map((r) => (
        <span
          key={r.id}
          aria-hidden
          className="pointer-events-none absolute size-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current opacity-25"
          style={{
            left: r.x,
            top: r.y,
            animation: 'abl-pulse-ring 0.6s var(--ease-out-expo) forwards',
          }}
        />
      ))}
    </>
  )

  const classes = cn(
    'group relative inline-flex select-none items-center justify-center overflow-hidden font-semibold',
    'transition-[background,color,border-color,filter,box-shadow,transform] duration-300 ease-[var(--ease-out-expo)]',
    'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
    VARIANTS[variant] ?? VARIANTS.primary,
    SIZES[size] ?? SIZES.md,
    className
  )

  const style = allowMagnet
    ? {
        transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
        transitionProperty: 'transform, background, color, border-color, filter, box-shadow',
        transitionDuration: offset.x === 0 && offset.y === 0 ? '600ms' : '120ms',
        transitionTimingFunction:
          offset.x === 0 && offset.y === 0 ? 'var(--ease-spring)' : 'ease-out',
      }
    : undefined

  const shared = {
    ref: setRefs,
    className: classes,
    style,
    onMouseMove: handleMove,
    onMouseLeave: handleLeave,
    onClick: handleClick,
    'data-cursor-label': cursorLabel,
    'data-cursor-variant': 'button',
    ...rest,
  }

  if (to) {
    return (
      <Link to={to} {...shared}>
        {content}
      </Link>
    )
  }

  if (href) {
    const external = /^https?:/.test(href)
    return (
      <a
        href={href}
        {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
        {...shared}
      >
        {content}
      </a>
    )
  }

  return (
    <button type="button" {...shared}>
      {content}
    </button>
  )
})

/** Kruhové tlačítko pro ikonu v hlavičce. */
export function IconButton({ icon: Icon, label, active, className, ...rest }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      data-cursor-variant="button"
      className={cn(
        'grid size-9 place-items-center rounded-xl border transition-all duration-300 ease-[var(--ease-out-expo)]',
        active
          ? 'border-accent/60 bg-accent/12 text-text'
          : 'border-transparent text-text-soft hover:border-line hover:bg-surface-2 hover:text-text',
        className
      )}
      {...rest}
    >
      <Icon size={16.5} strokeWidth={2} />
    </button>
  )
}
