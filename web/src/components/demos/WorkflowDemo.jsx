import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ClipboardCheck,
  Database,
  Mail,
  Play,
  Send,
  Sparkles,
  Zap,
} from 'lucide-react'
import { cn, czk, uid } from '../../lib/utils.js'
import { useT } from '../../lib/i18n.jsx'
import { useReducedMotion } from '../../lib/prefs.jsx'
import { useToast } from '../../lib/toast.jsx'
import { Badge, LiveDot, Tooltip } from '../ui/primitives.jsx'
import { Button } from '../ui/Button.jsx'
import { DemoShell, FakeDataNote, StepTrail } from './_shell.jsx'

/**
 * Živý workflow builder — vlajková ukázka.
 *
 * Pět propojených bloků, pulz putuje po spojnici z bloku do bloku a u každého
 * bloku se dá rozkliknout, co dostal na vstupu a co poslal dál. Všechno je
 * simulace v prohlížeči, nikam se nic neposílá.
 */

/** Pod touto hranicí by poptávka šla člověku ke kontrole. */
const CONF_FLOOR = 80

/** Jak dlouho letí pulz po spojnici. */
const TRAVEL = 260

const META = [
  { id: 'trigger', icon: Mail, ms: 700 },
  { id: 'ai', icon: Sparkles, ms: 1100, ai: true },
  { id: 'crm', icon: Database, ms: 820 },
  { id: 'task', icon: ClipboardCheck, ms: 780 },
  { id: 'reply', icon: Send, ms: 800 },
]

/** Na širokém rozložení tvoří bloky mírnou diagonálu. */
const STAGGER = ['lg:mt-0', 'lg:mt-7', 'lg:mt-14', 'lg:mt-7', 'lg:mt-0']

const L = {
  cs: {
    title: 'Workflow: poptávka z e-mailu',
    subtitle: 'E-mail → AI extrakce → CRM → úkol → potvrzení',
    trigger: 'Spouštěč: nová zpráva ve schránce poptavky@dvorakreality.cz',
    hint: 'Klikněte na kterýkoliv blok — uvidíte, co dostal na vstupu a co poslal dál.',
    run: 'Spustit proces',
    running: 'Běží…',
    inLabel: 'vstup',
    outLabel: 'výstup',
    noInput: 'Spouštěč nemá vstup — jen poslouchá na schránce.',
    added: 'zvýrazněné klíče přidal tento krok',
    confidence: 'spolehlivost',
    confTip:
      'Tady rozhoduje model, tak je vidět i nejistota. Pod 80 % se poptávka nezaloží sama a jde člověku ke kontrole.',
    review: 'ke kontrole člověkem',
    auto: 'zpracováno automaticky',
    logIdle: 'log je prázdný — spusťte proces',
    logStart: 'spouštěč aktivován, čekám na data',
    logFinal: 'hotovo — pět kroků bez zásahu člověka',
    logFinalLow: 'hotovo — čtyři kroky automaticky, jeden šel ke kontrole',
    triggerName: 'spouštěč',
    flowName: 'workflow',
    summary: (sec) => `Proces dokončen za ${sec} s · ručně by to zabralo ~11 min`,
    toastTitle: 'Workflow dokončeno',
    toastDesc: (sec) => `Pět kroků za ${sec} s. V reálu takhle běží každá příchozí zpráva.`,
    toastWarnTitle: 'Hotovo, ale s výhradou',
    toastWarnDesc: (c) => `AI si byla jistá na ${c} %. Poptávka šla člověku ke kontrole.`,
    compactLabel: 'e-mail → AI → CRM → úkol',
    confKey: 'spolehlivost',
    blocks: [
      {
        title: 'Nová zpráva',
        note: 'Webhook na schránce poptávek, bez pollingu.',
        log: () => 'přijata zpráva od Jany Dvořákové (Dvořák Reality s.r.o.)',
        patch: {
          od: 'jana.dvorakova@dvorakreality.cz',
          predmet: 'Poptávka — automatizace zpracování poptávek',
          telo: 'Dobrý den, denně nám chodí 30 poptávek a přepisujeme je ručně…',
          prijato: '2026-11-17T12:04:31+01:00',
        },
      },
      {
        title: 'AI extrakce',
        note: 'Vytáhne jméno, firmu, požadavek a odhad hodnoty.',
        log: (c) => `rozpoznán typ: poptávka · spolehlivost ${c} %`,
        logLow: (c) => `typ: poptávka · spolehlivost ${c} % → posílám ke kontrole`,
        patch: {
          jmeno: 'Jana Dvořáková',
          firma: 'Dvořák Reality s.r.o.',
          pozadavek: 'automatizace příchozích poptávek',
          hodnota_kc: 48000,
          typ: 'poptávka',
          spolehlivost: 0.94,
        },
      },
      {
        title: 'Zápis do CRM',
        note: 'Založí kontakt i obchodní případ, hlídá duplicity.',
        log: (c, loc) => `založen lead LEAD-2026-0412 · ${czk(48000, loc)}`,
        patch: {
          crm_id: 'LEAD-2026-0412',
          stav: 'nová poptávka',
          vlastnik: 'Petr Marek',
          zdroj: 'e-mail',
          duplicita: false,
        },
      },
      {
        title: 'Úkol obchodníkovi',
        note: 'Termín na druhý den, priorita podle hodnoty poptávky.',
        log: () => 'úkol TASK-8821 pro Petra Marka · termín zítra 9:00',
        patch: {
          ukol_id: 'TASK-8821',
          ukol: 'Zavolat Janě Dvořákové k poptávce',
          termin: '2026-11-18T09:00+01:00',
          priorita: 'vysoká',
        },
      },
      {
        title: 'Potvrzení zákazníkovi',
        note: 'Odpověď ze šablony, do pěti minut od doručení.',
        log: () => 'potvrzení odesláno na jana.dvorakova@dvorakreality.cz',
        patch: {
          potvrzeni: 'odesláno',
          sablona: 'potvrzeni-poptavky-v3',
          doruceno_za: '38 s',
        },
      },
    ],
  },

  en: {
    title: 'Workflow: enquiry from an e-mail',
    subtitle: 'E-mail → AI extraction → CRM → task → confirmation',
    trigger: 'Trigger: new message in poptavky@dvorakreality.cz',
    hint: 'Open any block — you will see what it received and what it passed on.',
    run: 'Run the process',
    running: 'Running…',
    inLabel: 'input',
    outLabel: 'output',
    noInput: 'The trigger has no input — it just listens on the mailbox.',
    added: 'highlighted keys were added by this step',
    confidence: 'confidence',
    confTip:
      'A model decides here, so the uncertainty is visible too. Below 80 % the enquiry is not created automatically — a human reviews it.',
    review: 'sent for human review',
    auto: 'handled automatically',
    logIdle: 'log is empty — run the process',
    logStart: 'trigger armed, waiting for data',
    logFinal: 'done — five steps, no human involved',
    logFinalLow: 'done — four steps automatic, one sent for review',
    triggerName: 'trigger',
    flowName: 'workflow',
    summary: (sec) => `Finished in ${sec} s · doing it by hand takes ~11 min`,
    toastTitle: 'Workflow finished',
    toastDesc: (sec) => `Five steps in ${sec} s. In production every incoming message runs this.`,
    toastWarnTitle: 'Done, with a caveat',
    toastWarnDesc: (c) => `The model was ${c} % confident. The enquiry went for human review.`,
    compactLabel: 'e-mail → AI → CRM → task',
    confKey: 'confidence',
    blocks: [
      {
        title: 'New message',
        note: 'Webhook on the enquiry mailbox, no polling.',
        log: () => 'message received from Jana Dvořáková (Dvořák Reality s.r.o.)',
        patch: {
          from: 'jana.dvorakova@dvorakreality.cz',
          subject: 'Enquiry — automating incoming enquiries',
          body: 'Hello, we get 30 enquiries a day and retype them by hand…',
          received: '2026-11-17T12:04:31+01:00',
        },
      },
      {
        title: 'AI extraction',
        note: 'Pulls out the name, company, request and value estimate.',
        log: (c) => `type recognised: enquiry · confidence ${c} %`,
        logLow: (c) => `type: enquiry · confidence ${c} % → sending for review`,
        patch: {
          name: 'Jana Dvořáková',
          company: 'Dvořák Reality s.r.o.',
          request: 'automation of incoming enquiries',
          value_czk: 48000,
          type: 'enquiry',
          confidence: 0.94,
        },
      },
      {
        title: 'Write to CRM',
        note: 'Creates the contact and the deal, watches for duplicates.',
        log: (c, loc) => `lead LEAD-2026-0412 created · ${czk(48000, loc)}`,
        patch: {
          crm_id: 'LEAD-2026-0412',
          stage: 'new enquiry',
          owner: 'Petr Marek',
          source: 'e-mail',
          duplicate: false,
        },
      },
      {
        title: 'Task for sales',
        note: 'Due the next morning, priority follows the deal value.',
        log: () => 'task TASK-8821 for Petr Marek · due tomorrow 9:00',
        patch: {
          task_id: 'TASK-8821',
          task: 'Call Jana Dvořáková about the enquiry',
          due: '2026-11-18T09:00+01:00',
          priority: 'high',
        },
      },
      {
        title: 'Confirmation to the customer',
        note: 'Reply from a template, within five minutes of delivery.',
        log: () => 'confirmation sent to jana.dvorakova@dvorakreality.cz',
        patch: {
          confirmation: 'sent',
          template: 'enquiry-confirmation-v3',
          delivered_in: '38 s',
        },
      },
    ],
  },
}

function makeEntry(kind, i, conf) {
  return { id: uid('log'), at: Date.now(), kind, i, conf }
}

/** Složí payload od prvního bloku až po `upTo` a doplní živou spolehlivost. */
function foldPayload(blocks, upTo, confKey, conf) {
  const out = {}
  for (let k = 0; k <= upTo; k++) Object.assign(out, blocks[k].patch)
  if (confKey in out) out[confKey] = Math.round(conf) / 100
  return out
}

function formatValue(value) {
  if (typeof value === 'string') return `"${value}"`
  return String(value)
}

export default function WorkflowDemo({ compact = false }) {
  const { t, lang } = useT()
  const s = L[lang] ?? L.cs
  const loc = lang === 'en' ? 'en-US' : 'cs-CZ'
  const reduced = useReducedMotion()
  const { push } = useToast()
  const panelId = useId()

  const count = compact ? 4 : META.length

  const [phase, setPhase] = useState('idle')
  const [runId, setRunId] = useState(0)
  const [active, setActive] = useState(-1)
  const [doneCount, setDoneCount] = useState(0)
  const [pulse, setPulse] = useState(null)
  const [pulsePt, setPulsePt] = useState(null)
  const [log, setLog] = useState([])
  const [open, setOpen] = useState(null)
  const [conf, setConf] = useState(94)
  const [elapsed, setElapsed] = useState(0)

  const confRef = useRef(94)
  const wrapRef = useRef(null)
  const cardRefs = useRef([])
  const pathRefs = useRef([])
  const [geo, setGeo] = useState({ w: 0, h: 0, links: [] })

  const low = conf < CONF_FLOOR
  const secText = elapsed.toLocaleString(loc, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })

  // Toast se staví z aktuálního jazyka, ale nesmí restartovat běžící timeline.
  const notifyRef = useRef(null)
  notifyRef.current = (c, sec) => {
    const text = sec.toLocaleString(loc, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
    if (c < CONF_FLOOR) {
      push({ title: s.toastWarnTitle, description: s.toastWarnDesc(c), variant: 'warn' })
      return
    }
    push({ title: s.toastTitle, description: s.toastDesc(text), variant: 'success' })
  }

  const reset = useCallback(() => {
    setPhase('idle')
    setActive(-1)
    setDoneCount(0)
    setPulse(null)
    setPulsePt(null)
    setLog([])
    setOpen(null)
    setElapsed(0)
    setConf(94)
    confRef.current = 94
  }, [])

  const start = useCallback(() => {
    const c = 72 + Math.floor(Math.random() * 26)
    confRef.current = c
    setConf(c)
    setOpen(null)
    setPulse(null)
    setPulsePt(null)

    if (reduced) {
      const chrono = [makeEntry('start', -1, c)]
      for (let i = 0; i < count; i += 1) chrono.push(makeEntry('done', i, c))
      chrono.push(makeEntry('final', -1, c))
      setLog(chrono.reverse())
      setActive(-1)
      setDoneCount(count)
      setPhase('done')
      setElapsed(4.2)
      if (!compact) notifyRef.current(c, 4.2)
      return
    }

    setLog([makeEntry('start', -1, c)])
    setActive(-1)
    setDoneCount(0)
    setPhase('running')
    setRunId((n) => n + 1)
  }, [compact, count, reduced])

  // Timeline běhu: každý blok se rozsvítí, dokončí a vystřelí pulz po spojnici.
  useEffect(() => {
    if (phase !== 'running') return undefined
    const timers = []
    const started = performance.now()
    let acc = 0

    for (let i = 0; i < count; i += 1) {
      const at = acc
      timers.push(setTimeout(() => setActive(i), at))
      acc += META[i].ms
      const atDone = acc
      timers.push(
        setTimeout(() => {
          setDoneCount(i + 1)
          setLog((prev) => [makeEntry('done', i, confRef.current), ...prev].slice(0, 12))
          if (i < count - 1) setPulse(i)
        }, atDone)
      )
    }

    timers.push(
      setTimeout(() => {
        const sec = (performance.now() - started) / 1000
        setActive(-1)
        setPhase('done')
        setElapsed(sec)
        setLog((prev) => [makeEntry('final', -1, confRef.current), ...prev].slice(0, 12))
        if (!compact) notifyRef.current(confRef.current, sec)
      }, acc)
    )

    return () => timers.forEach(clearTimeout)
  }, [phase, runId, count, compact])

  // Omezený pohyb: žádná smyčka ani přehrávání, jen hotový stav.
  useEffect(() => {
    if (!reduced) return
    const chrono = [makeEntry('start', -1, 94)]
    for (let i = 0; i < count; i += 1) chrono.push(makeEntry('done', i, 94))
    chrono.push(makeEntry('final', -1, 94))
    confRef.current = 94
    setConf(94)
    setLog(chrono.reverse())
    setActive(-1)
    setPulse(null)
    setDoneCount(count)
    setPhase('done')
    setElapsed(4.2)
  }, [reduced, count])

  // Náhled na úvodu se přehrává sám, s pauzou mezi průběhy.
  useEffect(() => {
    if (!compact || reduced) return undefined
    let id
    if (phase === 'idle') id = setTimeout(start, 600)
    else if (phase === 'done') id = setTimeout(reset, 1400)
    return () => clearTimeout(id)
  }, [compact, reduced, phase, start, reset])

  // Spojnice se počítají z reálné pozice karet — drží i po zlomu na mobilu.
  useLayoutEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return undefined
    let raf = 0

    const measure = () => {
      const nodes = cardRefs.current.slice(0, count)
      if (nodes.length < count || nodes.some((n) => !n)) return
      const base = wrap.getBoundingClientRect()
      const boxes = nodes.map((n) => {
        const b = n.getBoundingClientRect()
        return {
          left: b.left - base.left,
          right: b.right - base.left,
          top: b.top - base.top,
          bottom: b.bottom - base.top,
          cx: b.left - base.left + b.width / 2,
          cy: b.top - base.top + b.height / 2,
        }
      })

      const links = []
      for (let i = 0; i < boxes.length - 1; i += 1) {
        const a = boxes[i]
        const b = boxes[i + 1]
        if (b.top > a.bottom - 2) {
          const y1 = a.bottom + 4
          const y2 = b.top - 4
          const dy = Math.max(12, (y2 - y1) * 0.55)
          links.push({
            d: `M ${a.cx.toFixed(1)} ${y1.toFixed(1)} C ${a.cx.toFixed(1)} ${(y1 + dy).toFixed(
              1
            )}, ${b.cx.toFixed(1)} ${(y2 - dy).toFixed(1)}, ${b.cx.toFixed(1)} ${y2.toFixed(1)}`,
            ex: Number(b.cx.toFixed(1)),
            ey: Number(y2.toFixed(1)),
            dir: 'v',
          })
        } else {
          const x1 = a.right + 4
          const x2 = b.left - 4
          const dx = Math.max(12, (x2 - x1) * 0.6)
          links.push({
            d: `M ${x1.toFixed(1)} ${a.cy.toFixed(1)} C ${(x1 + dx).toFixed(1)} ${a.cy.toFixed(
              1
            )}, ${(x2 - dx).toFixed(1)} ${b.cy.toFixed(1)}, ${x2.toFixed(1)} ${b.cy.toFixed(1)}`,
            ex: Number(x2.toFixed(1)),
            ey: Number(b.cy.toFixed(1)),
            dir: 'h',
          })
        }
      }

      setGeo((prev) => {
        const same =
          Math.abs(prev.w - base.width) < 0.5 &&
          Math.abs(prev.h - base.height) < 0.5 &&
          prev.links.length === links.length &&
          prev.links.every((l, i) => l.d === links[i].d)
        return same ? prev : { w: base.width, h: base.height, links }
      })
    }

    measure()
    if (typeof ResizeObserver === 'undefined') return undefined

    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(measure)
    })
    ro.observe(wrap)
    cardRefs.current.slice(0, count).forEach((n) => n && ro.observe(n))

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [count])

  // Pulz vzorkuje skutečnou geometrii path, takže kopíruje i zakřivení.
  useEffect(() => {
    if (pulse == null || reduced) return undefined
    const pathEl = pathRefs.current[pulse]
    if (!pathEl || typeof pathEl.getTotalLength !== 'function') return undefined
    const len = pathEl.getTotalLength()
    const t0 = performance.now()
    let frame = 0

    const tick = (now) => {
      const p = Math.min(1, (now - t0) / TRAVEL)
      const pt = pathEl.getPointAtLength(len * p)
      setPulsePt({ x: pt.x, y: pt.y })
      if (p < 1) {
        frame = requestAnimationFrame(tick)
      } else {
        setPulsePt(null)
        setPulse(null)
      }
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [pulse, reduced])

  const stateOf = (i) => {
    if (i < doneCount) return 'done'
    if (i === active) return 'active'
    return 'todo'
  }

  const timeOf = (at) =>
    new Date(at).toLocaleTimeString(lang === 'en' ? 'en-GB' : 'cs-CZ', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })

  const nameOf = (e) => {
    if (e.kind === 'start') return s.triggerName
    if (e.kind === 'final') return s.flowName
    return s.blocks[e.i].title
  }

  const textOf = (e) => {
    if (e.kind === 'start') return s.logStart
    if (e.kind === 'final') return e.conf < CONF_FLOOR ? s.logFinalLow : s.logFinal
    const block = s.blocks[e.i]
    if (block.logLow && e.conf < CONF_FLOOR) return block.logLow(e.conf, loc)
    return block.log(e.conf, loc)
  }

  const flow = (
    <div
      ref={wrapRef}
      className={cn(
        'relative grid',
        compact
          // [&>*]:min-w-0 je nutné: grid položky mají min-width:auto, takže by
          // je delší názvy bloků roztáhly přes šířku karty
          ? 'h-full grid-cols-2 content-center gap-x-5 gap-y-6 [&>*]:min-w-0'
          : 'grid-cols-1 gap-y-9 sm:grid-cols-2 lg:grid-cols-5 lg:items-start lg:gap-x-6 lg:gap-y-0'
      )}
    >
      {geo.w > 0 && (
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox={`0 0 ${geo.w} ${geo.h}`}
          preserveAspectRatio="none"
        >
          {geo.links.map((link, i) => {
            const passed = doneCount > i
            const livePulse = pulse === i
            return (
              <g key={i}>
                <path
                  ref={(node) => {
                    pathRefs.current[i] = node
                  }}
                  d={link.d}
                  fill="none"
                  strokeWidth={livePulse ? 2 : 1.5}
                  strokeLinecap="round"
                  strokeDasharray={passed && !livePulse ? undefined : '5 7'}
                  className={cn(
                    'transition-colors duration-500',
                    livePulse
                      ? 'animate-dash stroke-accent'
                      : passed
                        ? 'stroke-ok/70'
                        : 'stroke-line-strong/70'
                  )}
                />
                <path
                  d={
                    link.dir === 'h'
                      ? `M ${link.ex - 4.5} ${link.ey - 3.4} L ${link.ex} ${link.ey} L ${
                          link.ex - 4.5
                        } ${link.ey + 3.4}`
                      : `M ${link.ex - 3.4} ${link.ey - 4.5} L ${link.ex} ${link.ey} L ${
                          link.ex + 3.4
                        } ${link.ey - 4.5}`
                  }
                  fill="none"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={cn(
                    'transition-colors duration-500',
                    passed ? 'stroke-ok/70' : 'stroke-line-strong/70'
                  )}
                />
              </g>
            )
          })}

          {pulsePt && (
            <g>
              <circle cx={pulsePt.x} cy={pulsePt.y} r={7} className="fill-accent/25" />
              <circle cx={pulsePt.x} cy={pulsePt.y} r={3.2} className="fill-accent" />
            </g>
          )}
        </svg>
      )}

      {META.slice(0, count).map((meta, i) => (
        <FlowCard
          key={meta.id}
          innerRef={(node) => {
            cardRefs.current[i] = node
          }}
          meta={meta}
          text={s.blocks[i]}
          index={i}
          state={stateOf(i)}
          compact={compact}
          conf={conf}
          low={low}
          dict={s}
          open={open === i}
          panelId={panelId}
          onToggle={() => setOpen((prev) => (prev === i ? null : i))}
          className={!compact ? STAGGER[i] : undefined}
        />
      ))}
    </div>
  )

  const logBox = (
    <div
      aria-live={compact ? 'off' : 'polite'}
      className={cn(
        'overflow-hidden rounded-xl border border-line bg-bg-sunk/60 px-3 py-2 font-mono text-[0.7rem]',
        // výška musí sednout na počet řádků (leading-6), jinak se poslední ořízne
        compact ? 'h-[4.25rem]' : 'h-[6.6rem]'
      )}
    >
      {log.length === 0 && <p className="text-muted">{s.logIdle}</p>}
      <AnimatePresence initial={false}>
        {log.slice(0, compact ? 2 : 4).map((e) => (
          <motion.p
            key={e.id}
            layout={!reduced}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.26 }}
            className="flex gap-2 whitespace-nowrap leading-6"
          >
            <span className="shrink-0 text-muted">{timeOf(e.at)}</span>
            <span className="shrink-0 text-line-strong">·</span>
            <span className="shrink-0 text-text-soft">{nameOf(e)}</span>
            <span className="shrink-0 text-line-strong">·</span>
            <span className="min-w-0 truncate text-text">{textOf(e)}</span>
          </motion.p>
        ))}
      </AnimatePresence>
    </div>
  )

  if (compact) {
    return (
      <div className="flex h-full flex-col gap-3 overflow-hidden">
        <div className="flex items-center justify-between gap-2">
          <p className="label-mono truncate">{s.compactLabel}</p>
          {phase === 'running' ? (
            <LiveDot tone="accent" />
          ) : phase === 'done' ? (
            <Check size={13} strokeWidth={2.6} className="shrink-0 text-ok" />
          ) : null}
        </div>
        <div className="min-h-0 flex-1">{flow}</div>
        {logBox}
      </div>
    )
  }

  return (
    <DemoShell title={s.title} subtitle={s.subtitle} onReset={reset} live>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="label-mono flex items-center gap-1.5">
              <Mail size={12} />
              <span className="truncate">{s.trigger}</span>
            </p>
            <p className="mt-1 text-[0.78rem] text-muted">{s.hint}</p>
          </div>
          <Button
            size="sm"
            icon={Play}
            iconRight={false}
            onClick={start}
            disabled={phase === 'running'}
          >
            {phase === 'running' ? s.running : phase === 'done' ? t('action.runAgain') : s.run}
          </Button>
        </div>

        {flow}

        <StepTrail steps={META.slice(0, count).map((m) => m.id)} current={doneCount} />

        <AnimatePresence initial={false}>
          {open != null && (
            <motion.div
              key={open}
              id={panelId}
              initial={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <PayloadPanel
                index={open}
                meta={META[open]}
                dict={s}
                conf={conf}
                low={low}
                state={stateOf(open)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {logBox}

        {phase === 'done' && (
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-xl border border-accent/40 bg-accent/[0.07] px-3.5 py-2.5"
          >
            <Zap size={14} strokeWidth={2.4} />
            <p className="text-[0.84rem] font-medium">{s.summary(secText)}</p>
            {low && (
              <span className="flex items-center gap-1.5 font-mono text-[0.68rem] text-warn">
                <AlertTriangle size={12} />
                {s.review}
              </span>
            )}
          </motion.div>
        )}

        <FakeDataNote />
      </div>
    </DemoShell>
  )
}

function FlowCard({
  innerRef,
  meta,
  text,
  index,
  state,
  compact,
  conf,
  low,
  dict,
  open,
  panelId,
  onToggle,
  className,
}) {
  const Icon = meta.icon
  const classes = cn(
    'relative z-10 block rounded-xl border text-left transition-all duration-500 ease-[var(--ease-out-expo)]',
    compact ? 'p-2.5' : 'w-full p-3',
    state === 'todo' && 'border-line bg-surface opacity-55',
    state === 'active' && 'border-accent bg-accent/[0.07] ring-2 ring-accent/30',
    state === 'done' && 'border-ok/45 bg-surface',
    !compact && 'hover:border-line-strong',
    !compact && open && state !== 'active' && 'ring-2 ring-line-strong',
    className
  )

  const body = (
    <>
      <div
        className={cn(
          'flex items-center gap-3',
          !compact && 'lg:flex-col lg:items-start lg:gap-2'
        )}
      >
        <span
          className={cn(
            'grid shrink-0 place-items-center rounded-lg border transition-colors duration-500',
            compact ? 'size-7' : 'size-8',
            state === 'done'
              ? 'border-ok/40 bg-ok/12 text-ok'
              : state === 'active'
                ? 'border-accent/50 bg-accent/15 text-text'
                : 'border-line bg-surface-2 text-muted'
          )}
        >
          {state === 'done' ? (
            <Check size={compact ? 13 : 15} strokeWidth={2.6} />
          ) : (
            <Icon size={compact ? 13 : 15} strokeWidth={2} />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <p className="label-mono flex items-center gap-1.5">
            {String(index + 1).padStart(2, '0')}
            {state === 'active' && <LiveDot tone="accent" />}
          </p>
          <p className="mt-0.5 text-[0.82rem] font-semibold leading-tight">{text.title}</p>
        </div>
      </div>

      {!compact && (
        <>
          <p className="mt-2 text-[0.71rem] leading-snug text-muted">{text.note}</p>
          {meta.ai && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <Badge tone="violet" className="px-2 py-0.5 text-[0.6rem]">
                AI
              </Badge>
              {state === 'done' && (
                <span className={cn('font-mono text-[0.66rem]', low ? 'text-warn' : 'text-ok')}>
                  {conf} %
                </span>
              )}
            </div>
          )}
        </>
      )}
    </>
  )

  if (compact) {
    return (
      <div ref={innerRef} className={classes}>
        {body}
      </div>
    )
  }

  return (
    <button
      ref={innerRef}
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls={panelId}
      className={classes}
    >
      {body}
      <ChevronDown
        size={13}
        aria-hidden
        className={cn(
          'absolute right-2.5 top-2.5 text-muted transition-transform duration-300',
          open && 'rotate-180'
        )}
      />
    </button>
  )
}

function PayloadPanel({ index, meta, dict, conf, low, state }) {
  const blocks = dict.blocks
  const text = blocks[index]
  const inData = foldPayload(blocks, index - 1, dict.confKey, conf)
  const outData = foldPayload(blocks, index, dict.confKey, conf)
  const addedKeys = Object.keys(text.patch)
  const Icon = meta.icon

  return (
    <div className="rounded-xl border border-line bg-surface-2/50 p-3 sm:p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={meta.ai ? 'violet' : 'neutral'} icon={Icon}>
          {String(index + 1).padStart(2, '0')} · {text.title}
        </Badge>
        <p className="text-[0.78rem] text-muted">{text.note}</p>
      </div>

      {meta.ai && (
        <p className="mt-2 flex flex-wrap items-center gap-2 text-[0.78rem]">
          <Tooltip content={dict.confTip}>
            <span className="cursor-help font-mono text-[0.72rem] text-text-soft underline decoration-dotted">
              {dict.confidence} {conf} %
            </span>
          </Tooltip>
          <span className={cn('font-mono text-[0.7rem]', low ? 'text-warn' : 'text-ok')}>
            {low ? dict.review : dict.auto}
          </span>
        </p>
      )}

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <JsonCard label={dict.inLabel} data={inData} empty={dict.noInput} />
        <JsonCard
          label={dict.outLabel}
          data={outData}
          added={addedKeys}
          dim={state === 'todo'}
          empty={dict.noInput}
        />
      </div>

      <p className="label-mono mt-2.5 flex items-center gap-1.5">
        <span aria-hidden className="size-2 rounded-[3px] bg-accent/45" />
        {dict.added}
      </p>
    </div>
  )
}

function JsonCard({ label, data, added, empty, dim }) {
  const entries = Object.entries(data)

  return (
    <div
      className={cn(
        'rounded-xl border border-line bg-bg-sunk/70 p-3 transition-opacity',
        dim && 'opacity-60'
      )}
    >
      <p className="label-mono mb-2">{label}</p>
      {entries.length === 0 ? (
        <p className="font-mono text-[0.7rem] leading-relaxed text-muted">{empty}</p>
      ) : (
        <div className="font-mono text-[0.7rem] leading-[1.65]">
          <span className="text-muted">{'{'}</span>
          {entries.map(([key, value]) => {
            const isNew = added?.includes(key)
            return (
              <div
                key={key}
                className={cn('-mx-1 flex gap-1 rounded px-1', isNew && 'bg-accent/12')}
              >
                <span aria-hidden className="w-2 shrink-0 text-accent">
                  {isNew ? '+' : ''}
                </span>
                <span className="shrink-0 text-text-soft">{key}:</span>
                <span
                  className={cn(
                    'min-w-0 break-words',
                    typeof value === 'string' ? 'text-text' : 'text-ok'
                  )}
                >
                  {formatValue(value)}
                </span>
              </div>
            )
          })}
          <span className="text-muted">{'}'}</span>
        </div>
      )}
    </div>
  )
}
