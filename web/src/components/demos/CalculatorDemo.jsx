import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Boxes,
  Check,
  Clock,
  Coins,
  GraduationCap,
  Link2,
  Minus,
  Percent,
  Plus,
  Send,
  Sparkles,
  Timer,
  TrendingUp,
  Users,
  Workflow,
} from 'lucide-react'
import { DemoShell, FakeDataNote, StatTile } from './_shell.jsx'
import { Badge, Switch } from '../ui/primitives.jsx'
import { Button } from '../ui/Button.jsx'
import { cn, clamp, czk, num } from '../../lib/utils.js'
import { useT } from '../../lib/i18n.jsx'
import { useReducedMotion } from '../../lib/prefs.jsx'
import { useToast } from '../../lib/toast.jsx'

/**
 * Kalkulačka automatizačních služeb.
 * Vedle ceny počítá i návratnost — zákazník vidí náklad i přínos naráz.
 */

const RATE = 450 // Kč/h — cena hodiny práce, kterou automatizace nahradí
const TOOL_PRICE = 3200 // jedno propojení nástroje
const TOOL_RUN = 290 // provoz jednoho propojení měsíčně
const ONBOARDING = 12000
const SELFHOST = 9000
const DOCS_RATE = 0.08
const SUPPORT_RATE = 0.15
const HORIZON = 12 // měsíců v grafu návratnosti

const PACKAGES = [
  {
    id: 'single',
    icon: Workflow,
    base: 12000,
    perProcess: 9000,
    perPerson: 120,
    hoursPerPerson: 0.2,
    name: { cs: 'Jedno workflow', en: 'Single workflow' },
    desc: {
      cs: 'Jeden proces od návrhu po nasazení.',
      en: 'One process from design to deployment.',
    },
  },
  {
    id: 'suite',
    icon: Boxes,
    base: 38000,
    perProcess: 6500,
    perPerson: 260,
    hoursPerPerson: 0.25,
    name: { cs: 'Sada procesů', en: 'Process suite' },
    desc: {
      cs: 'Několik navázaných automatizací jako celek.',
      en: 'Several linked automations as one system.',
    },
  },
  {
    id: 'training',
    icon: GraduationCap,
    base: 24000,
    perProcess: 3000,
    perPerson: 900,
    hoursPerPerson: 0.6,
    name: { cs: 'Školení týmu', en: 'Team training' },
    desc: {
      cs: 'Tým si automatizace umí postavit sám.',
      en: 'The team learns to build automations itself.',
    },
  },
]

const L = {
  cs: {
    title: 'Kalkulačka automatizace',
    subtitle: 'Naklikejte rozsah, cena i návratnost se počítají hned',
    pkg: 'Balíček',
    from: 'od',
    scope: 'Rozsah',
    processes: 'Procesy k automatizaci',
    team: 'Lidé v týmu',
    tools: 'Propojené nástroje',
    addons: 'Doplňky',
    addonDocs: 'Dokumentace a README',
    addonDocsDesc: '+8 % — předáno tak, aby to zvládl i váš člověk',
    addonOnboarding: 'Zaučení týmu',
    addonOnboardingDesc: '+12 000 Kč — dvě sezení a cvičná data',
    addonSupport: '3 měsíce podpory',
    addonSupportDesc: '+15 % rozděleno do tří měsíčních platek',
    addonSelfhost: 'Lokální nasazení n8n',
    addonSelfhostDesc: '+9 000 Kč — data neopustí vaši síť',
    totalOnce: 'Jednorázově',
    perMonth: 'měsíčně',
    monthlyNote: 'provoz, monitoring a podpora',
    breakdown: 'Rozpad položek',
    rowBase: 'Základ balíčku',
    rowProcesses: 'Procesy nad první',
    rowTeam: 'Rozsah podle týmu',
    rowTools: 'Propojení nástrojů',
    rowDiscount: 'Objemová sleva',
    rowRun: 'Provoz a monitoring',
    rowSupport: 'Podpora (3 měsíce)',
    discountEarned: 'Získaná sleva',
    nudge3: 'Ještě jeden proces a máte slevu 5 %.',
    nudge5: 'Ještě jeden proces a sleva vyroste na 10 %.',
    noDiscount: 'bez slevy',
    returnTitle: 'Co to vrátí',
    savedHours: 'Ušetřené hodiny',
    perMonthShort: '/ měsíc',
    savedMoney: 'V penězích',
    payback: 'Návratnost',
    months: 'měsíců',
    rateNote: `Počítáno na ${RATE} Kč za hodinu ruční práce.`,
    chartCost: 'Náklad',
    chartSave: 'Úspora',
    chartCross: 'bod návratnosti',
    chartNever: 'Při tomto rozsahu se náklad do roka nevrátí — zkuste přidat proces.',
    send: 'Poslat jako nabídku',
    sent: 'Nabídka připravena',
    toastTitle: 'Nabídka sestavena',
    toastDesc: 'V demu se nic neodesílá. Naživo by přišla do e-mailu jako PDF.',
    footnote:
      'Orientační ceny demo prostředí. Skutečná nabídka vychází z úvodní konzultace a reálných procesů.',
    compactLabel: 'Orientační cena',
    compactSaves: 'ušetří',
    compactPayback: 'návratnost',
    hours: 'h',
    processWord: ['proces', 'procesy', 'procesů'],
  },
  en: {
    title: 'Automation calculator',
    subtitle: 'Set the scope — price and payback update instantly',
    pkg: 'Package',
    from: 'from',
    scope: 'Scope',
    processes: 'Processes to automate',
    team: 'People in the team',
    tools: 'Connected tools',
    addons: 'Add-ons',
    addonDocs: 'Documentation & README',
    addonDocsDesc: '+8% — handed over so your own people can run it',
    addonOnboarding: 'Team onboarding',
    addonOnboardingDesc: '+12,000 CZK — two sessions and practice data',
    addonSupport: '3 months of support',
    addonSupportDesc: '+15% split into three monthly payments',
    addonSelfhost: 'Self-hosted n8n',
    addonSelfhostDesc: '+9,000 CZK — data never leaves your network',
    totalOnce: 'One-off',
    perMonth: 'per month',
    monthlyNote: 'operations, monitoring and support',
    breakdown: 'Line items',
    rowBase: 'Package base',
    rowProcesses: 'Processes beyond the first',
    rowTeam: 'Scope by team size',
    rowTools: 'Tool integrations',
    rowDiscount: 'Volume discount',
    rowRun: 'Operations & monitoring',
    rowSupport: 'Support (3 months)',
    discountEarned: 'Discount earned',
    nudge3: 'One more process unlocks a 5% discount.',
    nudge5: 'One more process and the discount grows to 10%.',
    noDiscount: 'no discount',
    returnTitle: 'What it gives back',
    savedHours: 'Hours saved',
    perMonthShort: '/ month',
    savedMoney: 'In money',
    payback: 'Payback',
    months: 'months',
    rateNote: `Calculated at ${RATE} CZK per hour of manual work.`,
    chartCost: 'Cost',
    chartSave: 'Savings',
    chartCross: 'payback point',
    chartNever: 'At this scope the cost does not return within a year — try adding a process.',
    send: 'Send as a quote',
    sent: 'Quote ready',
    toastTitle: 'Quote assembled',
    toastDesc: 'Nothing is sent in the demo. Live, it would arrive as a PDF by e-mail.',
    footnote:
      'Indicative demo pricing. A real quote comes out of the first consultation and your actual processes.',
    compactLabel: 'Indicative price',
    compactSaves: 'saves',
    compactPayback: 'payback',
    hours: 'h',
    processWord: ['process', 'processes', 'processes'],
  },
}

/** České skloňování počtu: 1 proces / 2 procesy / 5 procesů */
function plural(n, forms) {
  if (n === 1) return forms[0]
  if (n >= 2 && n <= 4) return forms[1]
  return forms[2]
}

function dec1(value, lang) {
  return value.toLocaleString(lang === 'en' ? 'en-US' : 'cs-CZ', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })
}

/** Plynulý přechod čísla mezi hodnotami — přerušený tween pokračuje z místa, kde byl. */
function useTween(target, duration = 520) {
  const reduced = useReducedMotion()
  const [value, setValue] = useState(target)
  const fromRef = useRef(target)

  useEffect(() => {
    if (reduced) {
      fromRef.current = target
      setValue(target)
      return
    }
    const from = fromRef.current
    if (Math.abs(from - target) < 0.5) {
      fromRef.current = target
      setValue(target)
      return
    }
    const start = performance.now()
    let frame = 0
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      const next = from + (target - from) * eased
      fromRef.current = next
      setValue(next)
      if (p < 1) frame = requestAnimationFrame(tick)
      else fromRef.current = target
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration, reduced])

  return value
}

function Slider({ label, value, min, max, onChange, unit, icon: Icon, compact = false }) {
  const id = useId()
  const pct = ((value - min) / (max - min)) * 100
  const step = (dir) => onChange(clamp(value + dir, min, max))

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="label-mono flex items-center gap-1.5">
          {Icon && <Icon size={12} />}
          {label}
        </label>
        <span className="flex items-center gap-1">
          {!compact && (
            <button
              type="button"
              onClick={() => step(-1)}
              disabled={value <= min}
              aria-label={`${label} −1`}
              className="grid size-6 place-items-center rounded-lg border border-line text-muted transition hover:border-line-strong hover:text-text disabled:opacity-35"
            >
              <Minus size={11} />
            </button>
          )}
          <span className="min-w-10 text-center font-mono text-[0.8rem] font-medium tabular-nums">
            {value}
            {unit ? <span className="text-muted">{unit}</span> : null}
          </span>
          {!compact && (
            <button
              type="button"
              onClick={() => step(1)}
              disabled={value >= max}
              aria-label={`${label} +1`}
              className="grid size-6 place-items-center rounded-lg border border-line text-muted transition hover:border-line-strong hover:text-text disabled:opacity-35"
            >
              <Plus size={11} />
            </button>
          )}
        </span>
      </div>

      <div className="relative mt-2 h-5">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="peer absolute inset-0 z-10 w-full cursor-pointer opacity-0"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-line"
        >
          <span
            className="block h-full rounded-full bg-accent transition-[width] duration-300 ease-[var(--ease-out-expo)]"
            style={{ width: `${pct}%` }}
          />
        </span>
        <span
          aria-hidden
          className="pointer-events-none absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent bg-surface transition-[left] duration-300 ease-[var(--ease-out-expo)] peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-surface"
          style={{ left: `${pct}%` }}
        />
      </div>
    </div>
  )
}

/**
 * Graf, kde se křivka nákladů a úspor protne v bodě návratnosti.
 * Počítá z právě animovaných hodnot, takže se protnutí plynule posouvá.
 */
function PaybackChart({ total, monthly, savedMonthly, labels, formatMonths }) {
  const W = 300
  const H = 128
  const PAD_L = 6
  const PAD_R = 6
  const PAD_T = 10
  const PAD_B = 22

  const net = savedMonthly - monthly
  const payback = net > 0 ? total / net : null

  const yMax = Math.max(total + monthly * HORIZON, savedMonthly * HORIZON, 1)
  const x = (m) => PAD_L + (m / HORIZON) * (W - PAD_L - PAD_R)
  const y = (v) => H - PAD_B - (v / yMax) * (H - PAD_T - PAD_B)

  const costPts = `${x(0).toFixed(1)},${y(total).toFixed(1)} ${x(HORIZON).toFixed(1)},${y(
    total + monthly * HORIZON
  ).toFixed(1)}`
  const savePts = `${x(0).toFixed(1)},${y(0).toFixed(1)} ${x(HORIZON).toFixed(1)},${y(
    savedMonthly * HORIZON
  ).toFixed(1)}`

  const inView = payback != null && payback <= HORIZON
  const cx = inView ? x(payback) : null
  const cy = inView ? y(savedMonthly * payback) : null

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label={labels.aria}
      >
        <line
          x1={PAD_L}
          y1={H - PAD_B}
          x2={W - PAD_R}
          y2={H - PAD_B}
          className="stroke-line"
          strokeWidth="1"
        />
        {[3, 6, 9].map((m) => (
          <line
            key={m}
            x1={x(m)}
            y1={PAD_T}
            x2={x(m)}
            y2={H - PAD_B}
            className="stroke-line/70"
            strokeWidth="1"
            strokeDasharray="2 4"
          />
        ))}

        <polyline
          points={costPts}
          fill="none"
          className="stroke-coral"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <polyline
          points={savePts}
          fill="none"
          className="stroke-accent"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {inView && (
          <>
            <line
              x1={cx}
              y1={cy}
              x2={cx}
              y2={H - PAD_B}
              className="stroke-accent/60"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <circle cx={cx} cy={cy} r="7" className="fill-accent/25" />
            <circle cx={cx} cy={cy} r="3.4" className="fill-accent" />
            <text
              x={clamp(cx, 26, W - 32)}
              y={Math.max(PAD_T + 2, cy - 11)}
              textAnchor="middle"
              className="fill-text font-mono"
              fontSize="9.5"
            >
              {formatMonths(payback)}
            </text>
          </>
        )}

        <text x={PAD_L} y={H - 7} className="fill-muted font-mono" fontSize="8.5">
          0
        </text>
        <text
          x={W - PAD_R}
          y={H - 7}
          textAnchor="end"
          className="fill-muted font-mono"
          fontSize="8.5"
        >
          {labels.horizon}
        </text>
      </svg>

      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="label-mono flex items-center gap-1.5">
          <span aria-hidden className="h-0.5 w-4 rounded-full bg-coral" />
          {labels.cost}
        </span>
        <span className="label-mono flex items-center gap-1.5">
          <span aria-hidden className="h-0.5 w-4 rounded-full bg-accent" />
          {labels.save}
        </span>
      </div>
    </div>
  )
}

export default function CalculatorDemo({ compact = false }) {
  const { lang } = useT()
  const s = L[lang] ?? L.cs
  const reduced = useReducedMotion()
  const { push } = useToast()

  const [pkgId, setPkgId] = useState('suite')
  const [processes, setProcesses] = useState(3)
  const [team, setTeam] = useState(8)
  const [tools, setTools] = useState(3)
  const [addons, setAddons] = useState({
    docs: true,
    onboarding: false,
    support: true,
    selfhost: false,
  })
  const [sent, setSent] = useState(false)
  const [autoplay, setAutoplay] = useState(compact)

  const sentTimer = useRef(null)
  useEffect(() => () => clearTimeout(sentTimer.current), [])

  // Compact karta se hýbe sama, dokud do ní někdo nesáhne.
  useEffect(() => {
    if (!compact || !autoplay || reduced) return
    let dir = 1
    const id = setInterval(() => {
      setProcesses((p) => {
        if (p >= 8) dir = -1
        if (p <= 1) dir = 1
        return clamp(p + dir, 1, 8)
      })
    }, 1500)
    return () => clearInterval(id)
  }, [compact, autoplay, reduced])

  const pkg = PACKAGES.find((p) => p.id === pkgId) ?? PACKAGES[0]

  const price = useMemo(() => {
    const base = pkg.base
    const processCost = pkg.perProcess * (processes - 1)
    const teamCost = pkg.perPerson * team
    const toolCost = TOOL_PRICE * (tools - 1)
    const subtotal = base + processCost + teamCost + toolCost

    const discountPct = processes >= 5 ? 10 : processes >= 3 ? 5 : 0
    const discount = Math.round((subtotal * discountPct) / 100)
    const afterDiscount = subtotal - discount

    const docs = addons.docs ? Math.round(afterDiscount * DOCS_RATE) : 0
    const onboarding = addons.onboarding ? ONBOARDING : 0
    const selfhost = addons.selfhost ? SELFHOST : 0
    const once = afterDiscount + docs + onboarding + selfhost

    const run = tools * TOOL_RUN
    const support = addons.support ? Math.round((once * SUPPORT_RATE) / 3) : 0
    const monthly = run + support

    const savedHours = Math.round(processes * 9 + tools * 2.5 + team * pkg.hoursPerPerson)
    const savedMoney = savedHours * RATE
    const net = savedMoney - monthly
    const payback = net > 0 ? once / net : null

    const rows = [
      { key: 'base', label: s.rowBase, value: base, kind: 'once' },
      {
        key: 'proc',
        label: `${s.rowProcesses} (${processes - 1}×)`,
        value: processCost,
        kind: 'once',
        hidden: processCost === 0,
      },
      {
        key: 'team',
        label: `${s.rowTeam} (${team})`,
        value: teamCost,
        kind: 'once',
        hidden: teamCost === 0,
      },
      {
        key: 'tools',
        label: `${s.rowTools} (${tools - 1}×)`,
        value: toolCost,
        kind: 'once',
        hidden: toolCost === 0,
      },
      {
        key: 'discount',
        label: `${s.rowDiscount} −${discountPct} %`,
        value: -discount,
        kind: 'once',
        tone: 'accent',
        hidden: discount === 0,
      },
      { key: 'docs', label: s.addonDocs, value: docs, kind: 'once', hidden: !addons.docs },
      {
        key: 'onboarding',
        label: s.addonOnboarding,
        value: onboarding,
        kind: 'once',
        hidden: !addons.onboarding,
      },
      {
        key: 'selfhost',
        label: s.addonSelfhost,
        value: selfhost,
        kind: 'once',
        hidden: !addons.selfhost,
      },
      { key: 'run', label: `${s.rowRun} (${tools})`, value: run, kind: 'month' },
      {
        key: 'support',
        label: s.rowSupport,
        value: support,
        kind: 'month',
        hidden: !addons.support,
      },
    ].filter((row) => !row.hidden)

    return { once, monthly, discountPct, savedHours, savedMoney, payback, rows }
  }, [pkg, processes, team, tools, addons, s])

  const tOnce = useTween(price.once)
  const tMonthly = useTween(price.monthly)
  const tHours = useTween(price.savedHours)
  const tSaved = useTween(price.savedMoney)
  const tPayback = useTween(price.payback ?? HORIZON + 4, 600)

  const sliderChange = (setter) => (value) => {
    if (compact) setAutoplay(false)
    setter(value)
  }

  const onSend = () => {
    setSent(true)
    push({
      title: s.toastTitle,
      description: s.toastDesc,
      variant: 'success',
    })
    clearTimeout(sentTimer.current)
    sentTimer.current = setTimeout(() => setSent(false), 2400)
  }

  const onReset = () => {
    setPkgId('suite')
    setProcesses(3)
    setTeam(8)
    setTools(3)
    setAddons({ docs: true, onboarding: false, support: true, selfhost: false })
    setSent(false)
  }

  /* ---------------------------------------------------------------- compact */
  if (compact) {
    return (
      <div className="hide-scrollbar flex h-full flex-col justify-between gap-3 overflow-hidden">
        <div className="flex items-start justify-between gap-2">
          <p className="label-mono">{s.compactLabel}</p>
          <Badge tone={price.discountPct ? 'accent' : 'neutral'} dot>
            {price.discountPct ? `−${price.discountPct} %` : s.noDiscount}
          </Badge>
        </div>

        <div>
          <p
            aria-hidden
            className="font-display text-[clamp(1.5rem,6.5vw,2.3rem)] font-semibold leading-none tabular-nums"
          >
            {czk(Math.round(tOnce))}
          </p>
          <p aria-hidden className="mt-1.5 font-mono text-[0.68rem] leading-relaxed text-muted">
            {processes} {plural(processes, s.processWord)} · {s.compactSaves}{' '}
            <span className="text-text">
              {num(Math.round(tHours))} {s.hours}
            </span>
            {s.perMonthShort}
          </p>
          <span className="sr-only" aria-live="polite">
            {czk(price.once)} · {processes} {plural(processes, s.processWord)} · {s.compactSaves}{' '}
            {price.savedHours} {s.hours}
            {s.perMonthShort}
          </span>
        </div>

        <Slider
          compact
          label={s.processes}
          icon={Workflow}
          value={processes}
          min={1}
          max={8}
          onChange={sliderChange(setProcesses)}
        />

        <p className="label-mono flex items-center gap-1.5">
          <Timer size={12} className="text-accent" />
          {s.compactPayback} ·{' '}
          <span className="text-text">
            {price.payback ? `${dec1(tPayback, lang)} ${s.months}` : '—'}
          </span>
        </p>
      </div>
    )
  }

  /* ------------------------------------------------------------------- plná */
  return (
    <DemoShell title={s.title} subtitle={s.subtitle} live onReset={onReset}>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* konfigurace */}
        <div className="space-y-5">
          <div>
            <p className="label-mono">{s.pkg}</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {PACKAGES.map((item) => {
                const Icon = item.icon
                const active = item.id === pkg.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setPkgId(item.id)}
                    className={cn(
                      'rounded-xl border p-3 text-left transition-all duration-300 ease-[var(--ease-out-expo)]',
                      active
                        ? 'border-accent bg-accent/10 shadow-[var(--shadow-soft)]'
                        : 'border-line bg-surface-2/50 hover:border-line-strong'
                    )}
                  >
                    <span className="flex items-center justify-between">
                      <Icon size={15} className={active ? 'text-text' : 'text-muted'} />
                      {active && <Check size={13} className="text-accent" />}
                    </span>
                    <span className="mt-2 block text-[0.86rem] font-semibold leading-tight">
                      {item.name[lang] ?? item.name.cs}
                    </span>
                    <span className="mt-1 block text-[0.72rem] leading-snug text-muted">
                      {item.desc[lang] ?? item.desc.cs}
                    </span>
                    <span className="mt-2 block font-mono text-[0.7rem] text-text-soft">
                      {s.from} {czk(item.base)}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-line bg-surface-2/40 p-3.5">
            <p className="label-mono">{s.scope}</p>
            <Slider
              label={s.processes}
              icon={Workflow}
              value={processes}
              min={1}
              max={8}
              onChange={setProcesses}
            />
            <Slider label={s.team} icon={Users} value={team} min={1} max={40} onChange={setTeam} />
            <Slider label={s.tools} icon={Link2} value={tools} min={1} max={6} onChange={setTools} />

            <AnimatePresence mode="wait">
              {processes === 2 || processes === 4 ? (
                <motion.p
                  key={processes}
                  initial={reduced ? { opacity: 0 } : { opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, y: -4 }}
                  className="flex items-center gap-1.5 text-[0.76rem] text-text-soft"
                >
                  <Sparkles size={12} className="shrink-0 text-accent" />
                  {processes === 2 ? s.nudge3 : s.nudge5}
                </motion.p>
              ) : null}
            </AnimatePresence>
          </div>

          <div>
            <p className="label-mono">{s.addons}</p>
            <div className="mt-2.5 grid gap-3 sm:grid-cols-2">
              <Switch
                checked={addons.docs}
                onChange={(v) => setAddons((a) => ({ ...a, docs: v }))}
                label={s.addonDocs}
                description={s.addonDocsDesc}
              />
              <Switch
                checked={addons.onboarding}
                onChange={(v) => setAddons((a) => ({ ...a, onboarding: v }))}
                label={s.addonOnboarding}
                description={s.addonOnboardingDesc}
              />
              <Switch
                checked={addons.support}
                onChange={(v) => setAddons((a) => ({ ...a, support: v }))}
                label={s.addonSupport}
                description={s.addonSupportDesc}
              />
              <Switch
                checked={addons.selfhost}
                onChange={(v) => setAddons((a) => ({ ...a, selfhost: v }))}
                label={s.addonSelfhost}
                description={s.addonSelfhostDesc}
              />
            </div>
          </div>
        </div>

        {/* cena + návratnost */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-line bg-surface-2/60 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="label-mono">{s.totalOnce}</p>
                <p
                  aria-hidden
                  className="mt-1 font-display text-[clamp(1.9rem,4.4vw,2.5rem)] font-semibold leading-none tabular-nums"
                >
                  {czk(Math.round(tOnce))}
                </p>
                {/* Čtečka dostane až dopočítanou hodnotu, ne každý krok animace. */}
                <span className="sr-only" aria-live="polite">
                  {s.totalOnce}: {czk(price.once)}
                </span>
                <p className="mt-1.5 font-mono text-[0.72rem] text-muted">
                  + {czk(Math.round(tMonthly))} {s.perMonth} · {s.monthlyNote}
                </p>
              </div>
              <AnimatePresence>
                {price.discountPct > 0 && (
                  <motion.span
                    key={price.discountPct}
                    initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.8, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                    className="shrink-0"
                  >
                    <Badge tone="accent" icon={Percent}>
                      {s.discountEarned} −{price.discountPct} %
                    </Badge>
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <p className="label-mono mt-4">{s.breakdown}</p>
            <motion.ul layout={!reduced} className="mt-1.5 divide-y divide-line/70">
              <AnimatePresence initial={false}>
                {price.rows.map((row) => (
                  <motion.li
                    key={row.key}
                    layout={!reduced}
                    initial={reduced ? { opacity: 0 } : { opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduced ? { opacity: 0 } : { opacity: 0, y: -4 }}
                    className="flex items-baseline justify-between gap-3 py-1.5"
                  >
                    <span
                      className={cn(
                        'text-[0.8rem] leading-snug',
                        row.tone === 'accent' ? 'text-text' : 'text-text-soft'
                      )}
                    >
                      {row.label}
                    </span>
                    <span
                      className={cn(
                        'shrink-0 font-mono text-[0.76rem] tabular-nums',
                        row.tone === 'accent' && 'text-accent'
                      )}
                    >
                      {czk(row.value)}
                      {row.kind === 'month' && (
                        <span className="text-muted"> {s.perMonthShort}</span>
                      )}
                    </span>
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>

            <div className="relative mt-4">
              <Button
                variant="primary"
                size="md"
                icon={sent ? Check : Send}
                className="w-full"
                onClick={onSend}
              >
                {sent ? s.sent : s.send}
              </Button>
              <AnimatePresence>
                {sent && !reduced && (
                  <motion.span
                    key="ring"
                    aria-hidden
                    initial={{ opacity: 0.7, scale: 0.96 }}
                    animate={{ opacity: 0, scale: 1.14 }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                    className="pointer-events-none absolute inset-0 rounded-xl border-2 border-accent"
                  />
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-surface-2/60 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="flex items-center gap-2 text-[0.92rem] font-semibold">
                <TrendingUp size={15} className="text-accent" />
                {s.returnTitle}
              </p>
              <Badge tone="neutral">{RATE} Kč / {s.hours}</Badge>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <StatTile
                label={s.savedHours}
                icon={Clock}
                value={`${num(Math.round(tHours))} ${s.hours}`}
                delta={s.perMonthShort}
              />
              <StatTile
                label={s.savedMoney}
                icon={Coins}
                value={czk(Math.round(tSaved))}
                delta={s.perMonthShort}
                tone="up"
              />
              <StatTile
                label={s.payback}
                icon={Timer}
                value={price.payback ? dec1(tPayback, lang) : '—'}
                delta={s.months}
                tone="up"
              />
            </div>

            <div className="mt-3">
              <PaybackChart
                total={tOnce}
                monthly={tMonthly}
                savedMonthly={tSaved}
                formatMonths={(m) => `${dec1(m, lang)} ${s.months}`}
                labels={{
                  cost: s.chartCost,
                  save: s.chartSave,
                  horizon: `${HORIZON} ${s.months}`,
                  aria: `${s.chartCost} / ${s.chartSave} — ${s.chartCross}`,
                }}
              />
              {!price.payback && (
                <p className="mt-1 text-[0.76rem] text-muted">{s.chartNever}</p>
              )}
            </div>

            <p className="mt-2 text-[0.74rem] leading-snug text-muted">{s.rateNote}</p>
          </div>

          <FakeDataNote />
        </div>
      </div>

      <p className="mt-5 border-t border-line pt-3 text-[0.78rem] leading-relaxed text-muted">
        {s.footnote}
      </p>
    </DemoShell>
  )
}
