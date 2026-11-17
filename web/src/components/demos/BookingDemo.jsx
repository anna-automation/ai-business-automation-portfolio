import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  CalendarCheck,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  GraduationCap,
  Loader2,
  Mail,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Workflow,
} from 'lucide-react'
import { DemoShell, FakeDataNote, StepTrail } from './_shell.jsx'
import { Badge } from '../ui/primitives.jsx'
import { Button } from '../ui/Button.jsx'
import { cn, czk, formatDate } from '../../lib/utils.js'
import { useT } from '../../lib/i18n.jsx'
import { useReducedMotion } from '../../lib/prefs.jsx'

/**
 * Rezervační kalendář. Obsazenost je odvozená z data (FNV hash), ne z Math.random,
 * aby při každém překreslení zůstala stejná.
 */

const CS_MONTHS = [
  'leden',
  'únor',
  'březen',
  'duben',
  'květen',
  'červen',
  'červenec',
  'srpen',
  'září',
  'říjen',
  'listopad',
  'prosinec',
]
const CS_MONTHS_GEN = [
  'ledna',
  'února',
  'března',
  'dubna',
  'května',
  'června',
  'července',
  'srpna',
  'září',
  'října',
  'listopadu',
  'prosince',
]
const EN_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
const CS_DAYS_SHORT = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne']
const EN_DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const CS_WEEKDAYS = ['pondělí', 'úterý', 'středa', 'čtvrtek', 'pátek', 'sobota', 'neděle']
const EN_WEEKDAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

const DAY_START = 9 * 60
const DAY_END = 17 * 60

const TYPES = [
  {
    id: 'consult',
    icon: MessageSquare,
    minutes: 30,
    price: 0,
    name: { cs: 'Konzultace 30 min', en: 'Consultation 30 min' },
    desc: {
      cs: 'Projdeme, co vás zdržuje, a řekneme si, co má smysl automatizovat.',
      en: 'We go through what slows you down and what is worth automating.',
    },
  },
  {
    id: 'analysis',
    icon: Workflow,
    minutes: 90,
    price: 4500,
    name: { cs: 'Analýza procesů 90 min', en: 'Process analysis 90 min' },
    desc: {
      cs: 'Rozkreslíme váš proces krok za krokem a označíme místa pro robota.',
      en: 'We map your process step by step and mark the spots for a robot.',
    },
  },
  {
    id: 'training',
    icon: GraduationCap,
    minutes: 480,
    price: 24000,
    name: { cs: 'Školení na míru 1 den', en: 'Custom training, 1 day' },
    desc: {
      cs: 'Celý den s týmem nad vašimi vlastními daty a nástroji.',
      en: 'A full day with your team, your data and your tools.',
    },
  },
]

const PEOPLE = [
  {
    id: 'anna',
    initials: 'AN',
    name: 'Anna Nováková',
    role: { cs: 'automatizace a procesy', en: 'automation & processes' },
  },
  {
    id: 'petr',
    initials: 'PK',
    name: 'Petr Kadlec',
    role: { cs: 'nasazení a provoz', en: 'deployment & operations' },
  },
]

const LOG = [
  { id: 'cal', icon: CalendarCheck },
  { id: 'mail', icon: Mail },
  { id: 'crm', icon: UserPlus },
  { id: 'reminder', icon: Bell },
]

const L = {
  cs: {
    title: 'Rezervace termínu',
    subtitle: 'Vyberete čas, na pozadí se rozběhne automatizace',
    steps: ['Typ', 'Pracovník', 'Termín', 'Údaje', 'Hotovo'],
    step1: 'Co si chcete rezervovat?',
    step2: 'S kým?',
    step3: 'Kdy vám to vyhovuje?',
    step4: 'Kam vám pošleme potvrzení?',
    free: 'zdarma',
    minutes: 'min',
    fullDay: 'celý den',
    anyone: 'Kdokoliv první volný',
    anyoneRole: 'přiřadíme podle obsazenosti',
    assigned: 'Přiděleno',
    pickDay: 'Vyberte den v kalendáři',
    slotsFor: 'Volné časy',
    noSlots: 'Tento den je plný. Zkuste jiný.',
    weekendNote: 'O víkendu se nerezervuje.',
    legendFree: 'volno',
    legendFull: 'obsazeno',
    legendClosed: 'zavřeno',
    today: 'dnes',
    prevMonth: 'Předchozí měsíc',
    nextMonth: 'Další měsíc',
    name: 'Jméno a firma',
    namePh: 'Jana Dvořáková, Pekárna Kvásek s.r.o.',
    email: 'E-mail',
    emailPh: 'jana.dvorakova@kvasek.cz',
    phone: 'Telefon',
    phonePh: '+420 777 123 456',
    note: 'Poznámka',
    notePh: 'Co bychom měli vědět dopředu…',
    optional: 'nepovinné',
    errRequired: 'Tohle pole je potřeba vyplnit.',
    errShort: 'Napište prosím celé jméno.',
    errEmail: 'E-mail nemá správný formát — zkontrolujte zavináč a tečku.',
    errPhone: 'Telefon zadejte jako +420 777 123 456.',
    book: 'Rezervovat termín',
    booking: 'Zapisuji…',
    doneTitle: 'Termín je rezervovaný',
    doneSub: 'A tohle se stalo bez jediného dalšího kliknutí:',
    behind: 'Co běží na pozadí',
    logCal: 'Termín zapsán do Google Calendar',
    logMail: 'Potvrzení odesláno na e-mail',
    logCrm: 'Kontakt založen v CRM',
    logReminder: 'Připomínka naplánována na den předem (24 h)',
    running: 'běží',
    again: 'Rezervovat další termín',
    summary: 'Souhrn rezervace',
    sumWhat: 'Schůzka',
    sumWho: 'Pracovník',
    sumWhen: 'Termín',
    sumContact: 'Kontakt',
    reminderAt: 'Připomínka',
    at: 'v',
    safe: 'Nic se neodesílá — rezervace zůstává v prohlížeči.',
    compactMonth: 'Volné termíny',
    compactSlots: 'Nejbližší časy',
  },
  en: {
    title: 'Book a slot',
    subtitle: 'You pick a time — the automation starts behind the scenes',
    steps: ['Type', 'Person', 'Slot', 'Details', 'Done'],
    step1: 'What would you like to book?',
    step2: 'Who with?',
    step3: 'When does it suit you?',
    step4: 'Where do we send the confirmation?',
    free: 'free',
    minutes: 'min',
    fullDay: 'full day',
    anyone: 'Anyone available first',
    anyoneRole: 'assigned by availability',
    assigned: 'Assigned to',
    pickDay: 'Pick a day in the calendar',
    slotsFor: 'Available times',
    noSlots: 'This day is full. Try another one.',
    weekendNote: 'No bookings on weekends.',
    legendFree: 'free',
    legendFull: 'booked',
    legendClosed: 'closed',
    today: 'today',
    prevMonth: 'Previous month',
    nextMonth: 'Next month',
    name: 'Name and company',
    namePh: 'Jana Dvořáková, Pekárna Kvásek s.r.o.',
    email: 'E-mail',
    emailPh: 'jana.dvorakova@kvasek.cz',
    phone: 'Phone',
    phonePh: '+420 777 123 456',
    note: 'Note',
    notePh: 'Anything we should know upfront…',
    optional: 'optional',
    errRequired: 'This field needs to be filled in.',
    errShort: 'Please write your full name.',
    errEmail: 'The e-mail format is off — check the @ and the dot.',
    errPhone: 'Use the format +420 777 123 456.',
    book: 'Book the slot',
    booking: 'Writing it down…',
    doneTitle: 'The slot is booked',
    doneSub: 'And all of this happened without a single extra click:',
    behind: 'Running behind the scenes',
    logCal: 'Slot written into Google Calendar',
    logMail: 'Confirmation sent by e-mail',
    logCrm: 'Contact created in the CRM',
    logReminder: 'Reminder scheduled for the day before (24 h)',
    running: 'running',
    again: 'Book another slot',
    summary: 'Booking summary',
    sumWhat: 'Meeting',
    sumWho: 'Person',
    sumWhen: 'Slot',
    sumContact: 'Contact',
    reminderAt: 'Reminder',
    at: 'at',
    safe: 'Nothing is sent — the booking stays in your browser.',
    compactMonth: 'Open slots',
    compactSlots: 'Next times',
  },
}

/** FNV-1a → stabilní číslo 0–1 pro daný klíč. */
function seed(key) {
  let h = 2166136261
  for (let i = 0; i < key.length; i += 1) {
    h ^= key.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 10000) / 10000
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

function dayKey(date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

function fmtTime(minutes) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}:${String(m).padStart(2, '0')}`
}

function monthTitle(date, lang) {
  if (lang === 'en') return `${EN_MONTHS[date.getMonth()]} ${date.getFullYear()}`
  const name = CS_MONTHS[date.getMonth()]
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${date.getFullYear()}`
}

function longDate(date, lang) {
  const weekday = (date.getDay() + 6) % 7
  if (lang === 'en') {
    return `${EN_WEEKDAYS[weekday]}, ${date.getDate()} ${EN_MONTHS[date.getMonth()]} ${date.getFullYear()}`
  }
  return `${CS_WEEKDAYS[weekday]} ${date.getDate()}. ${CS_MONTHS_GEN[date.getMonth()]} ${date.getFullYear()}`
}

/** Mřížka měsíce s pondělím na začátku; doplněná prázdnými buňkami. */
function monthGrid(year, month) {
  const first = new Date(year, month, 1)
  const offset = (first.getDay() + 6) % 7
  const length = new Date(year, month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < offset; i += 1) cells.push(null)
  for (let d = 1; d <= length; d += 1) cells.push(new Date(year, month, d))
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

function slotsFor(date, type, personId) {
  if (!date) return []
  const key = dayKey(date)
  const owners = personId === 'any' ? PEOPLE.map((p) => p.id) : [personId]
  const step = type.minutes >= DAY_END - DAY_START ? type.minutes : type.minutes === 30 ? 60 : 90
  // Část dní je plná celá — jinak by kalendář vypadal podezřele prázdně.
  const available = owners.filter((o) => seed(`${key}|load|${o}`) >= 0.16)
  const out = []

  for (let m = DAY_START; m + type.minutes <= DAY_END; m += step) {
    const label = fmtTime(m)
    const freeOwners = available.filter((o) => seed(`${key}|${label}|${o}`) > 0.38)
    out.push({
      id: label,
      start: m,
      end: m + type.minutes,
      busy: freeOwners.length === 0,
      owner: freeOwners[0] ?? null,
    })
  }
  return out
}

function dayState(date, type, personId, today) {
  if (!date) return null
  const past = startOfDay(date) < today
  const weekend = date.getDay() === 0 || date.getDay() === 6
  const slots = past || weekend ? [] : slotsFor(date, type, personId)
  const free = slots.filter((slot) => !slot.busy).length
  return {
    past,
    weekend,
    slots,
    free,
    full: !past && !weekend && free === 0,
    today: startOfDay(date) === today,
  }
}

function Avatar({ initials, tone = 'accent', size = 'md' }) {
  return (
    <span
      aria-hidden
      className={cn(
        'grid shrink-0 place-items-center rounded-full font-mono font-semibold',
        size === 'sm' ? 'size-6 text-[0.6rem]' : 'size-8 text-[0.68rem]',
        tone === 'accent' ? 'bg-accent/18 text-text' : 'bg-violet/18 text-text'
      )}
    >
      {initials}
    </span>
  )
}

function Field({ label, hint, error, children }) {
  return (
    <label className="block">
      <span className="label-mono flex items-center justify-between gap-2">
        {label}
        {hint && <span className="normal-case tracking-normal text-muted/80">{hint}</span>}
      </span>
      <span className="mt-1.5 block">{children}</span>
      <AnimatePresence initial={false}>
        {error && (
          <motion.span
            initial={{ opacity: 0, y: -3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            className="mt-1 block text-[0.74rem] text-coral"
          >
            {error}
          </motion.span>
        )}
      </AnimatePresence>
    </label>
  )
}

const INPUT_CLASS =
  'w-full rounded-xl border bg-surface px-3 py-2 text-[0.86rem] outline-none transition placeholder:text-muted/70 focus:border-accent'

export default function BookingDemo({ compact = false }) {
  const { t, lang } = useT()
  const s = L[lang] ?? L.cs
  const reduced = useReducedMotion()

  const today = useMemo(() => startOfDay(new Date()), [])
  const [monthOffset, setMonthOffset] = useState(0)
  const [step, setStep] = useState(0)
  const [typeId, setTypeId] = useState(null)
  const [personId, setPersonId] = useState(null)
  const [date, setDate] = useState(null)
  const [slotId, setSlotId] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', note: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [logDone, setLogDone] = useState(0)
  const [tick, setTick] = useState(0)

  const submitTimer = useRef(null)
  useEffect(() => () => clearTimeout(submitTimer.current), [])

  const type = TYPES.find((item) => item.id === typeId) ?? TYPES[0]
  const person = PEOPLE.find((item) => item.id === personId) ?? null

  const viewMonth = useMemo(() => {
    const base = new Date()
    return new Date(base.getFullYear(), base.getMonth() + monthOffset, 1)
  }, [monthOffset])

  const cells = useMemo(
    () => monthGrid(viewMonth.getFullYear(), viewMonth.getMonth()),
    [viewMonth]
  )

  const selectedState = useMemo(
    () => (date ? dayState(date, type, personId ?? 'any', today) : null),
    [date, type, personId, today]
  )

  const slot = selectedState?.slots.find((item) => item.id === slotId) ?? null

  // Náhled v bento kartě: aktuální měsíc a tři nejbližší volné časy.
  const preview = useMemo(() => {
    const base = new Date()
    const grid = monthGrid(base.getFullYear(), base.getMonth())
    const states = grid.map((cell) => dayState(cell, TYPES[0], 'any', today))
    const index = states.findIndex((st) => st && !st.past && !st.weekend && st.free > 0)
    const slots =
      index >= 0 ? states[index].slots.filter((item) => !item.busy).slice(0, 3) : []
    return { month: base, grid, states, slots }
  }, [today])

  // Řádky na pozadí naskakují jeden po druhém, až když je rezervace hotová.
  useEffect(() => {
    if (!done) return
    if (reduced) {
      setLogDone(LOG.length)
      return
    }
    setLogDone(0)
    const timers = LOG.map((_, i) =>
      setTimeout(() => setLogDone(i + 1), 520 + i * 620)
    )
    return () => timers.forEach(clearTimeout)
  }, [done, reduced])

  // Compact karta: jeden slot se rezervuje sám ve smyčce.
  useEffect(() => {
    if (!compact || reduced) return
    const id = setInterval(() => setTick((value) => value + 1), 1000)
    return () => clearInterval(id)
  }, [compact, reduced])

  const validate = (key, value) => {
    const text = String(value ?? '').trim()
    if (key === 'name') {
      if (!text) return s.errRequired
      if (text.length < 3) return s.errShort
      return ''
    }
    if (key === 'email') {
      if (!text) return s.errRequired
      if (!/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(text)) return s.errEmail
      return ''
    }
    if (key === 'phone') {
      if (!text) return s.errRequired
      if (!/^\+?[\d ]{9,17}$/.test(text)) return s.errPhone
      return ''
    }
    return ''
  }

  const onBlur = (key) => () => setErrors((prev) => ({ ...prev, [key]: validate(key, form[key]) }))

  const setField = (key) => (event) => {
    const { value } = event.target
    setForm((prev) => ({ ...prev, [key]: value }))
    // Chybu smažeme hned, jak se pole opraví; novou hlásíme až na blur.
    setErrors((prev) => (prev[key] ? { ...prev, [key]: validate(key, value) } : prev))
  }

  const canContinue =
    (step === 0 && typeId) ||
    (step === 1 && personId) ||
    (step === 2 && slot) ||
    (step === 3 &&
      !validate('name', form.name) &&
      !validate('email', form.email) &&
      !validate('phone', form.phone))

  const goNext = () => {
    if (step < 3) {
      setStep((value) => value + 1)
      return
    }
    const next = {
      name: validate('name', form.name),
      email: validate('email', form.email),
      phone: validate('phone', form.phone),
    }
    setErrors(next)
    if (next.name || next.email || next.phone) return

    setSubmitting(true)
    clearTimeout(submitTimer.current)
    submitTimer.current = setTimeout(() => {
      setSubmitting(false)
      setDone(true)
    }, 760)
  }

  const goTo = (index) => {
    if (index > (done ? 4 : step)) return
    setDone(false)
    setStep(Math.min(index, 3))
  }

  const onReset = () => {
    clearTimeout(submitTimer.current)
    setStep(0)
    setTypeId(null)
    setPersonId(null)
    setDate(null)
    setSlotId(null)
    setForm({ name: '', email: '', phone: '', note: '' })
    setErrors({})
    setSubmitting(false)
    setDone(false)
    setLogDone(0)
    setMonthOffset(0)
  }

  /* ---------------------------------------------------------------- compact */
  if (compact) {
    const compactSlots = preview.slots
    const phase = tick % 5
    const active = compactSlots.length ? Math.floor(tick / 5) % compactSlots.length : -1

    return (
      <div className="hide-scrollbar flex h-full flex-col gap-2.5 overflow-hidden">
        <div className="flex items-center justify-between gap-2">
          <p className="label-mono">{monthTitle(preview.month, lang)}</p>
          <span className="label-mono text-text-soft">{s.compactMonth}</span>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {(lang === 'en' ? EN_DAYS_SHORT : CS_DAYS_SHORT).map((d) => (
            <span key={d} className="font-mono text-[0.52rem] uppercase text-muted">
              {d}
            </span>
          ))}
          {preview.grid.map((cell, i) => {
            const state = preview.states[i]
            const free = state && !state.past && !state.weekend && state.free > 0
            return (
              <span
                key={cell ? dayKey(cell) : `pad-${i}`}
                className={cn(
                  'grid aspect-square place-items-center rounded-[5px] font-mono text-[0.55rem] leading-none',
                  !cell && 'opacity-0',
                  cell && state?.past && 'text-muted/45',
                  cell && !state?.past && !free && 'text-muted/70',
                  free && 'bg-accent/18 text-text',
                  state?.today && 'ring-1 ring-accent'
                )}
              >
                {cell ? cell.getDate() : ''}
              </span>
            )
          })}
        </div>

        <div className="mt-auto flex gap-1.5" aria-live="polite">
          {compactSlots.map((item, i) => {
            const pending = i === active && phase === 1
            const booked = i === active && (phase === 2 || phase === 3)
            return (
              <span
                key={item.id}
                className={cn(
                  'flex flex-1 items-center justify-center gap-1 rounded-lg border px-1 py-1.5 font-mono text-[0.62rem] transition-colors duration-300',
                  booked
                    ? 'border-accent bg-accent/15 text-text'
                    : pending
                      ? 'border-accent/50 bg-surface-2 text-text-soft'
                      : 'border-line bg-surface-2/60 text-text-soft'
                )}
              >
                {pending && <Loader2 size={9} className="animate-spin" />}
                {booked && <Check size={9} className="text-accent" />}
                {item.id}
              </span>
            )
          })}
        </div>
      </div>
    )
  }

  /* ------------------------------------------------------------------- plná */
  const current = done ? 4 : step
  const stepTrans = reduced ? { duration: 0 } : { duration: 0.28 }
  const logLabels = [s.logCal, s.logMail, s.logCrm, s.logReminder]
  const reminderDate = date ? new Date(date.getTime() - 24 * 60 * 60 * 1000) : null
  const assignedPerson =
    personId === 'any' ? (PEOPLE.find((p) => p.id === slot?.owner) ?? PEOPLE[0]) : person

  return (
    <DemoShell title={s.title} subtitle={s.subtitle} live onReset={onReset}>
      {/* kroky */}
      <nav aria-label={s.title}>
        <ol className="hide-scrollbar flex items-center gap-1 overflow-x-auto">
          {s.steps.map((label, i) => {
            const state = i < current ? 'done' : i === current ? 'active' : 'todo'
            const clickable = i < current
            return (
              <li key={label} className="flex min-w-0 flex-1 items-center">
                <button
                  type="button"
                  disabled={!clickable}
                  onClick={() => goTo(i)}
                  className={cn(
                    'flex w-full items-center gap-1.5 rounded-lg px-1 py-1 text-left transition',
                    clickable ? 'hover:bg-surface-2' : 'cursor-default'
                  )}
                >
                  <span
                    className={cn(
                      'grid size-[1.15rem] shrink-0 place-items-center rounded-full font-mono text-[0.58rem] transition-colors duration-300',
                      state === 'done' && 'bg-accent text-accent-ink',
                      state === 'active' && 'border border-accent text-text',
                      state === 'todo' && 'border border-line text-muted'
                    )}
                  >
                    {state === 'done' ? <Check size={10} strokeWidth={3} /> : i + 1}
                  </span>
                  <span
                    className={cn(
                      'truncate font-mono text-[0.62rem] uppercase tracking-[0.1em]',
                      state === 'todo' ? 'text-muted' : 'text-text-soft'
                    )}
                  >
                    {label}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
        <StepTrail steps={s.steps} current={current} className="mt-1.5" />
      </nav>

      {/* zvolené volby jako drobečky */}
      {(typeId || personId || slot) && !done && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {typeId && (
            <Badge tone="neutral">{type.name[lang] ?? type.name.cs}</Badge>
          )}
          {personId && (
            <Badge tone="neutral">
              {personId === 'any' ? s.anyone : person?.name}
            </Badge>
          )}
          {slot && date && (
            <Badge tone="accent" dot>
              {longDate(date, lang)} · {fmtTime(slot.start)}
            </Badge>
          )}
        </div>
      )}

      <div className="mt-4">
        <AnimatePresence mode="wait">
          {/* 1 — typ schůzky */}
          {!done && step === 0 && (
            <motion.div
              key="type"
              initial={reduced ? { opacity: 0 } : { opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, x: -12 }}
              transition={stepTrans}
            >
              <p className="text-[0.95rem] font-semibold">{s.step1}</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {TYPES.map((item) => {
                  const Icon = item.icon
                  const active = item.id === typeId
                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => {
                        setTypeId(item.id)
                        setSlotId(null)
                      }}
                      className={cn(
                        'rounded-xl border p-3 text-left transition-all duration-300 ease-[var(--ease-out-expo)]',
                        active
                          ? 'border-accent bg-accent/10'
                          : 'border-line bg-surface-2/50 hover:border-line-strong'
                      )}
                    >
                      <span className="flex items-center justify-between">
                        <Icon size={16} className={active ? 'text-text' : 'text-muted'} />
                        <span className="font-mono text-[0.62rem] uppercase tracking-[0.1em] text-muted">
                          {item.minutes >= 480
                            ? s.fullDay
                            : `${item.minutes} ${s.minutes}`}
                        </span>
                      </span>
                      <span className="mt-2 block text-[0.88rem] font-semibold leading-tight">
                        {item.name[lang] ?? item.name.cs}
                      </span>
                      <span className="mt-1 block text-[0.74rem] leading-snug text-muted">
                        {item.desc[lang] ?? item.desc.cs}
                      </span>
                      <span className="mt-2 block font-mono text-[0.72rem] text-text-soft">
                        {item.price === 0 ? s.free : czk(item.price)}
                      </span>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* 2 — pracovník */}
          {!done && step === 1 && (
            <motion.div
              key="person"
              initial={reduced ? { opacity: 0 } : { opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, x: -12 }}
              transition={stepTrans}
            >
              <p className="text-[0.95rem] font-semibold">{s.step2}</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {PEOPLE.map((item, i) => {
                  const active = item.id === personId
                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => {
                        setPersonId(item.id)
                        setSlotId(null)
                      }}
                      className={cn(
                        'flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all duration-300',
                        active
                          ? 'border-accent bg-accent/10'
                          : 'border-line bg-surface-2/50 hover:border-line-strong'
                      )}
                    >
                      <Avatar initials={item.initials} tone={i === 0 ? 'accent' : 'violet'} />
                      <span className="min-w-0">
                        <span className="block truncate text-[0.86rem] font-semibold">
                          {item.name}
                        </span>
                        <span className="block truncate text-[0.73rem] text-muted">
                          {item.role[lang] ?? item.role.cs}
                        </span>
                      </span>
                    </button>
                  )
                })}
                <button
                  type="button"
                  aria-pressed={personId === 'any'}
                  onClick={() => {
                    setPersonId('any')
                    setSlotId(null)
                  }}
                  className={cn(
                    'flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all duration-300',
                    personId === 'any'
                      ? 'border-accent bg-accent/10'
                      : 'border-line bg-surface-2/50 hover:border-line-strong'
                  )}
                >
                  <span
                    aria-hidden
                    className="grid size-8 shrink-0 place-items-center rounded-full bg-surface-2 text-muted"
                  >
                    <Sparkles size={15} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[0.86rem] font-semibold">{s.anyone}</span>
                    <span className="block truncate text-[0.73rem] text-muted">
                      {s.anyoneRole}
                    </span>
                  </span>
                </button>
              </div>
            </motion.div>
          )}

          {/* 3 — kalendář a časy */}
          {!done && step === 2 && (
            <motion.div
              key="slot"
              initial={reduced ? { opacity: 0 } : { opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, x: -12 }}
              transition={stepTrans}
            >
              <p className="text-[0.95rem] font-semibold">{s.step3}</p>

              <div className="mt-3 grid gap-4 md:grid-cols-[minmax(0,19rem)_minmax(0,1fr)]">
                <div className="rounded-xl border border-line bg-surface-2/40 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      aria-label={s.prevMonth}
                      disabled={monthOffset <= 0}
                      onClick={() => setMonthOffset((value) => Math.max(0, value - 1))}
                      className="grid size-7 place-items-center rounded-lg border border-line text-muted transition hover:border-line-strong hover:text-text disabled:opacity-35"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <p className="font-display text-[0.92rem] font-semibold">
                      {monthTitle(viewMonth, lang)}
                    </p>
                    <button
                      type="button"
                      aria-label={s.nextMonth}
                      onClick={() => setMonthOffset((value) => value + 1)}
                      className="grid size-7 place-items-center rounded-lg border border-line text-muted transition hover:border-line-strong hover:text-text"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  <div className="mt-3 grid grid-cols-7 gap-1 text-center">
                    {(lang === 'en' ? EN_DAYS_SHORT : CS_DAYS_SHORT).map((d) => (
                      <span key={d} className="label-mono justify-center text-[0.58rem]">
                        {d}
                      </span>
                    ))}
                    {cells.map((cell, i) => {
                      if (!cell) return <span key={`pad-${i}`} aria-hidden />
                      const state = dayState(cell, type, personId ?? 'any', today)
                      const disabled = state.past || state.weekend || state.full
                      const selected = date && startOfDay(date) === startOfDay(cell)
                      return (
                        <button
                          key={dayKey(cell)}
                          type="button"
                          disabled={disabled}
                          aria-pressed={!!selected}
                          aria-label={`${longDate(cell, lang)} — ${
                            disabled
                              ? state.weekend
                                ? s.legendClosed
                                : s.legendFull
                              : `${state.free} × ${s.legendFree}`
                          }`}
                          onClick={() => {
                            setDate(cell)
                            setSlotId(null)
                          }}
                          className={cn(
                            'relative grid aspect-square place-items-center rounded-lg font-mono text-[0.72rem] transition-all duration-200',
                            selected && 'bg-accent text-accent-ink',
                            !selected && !disabled && 'bg-surface text-text hover:bg-accent/15',
                            !selected && disabled && 'text-muted/45',
                            state.full && !selected && 'line-through decoration-coral/60',
                            state.today && !selected && 'ring-1 ring-accent/70'
                          )}
                        >
                          {cell.getDate()}
                          {!disabled && !selected && (
                            <span
                              aria-hidden
                              className="absolute bottom-1 size-1 rounded-full bg-accent"
                            />
                          )}
                        </button>
                      )
                    })}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 border-t border-line pt-2">
                    <span className="label-mono flex items-center gap-1.5">
                      <span aria-hidden className="size-1.5 rounded-full bg-accent" />
                      {s.legendFree}
                    </span>
                    <span className="label-mono flex items-center gap-1.5">
                      <span aria-hidden className="size-1.5 rounded-full bg-coral/70" />
                      {s.legendFull}
                    </span>
                    <span className="label-mono flex items-center gap-1.5">
                      <span aria-hidden className="size-1.5 rounded-full bg-line-strong" />
                      {s.legendClosed}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="label-mono flex items-center gap-1.5">
                    <Clock size={12} />
                    {s.slotsFor}
                    {date && <span className="normal-case tracking-normal">· {longDate(date, lang)}</span>}
                  </p>

                  {!date && (
                    <p className="mt-2 rounded-xl border border-dashed border-line bg-surface-2/40 p-4 text-center text-[0.82rem] text-muted">
                      {s.pickDay}
                    </p>
                  )}

                  {date && selectedState && selectedState.slots.length === 0 && (
                    <p className="mt-2 text-[0.82rem] text-muted">
                      {selectedState.weekend ? s.weekendNote : s.noSlots}
                    </p>
                  )}

                  {date && selectedState && selectedState.slots.length > 0 && (
                    <>
                      <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                        {selectedState.slots.map((item) => {
                          const active = item.id === slotId
                          return (
                            <button
                              key={item.id}
                              type="button"
                              disabled={item.busy}
                              aria-pressed={active}
                              onClick={() => setSlotId(item.id)}
                              className={cn(
                                'rounded-xl border px-2 py-2 font-mono text-[0.76rem] transition-all duration-200',
                                active && 'border-accent bg-accent text-accent-ink',
                                !active &&
                                  !item.busy &&
                                  'border-line bg-surface hover:border-accent/60',
                                item.busy &&
                                  'border-line bg-surface-2/50 text-muted/50 line-through'
                              )}
                            >
                              {fmtTime(item.start)}
                              <span className="opacity-70">–{fmtTime(item.end)}</span>
                            </button>
                          )
                        })}
                      </div>
                      {slot && personId === 'any' && slot.owner && (
                        <p className="mt-2 flex items-center gap-2 text-[0.78rem] text-text-soft">
                          <Avatar
                            size="sm"
                            initials={PEOPLE.find((p) => p.id === slot.owner)?.initials ?? 'AN'}
                          />
                          {s.assigned}: {PEOPLE.find((p) => p.id === slot.owner)?.name}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* 4 — údaje */}
          {!done && step === 3 && (
            <motion.div
              key="details"
              initial={reduced ? { opacity: 0 } : { opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, x: -12 }}
              transition={stepTrans}
            >
              <p className="text-[0.95rem] font-semibold">{s.step4}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Field label={s.name} error={errors.name}>
                  <input
                    type="text"
                    value={form.name}
                    onChange={setField('name')}
                    onBlur={onBlur('name')}
                    placeholder={s.namePh}
                    aria-invalid={!!errors.name}
                    className={cn(INPUT_CLASS, errors.name ? 'border-coral' : 'border-line')}
                  />
                </Field>
                <Field label={s.email} error={errors.email}>
                  <input
                    type="email"
                    value={form.email}
                    onChange={setField('email')}
                    onBlur={onBlur('email')}
                    placeholder={s.emailPh}
                    aria-invalid={!!errors.email}
                    className={cn(INPUT_CLASS, errors.email ? 'border-coral' : 'border-line')}
                  />
                </Field>
                <Field label={s.phone} error={errors.phone}>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={setField('phone')}
                    onBlur={onBlur('phone')}
                    placeholder={s.phonePh}
                    aria-invalid={!!errors.phone}
                    className={cn(INPUT_CLASS, errors.phone ? 'border-coral' : 'border-line')}
                  />
                </Field>
                <Field label={s.note} hint={s.optional}>
                  <textarea
                    rows={2}
                    value={form.note}
                    onChange={setField('note')}
                    placeholder={s.notePh}
                    className={cn(INPUT_CLASS, 'resize-none border-line')}
                  />
                </Field>
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-[0.76rem] text-muted">
                <ShieldCheck size={12} />
                {s.safe}
              </p>
            </motion.div>
          )}

          {/* 5 — potvrzení */}
          {done && (
            <motion.div
              key="done"
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={stepTrans}
            >
              <div className="flex flex-col items-center text-center">
                <svg viewBox="0 0 56 56" className="size-14" aria-hidden>
                  <motion.circle
                    cx="28"
                    cy="28"
                    r="25"
                    fill="none"
                    strokeWidth="2.5"
                    className="stroke-accent/55"
                    initial={reduced ? { pathLength: 1 } : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                  <motion.path
                    d="M17 29.5 L24.5 37 L39.5 19.5"
                    fill="none"
                    strokeWidth="3.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="stroke-accent"
                    initial={reduced ? { pathLength: 1 } : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.45, delay: 0.32, ease: 'easeOut' }}
                  />
                </svg>
                <p className="mt-2 font-display text-[1.25rem] font-semibold">{s.doneTitle}</p>
                <p className="mt-1 max-w-md text-[0.84rem] text-muted">{s.doneSub}</p>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-line bg-surface-2/50 p-3.5">
                  <p className="label-mono">{s.summary}</p>
                  <dl className="mt-2 space-y-2">
                    <div className="flex items-baseline justify-between gap-3">
                      <dt className="text-[0.78rem] text-muted">{s.sumWhat}</dt>
                      <dd className="text-right text-[0.82rem] font-medium">
                        {type.name[lang] ?? type.name.cs}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-[0.78rem] text-muted">{s.sumWho}</dt>
                      <dd className="flex items-center gap-2 text-[0.82rem] font-medium">
                        <Avatar size="sm" initials={assignedPerson?.initials ?? 'AN'} />
                        {assignedPerson?.name}
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-3">
                      <dt className="text-[0.78rem] text-muted">{s.sumWhen}</dt>
                      <dd className="text-right text-[0.82rem] font-medium">
                        {date ? longDate(date, lang) : '—'}
                        {slot && (
                          <span className="block font-mono text-[0.76rem] text-text-soft">
                            {fmtTime(slot.start)}–{fmtTime(slot.end)}
                          </span>
                        )}
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-3">
                      <dt className="text-[0.78rem] text-muted">{s.sumContact}</dt>
                      <dd className="min-w-0 text-right text-[0.82rem] font-medium">
                        <span className="block truncate">{form.name}</span>
                        <span className="block truncate font-mono text-[0.74rem] text-text-soft">
                          {form.email}
                        </span>
                      </dd>
                    </div>
                    {reminderDate && (
                      <div className="flex items-baseline justify-between gap-3 border-t border-line pt-2">
                        <dt className="text-[0.78rem] text-muted">{s.reminderAt}</dt>
                        <dd className="font-mono text-[0.78rem]">
                          {formatDate(reminderDate, lang === 'en' ? 'en-GB' : 'cs-CZ')} {s.at}{' '}
                          {slot ? fmtTime(slot.start) : '9:00'}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div className="rounded-xl border border-line bg-surface-2/50 p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="label-mono">{s.behind}</p>
                    {logDone < LOG.length && (
                      <span className="label-mono flex items-center gap-1.5 text-accent">
                        <Loader2 size={11} className="animate-spin" />
                        {s.running}
                      </span>
                    )}
                  </div>

                  <ul className="mt-2 space-y-1.5" aria-live="polite">
                    <AnimatePresence initial={false}>
                      {LOG.slice(0, logDone).map((item, i) => {
                        const Icon = item.icon
                        return (
                          <motion.li
                            key={item.id}
                            initial={reduced ? { opacity: 0 } : { opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className="flex items-center gap-2.5 rounded-lg border border-line bg-surface px-2.5 py-2"
                          >
                            <Icon size={14} className="shrink-0 text-muted" />
                            <span className="min-w-0 flex-1 text-[0.8rem] leading-snug">
                              {logLabels[i]}
                            </span>
                            <motion.span
                              aria-hidden
                              initial={reduced ? { scale: 1 } : { scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 520, damping: 24, delay: 0.1 }}
                              className="grid size-4 shrink-0 place-items-center rounded-full bg-accent text-accent-ink"
                            >
                              <Check size={10} strokeWidth={3.2} />
                            </motion.span>
                          </motion.li>
                        )
                      })}
                    </AnimatePresence>
                    {logDone < LOG.length && (
                      <li className="flex items-center gap-2.5 rounded-lg border border-dashed border-line px-2.5 py-2 text-[0.8rem] text-muted">
                        <CalendarDays size={14} className="shrink-0" />
                        <span className="h-3 flex-1 rounded skeleton" />
                      </li>
                    )}
                  </ul>

                  {logDone === LOG.length && (
                    <p className="mt-2.5 flex items-start gap-1.5 text-[0.76rem] leading-snug text-muted">
                      <ShieldCheck size={12} className="mt-0.5 shrink-0" />
                      {s.safe}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ovládání */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3.5">
        <FakeDataNote />
        <div className="flex items-center gap-2">
          {!done && (
            <>
              <Button
                variant="outline"
                size="sm"
                icon={ArrowLeft}
                iconRight={false}
                disabled={step === 0}
                onClick={() => setStep((value) => Math.max(0, value - 1))}
              >
                {t('action.prev')}
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={step === 3 ? (submitting ? Loader2 : CalendarCheck) : ArrowRight}
                disabled={!canContinue || submitting}
                onClick={goNext}
              >
                {step === 3 ? (submitting ? s.booking : s.book) : t('action.next')}
              </Button>
            </>
          )}
          {done && (
            <Button
              variant="quiet"
              size="sm"
              icon={CalendarDays}
              iconRight={false}
              onClick={onReset}
            >
              {s.again}
            </Button>
          )}
        </div>
      </div>
    </DemoShell>
  )
}
