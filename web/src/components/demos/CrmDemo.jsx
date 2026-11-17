import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Ban,
  FileText,
  GripVertical,
  Keyboard,
  Mail,
  Plus,
  TrendingUp,
  Trophy,
  X,
  Zap,
} from 'lucide-react'
import { DemoShell, FakeDataNote, StatTile } from './_shell.jsx'
import { Badge, Kbd, LiveDot } from '../ui/primitives.jsx'
import { Button } from '../ui/Button.jsx'
import { Counter } from '../ui/Counter.jsx'
import { useT } from '../../lib/i18n.jsx'
import { useReducedMotion } from '../../lib/prefs.jsx'
import { useToast } from '../../lib/toast.jsx'
import { cn, czk, uid } from '../../lib/utils.js'

/**
 * Jednoduché CRM — pipeline, kde přesun karty spustí automatizaci.
 * Drag & drop je nativní HTML5, klávesová alternativa je rovnocenná cesta.
 */

const STAGES = ['new', 'contacted', 'offer', 'won']
const OPEN_STAGES = ['new', 'contacted', 'offer']

const STAGE_DOT = {
  new: 'bg-muted',
  contacted: 'bg-violet',
  offer: 'bg-warn',
  won: 'bg-accent',
  lost: 'bg-coral',
}

const STAGE_RAIL = {
  new: 'bg-line-strong',
  contacted: 'bg-violet',
  offer: 'bg-warn',
  won: 'bg-accent',
  lost: 'bg-coral',
}

const STAGE_ICON = {
  new: Plus,
  contacted: Mail,
  offer: FileText,
  won: Trophy,
  lost: Ban,
}

const INITIAL_DEALS = [
  { id: 'd1', company: 'Dřevostavby Novák s.r.o.', person: 'Petr Novák', value: 245000, since: '2026-03-12', stage: 'new' },
  { id: 'd2', company: 'Kavárna U Lípy', person: 'Jana Dvořáková', value: 68000, since: '2026-03-10', stage: 'new' },
  { id: 'd3', company: 'Zubní klinika Smile', person: 'Tomáš Beneš', value: 132000, since: '2026-03-08', stage: 'contacted' },
  { id: 'd4', company: 'Elektro Svoboda', person: 'Lucie Svobodová', value: 89500, since: '2026-03-06', stage: 'contacted' },
  { id: 'd5', company: 'Bydlet reality', person: 'Martin Horák', value: 310000, since: '2026-03-05', stage: 'offer' },
  { id: 'd6', company: 'Penzion Na Mýtině', person: 'Veronika Čermáková', value: 174000, since: '2026-03-03', stage: 'offer' },
  { id: 'd7', company: 'Autoservis Kříž', person: 'Pavel Kříž', value: 54000, since: '2026-02-28', stage: 'won' },
]

/** Předpočítané dráhy konfet — žádné Math.random za běhu. */
const CONFETTI = [
  { x: -46, y: -34, r: -40, tone: 'bg-accent' },
  { x: -22, y: -52, r: 25, tone: 'bg-violet' },
  { x: 8, y: -56, r: -15, tone: 'bg-coral' },
  { x: 34, y: -42, r: 50, tone: 'bg-accent' },
  { x: 52, y: -16, r: -30, tone: 'bg-ok' },
  { x: 44, y: 22, r: 35, tone: 'bg-violet' },
  { x: 16, y: 44, r: -55, tone: 'bg-accent' },
  { x: -14, y: 48, r: 20, tone: 'bg-coral' },
  { x: -40, y: 28, r: -25, tone: 'bg-ok' },
  { x: -54, y: 2, r: 45, tone: 'bg-accent' },
]

const L = {
  cs: {
    title: 'Jednoduché CRM · pipeline',
    subtitle: 'Přesun karty rovnou spustí automatizaci',
    stages: { new: 'Nový', contacted: 'Kontaktováno', offer: 'Nabídka', won: 'Vyhráno', lost: 'Prohráno' },
    short: { new: 'Nový', contacted: 'Kontakt', offer: 'Nabídka', won: 'Vyhráno', lost: 'Prohráno' },
    openValue: 'Otevřené obchody',
    openHint: 'případů v pipeline',
    czkSuffix: ' Kč',
    whatHappened: 'Co se právě stalo',
    logEmpty: 'Přetáhněte kartu do dalšího sloupce — nebo použijte šipky na kartě.',
    logHint: 'Každý řádek je akce, kterou by workflow udělalo samo.',
    keyboardNote: 'Lze ovládat i klávesnicí',
    add: 'Přidat kontakt',
    cancel: 'Zrušit',
    company: 'Firma',
    person: 'Kontaktní osoba',
    value: 'Hodnota v Kč',
    save: 'Založit kartu',
    today: 'dnes',
    contactLabel: 'kontakt',
    lostZone: 'Prohráno',
    lostHint: 'sem přetáhněte, co nevyšlo',
    lostEmpty: 'Zatím nic',
    moveLeft: 'Posunout o stav zpět',
    moveRight: 'Posunout o stav dál',
    moveLost: 'Označit jako prohráno',
    dragHandle: 'Přetáhnout kartu',
    empty: 'Prázdné',
    auto: {
      new: ['Karta vrácena do stavu Nový', 'Navazující úkoly pozastaveny'],
      contacted: ['Odeslán úvodní e-mail ze šablony', 'Vytvořen úkol: zavolat do 3 dnů'],
      offer: ['Vygenerována nabídka z šablony (PDF)', 'Uloženo ke kontaktu'],
      won: ['Založen projekt', 'Odesláno poděkování', 'Zapsáno do reportu'],
      lost: ['Zapsán důvod', 'Naplánován follow-up za 6 měsíců'],
    },
    toast: {
      new: 'Karta vrácena zpět',
      contacted: 'Úvodní e-mail odeslán',
      offer: 'Nabídka vygenerována',
      won: 'Obchod vyhrán',
      lost: 'Uzavřeno jako prohrané',
    },
    created: ['Nová karta založena z formuláře', 'Přiřazen vlastník: Anna'],
    createdToast: 'Karta je ve stavu Nový',
    needCompany: 'Doplňte název firmy',
    needCompanyDesc: 'Bez firmy se karta nezaloží.',
  },
  en: {
    title: 'A simple CRM · pipeline',
    subtitle: 'Moving a card fires the automation right away',
    stages: { new: 'New', contacted: 'Contacted', offer: 'Quote', won: 'Won', lost: 'Lost' },
    short: { new: 'New', contacted: 'Contact', offer: 'Quote', won: 'Won', lost: 'Lost' },
    openValue: 'Open deals',
    openHint: 'deals in the pipeline',
    czkSuffix: ' CZK',
    whatHappened: 'What just happened',
    logEmpty: 'Drag a card to the next column — or use the arrows on the card.',
    logHint: 'Every line is an action the workflow would do on its own.',
    keyboardNote: 'Keyboard works too',
    add: 'Add a contact',
    cancel: 'Cancel',
    company: 'Company',
    person: 'Contact person',
    value: 'Value in CZK',
    save: 'Create card',
    today: 'today',
    contactLabel: 'contact',
    lostZone: 'Lost',
    lostHint: 'drop here what did not work out',
    lostEmpty: 'Nothing yet',
    moveLeft: 'Move one stage back',
    moveRight: 'Move one stage forward',
    moveLost: 'Mark as lost',
    dragHandle: 'Drag the card',
    empty: 'Empty',
    auto: {
      new: ['Card returned to New', 'Follow-up tasks paused'],
      contacted: ['Intro e-mail sent from a template', 'Task created: call within 3 days'],
      offer: ['Quote generated from the template (PDF)', 'Filed against the contact'],
      won: ['Project created', 'Thank-you sent', 'Written into the report'],
      lost: ['Reason recorded', 'Follow-up scheduled in 6 months'],
    },
    toast: {
      new: 'Card moved back',
      contacted: 'Intro e-mail sent',
      offer: 'Quote generated',
      won: 'Deal won',
      lost: 'Closed as lost',
    },
    created: ['New card created from the form', 'Owner assigned: Anna'],
    createdToast: 'The card sits in New',
    needCompany: 'Fill in the company name',
    needCompanyDesc: 'Without a company the card will not be created.',
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

function fmtSince(iso, lang, s) {
  if (!iso) return s.today
  return new Intl.DateTimeFormat(lang === 'en' ? 'en-GB' : 'cs-CZ', {
    day: 'numeric',
    month: 'numeric',
  }).format(new Date(iso))
}

function clock() {
  const d = new Date()
  return [d.getHours(), d.getMinutes(), d.getSeconds()]
    .map((n) => String(n).padStart(2, '0'))
    .join(':')
}

export default function CrmDemo({ compact = false }) {
  const { lang } = useT()
  const s = L[lang] ?? L.cs
  const reduced = useReducedMotion()
  const { push } = useToast()

  const [deals, setDeals] = useState(INITIAL_DEALS)
  const [log, setLog] = useState([])
  const [dragId, setDragId] = useState(null)
  const [overStage, setOverStage] = useState(null)
  const [flash, setFlash] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState({ company: '', person: '', value: '' })
  const [freshId, setFreshId] = useState(null)

  const timers = useRef([])
  const after = (ms, fn) => {
    const id = setTimeout(fn, ms)
    timers.current.push(id)
  }
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  // Compact: jedna karta obíhá pipeline sama, bez ovládání.
  const [loopStage, setLoopStage] = useState(reduced ? 1 : 0)
  useEffect(() => {
    if (!compact || reduced) return
    const id = setInterval(() => setLoopStage((i) => (i + 1) % 3), 2200)
    return () => clearInterval(id)
  }, [compact, reduced])

  const counts = useMemo(() => {
    const out = { new: 0, contacted: 0, offer: 0, won: 0, lost: 0 }
    for (const d of deals) out[d.stage] = (out[d.stage] ?? 0) + 1
    return out
  }, [deals])

  const openValue = useMemo(
    () => deals.filter((d) => OPEN_STAGES.includes(d.stage)).reduce((sum, d) => sum + d.value, 0),
    [deals]
  )
  const openCount = useMemo(() => deals.filter((d) => OPEN_STAGES.includes(d.stage)).length, [deals])

  // Counter se neanimuje při změně propu — proto remount s `key` a rozjezd od minulé hodnoty.
  const prevOpen = useRef(0)
  useEffect(() => {
    prevOpen.current = openValue
  }, [openValue])

  const pushLog = (entry) => {
    const item = { id: uid('log'), time: clock(), ...entry }
    setLog((list) => [item, ...list].slice(0, 12))
  }

  const runAutomation = (deal, stage) => {
    const lines = s.auto[stage] ?? []
    lines.forEach((text, i) => {
      const fire = () => pushLog({ text, company: deal.company, stage })
      if (reduced) fire()
      else after(i * 430, fire)
    })
    push({
      title: s.toast[stage],
      description: deal.company,
      variant: stage === 'won' ? 'success' : stage === 'lost' ? 'warn' : 'run',
    })
    if (stage === 'won') {
      setFlash(deal.id)
      after(1600, () => setFlash((id) => (id === deal.id ? null : id)))
    }
  }

  const move = (id, stage) => {
    const deal = deals.find((d) => d.id === id)
    if (!deal || !stage || deal.stage === stage) return
    setDeals((list) => list.map((d) => (d.id === id ? { ...d, stage, since: null } : d)))
    runAutomation(deal, stage)
  }

  const step = (deal, dir) => {
    if (deal.stage === 'lost') {
      if (dir < 0) move(deal.id, 'new')
      return
    }
    const i = STAGES.indexOf(deal.stage)
    const next = STAGES[i + dir]
    if (next) move(deal.id, next)
  }

  const onDrop = (stage) => (event) => {
    event.preventDefault()
    const id = event.dataTransfer.getData('text/plain') || dragId
    setOverStage(null)
    setDragId(null)
    move(id, stage)
  }

  const dropProps = (stage) => ({
    onDragOver: (event) => {
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'
      if (overStage !== stage) setOverStage(stage)
    },
    onDragLeave: (event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOverStage((v) => (v === stage ? null : v))
    },
    onDrop: onDrop(stage),
  })

  const submit = (event) => {
    event.preventDefault()
    const company = form.company.trim()
    if (!company) {
      push({ title: s.needCompany, description: s.needCompanyDesc, variant: 'warn' })
      return
    }
    const person = form.person.trim()
    const value = Number(String(form.value).replace(/[^\d]/g, '')) || 60000
    const id = uid('deal')
    setDeals((list) => [{ id, company, person: person || '—', value, since: null, stage: 'new' }, ...list])
    setForm({ company: '', person: '', value: '' })
    setFormOpen(false)
    setFreshId(id)
    after(1800, () => setFreshId((v) => (v === id ? null : v)))
    s.created.forEach((text, i) => {
      const fire = () => pushLog({ text, company, stage: 'new' })
      if (reduced) fire()
      else after(i * 430, fire)
    })
    push({ title: s.createdToast, description: company, variant: 'info' })
  }

  const reset = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setDeals(INITIAL_DEALS)
    setLog([])
    setFlash(null)
    setFreshId(null)
    setFormOpen(false)
    setForm({ company: '', person: '', value: '' })
    prevOpen.current = 0
  }

  if (compact) {
    const lane = ['new', 'offer', 'won']
    const parked = { new: INITIAL_DEALS[1], offer: null, won: INITIAL_DEALS[6] }
    const runner = INITIAL_DEALS[0]
    const activeStage = lane[loopStage]

    return (
      <div className="flex h-full flex-col gap-2.5 overflow-hidden">
        <div className="flex items-center justify-between gap-2">
          <p className="label-mono">{s.openValue}</p>
          <p className="font-mono text-[0.72rem] text-text-soft">{czk(openValue)}</p>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-3 gap-1.5">
          {lane.map((stage) => {
            const cards = [parked[stage], activeStage === stage ? runner : null].filter(Boolean)
            return (
              <div
                key={stage}
                className={cn(
                  'flex min-h-0 flex-col gap-1.5 rounded-xl border p-1.5 transition-colors duration-500',
                  activeStage === stage ? 'border-accent/45 bg-accent/8' : 'border-line bg-surface-2/50'
                )}
              >
                <p className="label-mono flex items-center gap-1 text-[0.58rem]">
                  <span aria-hidden className={cn('size-1 rounded-full', STAGE_DOT[stage])} />
                  <span className="truncate">{s.short[stage]}</span>
                </p>
                <div className="flex min-h-0 flex-col gap-1.5 overflow-hidden hide-scrollbar">
                  <AnimatePresence initial={false}>
                    {cards.map((deal) => (
                      <motion.div
                        key={deal.id}
                        initial={reduced ? false : { opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
                        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                        className="rounded-lg border border-line bg-surface p-1.5"
                      >
                        <p className="truncate text-[0.66rem] font-semibold leading-tight">{deal.company}</p>
                        <p className="mt-0.5 font-mono text-[0.58rem] text-muted">{czk(deal.value)}</p>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex items-center gap-1.5 rounded-lg border border-line bg-surface-2/60 px-2 py-1.5">
          <Zap size={11} className="shrink-0 text-accent" />
          <p className="truncate font-mono text-[0.6rem] text-text-soft">{s.auto[activeStage][0]}</p>
        </div>
      </div>
    )
  }

  return (
    <DemoShell title={s.title} subtitle={s.subtitle} onReset={reset} live>
      <div className="flex flex-col gap-4">
        {/* souhrn pipeline */}
        <div className="grid gap-3 sm:grid-cols-[13.5rem_minmax(0,1fr)]">
          <StatTile
            label={s.openValue}
            icon={TrendingUp}
            value={
              <Counter
                key={openValue}
                from={prevOpen.current}
                to={openValue}
                duration={760}
                suffix={s.czkSuffix}
              />
            }
            delta={`${openCount} ${s.openHint}`}
          />
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-line bg-surface-2/60 p-3">
            {[...STAGES, 'lost'].map((stage) => (
              <span
                key={stage}
                className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2 py-1 font-mono text-[0.68rem]"
              >
                <span aria-hidden className={cn('size-1.5 rounded-full', STAGE_DOT[stage])} />
                <span className="text-muted">{s.stages[stage]}</span>
                <span className="tabular-nums font-medium">{counts[stage] ?? 0}</span>
              </span>
            ))}
          </div>
        </div>

        {/* ovládání */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {formOpen ? (
              <Button size="sm" variant="ghost" icon={X} iconRight={false} onClick={() => setFormOpen(false)}>
                {s.cancel}
              </Button>
            ) : (
              <Button size="sm" variant="quiet" icon={Plus} iconRight={false} onClick={() => setFormOpen(true)}>
                {s.add}
              </Button>
            )}
            <p className="label-mono flex items-center gap-1.5">
              <Keyboard size={12} />
              {s.keyboardNote}
              <Kbd>←</Kbd>
              <Kbd>→</Kbd>
            </p>
          </div>
          <FakeDataNote />
        </div>

        <AnimatePresence initial={false}>
          {formOpen && (
            <motion.form
              onSubmit={submit}
              initial={reduced ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="grid gap-2.5 rounded-xl border border-line bg-surface-2/60 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_8rem_auto]">
                <Field
                  label={s.company}
                  value={form.company}
                  onChange={(v) => setForm((f) => ({ ...f, company: v }))}
                  placeholder="Pekárna Zrno s.r.o."
                />
                <Field
                  label={s.person}
                  value={form.person}
                  onChange={(v) => setForm((f) => ({ ...f, person: v }))}
                  placeholder="Marie Králová"
                />
                <Field
                  label={s.value}
                  value={form.value}
                  onChange={(v) => setForm((f) => ({ ...f, value: v }))}
                  placeholder="120000"
                  mono
                />
                <div className="flex items-end">
                  <Button size="sm" type="submit" icon={Plus} iconRight={false} className="w-full">
                    {s.save}
                  </Button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_17.5rem]">
          <div className="flex flex-col gap-2.5">
            <div className="overflow-x-auto hide-scrollbar">
              <div className="grid min-w-[40rem] grid-cols-4 gap-2.5">
                {STAGES.map((stage) => (
                  <Column
                    key={stage}
                    s={s}
                    lang={lang}
                    stage={stage}
                    deals={deals.filter((d) => d.stage === stage)}
                    over={overStage === stage}
                    dragId={dragId}
                    flash={flash}
                    freshId={freshId}
                    reduced={reduced}
                    dropProps={dropProps(stage)}
                    onDragStartCard={setDragId}
                    onDragEndCard={() => {
                      setDragId(null)
                      setOverStage(null)
                    }}
                    onStep={step}
                    onLost={(deal) => move(deal.id, 'lost')}
                  />
                ))}
              </div>
            </div>

            {/* odlišená zóna pro prohrané obchody */}
            <div
              {...dropProps('lost')}
              className={cn(
                'rounded-xl border border-dashed p-2.5 transition-colors duration-200',
                overStage === 'lost' ? 'border-coral bg-coral/10' : 'border-line bg-bg-sunk/60'
              )}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-muted">
                  <Ban size={12} className="text-coral" />
                  {s.lostZone}
                </span>
                <span className="text-[0.72rem] text-muted">{s.lostHint}</span>
                <span className="ml-auto flex flex-wrap items-center gap-1.5">
                  {deals.filter((d) => d.stage === 'lost').length === 0 && (
                    <span className="font-mono text-[0.65rem] text-muted">{s.lostEmpty}</span>
                  )}
                  <AnimatePresence initial={false}>
                    {deals
                      .filter((d) => d.stage === 'lost')
                      .map((deal) => (
                        <motion.span
                          key={deal.id}
                          layout={!reduced}
                          initial={reduced ? false : { opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-coral/40 bg-coral/10 px-2 py-1 text-[0.72rem]"
                        >
                          <span className="max-w-[10rem] truncate">{deal.company}</span>
                          <button
                            type="button"
                            onClick={() => step(deal, -1)}
                            aria-label={`${s.moveLeft}: ${deal.company}`}
                            className="rounded p-0.5 text-muted transition hover:text-text"
                          >
                            <ArrowLeft size={11} />
                          </button>
                        </motion.span>
                      ))}
                  </AnimatePresence>
                </span>
              </div>
            </div>
          </div>

          {/* panel s automatizacemi */}
          <aside className="flex flex-col rounded-xl border border-line bg-surface-2/50">
            <div className="flex items-center gap-2 border-b border-line px-3 py-2.5">
              <LiveDot tone="accent" />
              <p className="text-[0.8rem] font-semibold">{s.whatHappened}</p>
              <Badge tone="accent" className="ml-auto">
                {log.length}
              </Badge>
            </div>
            <div
              aria-live="polite"
              className="flex max-h-[19rem] min-h-[9rem] flex-col gap-1.5 overflow-y-auto p-2.5 hide-scrollbar"
            >
              {log.length === 0 && (
                <div className="flex h-full flex-col justify-center gap-1.5 px-1">
                  <p className="text-[0.8rem] leading-snug text-text-soft">{s.logEmpty}</p>
                  <p className="label-mono normal-case tracking-normal">{s.logHint}</p>
                </div>
              )}
              <AnimatePresence initial={false}>
                {log.map((entry) => {
                  const Icon = STAGE_ICON[entry.stage] ?? Zap
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
                      <span aria-hidden className={cn('w-0.5 shrink-0 rounded-full', STAGE_RAIL[entry.stage])} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <Icon size={11} className="shrink-0 text-muted" />
                          <span className="truncate font-mono text-[0.62rem] uppercase tracking-[0.1em] text-muted">
                            {entry.company}
                          </span>
                          <span className="ml-auto font-mono text-[0.6rem] tabular-nums text-muted">{entry.time}</span>
                        </div>
                        <p className="mt-0.5 text-[0.78rem] leading-snug">{entry.text}</p>
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

function Field({ label, value, onChange, placeholder, mono }) {
  return (
    <label className="block">
      <span className="label-mono">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={cn(
          'mt-1 w-full rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[0.82rem] outline-none transition focus:border-accent',
          mono && 'font-mono text-[0.78rem]'
        )}
      />
    </label>
  )
}

function Column({
  s,
  lang,
  stage,
  deals,
  over,
  dragId,
  flash,
  freshId,
  reduced,
  dropProps,
  onDragStartCard,
  onDragEndCard,
  onStep,
  onLost,
}) {
  const Icon = STAGE_ICON[stage] ?? Zap
  const sum = deals.reduce((acc, d) => acc + d.value, 0)

  return (
    <section
      {...dropProps}
      aria-label={s.stages[stage]}
      className={cn(
        'flex min-h-[13rem] flex-col gap-2 rounded-xl border p-2 transition-colors duration-200',
        over ? 'border-dashed border-accent bg-accent/10' : 'border-line bg-surface-2/40',
        stage === 'won' && !over && 'border-accent/35'
      )}
    >
      <div className="flex items-center gap-1.5 px-0.5">
        <span aria-hidden className={cn('size-1.5 shrink-0 rounded-full', STAGE_DOT[stage])} />
        <p className="label-mono truncate">{s.stages[stage]}</p>
        <Icon size={11} className="ml-auto shrink-0 text-muted" />
      </div>
      <p className="px-0.5 font-mono text-[0.62rem] text-muted">
        {deals.length} · {czk(sum)}
      </p>

      <ul className="flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {deals.map((deal) => (
            <motion.li
              key={deal.id}
              layout={!reduced}
              initial={reduced ? false : { opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              draggable
              onDragStart={(event) => {
                event.dataTransfer.effectAllowed = 'move'
                event.dataTransfer.setData('text/plain', deal.id)
                onDragStartCard(deal.id)
              }}
              onDragEnd={onDragEndCard}
              className={cn(
                'relative rounded-xl border bg-surface p-2.5 transition-all duration-200',
                'cursor-grab active:cursor-grabbing',
                dragId === deal.id ? 'rotate-[2.5deg] border-accent/60 opacity-40' : 'border-line hover:border-line-strong',
                flash === deal.id && 'border-accent ring-2 ring-accent/60',
                freshId === deal.id && 'border-accent/70'
              )}
            >
              {flash === deal.id && !reduced && (
                <span aria-hidden className="pointer-events-none absolute inset-0">
                  {CONFETTI.map((p, i) => (
                    <motion.span
                      key={i}
                      className={cn('absolute left-1/2 top-1/2 size-1.5 rounded-[2px]', p.tone)}
                      initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
                      animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.5, rotate: p.r }}
                      transition={{ duration: 0.95, ease: 'easeOut' }}
                    />
                  ))}
                </span>
              )}

              <div className="flex items-start gap-2">
                <span
                  aria-hidden
                  className={cn(
                    'grid size-7 shrink-0 place-items-center rounded-full font-mono text-[0.6rem] font-semibold',
                    stage === 'won' ? 'bg-accent text-accent-ink' : 'bg-surface-2 text-text-soft'
                  )}
                >
                  {initials(deal.person) || initials(deal.company)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.78rem] font-semibold leading-tight">{deal.company}</p>
                  <p className="truncate text-[0.7rem] text-muted">{deal.person}</p>
                </div>
                <GripVertical size={12} aria-hidden className="mt-0.5 shrink-0 text-muted" />
              </div>

              <div className="mt-2 flex items-center justify-between gap-1.5">
                <span className="font-mono text-[0.72rem] font-medium tabular-nums">{czk(deal.value)}</span>
                <span className="font-mono text-[0.6rem] text-muted">
                  {s.contactLabel} {fmtSince(deal.since, lang, s)}
                </span>
              </div>

              <div className="mt-2 flex items-center gap-1 border-t border-line pt-2">
                <CardButton
                  label={`${s.moveLeft}: ${deal.company}`}
                  onClick={() => onStep(deal, -1)}
                  disabled={stage === 'new'}
                >
                  <ArrowLeft size={12} />
                </CardButton>
                <CardButton
                  label={`${s.moveRight}: ${deal.company}`}
                  onClick={() => onStep(deal, 1)}
                  disabled={stage === 'won'}
                >
                  <ArrowRight size={12} />
                </CardButton>
                <CardButton
                  label={`${s.moveLost}: ${deal.company}`}
                  onClick={() => onLost(deal)}
                  className="ml-auto hover:border-coral/60 hover:text-coral"
                >
                  <Ban size={11} />
                </CardButton>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      {deals.length === 0 && (
        <p className="mt-auto px-0.5 font-mono text-[0.62rem] text-muted">{s.empty}</p>
      )}
    </section>
  )
}

function CardButton({ children, label, onClick, disabled, className }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        'grid size-6 place-items-center rounded-lg border border-line text-text-soft transition',
        'hover:border-accent/60 hover:text-text disabled:pointer-events-none disabled:opacity-35',
        className
      )}
    >
      {children}
    </button>
  )
}
