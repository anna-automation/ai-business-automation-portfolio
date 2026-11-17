import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUp, Sparkles } from 'lucide-react'
import { cn } from '../../lib/utils.js'
import { usePrefs } from '../../lib/prefs.jsx'
import { useT } from '../../lib/i18n.jsx'
import { posunNahoru } from '../../lib/scroll.js'
import { Button } from '../ui/Button.jsx'

/** Tenká linka nahoře, která ukazuje, kolik stránky je za námi. */
export function ScrollProgress() {
  const [progress, setProgress] = useState(0)
  const { reducedMotion } = usePrefs()

  useEffect(() => {
    let frame = null

    const update = () => {
      frame = null
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      setProgress(scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0)
    }

    const onScroll = () => {
      if (frame == null) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div
      aria-hidden
      className="no-print pointer-events-none fixed inset-x-0 top-0 z-[70] h-[2px] bg-transparent"
    >
      <div
        className="h-full origin-left bg-gradient-to-r from-accent via-accent to-violet"
        style={{
          transform: `scaleX(${progress})`,
          transition: reducedMotion ? 'none' : 'transform 120ms linear',
        }}
      />
    </div>
  )
}

/**
 * Vlastní kurzor: prstenec, který kurzor dohání se zpožděním, nad odkazy se
 * zvětší a umí nést popisek z atributu `data-cursor-label`.
 * Běží jen na zařízeních s myší a jen když uživatel nechce omezit pohyb.
 */
export function CustomCursor() {
  const { cursorActive } = usePrefs()
  const ringRef = useRef(null)
  const dotRef = useRef(null)
  const [label, setLabel] = useState(null)
  const [variant, setVariant] = useState('default')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!cursorActive) return

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const ring = { x: target.x, y: target.y }
    let frame = null
    let down = false

    let first = true

    const onMove = (event) => {
      // První pohyb kurzor "teleportuje" — jinak by přiletěl ze středu obrazovky.
      if (first) {
        ring.x = event.clientX
        ring.y = event.clientY
        first = false
      }
      target.x = event.clientX
      target.y = event.clientY
      setVisible(true)

      const el = event.target instanceof Element ? event.target : null
      const labelled = el?.closest('[data-cursor-label]')
      const interactive = el?.closest(
        'a, button, [role="button"], input, textarea, select, [data-cursor-variant]'
      )

      const nextLabel = labelled?.getAttribute('data-cursor-label') || null
      const nextVariant = interactive
        ? interactive.getAttribute('data-cursor-variant') || 'link'
        : 'default'

      setLabel((prev) => (prev === nextLabel ? prev : nextLabel))
      setVariant((prev) => (prev === nextVariant ? prev : nextVariant))
    }

    const onDown = () => {
      down = true
    }
    const onUp = () => {
      down = false
    }
    const onLeave = () => setVisible(false)
    const onEnter = () => setVisible(true)

    const tick = () => {
      // Prstenec dohání kurzor — odtud ten pocit hmotnosti.
      ring.x += (target.x - ring.x) * 0.18
      ring.y += (target.y - ring.y) * 0.18

      if (ringRef.current) {
        const scale = down ? 0.82 : 1
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0) translate(-50%, -50%) scale(${scale})`
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${target.x}px, ${target.y}px, 0) translate(-50%, -50%)`
      }

      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseenter', onEnter)

    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseenter', onEnter)
    }
    // Pozor: `visible` tu být nesmí. Effect by se při prvním pohybu restartoval
    // a kurzor by skočil zpátky do středu obrazovky.
  }, [cursorActive])

  if (!cursorActive) return null

  const hasLabel = Boolean(label)

  return (
    <div aria-hidden className="no-print pointer-events-none fixed inset-0 z-[100]">
      <div
        ref={ringRef}
        className={cn(
          'absolute left-0 top-0 grid place-items-center rounded-full border transition-[width,height,background-color,border-color,opacity] duration-300 ease-[var(--ease-out-expo)]',
          visible ? 'opacity-100' : 'opacity-0',
          hasLabel
            ? 'size-[4.5rem] border-transparent bg-accent'
            : variant === 'default'
              ? 'size-8 border-text/35 bg-transparent'
              : 'size-12 border-accent/70 bg-accent/12'
        )}
      >
        {hasLabel && (
          <span className="select-none font-mono text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-accent-ink">
            {label}
          </span>
        )}
      </div>
      <div
        ref={dotRef}
        className={cn(
          'absolute left-0 top-0 size-1 rounded-full bg-text transition-opacity duration-200',
          visible && !hasLabel ? 'opacity-90' : 'opacity-0'
        )}
      />
    </div>
  )
}

/** Plovoucí CTA — objeví se, až když návštěvník něco přečetl. */
export function FloatingCTA() {
  const { t } = useT()
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      const ratio = scrollable > 0 ? window.scrollY / scrollable : 0
      setShow(ratio > 0.22 && ratio < 0.93)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.96 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="no-print fixed bottom-5 left-5 z-[60] hidden lg:block"
        >
          <Button
            to="/kontakt"
            variant="solid"
            size="md"
            icon={Sparkles}
            iconRight={false}
            cursorLabel={t('action.try')}
            className="shadow-[var(--shadow-lift)]"
          >
            {t('nav.cta')}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** Návrat nahoru — v patě stránky. */
export function BackToTop() {
  const { t } = useT()
  return (
    <button
      type="button"
      onClick={posunNahoru}
      className="group flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-[0.8rem] text-muted transition-all duration-300 hover:border-line-strong hover:text-text"
    >
      <ArrowUp
        size={14}
        className="transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-0.5"
      />
      {t('footer.backToTop')}
    </button>
  )
}
