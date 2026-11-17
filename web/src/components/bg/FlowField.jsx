import { useEffect, useRef } from 'react'
import { cn } from '../../lib/utils.js'
import { usePrefs } from '../../lib/prefs.jsx'

/**
 * Živé pozadí: síť pravoúhlých tras s datovými pulzy.
 *
 * Záměrně to nejsou "částice". Tenhle web je o procesech, takže v pozadí
 * tečou data po linkách a potkávají se v uzlech — kurzor uzly rozsvěcí.
 *
 * Statické linky se kreslí jednou do offscreen vrstvy, každý frame se už
 * jen překreslují pulzy a zářící uzly.
 */

const TRACE_COUNT = 14
const PULSE_PER_TRACE = 1.6
const GRID = 56

function readColors() {
  const s = getComputedStyle(document.documentElement)
  return {
    trace: s.getPropertyValue('--trace').trim() || 'rgba(128,128,128,0.1)',
    accent: s.getPropertyValue('--accent').trim() || '#ccff4d',
    violet: s.getPropertyValue('--violet').trim() || '#8f74ff',
    line: s.getPropertyValue('--line-strong').trim() || '#333',
  }
}

/** Pravoúhlá trasa zleva doprava se zalomeními na mřížce. */
function buildTrace(width, height, rand) {
  const snap = (v) => Math.round(v / GRID) * GRID
  const points = []
  let x = -GRID * 2
  let y = snap(rand() * height)

  points.push({ x, y })

  while (x < width + GRID * 2) {
    const run = snap(GRID * (2 + Math.floor(rand() * 5)))
    x += run
    points.push({ x, y })

    if (rand() > 0.32) {
      const dir = rand() > 0.5 ? 1 : -1
      const rise = snap(GRID * (1 + Math.floor(rand() * 2)))
      const next = y + dir * rise
      if (next > GRID && next < height - GRID) {
        y = next
        points.push({ x, y })
      }
    }
  }

  return points
}

function traceLength(points) {
  let total = 0
  for (let i = 1; i < points.length; i++) {
    total += Math.abs(points[i].x - points[i - 1].x) + Math.abs(points[i].y - points[i - 1].y)
  }
  return total
}

/** Bod na trase v dané vzdálenosti od začátku. */
function pointAt(points, distance) {
  let remaining = distance
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]
    const b = points[i]
    const seg = Math.abs(b.x - a.x) + Math.abs(b.y - a.y)
    if (remaining <= seg) {
      const ratio = seg === 0 ? 0 : remaining / seg
      return { x: a.x + (b.x - a.x) * ratio, y: a.y + (b.y - a.y) * ratio }
    }
    remaining -= seg
  }
  const last = points[points.length - 1]
  return { x: last.x, y: last.y }
}

export default function FlowField({ className, density = 1, interactive = true, opacity = 1 }) {
  const canvasRef = useRef(null)
  const { theme, reducedMotion } = usePrefs()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let colors = readColors()
    let width = 0
    let height = 0
    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    let traces = []
    let pulses = []
    let statics = null
    let frame = null
    let running = true

    const mouse = { x: -9999, y: -9999, active: false }

    // Deterministický generátor — pozadí vypadá po reloadu stejně.
    let seed = 20261117
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296
      return seed / 4294967296
    }

    function drawStatics() {
      const layer = document.createElement('canvas')
      layer.width = Math.max(1, Math.floor(width * dpr))
      layer.height = Math.max(1, Math.floor(height * dpr))
      const lctx = layer.getContext('2d')
      if (!lctx) return null
      lctx.scale(dpr, dpr)

      lctx.lineWidth = 1
      lctx.strokeStyle = colors.trace
      lctx.lineCap = 'square'

      for (const trace of traces) {
        lctx.beginPath()
        lctx.moveTo(trace.points[0].x, trace.points[0].y)
        for (let i = 1; i < trace.points.length; i++) {
          lctx.lineTo(trace.points[i].x, trace.points[i].y)
        }
        lctx.stroke()

        // uzly na zalomeních
        for (let i = 1; i < trace.points.length - 1; i++) {
          const p = trace.points[i]
          const prev = trace.points[i - 1]
          const nextP = trace.points[i + 1]
          const isCorner =
            (p.x === prev.x) !== (p.x === nextP.x) || (p.y === prev.y) !== (p.y === nextP.y)
          if (!isCorner) continue
          lctx.beginPath()
          lctx.arc(p.x, p.y, 1.9, 0, Math.PI * 2)
          lctx.fillStyle = colors.trace
          lctx.fill()
        }
      }

      return layer
    }

    function build() {
      seed = 20261117
      const count = Math.max(5, Math.round(TRACE_COUNT * density * Math.min(1, width / 1100)))

      traces = []
      for (let i = 0; i < count; i++) {
        const points = buildTrace(width, height, rand)
        traces.push({ points, length: traceLength(points) })
      }

      pulses = []
      traces.forEach((trace, index) => {
        const howMany = Math.random() < PULSE_PER_TRACE - 1 ? 2 : 1
        for (let p = 0; p < howMany; p++) {
          pulses.push({
            trace: index,
            distance: rand() * trace.length,
            speed: 26 + rand() * 52,
            hue: rand() > 0.72 ? 'violet' : 'accent',
            size: 1.6 + rand() * 1.4,
          })
        }
      })

      statics = drawStatics()
    }

    function resize() {
      const parent = canvas.parentElement
      width = parent ? parent.clientWidth : window.innerWidth
      height = parent ? parent.clientHeight : window.innerHeight
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.max(1, Math.floor(width * dpr))
      canvas.height = Math.max(1, Math.floor(height * dpr))
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      build()
    }

    let last = performance.now()

    function render(now) {
      if (!running) return
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now

      ctx.clearRect(0, 0, width, height)
      if (statics) ctx.drawImage(statics, 0, 0, width, height)

      for (const pulse of pulses) {
        const trace = traces[pulse.trace]
        if (!trace) continue

        // Blízko kurzoru data "zabírají" — jemné zrychlení.
        let speed = pulse.speed
        if (mouse.active) {
          const head = pointAt(trace.points, pulse.distance)
          const dist = Math.hypot(head.x - mouse.x, head.y - mouse.y)
          if (dist < 220) speed *= 1 + (1 - dist / 220) * 1.6
        }

        pulse.distance += speed * dt
        if (pulse.distance > trace.length) pulse.distance = 0

        const head = pointAt(trace.points, pulse.distance)
        const color = pulse.hue === 'violet' ? colors.violet : colors.accent

        // ohon
        const tailSteps = 7
        for (let s = tailSteps; s >= 1; s--) {
          const d = pulse.distance - s * 7
          if (d < 0) continue
          const p = pointAt(trace.points, d)
          ctx.globalAlpha = (1 - s / tailSteps) * 0.22
          ctx.beginPath()
          ctx.arc(p.x, p.y, pulse.size * 0.72, 0, Math.PI * 2)
          ctx.fillStyle = color
          ctx.fill()
        }

        // hlava s glow
        ctx.globalAlpha = 0.9
        ctx.shadowBlur = 11
        ctx.shadowColor = color
        ctx.beginPath()
        ctx.arc(head.x, head.y, pulse.size, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()
        ctx.shadowBlur = 0
        ctx.globalAlpha = 1
      }

      // Uzly v dosahu kurzoru se rozsvítí.
      if (mouse.active) {
        for (const trace of traces) {
          for (let i = 1; i < trace.points.length - 1; i++) {
            const p = trace.points[i]
            const dist = Math.hypot(p.x - mouse.x, p.y - mouse.y)
            if (dist > 150) continue
            const strength = 1 - dist / 150
            ctx.globalAlpha = strength * 0.65
            ctx.beginPath()
            ctx.arc(p.x, p.y, 2 + strength * 2.4, 0, Math.PI * 2)
            ctx.fillStyle = colors.accent
            ctx.fill()
            ctx.globalAlpha = 1
          }
        }
      }

      frame = requestAnimationFrame(render)
    }

    function onPointerMove(event) {
      if (!interactive) return
      const rect = canvas.getBoundingClientRect()
      mouse.x = event.clientX - rect.left
      mouse.y = event.clientY - rect.top
      mouse.active = true
    }

    function onPointerLeave() {
      mouse.active = false
      mouse.x = -9999
      mouse.y = -9999
    }

    resize()

    if (reducedMotion) {
      // Statický obrázek: linky a jeden klidný snímek pulzů.
      ctx.clearRect(0, 0, width, height)
      if (statics) ctx.drawImage(statics, 0, 0, width, height)
    } else {
      frame = requestAnimationFrame(render)
    }

    const observer = new ResizeObserver(() => {
      resize()
      if (reducedMotion) {
        ctx.clearRect(0, 0, width, height)
        if (statics) ctx.drawImage(statics, 0, 0, width, height)
      }
    })
    if (canvas.parentElement) observer.observe(canvas.parentElement)

    if (interactive && !reducedMotion) {
      window.addEventListener('pointermove', onPointerMove, { passive: true })
      window.addEventListener('pointerleave', onPointerLeave)
    }

    // Mimo obrazovku necháme pozadí spát — ušetří baterii.
    const visibility = () => {
      if (document.hidden) {
        running = false
        if (frame) cancelAnimationFrame(frame)
      } else if (!reducedMotion && !running) {
        running = true
        last = performance.now()
        frame = requestAnimationFrame(render)
      }
    }
    document.addEventListener('visibilitychange', visibility)

    return () => {
      running = false
      if (frame) cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerleave', onPointerLeave)
      document.removeEventListener('visibilitychange', visibility)
    }
  }, [theme, reducedMotion, density, interactive])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 h-full w-full', className)}
      style={{ opacity }}
    />
  )
}
