import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { clamp, cn } from '../../lib/utils.js'
import { useT } from '../../lib/i18n.jsx'

/**
 * Porovnání dvou stavů jedné práce — ruční vlevo, automatizovaný vpravo.
 * Panely jsou libovolné React nody, maskují se přes clip-path.
 *
 * Pozici lze měnit tahem (myš i dotyk), klávesnicí, nebo zvenčí přes `initial`
 * — toho využívá compact náhled, kde se rukojeť hýbe sama.
 */

const L = {
  cs: {
    handle: 'Posuvník porovnání — šipkami doleva a doprava měníte dělicí čáru',
    value: (p) => `odhaleno ${p} % ruční varianty`,
  },
  en: {
    handle: 'Comparison slider — move the divider with the left and right arrows',
    value: (p) => `${p} % of the manual side revealed`,
  },
}

const KEY_STEP = {
  ArrowLeft: -2,
  ArrowRight: 2,
  ArrowDown: -2,
  ArrowUp: 2,
  PageDown: -10,
  PageUp: 10,
}

export default function BeforeAfter({
  before,
  after,
  beforeLabel,
  afterLabel,
  className,
  initial = 50,
}) {
  const { lang } = useT()
  const s = L[lang] ?? L.cs
  const wrapRef = useRef(null)
  const [pos, setPos] = useState(() => clamp(initial, 0, 100))
  const [dragging, setDragging] = useState(false)

  // Změna `initial` je způsob, jak rodič řídí pozici (samohybná smyčka v náhledu).
  useEffect(() => {
    setPos(clamp(initial, 0, 100))
  }, [initial])

  const fromClientX = useCallback((clientX) => {
    const el = wrapRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    if (!rect.width) return
    setPos(clamp(((clientX - rect.left) / rect.width) * 100, 0, 100))
  }, [])

  useEffect(() => {
    if (!dragging) return
    const onMove = (event) => fromClientX(event.clientX)
    const stop = () => setDragging(false)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', stop)
    window.addEventListener('pointercancel', stop)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', stop)
      window.removeEventListener('pointercancel', stop)
    }
  }, [dragging, fromClientX])

  const onSurfaceDown = (event) => {
    // Ovládací prvky vevnitř panelů si kliknutí nechají pro sebe.
    if (event.target?.closest?.('a, button, input, select, textarea')) return
    setDragging(true)
    fromClientX(event.clientX)
  }

  const onKeyDown = (event) => {
    if (event.key === 'Home') {
      event.preventDefault()
      setPos(0)
      return
    }
    if (event.key === 'End') {
      event.preventDefault()
      setPos(100)
      return
    }
    const delta = KEY_STEP[event.key]
    if (delta == null) return
    event.preventDefault()
    setPos((p) => clamp(p + delta, 0, 100))
  }

  const rounded = Math.round(pos)
  const beforeDim = clamp((pos - 4) / 26, 0.12, 1)
  const afterDim = clamp((96 - pos) / 26, 0.12, 1)

  return (
    <div
      ref={wrapRef}
      onPointerDown={onSurfaceDown}
      className={cn(
        'relative touch-pan-y select-none overflow-hidden rounded-2xl border border-line bg-surface-2',
        dragging && 'cursor-ew-resize',
        className
      )}
    >
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        {before}
      </div>
      <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
        {after}
      </div>

      {beforeLabel && (
        <span
          className="pointer-events-none absolute left-3 top-3 z-10 rounded-lg border border-line bg-surface/85 px-2 py-1 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-text-soft backdrop-blur-sm transition-opacity duration-200"
          style={{ opacity: beforeDim }}
        >
          {beforeLabel}
        </span>
      )}
      {afterLabel && (
        <span
          className="pointer-events-none absolute right-3 top-3 z-10 rounded-lg border border-accent/40 bg-surface/85 px-2 py-1 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-text backdrop-blur-sm transition-opacity duration-200"
          style={{ opacity: afterDim }}
        >
          {afterLabel}
        </span>
      )}

      {/* dělicí čára */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 z-10 w-0.5 -translate-x-1/2 bg-accent"
        style={{ left: `${pos}%`, boxShadow: '0 0 14px 0 var(--accent)' }}
      />

      <button
        type="button"
        role="slider"
        aria-label={s.handle}
        aria-orientation="horizontal"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={rounded}
        aria-valuetext={s.value(rounded)}
        onKeyDown={onKeyDown}
        onPointerDown={(event) => {
          event.stopPropagation()
          setDragging(true)
        }}
        className={cn(
          'absolute top-1/2 z-20 flex size-10 -translate-x-1/2 -translate-y-1/2 touch-none items-center justify-center rounded-full',
          'bg-accent text-accent-ink shadow-[var(--shadow-lift)] transition-transform duration-300 ease-[var(--ease-spring)]',
          dragging ? 'scale-105 cursor-ew-resize' : 'cursor-ew-resize hover:scale-105'
        )}
        style={{ left: `${pos}%` }}
      >
        <ChevronLeft size={13} strokeWidth={3} className="-mr-0.5" />
        <ChevronRight size={13} strokeWidth={3} className="-ml-0.5" />
      </button>
    </div>
  )
}
