import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  Bell,
  CalendarDays,
  Check,
  ClipboardList,
  Clock,
  FastForward,
  Flag,
  LayoutGrid,
  List,
  Mail,
  Users,
  Zap,
} from 'lucide-react'
import { DemoShell, FakeDataNote, StatTile } from './_shell.jsx'
import { Badge, LiveDot, Switch } from '../ui/primitives.jsx'
import { Button, IconButton } from '../ui/Button.jsx'
import { useT } from '../../lib/i18n.jsx'
import { useReducedMotion } from '../../lib/prefs.jsx'
import { useToast } from '../../lib/toast.jsx'
import { clamp, cn, uid } from '../../lib/utils.js'

/**
 * Správa úkolů a procesů — kanban, který hlídá termíny.
 * Těžiště dema je čas: tlačítko posune „dnešek“ a je vidět,
 * co automatizace udělala sama (připomínka, eskalace, navazující krok).
 */

const MAX_DAY = 10
const SPAN_FROM = 0
const SPAN_TO = 12
const STATUSES = ['wait', 'doing', 'done']

const SOURCE_ICON = { mail: Mail, form: ClipboardList, meeting: Users, auto: Zap }
const KIND_ICON = { remind: Bell, escalate: AlertTriangle, start: Zap, done: Check }
const KIND_RAIL = {
  remind: 'bg-warn',
  escalate: 'bg-coral',
  start: 'bg-violet',
  done: 'bg-ok',
}

/** Dativ u jmen řeším tabulkou — automatické skloňování by lhalo. */
const OWNERS = {
  'Petr Novák': { first: 'Petr', dative: 'Petrovi' },
  'Lucie Svobodová': { first: 'Lucie', dative: 'Lucii' },
  'Tomáš Beneš': { first: 'Tomáš', dative: 'Tomášovi' },
  'Jana Dvořáková': { first: 'Jana', dative: 'Janě' },
  'Martin Horák': { first: 'Martin', dative: 'Martinovi' },
  'Veronika Čermáková': { first: 'Veronika', dative: 'Veronice' },
  'Pavel Kříž': { first: 'Pavel', dative: 'Pavlovi' },
  'Eva Marková': { first: 'Eva', dative: 'Evě' },
}

const INITIAL_TASKS = [
  {
    id: 't1',
    title: { cs: 'Vyfakturovat březnové zakázky', en: 'Invoice the March jobs' },
    owner: 'Lucie Svobodová',
    from: 0,
    due: 2,
    status: 'doing',
    prio: 'high',
    source: 'mail',
    next: { cs: 'Předat podklady účetní', en: 'Hand the documents to accounting' },
    nextOwner: 'Eva Marková',
  },
  {
    id: 't2',
    title: { cs: 'Připravit podklady pro audit', en: 'Prepare the audit documents' },
    owner: 'Tomáš Beneš',
    from: 1,
    due: 4,
    status: 'wait',
    prio: 'mid',
    source: 'meeting',
    next: { cs: 'Rozeslat zápis z auditu', en: 'Circulate the audit minutes' },
    nextOwner: 'Jana Dvořáková',
  },
  {
    id: 't3',
    title: { cs: 'Odpovědět na poptávku z webu', en: 'Reply to the website enquiry' },
    owner: 'Petr Novák',
    from: 0,
    due: 0,
    status: 'doing',
    prio: 'high',
    source: 'form',
    next: { cs: 'Založit kartu v CRM', en: 'Create the CRM card' },
    nextOwner: 'Petr Novák',
  },
  {
    id: 't4',
    title: { cs: 'Zaktualizovat ceník služeb', en: 'Update the service price list' },
    owner: 'Jana Dvořáková',
    from: 2,
    due: 6,
    status: 'wait',
    prio: 'low',
    source: 'meeting',
    next: { cs: 'Publikovat ceník na web', en: 'Publish the price list' },
    nextOwner: 'Pavel Kříž',
  },
  {
    id: 't5',
    title: { cs: 'Objednat kancelářské potřeby', en: 'Order office supplies' },
    owner: 'Martin Horák',
    from: 0,
    due: 2,
    status: 'done',
    doneDay: 0,
    prio: 'low',
    source: 'mail',
    next: { cs: 'Zkontrolovat dodávku', en: 'Check the delivery' },
    nextOwner: 'Martin Horák',
  },
  {
    id: 't6',
    title: { cs: 'Zkontrolovat smlouvu s dodavatelem', en: 'Review the supplier contract' },
    owner: 'Veronika Čermáková',
    from: 1,
    due: 3,
    status: 'doing',
    prio: 'high',
    source: 'mail',
    next: { cs: 'Založit smlouvu do archivu', en: 'File the contract in the archive' },
    nextOwner: 'Eva Marková',
  },
  {
    id: 't7',
    title: { cs: 'Nahrát fotky na nový web', en: 'Upload photos to the new site' },
    owner: 'Pavel Kříž',
    from: 3,
    due: 5,
    status: 'wait',
    prio: 'mid',
    source: 'form',
    next: { cs: 'Zkontrolovat web na mobilu', en: 'Check the site on mobile' },
    nextOwner: 'Pavel Kříž',
  },
  {
    id: 't8',
    title: { cs: 'Proškolit nováčka v CRM', en: 'Onboard the new hire into the CRM' },
    owner: 'Eva Marková',
    from: 4,
    due: 8,
    status: 'wait',
    prio: 'mid',
    source: 'meeting',
    next: { cs: 'Vyžádat zpětnou vazbu', en: 'Ask for feedback' },
    nextOwner: 'Eva Marková',
  },
]

const COMPACT_TASKS = [
  { id: 'c1', title: { cs: 'Odpovědět na poptávku', en: 'Reply to the enquiry' }, owner: 'Petr Novák', due: 2 },
  { id: 'c2', title: { cs: 'Vyfakturovat zakázky', en: 'Invoice the jobs' }, owner: 'Lucie Svobodová', due: 4 },
  { id: 'c3', title: { cs: 'Zkontrolovat smlouvu', en: 'Review the contract' }, owner: 'Veronika Čermáková', due: 6 },
  { id: 'c4', title: { cs: 'Předat podklady účetní', en: 'Hand over to accounting' }, owner: 'Eva Marková', due: 9 },
]

const L = {
  cs: {
    title: 'Správa úkolů a procesů',
    subtitle: 'Termíny si hlídá systém, ne vedoucí',
    status: { wait: 'Čeká', doing: 'Probíhá', done: 'Hotovo' },
    prio: { high: 'Vysoká priorita', mid: 'Střední priorita', low: 'Nízká priorita' },
    source: { mail: 'z e-mailu', form: 'z formuláře', meeting: 'z porady', auto: 'z automatizace' },
    tiles: { doing: 'Probíhá', late: 'Po termínu', doneWeek: 'Hotovo tento týden', actions: 'Automatických akcí' },
    tileHints: { doing: 's odpovědnou osobou', late: 'eskalováno vedoucímu', doneWeek: 'včetně navazujících', actions: 'bez zásahu člověka' },
    today: 'Simulované dnes',
    advance: 'Posunout čas o den',
    fast: 'Zrychlený čas',
    fastDesc: 'Posouvá den každou 1,5 s',
    timeline: 'Časová osa týdne',
    timelineHint: 'Svislá linka je dnešek. Posunem času se hýbe.',
    todayShort: 'dnes',
    viewList: 'Zobrazit jako seznam',
    viewBoard: 'Zobrazit jako kanban',
    actionsPanel: 'Automatické akce',
    actionsEmpty: 'Posuňte čas o den. Uvidíte, co systém udělá sám.',
    actionsHint: 'Připomínky, eskalace a navazující kroky.',
    owner: 'Odpovídá',
    due: 'Termín',
    dueToday: 'termín dnes',
    doneLabel: 'dokončeno',
    check: 'Označit jako hotové',
    uncheck: 'Vrátit do práce',
    autoTask: 'Z automatizace',
    emptyCol: 'Prázdné',
    remind: (p) => `Odeslána připomínka ${p}`,
    escalate: 'Eskalováno vedoucímu — termín propadl',
    start: (p) => `Úkol zařazen do práce, přiděleno ${p}`,
    doneChain: 'Dokončeno → spuštěn navazující úkol: ',
    doneToast: 'Dokončení spustilo navazující krok',
    ranTitle: (n) => `Automatizace: ${n === 1 ? '1 akce' : n <= 4 ? `${n} akce` : `${n} akcí`}`,
    quietTitle: 'Den posunut, nic k řešení',
    quietDesc: 'Žádný termín se neblíží.',
    endTitle: 'Konec simulovaného období',
    endDesc: 'Resetem začnete znovu od pondělí.',
    compactActions: [
      'Odeslána připomínka Petrovi',
      'Úkol zařazen do práce',
      'Eskalováno vedoucímu',
      'Dokončeno → spuštěn navazující krok',
    ],
  },
  en: {
    title: 'Task & process management',
    subtitle: 'The system watches deadlines, not the team lead',
    status: { wait: 'Waiting', doing: 'In progress', done: 'Done' },
    prio: { high: 'High priority', mid: 'Medium priority', low: 'Low priority' },
    source: { mail: 'from e-mail', form: 'from a form', meeting: 'from a meeting', auto: 'from automation' },
    tiles: { doing: 'In progress', late: 'Overdue', doneWeek: 'Done this week', actions: 'Automatic actions' },
    tileHints: { doing: 'with an owner', late: 'escalated to the lead', doneWeek: 'follow-ups included', actions: 'nobody touched it' },
    today: 'Simulated today',
    advance: 'Move time one day',
    fast: 'Fast-forward',
    fastDesc: 'One day every 1.5 s',
    timeline: 'Week timeline',
    timelineHint: 'The vertical line is today. It moves with time.',
    todayShort: 'today',
    viewList: 'Show as a list',
    viewBoard: 'Show as a kanban',
    actionsPanel: 'Automatic actions',
    actionsEmpty: 'Move time by a day and watch what the system does alone.',
    actionsHint: 'Reminders, escalations and follow-up steps.',
    owner: 'Owner',
    due: 'Due',
    dueToday: 'due today',
    doneLabel: 'completed',
    check: 'Mark as done',
    uncheck: 'Move back to in progress',
    autoTask: 'From automation',
    emptyCol: 'Empty',
    remind: (p) => `Reminder sent to ${p}`,
    escalate: 'Escalated to the team lead — deadline missed',
    start: (p) => `Task moved into progress, assigned to ${p}`,
    doneChain: 'Done → follow-up task started: ',
    doneToast: 'Completion started the next step',
    ranTitle: (n) => `Automation: ${n === 1 ? '1 action' : `${n} actions`}`,
    quietTitle: 'Day moved, nothing to handle',
    quietDesc: 'No deadline is close.',
    endTitle: 'End of the simulated period',
    endDesc: 'Reset to start again from Monday.',
    compactActions: [
      'Reminder sent to Petr',
      'Task moved into progress',
      'Escalated to the team lead',
      'Done → follow-up step started',
    ],
  },
}

function initials(name) {
  return String(name ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function ownerPart(name, lang, form) {
  const rec = OWNERS[name]
  if (!rec) return name
  if (lang === 'en') return rec.first
  return form === 'dative' ? rec.dative : rec.first
}

function dayDate(offset) {
  return new Date(2026, 2, 9 + offset)
}

function fmtShort(offset, lang) {
  return new Intl.DateTimeFormat(lang === 'en' ? 'en-GB' : 'cs-CZ', {
    day: 'numeric',
    month: 'numeric',
  }).format(dayDate(offset))
}

function fmtLong(offset, lang) {
  return new Intl.DateTimeFormat(lang === 'en' ? 'en-GB' : 'cs-CZ', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
  }).format(dayDate(offset))
}

function leftLabel(left, lang) {
  if (lang === 'en') {
    if (left === 0) return 'due today'
    if (left < 0) return `${-left} ${-left === 1 ? 'day' : 'days'} overdue`
    return `${left} ${left === 1 ? 'day' : 'days'} left`
  }
  if (left === 0) return 'termín dnes'
  if (left < 0) {
    const n = -left
    return `po termínu o ${n} ${n === 1 ? 'den' : n <= 4 ? 'dny' : 'dnů'}`
  }
  return `zbývá${left >= 2 && left <= 4 ? 'jí' : ''} ${left} ${left === 1 ? 'den' : left <= 4 ? 'dny' : 'dnů'}`
}

function leftTone(left, done) {
  if (done) return 'done'
  if (left < 0) return 'late'
  if (left <= 2) return 'soon'
  return 'calm'
}

const TONE_CHIP = {
  late: 'border-coral/45 bg-coral/12 text-text',
  soon: 'border-warn/45 bg-warn/14 text-text',
  calm: 'border-line bg-surface-2 text-muted',
  done: 'border-ok/40 bg-ok/12 text-text',
}

const TONE_BAR = {
  late: 'bg-coral',
  soon: 'bg-warn',
  calm: 'bg-line-strong',
  done: 'bg-ok/70',
}

const PRIO_COLOR = { high: 'text-coral', mid: 'text-warn', low: 'text-muted' }

const pct = (day) => (clamp(day, SPAN_FROM, SPAN_TO) / (SPAN_TO - SPAN_FROM)) * 100

export default function TasksDemo({ compact = false }) {
  const { lang, pick } = useT()
  const s = L[lang] ?? L.cs
  const reduced = useReducedMotion()
  const { push } = useToast()

  const [tasks, setTasks] = useState(INITIAL_TASKS)
  const [day, setDay] = useState(0)
  const [log, setLog] = useState([])
  const [view, setView] = useState('list')
  const [fast, setFast] = useState(false)

  const timers = useRef([])
  const clockRef = useRef(8 * 60 + 5)
  const after = (ms, fn) => {
    const id = setTimeout(fn, ms)
    timers.current.push(id)
  }
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const stamp = (offset) => {
    clockRef.current = 8 * 60 + ((clockRef.current - 8 * 60 + 37) % 540)
    const h = Math.floor(clockRef.current / 60)
    const m = Math.floor(clockRef.current % 60)
    return `${fmtShort(offset, lang)} ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }

  const emit = (events, offset) => {
    events.forEach((event, i) => {
      const fire = () => {
        const entry = { id: uid('act'), stamp: stamp(offset), ...event }
        setLog((list) => [entry, ...list].slice(0, 14))
      }
      if (reduced) fire()
      else after(i * 380, fire)
    })
  }

  const advance = () => {
    if (day >= MAX_DAY) {
      setFast(false)
      push({ title: s.endTitle, description: s.endDesc, variant: 'info' })
      return
    }
    const nd = day + 1
    const events = []
    const next = tasks.map((task) => {
      if (task.status === 'done') return task
      const left = task.due - nd
      const name = pick(task.title)
      let out = task

      if (left >= 0 && left <= 2 && !task.reminded) {
        out = { ...out, reminded: true }
        events.push({
          kind: 'remind',
          text: s.remind(ownerPart(task.owner, lang, 'dative')),
          detail: name,
        })
      }
      if (left < 0 && !task.escalated) {
        out = { ...out, escalated: true, prio: 'high' }
        events.push({ kind: 'escalate', text: s.escalate, detail: name })
      }
      if (out.status === 'wait' && left <= 2) {
        out = { ...out, status: 'doing' }
        events.push({ kind: 'start', text: s.start(ownerPart(task.owner, lang)), detail: name })
      }
      return out
    })

    setDay(nd)
    setTasks(next)
    emit(events, nd)
    push(
      events.length
        ? { title: s.ranTitle(events.length), description: fmtLong(nd, lang), variant: 'run' }
        : { title: s.quietTitle, description: s.quietDesc, variant: 'info' }
    )
  }

  // Interval sahá na čerstvou verzi funkce, aby neposouval den podle starého stavu.
  const advanceRef = useRef(advance)
  useEffect(() => {
    advanceRef.current = advance
  })

  useEffect(() => {
    if (!fast || reduced || compact) return
    const id = setInterval(() => advanceRef.current(), 1500)
    return () => clearInterval(id)
  }, [fast, reduced, compact])

  // Compact: čas i automatická akce běží samy, bez ovládání.
  const [tick, setTick] = useState(reduced ? 2 : 0)
  useEffect(() => {
    if (!compact || reduced) return
    const id = setInterval(() => setTick((v) => (v + 1) % 5), 1800)
    return () => clearInterval(id)
  }, [compact, reduced])

  const toggle = (task) => {
    if (task.status === 'done') {
      setTasks((list) => list.map((t) => (t.id === task.id ? { ...t, status: 'doing', doneDay: null } : t)))
      return
    }
    const follow = task.next
    const spawned = follow
      ? {
          id: uid('task'),
          title: follow,
          owner: task.nextOwner ?? task.owner,
          from: day,
          due: day + 3,
          status: 'wait',
          prio: 'mid',
          source: 'auto',
          auto: true,
        }
      : null
    setTasks((list) => {
      const updated = list.map((t) => (t.id === task.id ? { ...t, status: 'done', doneDay: day } : t))
      return spawned ? [...updated, spawned] : updated
    })
    if (follow) {
      emit([{ kind: 'done', text: `${s.doneChain}${pick(follow)}`, detail: pick(task.title) }], day)
      push({ title: s.doneToast, description: pick(follow), variant: 'success' })
    }
  }

  const stats = useMemo(() => {
    const doing = tasks.filter((t) => t.status === 'doing').length
    const late = tasks.filter((t) => t.status !== 'done' && t.due - day < 0).length
    const done = tasks.filter((t) => t.status === 'done').length
    return { doing, late, done }
  }, [tasks, day])

  const ordered = useMemo(() => {
    const rank = { doing: 0, wait: 1, done: 2 }
    return [...tasks].sort((a, b) => rank[a.status] - rank[b.status] || a.due - b.due)
  }, [tasks])

  const reset = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    clockRef.current = 8 * 60 + 5
    setTasks(INITIAL_TASKS)
    setDay(0)
    setLog([])
    setFast(false)
    setView('list')
  }

  if (compact) {
    const action = s.compactActions[tick % s.compactActions.length]
    return (
      <div className="flex h-full flex-col gap-2 overflow-hidden">
        <div className="flex items-center justify-between gap-2">
          <p className="label-mono flex items-center gap-1.5">
            <CalendarDays size={11} />
            {s.today}
          </p>
          <span className="font-mono text-[0.62rem] text-text-soft">{fmtShort(tick, lang)}</span>
        </div>

        <ul className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden hide-scrollbar">
          {COMPACT_TASKS.map((task) => {
            const left = task.due - tick
            const tone = leftTone(left, false)
            return (
              <li
                key={task.id}
                className="flex items-center gap-2 rounded-lg border border-line bg-surface-2/50 px-2 py-1.5"
              >
                <span
                  aria-hidden
                  className="grid size-5 shrink-0 place-items-center rounded-full bg-surface font-mono text-[0.52rem] font-semibold text-text-soft"
                >
                  {initials(task.owner)}
                </span>
                <p className="min-w-0 flex-1 truncate text-[0.68rem] leading-tight">{pick(task.title)}</p>
                <span
                  className={cn(
                    'shrink-0 rounded-md border px-1.5 py-0.5 font-mono text-[0.55rem]',
                    TONE_CHIP[tone]
                  )}
                >
                  {left < 0 ? `D${left}` : left === 0 ? s.todayShort : `D+${left}`}
                </span>
              </li>
            )
          })}
        </ul>

        <div className="flex items-center gap-1.5 rounded-lg border border-line bg-surface-2/60 px-2 py-1.5">
          <Zap size={11} className="shrink-0 text-accent" />
          <p className="truncate font-mono text-[0.6rem] text-text-soft">{action}</p>
        </div>
      </div>
    )
  }

  return (
    <DemoShell
      title={s.title}
      subtitle={s.subtitle}
      onReset={reset}
      live
      toolbar={
        <span className="flex items-center gap-1">
          <IconButton
            icon={List}
            label={s.viewList}
            active={view === 'list'}
            onClick={() => setView('list')}
          />
          <IconButton
            icon={LayoutGrid}
            label={s.viewBoard}
            active={view === 'board'}
            onClick={() => setView('board')}
          />
        </span>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          <StatTile label={s.tiles.doing} value={stats.doing} delta={s.tileHints.doing} icon={Clock} />
          <StatTile
            label={s.tiles.late}
            value={stats.late}
            delta={s.tileHints.late}
            tone={stats.late > 0 ? 'down' : 'neutral'}
            icon={AlertTriangle}
          />
          <StatTile
            label={s.tiles.doneWeek}
            value={stats.done}
            delta={s.tileHints.doneWeek}
            tone="up"
            icon={Check}
          />
          <StatTile
            label={s.tiles.actions}
            value={log.length}
            delta={s.tileHints.actions}
            tone={log.length > 0 ? 'up' : 'neutral'}
            icon={Zap}
          />
        </div>

        {/* ovládání času */}
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface-2/60 p-3">
          <div className="min-w-[9.5rem]">
            <p className="label-mono">{s.today}</p>
            <p className="font-mono text-[0.84rem] font-medium">
              {fmtLong(day, lang)} <span className="text-muted">· D+{day}</span>
            </p>
          </div>
          <Button size="sm" icon={FastForward} iconRight={false} onClick={advance} disabled={day >= MAX_DAY}>
            {s.advance}
          </Button>
          {!reduced && (
            <Switch checked={fast} onChange={setFast} label={s.fast} description={s.fastDesc} />
          )}
          <FakeDataNote className="ml-auto" />
        </div>

        {/* časová osa */}
        <section className="rounded-xl border border-line bg-bg-sunk/50 p-3">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <p className="label-mono flex items-center gap-1.5">
              <CalendarDays size={12} />
              {s.timeline}
            </p>
            <p className="text-[0.72rem] text-muted">{s.timelineHint}</p>
          </div>

          <div className="relative">
            <div className="flex items-center gap-2 pb-1.5">
              <span className="w-[7rem] shrink-0" />
              <div className="relative h-3 flex-1">
                {[0, 3, 6, 9, 12].map((d) => (
                  <span
                    key={d}
                    className="absolute -translate-x-1/2 font-mono text-[0.58rem] text-muted"
                    style={{ left: `${pct(d)}%` }}
                  >
                    {fmtShort(d, lang)}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex max-h-[11rem] flex-col gap-1 overflow-y-auto hide-scrollbar">
              {tasks.map((task) => {
                const done = task.status === 'done'
                const end = done ? (task.doneDay ?? task.due) : task.due
                const tone = leftTone(task.due - day, done)
                const start = pct(task.from)
                const width = Math.max(2.5, pct(Math.max(end, task.from)) - start)
                return (
                  <div key={task.id} className="flex items-center gap-2">
                    <span className="w-[7rem] shrink-0 truncate text-[0.68rem] text-text-soft">
                      {pick(task.title)}
                    </span>
                    <div className="relative h-4 flex-1 rounded-full bg-surface-2/70">
                      <span
                        aria-hidden
                        className={cn(
                          'absolute inset-y-1 rounded-full transition-all duration-500 ease-[var(--ease-out-expo)]',
                          TONE_BAR[tone],
                          done && 'opacity-70'
                        )}
                        style={{ left: `${start}%`, width: `${width}%` }}
                      />
                      <span
                        aria-hidden
                        className={cn(
                          'absolute top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full',
                          done ? 'bg-ok' : tone === 'late' ? 'bg-coral' : 'bg-text-soft'
                        )}
                        style={{ left: `${pct(end)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* linka dneška */}
            <div aria-hidden className="pointer-events-none absolute inset-y-0 left-[7.5rem] right-0">
              <div
                className="absolute inset-y-0 w-px bg-accent transition-[left] duration-500 ease-[var(--ease-out-expo)]"
                style={{ left: `${pct(day)}%` }}
              >
                <span className="absolute -top-0.5 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-accent" />
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_17.5rem]">
          {/* dva pohledy na stejná data */}
          <div className="min-w-0">
            {view === 'list' ? (
              <ul className="flex flex-col gap-1.5">
                <AnimatePresence initial={false}>
                  {ordered.map((task) => (
                    <motion.li
                      key={task.id}
                      layout={!reduced}
                      initial={reduced ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="flex items-center gap-2.5 rounded-xl border border-line bg-surface p-2.5"
                    >
                      <TaskCheck
                        done={task.status === 'done'}
                        reduced={reduced}
                        label={`${task.status === 'done' ? s.uncheck : s.check}: ${pick(task.title)}`}
                        onToggle={() => toggle(task)}
                      />
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            'truncate text-[0.84rem] font-medium leading-tight',
                            task.status === 'done' && 'text-muted line-through'
                          )}
                        >
                          {pick(task.title)}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1.5 truncate font-mono text-[0.62rem] text-muted">
                          <OwnerChip owner={task.owner} />
                          <SourceMark task={task} s={s} />
                        </p>
                      </div>
                      <Flag
                        size={12}
                        role="img"
                        aria-label={s.prio[task.prio]}
                        className={cn('shrink-0', PRIO_COLOR[task.prio])}
                      />
                      <span
                        className={cn(
                          'hidden shrink-0 rounded-lg border px-2 py-1 font-mono text-[0.62rem] sm:inline-block',
                          TONE_CHIP[leftTone(task.due - day, task.status === 'done')]
                        )}
                      >
                        {task.status === 'done'
                          ? s.doneLabel
                          : leftLabel(task.due - day, lang)}
                      </span>
                      <span className="hidden w-[5.5rem] shrink-0 text-right font-mono text-[0.62rem] text-muted lg:inline-block">
                        {s.status[task.status]}
                      </span>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            ) : (
              <div className="grid gap-2.5 sm:grid-cols-3">
                {STATUSES.map((status) => {
                  const column = ordered.filter((t) => t.status === status)
                  return (
                    <section
                      key={status}
                      aria-label={s.status[status]}
                      className={cn(
                        'flex min-h-[10rem] flex-col gap-2 rounded-xl border p-2',
                        status === 'done' ? 'border-ok/30 bg-ok/5' : 'border-line bg-surface-2/40'
                      )}
                    >
                      <div className="flex items-center gap-1.5 px-0.5">
                        <p className="label-mono truncate">{s.status[status]}</p>
                        <span className="ml-auto font-mono text-[0.62rem] tabular-nums text-muted">
                          {column.length}
                        </span>
                      </div>
                      <AnimatePresence initial={false}>
                        {column.map((task) => {
                          const tone = leftTone(task.due - day, status === 'done')
                          return (
                            <motion.article
                              key={task.id}
                              layout={!reduced}
                              initial={reduced ? false : { opacity: 0, y: 10, scale: 0.97 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                              className="rounded-lg border border-line bg-surface p-2"
                            >
                              <div className="flex items-start gap-2">
                                <TaskCheck
                                  done={status === 'done'}
                                  reduced={reduced}
                                  label={`${status === 'done' ? s.uncheck : s.check}: ${pick(task.title)}`}
                                  onToggle={() => toggle(task)}
                                />
                                <p
                                  className={cn(
                                    'min-w-0 flex-1 text-[0.75rem] font-medium leading-snug',
                                    status === 'done' && 'text-muted line-through'
                                  )}
                                >
                                  {pick(task.title)}
                                </p>
                                <Flag
                                  size={11}
                                  role="img"
                                  aria-label={s.prio[task.prio]}
                                  className={cn('mt-0.5 shrink-0', PRIO_COLOR[task.prio])}
                                />
                              </div>
                              <div className="mt-2 flex items-center gap-1.5">
                                <OwnerChip owner={task.owner} />
                                <span
                                  className={cn(
                                    'ml-auto rounded-md border px-1.5 py-0.5 font-mono text-[0.56rem]',
                                    TONE_CHIP[tone]
                                  )}
                                >
                                  {status === 'done' ? s.doneLabel : leftLabel(task.due - day, lang)}
                                </span>
                              </div>
                            </motion.article>
                          )
                        })}
                      </AnimatePresence>
                      {column.length === 0 && (
                        <p className="mt-auto px-0.5 font-mono text-[0.62rem] text-muted">{s.emptyCol}</p>
                      )}
                    </section>
                  )
                })}
              </div>
            )}
          </div>

          {/* log automatických akcí */}
          <aside className="flex flex-col rounded-xl border border-line bg-surface-2/50">
            <div className="flex items-center gap-2 border-b border-line px-3 py-2.5">
              <LiveDot tone="accent" />
              <p className="text-[0.8rem] font-semibold">{s.actionsPanel}</p>
              <Badge tone="accent" className="ml-auto">
                {log.length}
              </Badge>
            </div>
            <div
              aria-live="polite"
              className="flex max-h-[22rem] min-h-[9rem] flex-col gap-1.5 overflow-y-auto p-2.5 hide-scrollbar"
            >
              {log.length === 0 && (
                <div className="flex h-full flex-col justify-center gap-1.5 px-1">
                  <p className="text-[0.8rem] leading-snug text-text-soft">{s.actionsEmpty}</p>
                  <p className="label-mono normal-case tracking-normal">{s.actionsHint}</p>
                </div>
              )}
              <AnimatePresence initial={false}>
                {log.map((entry) => {
                  const Icon = KIND_ICON[entry.kind] ?? Zap
                  return (
                    <motion.div
                      key={entry.id}
                      layout={!reduced}
                      initial={reduced ? false : { opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="flex gap-2 rounded-lg border border-line bg-surface p-2"
                    >
                      <span aria-hidden className={cn('w-0.5 shrink-0 rounded-full', KIND_RAIL[entry.kind])} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <Icon size={11} className="shrink-0 text-muted" />
                          <span className="ml-auto font-mono text-[0.6rem] tabular-nums text-muted">
                            {entry.stamp}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[0.78rem] leading-snug">{entry.text}</p>
                        {entry.detail && (
                          <p className="mt-0.5 truncate font-mono text-[0.6rem] text-muted">{entry.detail}</p>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </aside>
        </div>
      </div>
    </DemoShell>
  )
}

function OwnerChip({ owner }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5">
      <span
        aria-hidden
        className="grid size-5 place-items-center rounded-full bg-surface-2 font-mono text-[0.52rem] font-semibold text-text-soft"
      >
        {initials(owner)}
      </span>
      <span className="max-w-[7.5rem] truncate">{owner}</span>
    </span>
  )
}

function SourceMark({ task, s }) {
  const Icon = SOURCE_ICON[task.source] ?? Mail
  return (
    <span className="inline-flex shrink-0 items-center gap-1 text-muted">
      <span aria-hidden>·</span>
      <Icon size={10} aria-hidden />
      {task.auto ? s.autoTask : s.source[task.source]}
    </span>
  )
}

function TaskCheck({ done, onToggle, label, reduced }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={done}
      aria-label={label}
      title={label}
      onClick={onToggle}
      className={cn(
        'grid size-5 shrink-0 place-items-center rounded-md border transition-colors duration-200',
        done ? 'border-ok bg-ok/15 text-ok' : 'border-line-strong text-transparent hover:border-accent'
      )}
    >
      <svg viewBox="0 0 24 24" className="size-3.5" fill="none" aria-hidden>
        <motion.path
          d="M4.5 12.5 L9.5 18 L19.5 6.5"
          stroke="currentColor"
          strokeWidth={3.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{ pathLength: done ? 1 : 0 }}
          transition={{ duration: reduced ? 0 : 0.38, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
    </button>
  )
}
