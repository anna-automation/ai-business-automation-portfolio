import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Building2,
  Check,
  Clock,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  Send,
  Sparkles,
  User,
} from 'lucide-react'
import { DemoShell, FakeDataNote, SimBadge, StepTrail } from './_shell.jsx'
import BeforeAfter from './BeforeAfter.jsx'
import { Badge, Kbd, LabeledRule } from '../ui/primitives.jsx'
import { Button } from '../ui/Button.jsx'
import { useT } from '../../lib/i18n.jsx'
import { useReducedMotion } from '../../lib/prefs.jsx'
import { useToast } from '../../lib/toast.jsx'
import { cn, czk, formatDate } from '../../lib/utils.js'

/**
 * Generování nabídek: pět polí → dokument ve firemní šabloně.
 * Čísla počítá šablona, texty dolaďuje "model" — a je to u nich napsané.
 */

const VAT_RATE = 0.21
const STEP_MS = 500

const SERVICES = [
  { id: 'analysis', cs: 'Analýza procesů', en: 'Process analysis', unit: 9800, unitCs: 'MD', unitEn: 'MD', qty: { small: 2, medium: 4, large: 7 } },
  { id: 'n8n', cs: 'Nasazení n8n', en: 'n8n deployment', unit: 11500, unitCs: 'MD', unitEn: 'MD', qty: { small: 3, medium: 6, large: 12 } },
  { id: 'training', cs: 'Školení týmu', en: 'Team training', unit: 14000, unitCs: 'den', unitEn: 'day', qty: { small: 1, medium: 1, large: 2 } },
  { id: 'docs', cs: 'Dokumentace', en: 'Documentation', unit: 7500, unitCs: 'ks', unitEn: 'pc', qty: { small: 1, medium: 1, large: 2 } },
  { id: 'support', cs: 'Podpora', en: 'Support', unit: 4900, unitCs: 'měsíc', unitEn: 'month', qty: { small: 3, medium: 6, large: 12 } },
]

const SCOPES = ['small', 'medium', 'large']
const VALIDITY = [14, 30, 60]

const INTRO = {
  cs: {
    small: (c) =>
      `Děkujeme za zájem. Pro ${c} navrhujeme odlehčený start: vybereme jeden proces s nejvyšší úsporou, nasadíme ho do provozu a předáme ho tak, abyste si ho dokázali upravovat sami.`,
    medium: (c) =>
      `Děkujeme za zájem. Pro ${c} navrhujeme nasazení ve dvou vlnách — nejdřív dva procesy s nejrychlejší návratností, pak zaškolení týmu a předání dokumentace. Po každé vlně si společně vyhodnotíme, co se opravdu ušetřilo.`,
    large: (c) =>
      `Děkujeme za zájem. U projektu v rozsahu, který ${c} řeší, začínáme analýzou celého provozu a nasazujeme po etapách — každá etapa má vlastní měřitelný výsledek. Součástí je půlroční podpora a předání know-how, abyste nezůstali závislí na dodavateli.`,
  },
  en: {
    small: (c) =>
      `Thank you for your interest. For ${c} we suggest a light start: we pick the single process with the biggest saving, put it into production and hand it over so your own people can adjust it.`,
    medium: (c) =>
      `Thank you for your interest. For ${c} we suggest a rollout in two waves — the two fastest-payback processes first, then team training and documentation handover. After each wave we measure together what was actually saved.`,
    large: (c) =>
      `Thank you for your interest. At the scale ${c} is dealing with we start with an analysis of the whole operation and roll out in stages, each with its own measurable result. Six months of support and a full know-how handover are included, so you never depend on the vendor.`,
  },
}

const L = {
  cs: {
    title: 'Generování nabídek',
    subtitle: 'Pět polí → hotová nabídka ve firemní šabloně',
    form: 'Zadání',
    company: 'Firma',
    contact: 'Kontaktní osoba',
    services: 'Služby v nabídce',
    scope: 'Rozsah projektu',
    scopes: { small: 'Malý', medium: 'Střední', large: 'Velký' },
    scopeNote: {
      small: 'jeden proces, rychlý start',
      medium: 'několik procesů ve vlnách',
      large: 'celý provoz, etapy a podpora',
    },
    validity: 'Platnost nabídky',
    dayUnit: 'dní',
    generate: 'Vygenerovat nabídku',
    again: 'Vygenerovat znovu',
    working: 'Generuji…',
    steps: [
      'Načítám šablonu',
      'Doplňuji údaje zákazníka',
      'Počítám ceny a DPH',
      'AI dolaďuje texty podle rozsahu',
      'Skládám PDF',
    ],
    pickOne: 'Vyberte alespoň jednu službu',
    pickOneBody: 'Bez položek není co nacenit.',
    emptyTitle: 'Nabídka se vysune sem',
    emptyBody: 'Vlevo vyplňte zadání a spusťte generování. Dokument se složí z firemní šablony.',
    readyToast: 'Nabídka je hotová',
    readyToastBody: 'Složeno z šablony za 40 sekund.',
    download: 'Stáhnout PDF',
    downloadToast: 'V demu se nic nestahuje',
    downloadToastBody: 'Tlačítko je tu, aby bylo vidět, kde v reálu vypadne PDF.',
    send: 'Odeslat zákazníkovi',
    sendToast: 'Nabídka odeslána',
    sendToastBody: 'Simulace — žádný e-mail neodešel.',
    crm: 'Uloženo ke kontaktu v CRM',
    docKind: 'Nabídka — návrh spolupráce',
    docNo: 'Číslo',
    issued: 'Vystaveno',
    supplier: 'Dodavatel',
    client: 'Odběratel',
    colItem: 'Položka',
    colQty: 'Počet',
    colUnit: 'Cena / j.',
    colTotal: 'Celkem',
    subtotal: 'Základ bez DPH',
    vat: 'DPH 21 %',
    total: 'Celkem k úhradě',
    validTill: 'Nabídka platí do',
    signedBy: 'Anna Nováková',
    signedRole: 'AI Business Lab · automatizace procesů',
    aiPart: 'AI',
    aiNote:
      'Úvodní odstavec skládá jazykový model podle vybraného rozsahu. Čísla počítá šablona, ne model.',
    compare: 'Ruční práce vs. automat',
    compareBody: 'Táhněte dělicí čárou. Vlevo je to, co se dnes děje ve většině firem.',
    beforeLabel: 'Ručně — 52 minut',
    afterLabel: 'Automaticky — 40 sekund',
    beforeShort: 'Ručně · 52 min',
    afterShort: 'Automat · 40 s',
    dragHint: 'Táhněte dělicí čárou, nebo použijte šipky',
    mWord: 'nabidka_FINAL_v5.docx',
    mNote1: 'ceník?? v3 nebo v5',
    mNote2: 'volala jsem Petrovi — neví',
    mPrice: 'kolik jsme dali Dvořákovi?',
    mPaper: 'poznámky z telefonátu',
    mTime: '52 min',
    mFiles: ['cenik_2024.xlsx', 'cenik_2025.xlsx', 'cenik_final.xlsx', 'cenik_final_2.xlsx', 'cenik_opraveny.xlsx'],
    aQuote: 'Nabídka 2026/0139',
    aDone: 'odesláno zákazníkovi',
    aTime: '40 s',
  },
  en: {
    title: 'Quote generation',
    subtitle: 'Five fields → a finished quote in the company template',
    form: 'Input',
    company: 'Company',
    contact: 'Contact person',
    services: 'Services in the quote',
    scope: 'Project scope',
    scopes: { small: 'Small', medium: 'Medium', large: 'Large' },
    scopeNote: {
      small: 'one process, quick start',
      medium: 'several processes in waves',
      large: 'whole operation, stages and support',
    },
    validity: 'Quote validity',
    dayUnit: 'days',
    generate: 'Generate the quote',
    again: 'Generate again',
    working: 'Generating…',
    steps: [
      'Loading the template',
      'Filling in customer details',
      'Calculating prices and VAT',
      'AI tunes the wording to the scope',
      'Assembling the PDF',
    ],
    pickOne: 'Pick at least one service',
    pickOneBody: 'With no line items there is nothing to price.',
    emptyTitle: 'The quote slides out here',
    emptyBody: 'Fill in the input on the left and run it. The document is built from the company template.',
    readyToast: 'The quote is ready',
    readyToastBody: 'Assembled from the template in 40 seconds.',
    download: 'Download PDF',
    downloadToast: 'Nothing downloads in a demo',
    downloadToastBody: 'The button is here to show where the real PDF would come out.',
    send: 'Send to the customer',
    sendToast: 'Quote sent',
    sendToastBody: 'Simulation — no e-mail went out.',
    crm: 'Saved to the contact in the CRM',
    docKind: 'Quote — proposal of cooperation',
    docNo: 'Number',
    issued: 'Issued',
    supplier: 'Supplier',
    client: 'Customer',
    colItem: 'Item',
    colQty: 'Qty',
    colUnit: 'Unit price',
    colTotal: 'Total',
    subtotal: 'Net total',
    vat: 'VAT 21 %',
    total: 'Total due',
    validTill: 'Quote valid until',
    signedBy: 'Anna Nováková',
    signedRole: 'AI Business Lab · process automation',
    aiPart: 'AI',
    aiNote:
      'The opening paragraph is written by a language model based on the chosen scope. The numbers come from the template, not from the model.',
    compare: 'Hand work vs. the machine',
    compareBody: 'Drag the divider. On the left is what still happens in most companies.',
    beforeLabel: 'By hand — 52 minutes',
    afterLabel: 'Automated — 40 seconds',
    beforeShort: 'By hand · 52 min',
    afterShort: 'Auto · 40 s',
    dragHint: 'Drag the divider, or use the arrow keys',
    mWord: 'quote_FINAL_v5.docx',
    mNote1: 'price list?? v3 or v5',
    mNote2: 'called Petr — he has no idea',
    mPrice: 'what did we charge Dvořák?',
    mPaper: 'notes from the call',
    mTime: '52 min',
    mFiles: ['pricelist_2024.xlsx', 'pricelist_2025.xlsx', 'pricelist_final.xlsx', 'pricelist_final_2.xlsx', 'pricelist_fixed.xlsx'],
    aQuote: 'Quote 2026/0139',
    aDone: 'sent to the customer',
    aTime: '40 s',
  },
}

/** Značka v záhlaví dokumentu — "A" v akcentním čtverci. */
function Mark({ className }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect x="0" y="0" width="32" height="32" rx="9" fill="var(--accent)" />
      <path
        d="M9.5 23 16 9l6.5 14"
        fill="none"
        stroke="var(--accent-ink)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12.6 18.6h6.8" stroke="var(--accent-ink)" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}

function Signature({ className }) {
  return (
    <svg viewBox="0 0 132 32" className={className} aria-hidden>
      <path
        d="M4 24c7-13 11-15 13.5-8s0 13 3.5 11.5S27 12 31 12s3.5 11 8 11 6.5-9.5 11-9.5 4 8.5 8 7 7-9.5 11.5-9.5 4 8 8.5 7.5 8-7 12-8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path d="M86 27h40" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
    </svg>
  )
}

/* ---------------------------------------------------------------------------
   Panely pro porovnání
   --------------------------------------------------------------------------- */

/** Chaos před automatizací — rozdělaný dokument, pět ceníků, papírky. */
function ManualPanel({ s, tight }) {
  return (
    <div className="grid-paper-fine relative h-full w-full overflow-hidden bg-bg-sunk">
      <div
        className={cn(
          'absolute left-[5%] top-[13%] w-[54%] -rotate-2 rounded-lg border border-line bg-surface p-3 shadow-[var(--shadow-soft)]',
          tight && 'top-[16%] w-[62%] p-2.5'
        )}
      >
        <p className="flex items-center gap-1.5 font-mono text-[0.58rem] text-muted">
          <FileText size={10} />
          {s.mWord}
        </p>
        <div className="mt-2 space-y-1.5">
          <span className="block h-1.5 w-full rounded-full bg-line" />
          <span className="block h-1.5 w-[86%] rounded-full bg-line" />
          <span className="relative block h-1.5 w-[70%] rounded-full bg-line">
            <span aria-hidden className="absolute inset-x-0 top-1/2 h-px bg-coral" />
          </span>
          {!tight && <span className="block h-1.5 w-[92%] rounded-full bg-line" />}
        </div>
        <div className="mt-2.5 flex flex-wrap items-baseline gap-2 font-mono text-[0.66rem]">
          <s className="text-muted/70">42 000</s>
          <s className="text-muted/70">38 500</s>
          <span className="text-coral">41 200 ?</span>
        </div>
      </div>

      <div
        className={cn(
          'absolute left-[8%] top-[62%] w-[38%] rotate-[4deg] rounded-sm border border-warn/40 bg-warn/20 px-2.5 py-2 shadow-[var(--shadow-soft)]',
          tight && 'top-[68%] w-[46%]'
        )}
      >
        <p className="font-mono text-[0.62rem] leading-tight text-text">{s.mNote1}</p>
        {!tight && <p className="mt-1 font-mono text-[0.56rem] leading-tight text-text-soft">{s.mNote2}</p>}
      </div>

      {!tight && (
        <div className="absolute left-[46%] top-[48%] w-[30%] -rotate-[6deg] rounded-sm border border-line bg-surface px-2.5 py-2 shadow-[var(--shadow-soft)]">
          <p className="label-mono text-[0.52rem]">{s.mPaper}</p>
          <svg viewBox="0 0 90 34" className="mt-1 h-7 w-full text-muted" aria-hidden>
            <path
              d="M2 8c6-5 11 4 17 0s9-6 14-2 8 5 13 2 10-4 14 1 10 3 14 0"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <path
              d="M2 20c7-4 10 3 16 1s10-5 15-1 7 4 12 1 11-3 15 2"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <path
              d="M2 30c5-3 9 2 14 0s8-3 12 0"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
          <p className="mt-0.5 font-mono text-[0.55rem] text-coral">{s.mPrice}</p>
        </div>
      )}

      <div className={cn('absolute right-[8%] top-[8%] w-[32%] space-y-1', tight && 'right-[4%] w-[36%]')}>
        {s.mFiles.slice(0, tight ? 3 : 5).map((file, i) => (
          <span
            key={file}
            className="flex items-center gap-1.5 truncate rounded-md border border-line bg-surface px-1.5 py-1 font-mono text-[0.55rem] text-muted shadow-[var(--shadow-soft)]"
            style={{ transform: `rotate(${(i % 2 === 0 ? 1 : -1) * (1 + i * 0.4)}deg)` }}
          >
            <FileSpreadsheet size={9} className="shrink-0" />
            <span className="truncate">{file}</span>
          </span>
        ))}
      </div>

      <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-coral/40 bg-coral/14 px-2.5 py-1 font-mono text-[0.62rem] font-medium uppercase tracking-[0.1em] text-text">
        <Clock size={11} strokeWidth={2.4} />
        {s.mTime}
      </span>
    </div>
  )
}

/** Hotový výsledek — jeden dokument, nic víc. */
function CleanPanel({ s, tight }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-surface-2">
      <div className={cn('absolute inset-0 flex items-center justify-center pl-[20%] pr-[6%]', tight && 'pl-[26%]')}>
        <div className="w-full max-w-[15rem] rounded-lg border border-line bg-surface p-3 shadow-[var(--shadow-lift)]">
          <div className="flex items-center gap-2 border-b border-line pb-2">
            <Mark className="size-5 shrink-0" />
            <p className="truncate font-mono text-[0.58rem] uppercase tracking-[0.1em] text-muted">
              {s.aQuote}
            </p>
          </div>
          <div className="mt-2.5 space-y-1.5">
            <span className="block h-1.5 w-[92%] rounded-full bg-line" />
            <span className="block h-1.5 w-full rounded-full bg-line" />
            <span className="block h-1.5 w-[78%] rounded-full bg-line" />
          </div>
          <div className="mt-3 space-y-1.5">
            {[72, 58, 64].map((w, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="block h-1.5 rounded-full bg-line" style={{ width: `${w}%` }} />
                <span className="ml-auto block h-1.5 w-8 rounded-full bg-line-strong" />
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between rounded-md bg-accent/16 px-2 py-1.5">
            <span className="font-mono text-[0.56rem] uppercase tracking-[0.1em] text-text-soft">
              {s.total}
            </span>
            <span className="font-mono text-[0.68rem] font-semibold tabular-nums">{czk(203_280)}</span>
          </div>
          {!tight && (
            <p className="mt-2 flex items-center gap-1.5 font-mono text-[0.55rem] text-ok">
              <Check size={10} strokeWidth={3} />
              {s.aDone}
            </p>
          )}
        </div>
      </div>
      <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/16 px-2.5 py-1 font-mono text-[0.62rem] font-medium uppercase tracking-[0.1em] text-text">
        <Check size={11} strokeWidth={3} />
        {s.aTime}
      </span>
    </div>
  )
}

/* ---------------------------------------------------------------------------
   Dokument
   --------------------------------------------------------------------------- */

function QuoteDocument({ doc, s, lang, reduced }) {
  return (
    <div className="relative">
      {/* štěrbina tiskárny */}
      <div aria-hidden className="mx-auto mb-2.5 h-1.5 w-2/3 rounded-full bg-line-strong/70" />
      <motion.div
        key={doc.no}
        initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
        animate={reduced ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
        transition={{ duration: reduced ? 0.15 : 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="overflow-hidden"
      >
        <motion.article
          initial={reduced ? false : { y: -28 }}
          animate={{ y: 0 }}
          transition={{ duration: reduced ? 0 : 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-xl border border-line bg-surface p-4 shadow-[var(--shadow-lift)] sm:p-5"
        >
          <header className="flex flex-wrap items-start gap-3 border-b border-line pb-3">
            <Mark className="size-8 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-display text-[0.95rem] font-semibold leading-tight">AI Business Lab</p>
              <p className="label-mono mt-0.5 text-[0.58rem]">{s.docKind}</p>
            </div>
            <div className="text-right">
              <p className="label-mono text-[0.58rem]">{s.docNo}</p>
              <p className="font-mono text-[0.86rem] font-semibold tabular-nums">{doc.no}</p>
              <p className="mt-0.5 font-mono text-[0.6rem] text-muted">
                {s.issued} {formatDate(doc.issued, lang === 'en' ? 'en-GB' : 'cs-CZ')}
              </p>
            </div>
          </header>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-line bg-surface-2/60 p-2.5">
              <p className="label-mono text-[0.55rem]">{s.supplier}</p>
              <p className="mt-1 text-[0.82rem] font-medium">AI Business Lab s.r.o.</p>
              <p className="font-mono text-[0.62rem] leading-relaxed text-muted">
                Pekárenská 7, 602 00 Brno
                <br />
                IČO 19284756 · DIČ CZ19284756
              </p>
            </div>
            <div className="rounded-lg border border-line bg-surface-2/60 p-2.5">
              <p className="label-mono text-[0.55rem]">{s.client}</p>
              <p className="mt-1 text-[0.82rem] font-medium">{doc.company}</p>
              <p className="font-mono text-[0.62rem] leading-relaxed text-muted">
                {doc.contact}
                <br />
                Nádražní 18, 603 00 Brno
              </p>
            </div>
          </div>

          <div className="mt-3.5 rounded-lg border border-violet/30 bg-violet/8 p-2.5">
            <div className="flex items-center gap-2">
              <Badge tone="violet" icon={Sparkles}>
                {s.aiPart}
              </Badge>
              <span className="label-mono text-[0.55rem]">{s.scopes[doc.scope]}</span>
            </div>
            <p className="mt-2 text-[0.82rem] leading-relaxed text-text-soft">{doc.intro}</p>
          </div>

          <table className="mt-3.5 w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-line">
                <th className="label-mono py-1.5 pr-2 text-[0.55rem] font-medium">{s.colItem}</th>
                <th className="label-mono py-1.5 pr-2 text-right text-[0.55rem] font-medium">{s.colQty}</th>
                <th className="label-mono py-1.5 pr-2 text-right text-[0.55rem] font-medium">{s.colUnit}</th>
                <th className="label-mono py-1.5 text-right text-[0.55rem] font-medium">{s.colTotal}</th>
              </tr>
            </thead>
            <tbody>
              {doc.lines.map((line) => (
                <tr key={line.id} className="border-b border-line/60">
                  <td className="py-1.5 pr-2 text-[0.8rem]">{line.label}</td>
                  <td className="py-1.5 pr-2 text-right font-mono text-[0.72rem] tabular-nums">
                    {line.qty} {line.unitLabel}
                  </td>
                  <td className="py-1.5 pr-2 text-right font-mono text-[0.72rem] tabular-nums text-muted">
                    {czk(line.unit)}
                  </td>
                  <td className="py-1.5 text-right font-mono text-[0.76rem] tabular-nums">
                    {czk(line.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-3 ml-auto w-full max-w-[16rem] space-y-1">
            <div className="flex items-center justify-between text-[0.76rem]">
              <span className="text-muted">{s.subtotal}</span>
              <span className="font-mono tabular-nums">{czk(doc.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-[0.76rem]">
              <span className="text-muted">{s.vat}</span>
              <span className="font-mono tabular-nums">{czk(doc.vat)}</span>
            </div>
            <div className="flex items-center justify-between border-t-2 border-accent pt-1.5">
              <span className="text-[0.8rem] font-semibold">{s.total}</span>
              <span className="font-mono text-[0.95rem] font-semibold tabular-nums">{czk(doc.total)}</span>
            </div>
          </div>

          <footer className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-line pt-3">
            <div>
              <p className="label-mono text-[0.55rem]">{s.validTill}</p>
              <p className="font-mono text-[0.76rem] tabular-nums">
                {formatDate(doc.until, lang === 'en' ? 'en-GB' : 'cs-CZ')}
              </p>
            </div>
            <div className="text-right">
              <Signature className="ml-auto h-7 w-28 text-text-soft" />
              <p className="text-[0.76rem] font-medium">{s.signedBy}</p>
              <p className="font-mono text-[0.58rem] text-muted">{s.signedRole}</p>
            </div>
          </footer>
        </motion.article>
      </motion.div>
    </div>
  )
}

/* ---------------------------------------------------------------------------
   Demo
   --------------------------------------------------------------------------- */

export default function QuoteDemo({ compact = false }) {
  const { lang } = useT()
  const s = L[lang] ?? L.cs
  const reduced = useReducedMotion()
  const { push } = useToast()

  const [company, setCompany] = useState('Pekárna Dvořák s.r.o.')
  const [contact, setContact] = useState('Jana Dvořáková')
  const [picked, setPicked] = useState(['analysis', 'n8n'])
  const [scope, setScope] = useState('medium')
  const [validity, setValidity] = useState(30)

  const [phase, setPhase] = useState('idle')
  const [step, setStep] = useState(0)
  const [doc, setDoc] = useState(null)
  const [sentAt, setSentAt] = useState(null)
  const [serial, setSerial] = useState(147)
  const [autoPos, setAutoPos] = useState(50)

  const timers = useRef([])

  const clearTimers = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  useEffect(() => clearTimers, [])

  // Samohybná rukojeť v náhledu — při omezeném pohybu stojí v polovině.
  useEffect(() => {
    if (!compact || reduced) return
    let frame
    const start = performance.now()
    const tick = (now) => {
      const t = (now - start) / 1000
      const next = Math.round(50 + 24 * Math.sin((t * Math.PI * 2) / 6.5))
      setAutoPos((prev) => (prev === next ? prev : next))
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [compact, reduced])

  const lines = useMemo(
    () =>
      SERVICES.filter((item) => picked.includes(item.id)).map((item) => {
        const qty = item.qty[scope]
        return {
          id: item.id,
          label: lang === 'en' ? item.en : item.cs,
          unitLabel: lang === 'en' ? item.unitEn : item.unitCs,
          qty,
          unit: item.unit,
          total: qty * item.unit,
        }
      }),
    [picked, scope, lang]
  )

  const subtotal = lines.reduce((sum, line) => sum + line.total, 0)
  const vat = Math.round(subtotal * VAT_RATE)

  const toggleService = (id) =>
    setPicked((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]))

  const run = () => {
    if (!lines.length) {
      push({ title: s.pickOne, description: s.pickOneBody, variant: 'warn' })
      return
    }
    clearTimers()
    const no = `2026/${String(serial).padStart(4, '0')}`
    const issued = new Date()
    const snapshot = {
      no,
      company: company.trim() || '—',
      contact: contact.trim() || '—',
      scope,
      lines,
      subtotal,
      vat,
      total: subtotal + vat,
      issued,
      until: new Date(issued.getTime() + validity * 86_400_000),
      intro: (INTRO[lang] ?? INTRO.cs)[scope](company.trim() || (lang === 'en' ? 'your company' : 'vaši firmu')),
    }

    setSerial((n) => n + 1)
    setSentAt(null)
    setDoc(null)

    if (reduced) {
      setStep(s.steps.length)
      setDoc(snapshot)
      setPhase('done')
      push({ title: s.readyToast, description: s.readyToastBody, variant: 'success' })
      return
    }

    setPhase('running')
    setStep(0)
    s.steps.forEach((_, i) => {
      timers.current.push(setTimeout(() => setStep(i + 1), (i + 1) * STEP_MS))
    })
    timers.current.push(
      setTimeout(() => {
        setDoc(snapshot)
        setPhase('done')
        push({ title: s.readyToast, description: s.readyToastBody, variant: 'success' })
      }, s.steps.length * STEP_MS + 160)
    )
  }

  const reset = () => {
    clearTimers()
    setPhase('idle')
    setStep(0)
    setDoc(null)
    setSentAt(null)
    setSerial(147)
  }

  const sendToCustomer = () => {
    setSentAt(
      new Date().toLocaleTimeString(lang === 'en' ? 'en-GB' : 'cs-CZ', {
        hour: '2-digit',
        minute: '2-digit',
      })
    )
    push({ title: s.sendToast, description: s.sendToastBody, variant: 'success' })
  }

  if (compact) {
    return (
      <div className="h-full overflow-hidden">
        <BeforeAfter
          className="h-full"
          initial={reduced ? 50 : autoPos}
          beforeLabel={s.beforeShort}
          afterLabel={s.afterShort}
          before={<ManualPanel s={s} tight />}
          after={<CleanPanel s={s} tight />}
        />
      </div>
    )
  }

  const running = phase === 'running'

  return (
    <DemoShell
      title={s.title}
      subtitle={s.subtitle}
      live
      onReset={reset}
      toolbar={<SimBadge />}
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        {/* --- zadání --- */}
        <div className="space-y-4">
          <p className="label-mono">{s.form}</p>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="label-mono flex items-center gap-1.5">
                <Building2 size={11} />
                {s.company}
              </span>
              <input
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-line bg-surface-2 px-3 py-2 text-[0.85rem] outline-none transition focus:border-accent/60"
              />
            </label>
            <label className="block">
              <span className="label-mono flex items-center gap-1.5">
                <User size={11} />
                {s.contact}
              </span>
              <input
                value={contact}
                onChange={(event) => setContact(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-line bg-surface-2 px-3 py-2 text-[0.85rem] outline-none transition focus:border-accent/60"
              />
            </label>
          </div>

          <div>
            <p className="label-mono">{s.services}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {SERVICES.map((item) => {
                const active = picked.includes(item.id)
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleService(item.id)}
                    aria-pressed={active}
                    className={cn(
                      'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.8rem] transition duration-300',
                      active
                        ? 'border-accent bg-accent/16 text-text'
                        : 'border-line bg-surface-2 text-text-soft hover:border-line-strong hover:text-text'
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        'grid size-3.5 place-items-center rounded-full border transition',
                        active ? 'border-accent bg-accent text-accent-ink' : 'border-line-strong'
                      )}
                    >
                      {active && <Check size={9} strokeWidth={3.5} />}
                    </span>
                    {lang === 'en' ? item.en : item.cs}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="label-mono">{s.scope}</p>
              <div className="mt-2 flex rounded-xl border border-line bg-surface-2 p-1">
                {SCOPES.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setScope(key)}
                    aria-pressed={scope === key}
                    className={cn(
                      'flex-1 rounded-lg px-2 py-1.5 text-[0.78rem] transition duration-300',
                      scope === key
                        ? 'bg-text text-bg font-medium'
                        : 'text-text-soft hover:text-text'
                    )}
                  >
                    {s.scopes[key]}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 font-mono text-[0.64rem] text-muted">{s.scopeNote[scope]}</p>
            </div>

            <div>
              <p className="label-mono">{s.validity}</p>
              <div className="mt-2 flex rounded-xl border border-line bg-surface-2 p-1">
                {VALIDITY.map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setValidity(days)}
                    aria-pressed={validity === days}
                    className={cn(
                      'flex-1 rounded-lg px-2 py-1.5 font-mono text-[0.75rem] tabular-nums transition duration-300',
                      validity === days ? 'bg-text text-bg font-medium' : 'text-text-soft hover:text-text'
                    )}
                  >
                    {days}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 font-mono text-[0.64rem] text-muted">
                {validity} {s.dayUnit}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button onClick={run} icon={Sparkles} iconRight={false} disabled={running}>
              {running ? s.working : phase === 'done' ? s.again : s.generate}
            </Button>
            <span className="font-mono text-[0.7rem] text-muted tabular-nums">
              {lines.length} × · {czk(subtotal + vat)}
            </span>
          </div>

          <FakeDataNote />
        </div>

        {/* --- výstup --- */}
        <div className="min-w-0">
          <AnimatePresence mode="wait">
            {phase === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid h-full min-h-[18rem] place-items-center rounded-xl border border-dashed border-line bg-surface-2/40 p-6 text-center"
              >
                <div>
                  <Printer size={26} className="mx-auto text-muted" strokeWidth={1.6} />
                  <p className="mt-2.5 text-[0.9rem] font-semibold">{s.emptyTitle}</p>
                  <p className="mx-auto mt-1 max-w-[22rem] text-[0.82rem] leading-relaxed text-muted">
                    {s.emptyBody}
                  </p>
                </div>
              </motion.div>
            )}

            {running && (
              <motion.div
                key="run"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-xl border border-line bg-surface-2/50 p-4"
              >
                <StepTrail steps={s.steps} current={step} />
                <ol className="mt-4 space-y-2.5" aria-live="polite">
                  {s.steps.map((label, i) => {
                    const done = i < step
                    const active = i === step
                    return (
                      <li key={label} className="flex items-center gap-2.5">
                        <span
                          className={cn(
                            'grid size-5 shrink-0 place-items-center rounded-full border transition duration-300',
                            done && 'border-accent bg-accent text-accent-ink',
                            active && 'border-accent/60 bg-accent/14 text-text',
                            !done && !active && 'border-line text-muted'
                          )}
                        >
                          {done ? (
                            <Check size={11} strokeWidth={3.5} />
                          ) : (
                            <span className="font-mono text-[0.58rem]">{i + 1}</span>
                          )}
                        </span>
                        <span
                          className={cn(
                            'text-[0.84rem] transition-colors duration-300',
                            done ? 'text-text' : active ? 'text-text' : 'text-muted'
                          )}
                        >
                          {label}
                        </span>
                        {active && (
                          <span
                            aria-hidden
                            className="ml-auto block h-1 w-10 overflow-hidden rounded-full bg-line"
                          >
                            <span className="skeleton block h-full w-full" />
                          </span>
                        )}
                      </li>
                    )
                  })}
                </ol>
              </motion.div>
            )}

            {phase === 'done' && doc && (
              <motion.div key="doc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <QuoteDocument doc={doc} s={s} lang={lang} reduced={reduced} />

                <p className="mt-3 text-[0.76rem] leading-relaxed text-muted">{s.aiNote}</p>

                <div className="mt-3 flex flex-wrap items-center gap-2.5">
                  <Button
                    size="sm"
                    variant="quiet"
                    icon={Download}
                    iconRight={false}
                    onClick={() =>
                      push({
                        title: s.downloadToast,
                        description: s.downloadToastBody,
                        variant: 'info',
                      })
                    }
                  >
                    {s.download}
                  </Button>
                  <Button size="sm" icon={Send} iconRight={false} onClick={sendToCustomer}>
                    {s.send}
                  </Button>
                </div>

                <AnimatePresence>
                  {sentAt && (
                    <motion.p
                      initial={reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-2.5 flex items-center gap-2 font-mono text-[0.7rem] text-ok"
                      aria-live="polite"
                    >
                      <Check size={12} strokeWidth={3} />
                      {s.crm} · {sentAt}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* --- porovnání --- */}
      <div className="mt-7">
        <LabeledRule>{s.compare}</LabeledRule>
        <p className="mx-auto mt-3 max-w-[34rem] text-center text-[0.84rem] leading-relaxed text-muted">
          {s.compareBody}
        </p>
        <BeforeAfter
          className="mt-4 h-[20rem] sm:h-[23rem]"
          initial={44}
          beforeLabel={s.beforeLabel}
          afterLabel={s.afterLabel}
          before={<ManualPanel s={s} />}
          after={<CleanPanel s={s} />}
        />
        <p className="label-mono mt-2.5 flex flex-wrap items-center justify-center gap-2">
          {s.dragHint}
          <Kbd>←</Kbd>
          <Kbd>→</Kbd>
        </p>
      </div>
    </DemoShell>
  )
}
