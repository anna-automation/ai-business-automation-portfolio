import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { BadgeCheck, Clock, FileText, Inbox, RefreshCw, Sparkles, Timer } from 'lucide-react'
import { cn, num } from '../../lib/utils.js'
import { useT } from '../../lib/i18n.jsx'
import { useReducedMotion } from '../../lib/prefs.jsx'
import { useToast } from '../../lib/toast.jsx'
import { Badge, LabeledRule, Skeleton } from '../ui/primitives.jsx'
import { Button } from '../ui/Button.jsx'
import { Counter } from '../ui/Counter.jsx'
import { DemoShell, FakeDataNote, MiniTable, StatTile } from './_shell.jsx'

/**
 * Živý report — týdenní přehled, který se generuje sám každé pondělí v 7:00.
 *
 * Grafy jsou ručně kreslené inline SVG, žádná knihovna. Čísla po náběhu dál
 * mírně rostou, aby bylo vidět, že report sedí na živém provozu.
 */

/** Minulý týden — proti němu se počítá změna. */
const PREV_LEADS = 36

const SOURCE_IDS = ['web', 'phone', 'email', 'referral', 'linkedin']

const TILES = [
  { id: 'leads', icon: Inbox, dec: 0, step: 1 },
  { id: 'deals', icon: BadgeCheck, dec: 0, step: 1 },
  { id: 'hours', icon: Timer, dec: 1, step: 0.2, suffix: ' h' },
  { id: 'docs', icon: FileText, dec: 0, step: 2 },
]

/** Které dlaždice přirůstají častěji — obchody se zavírají pomaleji. */
const DRIFT_POOL = [0, 0, 2, 2, 3, 3, 1]

const L = {
  cs: {
    title: 'Týdenní report',
    subtitle: 'Generuje se sám každé pondělí v 7:00 a odejde e-mailem i do kanálu týmu',
    nextRun: 'Příští spuštění: pondělí 7:00',
    generate: 'Vygenerovat report',
    generating: 'Počítám…',
    barTitle: 'Nové poptávky po dnech',
    barTotal: 'celkem za týden',
    sparkTitle: 'Ušetřené hodiny · 12 týdnů',
    commentLabel: 'komentář AI k číslům',
    commentNote: 'Komentář píše model, čísla bere z tabulky — nic si nedomýšlí.',
    sourcesTitle: 'Top 5 zdrojů poptávek',
    colSource: 'zdroj',
    colCount: 'počet',
    colConv: 'konverze',
    tiles: {
      leads: 'Nové poptávky',
      deals: 'Uzavřené obchody',
      hours: 'Ušetřené hodiny',
      docs: 'Zpracované dokumenty',
    },
    days: ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'],
    dayIn: ['v pondělí', 'v úterý', 've středu', 've čtvrtek', 'v pátek', 'v sobotu', 'v neděli'],
    sources: {
      web: 'Webový formulář',
      phone: 'Telefon',
      email: 'E-mail',
      referral: 'Doporučení',
      linkedin: 'LinkedIn',
    },
    // druhý pád pro vsazení do věty: „nejvíc z webového formuláře“
    sourcesFrom: {
      web: 'webového formuláře',
      phone: 'telefonu',
      email: 'e-mailu',
      referral: 'doporučení',
      linkedin: 'LinkedInu',
    },
    deltaLeads: (g) =>
      g === 0
        ? 'stejně jako minulý týden'
        : `${g > 0 ? '+' : '−'}${Math.abs(g)} % proti minulému týdnu`,
    deltaDeals: (n) => `z ${n} otevřených příležitostí`,
    deltaHours: (days) => `ekvivalent ${days} dne práce`,
    deltaDocs: (rate) => `${rate} % bez zásahu člověka`,
    comment: (d) =>
      `Poptávky ${
        d.growth === 0
          ? 'drží stejnou úroveň jako minulý týden'
          : d.growth > 0
            ? `vzrostly o ${d.growth} % proti minulému týdnu`
            : `klesly o ${Math.abs(d.growth)} % proti minulému týdnu`
      }, nejvíc z ${d.topSource} (${d.topCount} z ${d.leads}). Nejvíc jich přišlo ${
        d.bestDay
      }. Automatizace ušetřily ${d.hours} h a ${d.autoRate} % dokumentů prošlo bez zásahu člověka. U ${
        d.worstSource
      } drží konverze jen ${d.worstConv} % — tam bych hledala, kde se poptávky ztrácejí.`,
    toastTitle: 'Report vygenerován',
    toastDesc: (d) => `${d.leads} poptávek, ${d.deals} obchodů, ${d.hours} h ušetřeno.`,
    liveNote: 'čísla se dopočítávají průběžně',
  },

  en: {
    title: 'Weekly report',
    subtitle: 'Writes itself every Monday at 7:00 and goes out by e-mail and to the team channel',
    nextRun: 'Next run: Monday 7:00',
    generate: 'Generate the report',
    generating: 'Crunching…',
    barTitle: 'New enquiries by day',
    barTotal: 'total this week',
    sparkTitle: 'Hours saved · 12 weeks',
    commentLabel: 'AI commentary on the numbers',
    commentNote: 'The model writes the commentary, the numbers come from the sheet — nothing invented.',
    sourcesTitle: 'Top 5 enquiry sources',
    colSource: 'source',
    colCount: 'count',
    colConv: 'conversion',
    tiles: {
      leads: 'New enquiries',
      deals: 'Deals closed',
      hours: 'Hours saved',
      docs: 'Documents processed',
    },
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    dayIn: ['on Monday', 'on Tuesday', 'on Wednesday', 'on Thursday', 'on Friday', 'on Saturday', 'on Sunday'],
    sources: {
      web: 'Web form',
      phone: 'Phone',
      email: 'E-mail',
      referral: 'Referral',
      linkedin: 'LinkedIn',
    },
    sourcesFrom: {
      web: 'the web form',
      phone: 'the phone',
      email: 'e-mail',
      referral: 'referrals',
      linkedin: 'LinkedIn',
    },
    deltaLeads: (g) =>
      g === 0 ? 'same as last week' : `${g > 0 ? '+' : '−'}${Math.abs(g)} % week over week`,
    deltaDeals: (n) => `of ${n} open opportunities`,
    deltaHours: (days) => `${days} working days equivalent`,
    deltaDocs: (rate) => `${rate} % with no human touch`,
    comment: (d) =>
      `Enquiries ${
        d.growth === 0
          ? 'held last week’s level'
          : d.growth > 0
            ? `grew by ${d.growth} % week over week`
            : `fell by ${Math.abs(d.growth)} % week over week`
      }, mostly from ${d.topSource} (${d.topCount} of ${d.leads}). The peak was ${
        d.bestDay
      }. Automations saved ${d.hours} h and ${d.autoRate} % of documents went through untouched. Conversion on ${
        d.worstSource
      } sits at only ${d.worstConv} % — that is where I would look for the leak.`,
    toastTitle: 'Report generated',
    toastDesc: (d) => `${d.leads} enquiries, ${d.deals} deals, ${d.hours} h saved.`,
    liveNote: 'numbers keep updating',
  },
}

function rnd(min, max) {
  return min + Math.random() * (max - min)
}

function rndInt(min, max) {
  return Math.round(rnd(min, max))
}

/** Celý report se počítá z jednoho zdroje, aby čísla vzájemně dávala smysl. */
function makeData() {
  const days = [
    rndInt(5, 9),
    rndInt(5, 10),
    rndInt(4, 9),
    rndInt(6, 10),
    rndInt(4, 8),
    rndInt(0, 3),
    rndInt(0, 2),
  ]
  const leads = days.reduce((a, b) => a + b, 0)
  const growth = Math.round(((leads - PREV_LEADS) / PREV_LEADS) * 100)
  const deals = rndInt(6, 12)
  const opened = deals + rndInt(2, 7)
  const hours = Math.round(rnd(19, 31) * 10) / 10
  const docs = rndInt(160, 260)
  const autoRate = rndInt(93, 99)

  const weights = [0.4, 0.23, 0.17, 0.12]
  const head = weights.map((w) => Math.floor(leads * w))
  const rest = leads - head.reduce((a, b) => a + b, 0)
  const counts = [...head, Math.max(0, rest)]

  const sources = SOURCE_IDS.map((id, i) => ({
    id,
    count: counts[i],
    conv: rndInt(14, 46),
  })).sort((a, b) => b.count - a.count)

  const spark = Array.from({ length: 11 }, () => Math.round(rnd(12, 29) * 10) / 10)
  const bestDay = days.indexOf(Math.max(...days))

  return { days, leads, growth, deals, opened, hours, docs, autoRate, sources, spark, bestDay }
}

export default function DashboardDemo({ compact = false }) {
  const { lang } = useT()
  const s = L[lang] ?? L.cs
  const loc = lang === 'en' ? 'en-US' : 'cs-CZ'
  const reduced = useReducedMotion()
  const { push } = useToast()

  const [data, setData] = useState(() => makeData())
  const [gen, setGen] = useState(0)
  const [busy, setBusy] = useState(false)
  const [settled, setSettled] = useState(false)
  const [drift, setDrift] = useState([0, 0, 0, 0])
  const [pulsed, setPulsed] = useState(null)

  const busyTimer = useRef(null)
  const pulseTimer = useRef(null)

  useEffect(
    () => () => {
      clearTimeout(busyTimer.current)
      clearTimeout(pulseTimer.current)
    },
    []
  )

  // Po náběhu Counteru přepneme na živé hodnoty, které dál mírně rostou.
  useEffect(() => {
    if (reduced) {
      setSettled(true)
      return undefined
    }
    setSettled(false)
    const id = setTimeout(() => setSettled(true), 1800)
    return () => clearTimeout(id)
  }, [gen, reduced])

  useEffect(() => {
    if (reduced || !settled || busy) return undefined
    let alive = true
    let id = 0

    const schedule = () => {
      id = setTimeout(() => {
        if (!alive) return
        const k = DRIFT_POOL[Math.floor(Math.random() * DRIFT_POOL.length)]
        setDrift((prev) => {
          const next = [...prev]
          next[k] = Math.round((next[k] + TILES[k].step) * 10) / 10
          return next
        })
        setPulsed(k)
        clearTimeout(pulseTimer.current)
        pulseTimer.current = setTimeout(() => setPulsed(null), 1000)
        schedule()
      }, 2000 + Math.random() * 2000)
    }

    schedule()
    return () => {
      alive = false
      clearTimeout(id)
    }
  }, [reduced, settled, busy])

  const regenerate = useCallback(() => {
    if (busy) return
    setBusy(true)
    setPulsed(null)
    clearTimeout(busyTimer.current)
    busyTimer.current = setTimeout(
      () => {
        const next = makeData()
        setData(next)
        setDrift([0, 0, 0, 0])
        setGen((g) => g + 1)
        setBusy(false)
        push({
          title: s.toastTitle,
          description: s.toastDesc({
            leads: next.leads,
            deals: next.deals,
            hours: next.hours.toLocaleString(loc, {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            }),
          }),
          variant: 'success',
        })
      },
      reduced ? 0 : 1200
    )
  }, [busy, loc, push, reduced, s])

  const reset = useCallback(() => {
    clearTimeout(busyTimer.current)
    setBusy(false)
    setData(makeData())
    setDrift([0, 0, 0, 0])
    setPulsed(null)
    setGen((g) => g + 1)
  }, [])

  const base = [data.leads, data.deals, data.hours, data.docs]
  const values = base.map((v, i) => Math.round((v + drift[i]) * 10) / 10)

  const fmt = (value, dec) =>
    value.toLocaleString(loc, { minimumFractionDigits: dec, maximumFractionDigits: dec })

  const deltas = [
    s.deltaLeads(data.growth),
    s.deltaDeals(data.opened),
    s.deltaHours(fmt(Math.round((values[2] / 8) * 10) / 10, 1)),
    s.deltaDocs(data.autoRate),
  ]
  const tones = [data.growth >= 0 ? 'up' : 'down', 'neutral', 'up', 'neutral']

  const weakest = useMemo(
    () => [...data.sources].sort((a, b) => a.conv - b.conv)[0],
    [data.sources]
  )
  const comment = useMemo(
    () =>
      s.comment({
        growth: data.growth,
        leads: data.leads,
        topSource: s.sourcesFrom[data.sources[0].id],
        topCount: data.sources[0].count,
        bestDay: s.dayIn[data.bestDay],
        hours: data.hours.toLocaleString(loc, {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        }),
        autoRate: data.autoRate,
        worstSource: s.sourcesFrom[weakest.id],
        worstConv: weakest.conv,
      }),
    [data, weakest, loc, s]
  )

  const tiles = TILES.map((tile, i) => (
    <StatTile
      key={tile.id}
      label={s.tiles[tile.id]}
      icon={tile.icon}
      tone={tones[i]}
      delta={compact ? undefined : deltas[i]}
      className={cn('transition-shadow duration-700', pulsed === i && 'ring-2 ring-accent/35')}
      value={
        busy ? (
          <Skeleton className="h-6 w-20" />
        ) : settled ? (
          <span>
            {fmt(values[i], tile.dec)}
            {tile.suffix ?? ''}
          </span>
        ) : (
          <Counter
            key={`${tile.id}-${gen}`}
            to={base[i]}
            decimals={tile.dec}
            suffix={tile.suffix ?? ''}
          />
        )
      }
    />
  ))

  const spark = [...data.spark, values[2]]

  if (compact) {
    return (
      <div className="flex h-full flex-col gap-3 overflow-hidden">
        <div className="grid grid-cols-2 gap-2.5">{tiles}</div>
        <div className="mt-auto">
          <div className="flex items-end justify-between gap-2">
            <p className="label-mono truncate">{s.sparkTitle}</p>
            <span className="font-mono text-[0.7rem] tabular-nums text-text-soft">
              {fmt(values[2], 1)} h
            </span>
          </div>
          <Sparkline values={spark} reduced={reduced} className="mt-1.5" />
        </div>
      </div>
    )
  }

  const rows = data.sources.slice(0, 5).map((src) => ({
    id: src.id,
    source: s.sources[src.id],
    count: num(src.count, loc),
    conv: src.conv,
  }))

  const columns = [
    { key: 'source', label: s.colSource },
    { key: 'count', label: s.colCount, align: 'right', mono: true },
    {
      key: 'conv',
      label: s.colConv,
      align: 'right',
      mono: true,
      render: (row) => (
        <span className="flex items-center justify-end gap-2">
          <span aria-hidden className="h-1 w-10 overflow-hidden rounded-full bg-line">
            <span
              className="block h-full rounded-full bg-text-soft/70"
              style={{ width: `${row.conv}%` }}
            />
          </span>
          <span className="tabular-nums">{row.conv} %</span>
        </span>
      ),
    },
  ]

  return (
    <DemoShell title={s.title} subtitle={s.subtitle} onReset={reset} live>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="label-mono flex items-center gap-1.5">
              <Clock size={12} />
              {s.nextRun}
            </p>
            <p className="mt-1 font-mono text-[0.68rem] text-muted">{s.liveNote}</p>
          </div>
          <Button size="sm" icon={RefreshCw} iconRight={false} onClick={regenerate} disabled={busy}>
            {busy ? s.generating : s.generate}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">{tiles}</div>

        <div className="grid gap-3 lg:grid-cols-[1.35fr_1fr]">
          <div
            className={cn(
              'rounded-xl border border-line bg-surface-2/40 p-3 transition-opacity duration-300',
              busy && 'opacity-40'
            )}
          >
            <div className="flex items-end justify-between gap-2">
              <p className="label-mono">{s.barTitle}</p>
              <span className="font-mono text-[0.7rem] tabular-nums text-text-soft">
                {num(data.leads, loc)} <span className="text-muted">{s.barTotal}</span>
              </span>
            </div>
            <BarChart days={data.days} labels={s.days} reduced={reduced} title={s.barTitle} />
          </div>

          <div
            className={cn(
              'rounded-xl border border-line bg-surface-2/40 p-3 transition-opacity duration-300',
              busy && 'opacity-40'
            )}
          >
            <div className="flex items-end justify-between gap-2">
              <p className="label-mono">{s.sparkTitle}</p>
              <span className="font-mono text-[0.7rem] tabular-nums text-text-soft">
                {fmt(values[2], 1)} h
              </span>
            </div>
            <Sparkline values={spark} reduced={reduced} className="mt-3" />
          </div>
        </div>

        <AiComment
          text={comment}
          note={s.commentNote}
          label={s.commentLabel}
          busy={busy}
          reduced={reduced}
        />

        <div>
          <LabeledRule>{s.sourcesTitle}</LabeledRule>
          <MiniTable columns={columns} rows={rows} className="mt-1" />
        </div>

        <FakeDataNote />
      </div>
    </DemoShell>
  )
}

function AiComment({ text, note, label, busy, reduced }) {
  const [typed, setTyped] = useState(0)

  useEffect(() => {
    if (reduced || busy) {
      setTyped(text.length)
      return undefined
    }
    setTyped(0)
    let i = 0
    const id = setInterval(() => {
      i = Math.min(text.length, i + 2)
      setTyped(i)
      if (i >= text.length) clearInterval(id)
    }, 18)
    return () => clearInterval(id)
  }, [text, reduced, busy])

  const typing = typed < text.length

  return (
    <div className="rounded-xl border border-line bg-surface-2/50 p-3.5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="violet" icon={Sparkles}>
          AI
        </Badge>
        <p className="label-mono">{label}</p>
      </div>

      {busy ? (
        <div className="mt-3 space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-[86%]" />
          <Skeleton className="h-3 w-[64%]" />
        </div>
      ) : (
        <>
          <p
            aria-hidden
            className={cn(
              'mt-2.5 text-[0.86rem] leading-relaxed text-text-soft',
              typing && 'caret'
            )}
          >
            {text.slice(0, typed)}
          </p>
          <p className="sr-only">{text}</p>
        </>
      )}

      <p className="label-mono mt-2.5">{note}</p>
    </div>
  )
}

/** Sloupcový graf — jedna řada, takže legenda není potřeba. */
function BarChart({ days, labels, reduced, title }) {
  const [hover, setHover] = useState(null)
  // useId vrací dvojtečky, ty se v url(#…) referenci nehodí
  const clipId = `barclip-${useId().replace(/:/g, '')}`
  const W = 300
  const H = 112
  const maxValue = Math.max(...days, 1)
  const slot = W / days.length
  const barW = Math.round(slot * 0.56 * 10) / 10
  const maxIndex = days.indexOf(maxValue)

  const scale = (v) => Math.max(2, (v / maxValue) * (H - 12))

  return (
    <div className="relative mt-2">
      <div className="grid grid-cols-7">
        {days.map((v, i) => (
          <span
            key={i}
            className={cn(
              'label-mono text-center tabular-nums transition-opacity duration-200',
              i === hover || i === maxIndex ? 'text-text-soft opacity-100' : 'opacity-0'
            )}
          >
            {v}
          </span>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="mt-1 h-28 w-full text-line"
        role="group"
        aria-label={title}
      >
        <defs>
          <clipPath id={clipId}>
            <rect x="0" y="0" width={W} height={H} />
          </clipPath>
        </defs>

        {[0.5, 1].map((frac) => (
          <line
            key={frac}
            x1="0"
            x2={W}
            y1={H - (H - 12) * frac}
            y2={H - (H - 12) * frac}
            stroke="currentColor"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        <g clipPath={`url(#${clipId})`}>
          {days.map((v, i) => {
            const h = Math.round(scale(v) * 10) / 10
            const x = Math.round((i * slot + (slot - barW) / 2) * 10) / 10
            return (
              <g
                key={i}
                tabIndex={0}
                role="img"
                aria-label={`${labels[i]}: ${days[i]}`}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover((prev) => (prev === i ? null : prev))}
                onFocus={() => setHover(i)}
                onBlur={() => setHover((prev) => (prev === i ? null : prev))}
              >
                <rect x={i * slot} y="0" width={slot} height={H} fill="transparent" />
                <motion.rect
                  x={x}
                  width={barW}
                  rx="3"
                  initial={reduced ? false : { y: H, height: 0 }}
                  animate={{ y: H - h, height: h + 4 }}
                  transition={{
                    duration: reduced ? 0 : 0.7,
                    delay: reduced ? 0 : i * 0.06,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className={cn(
                    'transition-colors duration-200',
                    i === hover ? 'fill-accent' : 'fill-accent/70'
                  )}
                />
              </g>
            )
          })}
        </g>

        <line
          x1="0"
          x2={W}
          y1={H - 0.5}
          y2={H - 0.5}
          className="stroke-line-strong"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div className="mt-1.5 grid grid-cols-7">
        {labels.map((label, i) => (
          <span
            key={label}
            className={cn(
              'label-mono text-center transition-colors',
              i === hover && 'text-text-soft'
            )}
          >
            {label}
          </span>
        ))}
      </div>

      {hover != null && (
        <span
          aria-hidden
          className="glass pointer-events-none absolute top-3 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg px-2 py-1 font-mono text-[0.68rem] shadow-[var(--shadow-lift)]"
          style={{ left: `${((hover + 0.5) / days.length) * 100}%` }}
        >
          {labels[hover]} · {days[hover]}
        </span>
      )}
    </div>
  )
}

/** Sparkline — jedna řada, poslední bod se hýbe s živou hodnotou. */
function Sparkline({ values, reduced, className }) {
  const W = 300
  const H = 64
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const points = values.map((v, i) => [
    (i / (values.length - 1)) * W,
    H - 6 - ((v - min) / span) * (H - 16),
  ])
  const line = points
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(' ')
  const area = `${line} L ${W} ${H} L 0 ${H} Z`
  const last = points[points.length - 1]

  return (
    <div className={cn('relative', className)}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="h-16 w-full"
        aria-hidden
      >
        <path d={area} className="fill-violet/10" />
        <motion.path
          d={line}
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          className="stroke-violet"
          initial={reduced ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: reduced ? 0 : 1.1, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <span
        aria-hidden
        className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet ring-4 ring-violet/20 transition-all duration-500"
        style={{ left: '100%', top: `${(last[1] / H) * 100}%` }}
      />
    </div>
  )
}
