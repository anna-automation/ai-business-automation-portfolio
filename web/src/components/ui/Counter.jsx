import { useEffect, useRef, useState } from 'react'
import { num } from '../../lib/utils.js'
import { usePrefs, useReducedMotion } from '../../lib/prefs.jsx'

/**
 * Číslo, které se dopočítá, až se dostane do pohledu.
 * Mimo viewport se nic nepočítá — žádné animace na pozadí.
 */
export function Counter({
  to,
  from = 0,
  duration = 1600,
  decimals = 0,
  prefix = '',
  suffix = '',
  className,
}) {
  const reduced = useReducedMotion()
  const { lang } = usePrefs()
  const locale = lang === 'en' ? 'en-US' : 'cs-CZ'
  const ref = useRef(null)
  const [value, setValue] = useState(reduced ? to : from)
  const started = useRef(false)

  useEffect(() => {
    if (reduced) {
      setValue(to)
      return
    }
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || started.current) return
        started.current = true
        observer.disconnect()

        const start = performance.now()
        let frame

        const tick = (now) => {
          const progress = Math.min(1, (now - start) / duration)
          // ease-out-expo — rychlý rozjezd, klidné dojetí
          const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
          setValue(from + (to - from) * eased)
          if (progress < 1) frame = requestAnimationFrame(tick)
        }

        frame = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(frame)
      },
      { threshold: 0.4 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [to, from, duration, reduced])

  const shown =
    decimals > 0
      ? value.toLocaleString(locale, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
      : num(Math.round(value), locale)

  return (
    <span ref={ref} className={className}>
      {prefix}
      {shown}
      {suffix}
    </span>
  )
}
