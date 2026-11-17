import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  Check,
  Copy,
  FileImage,
  FileText,
  FileUp,
  Pencil,
  ScanLine,
  SkipForward,
} from 'lucide-react'
import { DemoShell, FakeDataNote, MiniTable, StatTile, StepTrail } from './_shell.jsx'
import { Badge, LabeledRule } from '../ui/primitives.jsx'
import { Button } from '../ui/Button.jsx'
import { useT } from '../../lib/i18n.jsx'
import { useReducedMotion } from '../../lib/prefs.jsx'
import { useToast } from '../../lib/toast.jsx'
import { clamp, cn, czk, uid } from '../../lib/utils.js'

/**
 * Zpracování dokumentů: faktura z přílohy do tabulky.
 * Vytěžení není magie — u každého pole je vidět odkud pochází a jak si je model jistý.
 */

const VAT_RATE = 0.21
const SCAN_MS = 2600
const CHECK_MS = 900
const LOW_CONF = 70

/** Pole, která vytěžujeme. `box` je výřez v souřadnicích náhledu dokumentu. */
const FIELDS = [
  { key: 'supplier', box: [14, 30, 152, 15], cs: 'Dodavatel', en: 'Supplier' },
  { key: 'invoiceNo', box: [168, 29, 118, 16], cs: 'Číslo faktury', en: 'Invoice number' },
  { key: 'ico', box: [14, 50, 94, 12], cs: 'IČO', en: 'Company ID' },
  { key: 'vs', box: [166, 50, 120, 12], cs: 'Variabilní symbol', en: 'Payment reference' },
  { key: 'dic', box: [14, 64, 94, 12], cs: 'DIČ', en: 'VAT ID' },
  { key: 'issue', box: [166, 64, 120, 12], cs: 'Datum vystavení', en: 'Issue date' },
  { key: 'due', box: [166, 78, 120, 12], cs: 'Datum splatnosti', en: 'Due date' },
  { key: 'base', box: [168, 298, 118, 13], cs: 'Částka bez DPH', en: 'Amount excl. VAT' },
  { key: 'vat', box: [168, 312, 118, 13], cs: 'DPH 21 %', en: 'VAT 21 %' },
  { key: 'total', box: [164, 328, 122, 18], cs: 'Celkem', en: 'Total' },
]

const REVEAL_ORDER = [...FIELDS].sort((a, b) => a.box[1] - b.box[1])

/** Pole, která ukazuje malý náhled na úvodu. */
const COMPACT_FIELDS = ['supplier', 'ico', 'vs', 'total']
  .map((key) => FIELDS.find((field) => field.key === key))
  .filter(Boolean)

const FILES = [
  {
    id: 'f1',
    name: 'Faktura_2026_0431.pdf',
    kind: 'pdf',
    size: '184 kB',
    poor: false,
    duplicate: false,
    supplier: 'Dřevo Horák s.r.o.',
    ico: '27485913',
    dic: 'CZ27485913',
    invoiceNo: '2026/0431',
    vs: '20260431',
    issue: '12. 11. 2026',
    due: '26. 11. 2026',
    base: 48600,
    items: [
      { desc: 110, qty: '12 ks', unit: 2400, total: 28800 },
      { desc: 86, qty: '4 ks', unit: 3250, total: 13000 },
      { desc: 132, qty: '1 ks', unit: 6800, total: 6800 },
    ],
    conf: { supplier: 98, invoiceNo: 99, ico: 97, vs: 99, dic: 96, issue: 95, due: 94, base: 98, vat: 98, total: 99 },
  },
  {
    id: 'f2',
    name: 'sken_dodavatel.jpg',
    kind: 'img',
    size: '2,4 MB',
    poor: true,
    duplicate: false,
    supplier: 'Kovo Beneš a syn',
    ico: '28140251',
    dic: 'CZ28140251',
    icoRaw: '2B14O251',
    dicRaw: 'CZ281AO25I',
    invoiceNo: '2026-0977',
    vs: '20260977',
    issue: '9. 11. 2026',
    due: '23. 11. 2026',
    base: 12840,
    items: [
      { desc: 124, qty: '6 ks', unit: 1540, total: 9240 },
      { desc: 94, qty: '2 ks', unit: 1800, total: 3600 },
    ],
    conf: { supplier: 86, invoiceNo: 91, ico: 64, vs: 88, dic: 58, issue: 83, due: 81, base: 92, vat: 92, total: 94 },
  },
  {
    id: 'f3',
    name: 'FV-2026-118.pdf',
    kind: 'pdf',
    size: '96 kB',
    poor: false,
    duplicate: true,
    duplicateDate: '3. 11. 2026',
    supplier: 'Grafika Malá s.r.o.',
    ico: '09127644',
    dic: 'CZ09127644',
    invoiceNo: 'FV-2026-118',
    vs: '20260118',
    issue: '31. 10. 2026',
    due: '14. 11. 2026',
    base: 7400,
    items: [
      { desc: 138, qty: '1 ks', unit: 5400, total: 5400 },
      { desc: 76, qty: '2 ks', unit: 1000, total: 2000 },
    ],
    conf: { supplier: 97, invoiceNo: 98, ico: 96, vs: 99, dic: 95, issue: 93, due: 93, base: 97, vat: 97, total: 98 },
  },
]

const L = {
  cs: {
    title: 'Zpracování dokumentů',
    subtitle: 'Faktura z přílohy do tabulky — i když je sken špatný',
    drop: 'Přetáhněte fakturu sem',
    dropNote: 'nebo klikněte na jednu z ukázkových příloh',
    dropToast: 'V demu se čtou jen ukázkové faktury',
    dropToastBody: 'Váš soubor se nikam neposílá. Vybrala jsem za vás jednu z příloh.',
    samples: 'Ukázkové přílohy',
    poorTag: 'špatný sken',
    written: 'zapsáno',
    extract: 'Vytěžit údaje',
    extractAgain: 'Vytěžit znovu',
    extracting: 'Vytěžuji…',
    pickFirst: 'Vyberte přílohu',
    pickFirstBody: 'Vlevo klikněte na fakturu, nebo ji přetáhněte do zóny.',
    stages: ['Vytěžení', 'Kontrola duplicity', 'Zápis'],
    statusIdle: 'Vyberte přílohu a spusťte vytěžení.',
    statusScan: 'Skenuji dokument a hledám známá pole…',
    statusCheck: 'Kontroluji variabilní symbol v tabulce…',
    statusDup: 'Variabilní symbol už v tabulce je. Rozhodněte, co s tím.',
    statusDone: 'Hotovo. Doklad je uzavřený.',
    preview: 'Náhled přílohy',
    previewEmpty: 'Náhled se zobrazí po vybrání přílohy',
    fields: 'Vytěžená pole',
    fieldsEmpty: 'Po spuštění tu pole naskáčou tak, jak je skenovací linka najde.',
    confidence: 'spolehlivost',
    toCheck: 'ke kontrole člověkem',
    fix: 'Opravit',
    confirm: 'Potvrdit',
    cancel: 'Zpět',
    verified: 'ověřeno člověkem',
    dupTitle: 'Duplicita',
    dupBody: (d) => `Tato faktura už byla zapsána ${d}.`,
    dupHint: 'Shoda podle variabilního symbolu a IČO dodavatele.',
    skip: 'Přeskočit',
    writeAgain: 'Zapsat znovu',
    tableTitle: 'Zapsané faktury',
    colDoc: 'Doklad',
    colSupplier: 'Dodavatel',
    colVs: 'VS',
    colTotal: 'Celkem',
    colState: 'Stav',
    tableEmpty: 'Zatím nic zapsaného.',
    summary: (n, all) => `Zapsáno ${n} z ${all} · ušetřeno 6 minut na dokladu`,
    statDocs: 'Zapsáno',
    statSaved: 'Ušetřeno',
    statChecks: 'Ke kontrole',
    minutes: 'min',
    fieldsCount: 'polí',
    doneToast: 'Faktura zapsána',
    doneToastBody: 'Řádek přiskočil do tabulky. V reálu by šel do účetního systému.',
    dupToast: 'Našla jsem duplicitu',
    dupToastBody: 'Doklad se stejným variabilním symbolem už v tabulce je.',
    skipToast: 'Doklad přeskočen',
    skipToastBody: 'Nic se nezapsalo — původní záznam zůstal.',
    scanToast: 'Vytěženo 10 polí',
    scanToastBody: 'Dvě pole u špatného skenu šla ke kontrole.',
    scanToastClean: 'Všechna pole nad 90 % spolehlivosti.',
    docSupplier: 'DODAVATEL',
    docClient: 'ODBĚRATEL',
    docKind: 'FAKTURA — DAŇOVÝ DOKLAD',
    docIco: 'IČO',
    docDic: 'DIČ',
    docVs: 'Variabilní symbol',
    docIssue: 'Datum vystavení',
    docDue: 'Datum splatnosti',
    docDesc: 'Popis',
    docQty: 'Počet',
    docUnit: 'Cena',
    docTotal: 'Celkem',
    docBase: 'Základ bez DPH',
    docVat: 'DPH 21 %',
    docSum: 'Celkem k úhradě',
    docFooter: 'Platba převodem · děkujeme za spolupráci',
    docQr: 'QR PLATBA',
    ourName: 'AI Business Lab s.r.o.',
    ourAddr: 'Pekárenská 7, 602 00 Brno',
  },
  en: {
    title: 'Document processing',
    subtitle: 'An invoice from an attachment into a table — even a bad scan',
    drop: 'Drop the invoice here',
    dropNote: 'or click one of the sample attachments',
    dropToast: 'Only sample invoices are read in the demo',
    dropToastBody: 'Your file goes nowhere. I picked one of the attachments for you.',
    samples: 'Sample attachments',
    poorTag: 'bad scan',
    written: 'written',
    extract: 'Extract the data',
    extractAgain: 'Extract again',
    extracting: 'Extracting…',
    pickFirst: 'Pick an attachment',
    pickFirstBody: 'Click an invoice on the left, or drag one into the zone.',
    stages: ['Extraction', 'Duplicate check', 'Write'],
    statusIdle: 'Pick an attachment and start the extraction.',
    statusScan: 'Scanning the document and looking for known fields…',
    statusCheck: 'Checking the payment reference against the table…',
    statusDup: 'This payment reference is already in the table. Your call.',
    statusDone: 'Done. The document is closed.',
    preview: 'Attachment preview',
    previewEmpty: 'The preview appears once you pick an attachment',
    fields: 'Extracted fields',
    fieldsEmpty: 'Once started, fields pop in here as the scan line finds them.',
    confidence: 'confidence',
    toCheck: 'needs a human check',
    fix: 'Fix',
    confirm: 'Confirm',
    cancel: 'Back',
    verified: 'verified by a human',
    dupTitle: 'Duplicate',
    dupBody: (d) => `This invoice was already written on ${d}.`,
    dupHint: 'Matched on the payment reference and the supplier ID.',
    skip: 'Skip',
    writeAgain: 'Write anyway',
    tableTitle: 'Invoices written',
    colDoc: 'Document',
    colSupplier: 'Supplier',
    colVs: 'Ref.',
    colTotal: 'Total',
    colState: 'State',
    tableEmpty: 'Nothing written yet.',
    summary: (n, all) => `${n} of ${all} written · 6 minutes saved per document`,
    statDocs: 'Written',
    statSaved: 'Saved',
    statChecks: 'To check',
    minutes: 'min',
    fieldsCount: 'fields',
    doneToast: 'Invoice written',
    doneToastBody: 'The row popped into the table. In production it would go to accounting.',
    dupToast: 'Found a duplicate',
    dupToastBody: 'A document with the same payment reference is already in the table.',
    skipToast: 'Document skipped',
    skipToastBody: 'Nothing was written — the original record stays.',
    scanToast: '10 fields extracted',
    scanToastBody: 'Two fields from the bad scan went to a human.',
    scanToastClean: 'Every field above 90 % confidence.',
    docSupplier: 'SUPPLIER',
    docClient: 'CUSTOMER',
    docKind: 'INVOICE — TAX DOCUMENT',
    docIco: 'Company ID',
    docDic: 'VAT ID',
    docVs: 'Payment reference',
    docIssue: 'Issue date',
    docDue: 'Due date',
    docDesc: 'Description',
    docQty: 'Qty',
    docUnit: 'Price',
    docTotal: 'Total',
    docBase: 'Net total',
    docVat: 'VAT 21 %',
    docSum: 'Total due',
    docFooter: 'Payment by transfer · thank you',
    docQr: 'QR PAYMENT',
    ourName: 'AI Business Lab s.r.o.',
    ourAddr: 'Pekárenská 7, 602 00 Brno',
  },
}

const vatOf = (base) => Math.round(base * VAT_RATE)

function rawValue(file, key) {
  switch (key) {
    case 'supplier':
      return file.supplier
    case 'ico':
      return file.poor ? file.icoRaw : file.ico
    case 'dic':
      return file.poor ? file.dicRaw : file.dic
    case 'invoiceNo':
      return file.invoiceNo
    case 'vs':
      return file.vs
    case 'issue':
      return file.issue
    case 'due':
      return file.due
    case 'base':
      return czk(file.base)
    case 'vat':
      return czk(vatOf(file.base))
    case 'total':
      return czk(file.base + vatOf(file.base))
    default:
      return ''
  }
}

/** Deterministický vzor pro QR kód — ze jména souboru, aby byl pro každý jiný. */
function qrCells(seed) {
  const n = 13
  let h = 2166136261
  for (let i = 0; i < seed.length; i += 1) h = ((h ^ seed.charCodeAt(i)) * 16777619) >>> 0
  const cells = []
  for (let y = 0; y < n; y += 1) {
    for (let x = 0; x < n; x += 1) {
      const finder = (x < 4 && y < 4) || (x >= n - 4 && y < 4) || (x < 4 && y >= n - 4)
      if (finder) continue
      h = (h * 1103515245 + 12345) >>> 0
      if ((h >>> 17) % 100 < 46) cells.push({ x, y })
    }
  }
  return cells
}

function DocLabel({ x, y, anchor = 'start', children }) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fill="var(--muted)"
      fontSize="5.2"
      letterSpacing="0.5"
      style={{ fontFamily: 'var(--font-mono)' }}
    >
      {children}
    </text>
  )
}

function DocValue({ x, y, anchor = 'start', size = 8, weight = 400, mono = true, children }) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fill="var(--text)"
      fontSize={size}
      fontWeight={weight}
      style={{ fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)' }}
    >
      {children}
    </text>
  )
}

/** Stylizovaný náhled faktury. Highlighty ukazují, odkud se pole vytěžilo. */
function InvoiceSheet({ file, highlights, s, reduced }) {
  const cells = useMemo(() => qrCells(file.name), [file.name])
  const vat = vatOf(file.base)

  return (
    <svg viewBox="0 0 300 410" className="block h-auto w-full" role="img" aria-label={file.name}>
      <rect x="0" y="0" width="300" height="410" fill="var(--surface)" />
      <rect x="0" y="0" width="300" height="2.5" fill="var(--line-strong)" />

      <DocLabel x={14} y={21}>
        {s.docSupplier}
      </DocLabel>
      <DocValue x={14} y={41} size={11.5} weight={600} mono={false}>
        {file.supplier}
      </DocValue>
      <DocLabel x={14} y={59}>
        {s.docIco}
      </DocLabel>
      <DocValue x={52} y={59.5}>
        {rawValue(file, 'ico')}
      </DocValue>
      <DocLabel x={14} y={73}>
        {s.docDic}
      </DocLabel>
      <DocValue x={52} y={73.5}>
        {rawValue(file, 'dic')}
      </DocValue>

      <DocLabel x={286} y={21} anchor="end">
        {s.docKind}
      </DocLabel>
      <DocValue x={286} y={41} anchor="end" size={12} weight={600}>
        {file.invoiceNo}
      </DocValue>
      <DocLabel x={168} y={59}>
        {s.docVs}
      </DocLabel>
      <DocValue x={286} y={59.5} anchor="end">
        {file.vs}
      </DocValue>
      <DocLabel x={168} y={73}>
        {s.docIssue}
      </DocLabel>
      <DocValue x={286} y={73.5} anchor="end">
        {file.issue}
      </DocValue>
      <DocLabel x={168} y={87}>
        {s.docDue}
      </DocLabel>
      <DocValue x={286} y={87.5} anchor="end">
        {file.due}
      </DocValue>

      <path d="M14 100H286" stroke="var(--line)" strokeWidth="1" />

      <DocLabel x={14} y={116}>
        {s.docClient}
      </DocLabel>
      <DocValue x={14} y={130} size={8.6} weight={600} mono={false}>
        {s.ourName}
      </DocValue>
      <DocValue x={14} y={141} size={6.6}>
        {s.ourAddr}
      </DocValue>

      <DocLabel x={14} y={160}>
        {s.docDesc}
      </DocLabel>
      <DocLabel x={200} y={160} anchor="end">
        {s.docQty}
      </DocLabel>
      <DocLabel x={242} y={160} anchor="end">
        {s.docUnit}
      </DocLabel>
      <DocLabel x={286} y={160} anchor="end">
        {s.docTotal}
      </DocLabel>
      <path d="M14 164H286" stroke="var(--line)" strokeWidth="1" />

      {file.items.map((item, i) => {
        const y = 178 + i * 19
        return (
          <g key={i}>
            <rect x="14" y={y - 7} width={item.desc} height="4" rx="2" fill="var(--line-strong)" />
            <rect x="14" y={y} width={item.desc * 0.56} height="3" rx="1.5" fill="var(--line)" />
            <DocValue x={200} y={y - 3} anchor="end" size={7}>
              {item.qty}
            </DocValue>
            <DocValue x={242} y={y - 3} anchor="end" size={7}>
              {czk(item.unit)}
            </DocValue>
            <DocValue x={286} y={y - 3} anchor="end" size={7.4}>
              {czk(item.total)}
            </DocValue>
            <path d={`M14 ${y + 8}H286`} stroke="var(--line)" strokeWidth="0.6" />
          </g>
        )
      })}

      {/* QR kód */}
      <g transform="translate(14 296)">
        {[
          [0, 0],
          [9, 0],
          [0, 9],
        ].map(([fx, fy]) => (
          <g key={`${fx}-${fy}`}>
            <rect
              x={fx * 4 + 1}
              y={fy * 4 + 1}
              width="10"
              height="10"
              fill="none"
              stroke="var(--text)"
              strokeWidth="2"
            />
            <rect x={fx * 4 + 4} y={fy * 4 + 4} width="4" height="4" fill="var(--text)" />
          </g>
        ))}
        {cells.map((cell) => (
          <rect
            key={`${cell.x}-${cell.y}`}
            x={cell.x * 4}
            y={cell.y * 4}
            width="3.4"
            height="3.4"
            fill="var(--text)"
          />
        ))}
      </g>
      <DocLabel x={14} y={360}>
        {s.docQr}
      </DocLabel>

      <DocLabel x={170} y={308}>
        {s.docBase}
      </DocLabel>
      <DocValue x={286} y={308.5} anchor="end" size={8}>
        {czk(file.base)}
      </DocValue>
      <DocLabel x={170} y={322}>
        {s.docVat}
      </DocLabel>
      <DocValue x={286} y={322.5} anchor="end" size={8}>
        {czk(vat)}
      </DocValue>
      <path d="M164 328H286" stroke="var(--text)" strokeWidth="1" />
      <DocLabel x={170} y={342}>
        {s.docSum}
      </DocLabel>
      <DocValue x={286} y={343} anchor="end" size={10.5} weight={600}>
        {czk(file.base + vat)}
      </DocValue>

      <DocLabel x={14} y={396}>
        {s.docFooter}
      </DocLabel>

      {/* výřezy, ze kterých se pole vytěžilo */}
      {FIELDS.filter((field) => highlights.includes(field.key)).map((field) => {
        const [x, y, w, h] = field.box
        return (
          <motion.g
            key={field.key}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduced ? 0.01 : 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <rect x={x} y={y} width={w} height={h} rx="2.5" fill="var(--accent)" fillOpacity="0.14" />
            <rect
              x={x}
              y={y}
              width={w}
              height={h}
              rx="2.5"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1.1"
            />
          </motion.g>
        )
      })}
    </svg>
  )
}

/** Zjednodušený dokument pro compact náhled — jen bloky, žádný text. */
function DocSketch({ className }) {
  return (
    <svg viewBox="0 0 120 170" className={className} aria-hidden>
      <rect x="0" y="0" width="120" height="170" fill="var(--surface)" />
      <rect x="0" y="0" width="120" height="1.6" fill="var(--line-strong)" />
      <rect x="10" y="10" width="42" height="5" rx="2.5" fill="var(--text)" opacity="0.7" />
      <rect x="10" y="20" width="30" height="3" rx="1.5" fill="var(--line-strong)" />
      <rect x="10" y="27" width="26" height="3" rx="1.5" fill="var(--line-strong)" />
      <rect x="74" y="10" width="36" height="6" rx="2" fill="var(--text)" opacity="0.5" />
      <rect x="82" y="21" width="28" height="3" rx="1.5" fill="var(--line-strong)" />
      <rect x="86" y="28" width="24" height="3" rx="1.5" fill="var(--line-strong)" />
      <path d="M10 40h100" stroke="var(--line)" strokeWidth="0.8" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x="10" y={50 + i * 14} width={56 - i * 7} height="3.4" rx="1.7" fill="var(--line-strong)" />
          <rect x="88" y={50 + i * 14} width="22" height="3.4" rx="1.7" fill="var(--line)" />
          <path d={`M10 ${58 + i * 14}h100`} stroke="var(--line)" strokeWidth="0.5" />
        </g>
      ))}
      <g transform="translate(10 118)">
        {[
          [0, 0],
          [7, 0],
          [0, 7],
        ].map(([fx, fy]) => (
          <g key={`${fx}-${fy}`}>
            <rect x={fx * 3.4 + 1} y={fy * 3.4 + 1} width="8" height="8" fill="none" stroke="var(--text)" strokeWidth="1.6" />
            <rect x={fx * 3.4 + 3.4} y={fy * 3.4 + 3.4} width="3" height="3" fill="var(--text)" />
          </g>
        ))}
        {[
          [5, 2],
          [7, 3],
          [4, 5],
          [6, 6],
          [8, 5],
          [2, 7],
          [5, 8],
          [7, 8],
          [3, 9],
          [8, 2],
        ].map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x * 3.4} y={y * 3.4} width="2.8" height="2.8" fill="var(--text)" />
        ))}
      </g>
      <rect x="66" y="122" width="44" height="3.4" rx="1.7" fill="var(--line-strong)" />
      <rect x="74" y="132" width="36" height="3.4" rx="1.7" fill="var(--line-strong)" />
      <path d="M62 142h48" stroke="var(--text)" strokeWidth="0.8" />
      <rect x="70" y="148" width="40" height="5" rx="2.5" fill="var(--text)" opacity="0.75" />
    </svg>
  )
}

/** Svítící linka, která přejede dokument. */
function ScanBeam({ loop, reduced }) {
  if (reduced) return null
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 z-20"
      initial={{ top: '-6%' }}
      animate={{ top: loop ? ['-6%', '104%'] : '104%' }}
      transition={{
        duration: loop ? 3.5 : SCAN_MS / 1000,
        ease: 'linear',
        repeat: loop ? Infinity : 0,
      }}
    >
      <div
        className="h-16 -translate-y-full"
        style={{
          background:
            'linear-gradient(to bottom, transparent, color-mix(in srgb, var(--accent) 26%, transparent))',
        }}
      />
      <div className="h-0.5 bg-accent" style={{ boxShadow: '0 0 16px 2px var(--accent)' }} />
    </motion.div>
  )
}

export default function DocumentsDemo({ compact = false }) {
  const { lang } = useT()
  const s = L[lang] ?? L.cs
  const reduced = useReducedMotion()
  const { push } = useToast()

  const [fileId, setFileId] = useState(null)
  const [phase, setPhase] = useState('idle')
  const [revealed, setRevealed] = useState([])
  const [edits, setEdits] = useState({})
  const [editing, setEditing] = useState(null)
  const [draft, setDraft] = useState('')
  const [rows, setRows] = useState([])
  const [handled, setHandled] = useState([])
  const [over, setOver] = useState(false)
  const [compactStep, setCompactStep] = useState(reduced ? 4 : 0)

  const timers = useRef([])
  const clearTimers = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }
  useEffect(() => clearTimers, [])

  // Compact náhled: pole naskakují ve stejném rytmu, v jakém běží linka.
  useEffect(() => {
    if (!compact || reduced) return
    const id = setInterval(() => setCompactStep((n) => (n + 1) % 5), 700)
    return () => clearInterval(id)
  }, [compact, reduced])

  const file = FILES.find((item) => item.id === fileId) ?? null

  const shownValue = (key) => (file ? edits[key] ?? rawValue(file, key) : '')
  const confOf = (key) => (edits[key] != null ? 100 : file?.conf[key] ?? 0)
  const lowCount = revealed.filter((key) => confOf(key) < LOW_CONF).length

  const selectFile = (next) => {
    clearTimers()
    setFileId(next.id)
    setPhase('idle')
    setRevealed([])
    setEdits({})
    setEditing(null)
  }

  const extract = () => {
    if (!file) {
      push({ title: s.pickFirst, description: s.pickFirstBody, variant: 'warn' })
      return
    }
    clearTimers()
    setRevealed([])
    setEdits({})
    setEditing(null)

    if (reduced) {
      setRevealed(REVEAL_ORDER.map((field) => field.key))
      finishScan()
      return
    }

    setPhase('scanning')
    REVEAL_ORDER.forEach((field) => {
      const delay = 200 + (field.box[1] / 410) * SCAN_MS
      timers.current.push(
        setTimeout(() => setRevealed((list) => [...list, field.key]), delay)
      )
    })
    timers.current.push(setTimeout(finishScan, SCAN_MS + 120))
  }

  function finishScan() {
    push({
      title: s.scanToast,
      description: file?.poor ? s.scanToastBody : s.scanToastClean,
      variant: file?.poor ? 'warn' : 'success',
    })
    setPhase('checking')
    timers.current.push(
      setTimeout(
        () => {
          if (file?.duplicate) {
            setPhase('duplicate')
            push({ title: s.dupToast, description: s.dupToastBody, variant: 'warn' })
          } else {
            writeRow(false)
          }
        },
        reduced ? 0 : CHECK_MS
      )
    )
  }

  function writeRow(again) {
    if (!file) return
    setRows((list) => [
      ...list,
      {
        id: uid('row'),
        doc: file.name,
        supplier: edits.supplier ?? file.supplier,
        vs: edits.vs ?? file.vs,
        total: czk(file.base + vatOf(file.base)),
        again,
      },
    ])
    setHandled((list) => (list.includes(file.id) ? list : [...list, file.id]))
    setPhase('done')
    push({ title: s.doneToast, description: s.doneToastBody, variant: 'success' })
  }

  const skip = () => {
    if (!file) return
    setHandled((list) => (list.includes(file.id) ? list : [...list, file.id]))
    setPhase('done')
    push({ title: s.skipToast, description: s.skipToastBody, variant: 'info' })
  }

  const reset = () => {
    clearTimers()
    setFileId(null)
    setPhase('idle')
    setRevealed([])
    setEdits({})
    setEditing(null)
    setRows([])
    setHandled([])
  }

  const onDrop = (event) => {
    event.preventDefault()
    setOver(false)
    const next = FILES.find((item) => !handled.includes(item.id)) ?? FILES[0]
    selectFile(next)
    push({ title: s.dropToast, description: s.dropToastBody, variant: 'info' })
  }

  const columns = useMemo(
    () => [
      {
        key: 'doc',
        label: s.colDoc,
        mono: true,
        render: (row) => (
          <Pop reduced={reduced} delay={0}>
            <FileText size={11} className="shrink-0 text-muted" />
            <span className="truncate">{row.doc}</span>
          </Pop>
        ),
      },
      {
        key: 'supplier',
        label: s.colSupplier,
        render: (row) => (
          <Pop reduced={reduced} delay={0.05}>
            {row.supplier}
          </Pop>
        ),
      },
      {
        key: 'vs',
        label: s.colVs,
        mono: true,
        render: (row) => (
          <Pop reduced={reduced} delay={0.1}>
            {row.vs}
          </Pop>
        ),
      },
      {
        key: 'total',
        label: s.colTotal,
        align: 'right',
        mono: true,
        render: (row) => (
          <Pop reduced={reduced} delay={0.15}>
            {row.total}
          </Pop>
        ),
      },
      {
        key: 'state',
        label: s.colState,
        render: (row) => (
          <Pop reduced={reduced} delay={0.2}>
            <Badge tone={row.again ? 'warn' : 'ok'} dot>
              {row.again ? s.dupTitle : s.written}
            </Badge>
          </Pop>
        ),
      },
    ],
    [s, reduced]
  )

  if (compact) {
    const preview = FILES[0]
    const shown = COMPACT_FIELDS.slice(0, reduced ? 4 : compactStep)
    return (
      <div className="flex h-full items-stretch gap-3 overflow-hidden">
        <div className="relative w-[40%] shrink-0 overflow-hidden rounded-lg border border-line bg-surface">
          <DocSketch className="h-full w-full" />
          <ScanBeam loop reduced={reduced} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5" aria-hidden>
          <p className="label-mono text-[0.58rem]">{s.fields}</p>
          {COMPACT_FIELDS.map((field) => {
            const visible = shown.includes(field)
            return (
              <div
                key={field.key}
                className={cn(
                  'rounded-lg border px-2 py-1.5 transition-all duration-500',
                  visible
                    ? 'translate-x-0 border-line bg-surface-2 opacity-100'
                    : 'translate-x-2 border-transparent opacity-0'
                )}
              >
                <p className="label-mono text-[0.5rem] leading-none">{field[lang] ?? field.cs}</p>
                <p className="mt-1 truncate font-mono text-[0.68rem] leading-none">
                  {rawValue(preview, field.key)}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const scanning = phase === 'scanning'
  const stage = phase === 'idle' ? 0 : scanning ? 0 : phase === 'checking' ? 1 : phase === 'duplicate' ? 1 : 3
  const status =
    phase === 'scanning'
      ? s.statusScan
      : phase === 'checking'
        ? s.statusCheck
        : phase === 'duplicate'
          ? s.statusDup
          : phase === 'done'
            ? s.statusDone
            : s.statusIdle

  return (
    <DemoShell title={s.title} subtitle={s.subtitle} live onReset={reset}>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,15.5rem)_minmax(0,1fr)]">
        {/* --- vstup --- */}
        <div className="space-y-4">
          <div
            onDragOver={(event) => {
              event.preventDefault()
              setOver(true)
            }}
            onDragEnter={(event) => {
              event.preventDefault()
              setOver(true)
            }}
            onDragLeave={() => setOver(false)}
            onDrop={onDrop}
            className={cn(
              'rounded-xl border border-dashed p-4 text-center transition duration-300',
              over
                ? 'border-accent bg-accent/12'
                : 'border-line bg-surface-2/40 hover:border-line-strong'
            )}
          >
            <FileUp
              size={22}
              strokeWidth={1.7}
              className={cn('mx-auto transition-colors duration-300', over ? 'text-accent' : 'text-muted')}
            />
            <p className="mt-2 text-[0.84rem] font-medium">{s.drop}</p>
            <p className="mt-0.5 text-[0.74rem] leading-snug text-muted">{s.dropNote}</p>
          </div>

          <div>
            <p className="label-mono">{s.samples}</p>
            <div className="mt-2 space-y-2">
              {FILES.map((item) => {
                const active = item.id === fileId
                const done = handled.includes(item.id)
                const Icon = item.kind === 'img' ? FileImage : FileText
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectFile(item)}
                    aria-pressed={active}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left transition duration-300',
                      active
                        ? 'border-accent/60 bg-accent/10'
                        : 'border-line bg-surface-2/50 hover:border-line-strong'
                    )}
                  >
                    <Icon size={15} className={cn('shrink-0', active ? 'text-text' : 'text-muted')} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-mono text-[0.72rem]">{item.name}</span>
                      <span className="label-mono block text-[0.55rem]">
                        {item.size}
                        {item.poor ? ` · ${s.poorTag}` : ''}
                      </span>
                    </span>
                    {done && <Check size={13} strokeWidth={3} className="shrink-0 text-ok" />}
                  </button>
                )
              })}
            </div>
          </div>

          <Button
            onClick={extract}
            icon={ScanLine}
            iconRight={false}
            disabled={scanning || phase === 'checking'}
            className="w-full"
          >
            {scanning ? s.extracting : phase === 'done' ? s.extractAgain : s.extract}
          </Button>

          <div>
            <StepTrail steps={s.stages} current={stage} />
            <p className="mt-2 text-[0.76rem] leading-snug text-muted" aria-live="polite">
              {status}
            </p>
          </div>

          <FakeDataNote />
        </div>

        {/* --- náhled + vytěžená pole --- */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="label-mono mb-2">{s.preview}</p>
            {file ? (
              <div className="relative overflow-hidden rounded-xl border border-line bg-surface shadow-[var(--shadow-soft)]">
                <div
                  className={cn(
                    'origin-center',
                    file.poor && '-rotate-1 [filter:blur(0.35px)_contrast(0.94)]'
                  )}
                >
                  <InvoiceSheet file={file} highlights={revealed} s={s} reduced={reduced} />
                </div>
                {file.poor && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(118deg, transparent 34%, var(--trace) 60%, transparent 90%)',
                    }}
                  />
                )}
                {scanning && <ScanBeam reduced={reduced} />}
              </div>
            ) : (
              <div className="grid min-h-[14rem] place-items-center rounded-xl border border-dashed border-line bg-surface-2/40 p-5 text-center">
                <p className="text-[0.8rem] text-muted">{s.previewEmpty}</p>
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="label-mono">{s.fields}</p>
              {revealed.length > 0 && (
                <span className="font-mono text-[0.62rem] text-muted tabular-nums">
                  {revealed.length}/{FIELDS.length} {s.fieldsCount}
                </span>
              )}
            </div>

            {revealed.length === 0 ? (
              <div className="rounded-xl border border-dashed border-line bg-surface-2/40 p-4">
                <p className="text-[0.8rem] leading-relaxed text-muted">{s.fieldsEmpty}</p>
              </div>
            ) : (
              <div className="space-y-1.5" aria-live="polite">
                {revealed.map((key) => {
                  const field = FIELDS.find((item) => item.key === key)
                  if (!field) return null
                  const conf = confOf(key)
                  const low = conf < LOW_CONF
                  const fixed = edits[key] != null
                  return (
                    <motion.div
                      key={key}
                      initial={reduced ? { opacity: 0 } : { opacity: 0, x: 14 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className={cn(
                        'rounded-xl border px-2.5 py-2',
                        low ? 'border-warn/45 bg-warn/10' : 'border-line bg-surface-2/60'
                      )}
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="label-mono text-[0.55rem]">{field[lang] ?? field.cs}</p>
                        <span
                          aria-label={`${s.confidence} ${conf} %`}
                          className={cn(
                            'font-mono text-[0.6rem] tabular-nums',
                            low ? 'text-warn' : fixed ? 'text-ok' : 'text-muted'
                          )}
                        >
                          {conf} %
                        </span>
                      </div>

                      {editing === key ? (
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          <input
                            value={draft}
                            onChange={(event) => setDraft(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter') {
                                event.preventDefault()
                                setEdits((map) => ({ ...map, [key]: draft.trim() || shownValue(key) }))
                                setEditing(null)
                              }
                              if (event.key === 'Escape') setEditing(null)
                            }}
                            aria-label={field[lang] ?? field.cs}
                            className="min-w-[7rem] flex-1 rounded-lg border border-accent/60 bg-surface px-2 py-1 font-mono text-[0.74rem] outline-none"
                          />
                          <Button
                            size="sm"
                            className="h-8 px-2.5"
                            onClick={() => {
                              setEdits((map) => ({ ...map, [key]: draft.trim() || shownValue(key) }))
                              setEditing(null)
                            }}
                          >
                            {s.confirm}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2"
                            onClick={() => setEditing(null)}
                          >
                            {s.cancel}
                          </Button>
                        </div>
                      ) : (
                        <p className="mt-0.5 break-words font-mono text-[0.8rem]">{shownValue(key)}</p>
                      )}

                      <div className="mt-1 flex items-center gap-2">
                        <span
                          aria-hidden
                          className="h-1 flex-1 overflow-hidden rounded-full bg-line"
                        >
                          <span
                            className={cn(
                              'block h-full rounded-full transition-all duration-700',
                              low ? 'bg-warn' : 'bg-accent'
                            )}
                            style={{ width: `${clamp(conf, 0, 100)}%` }}
                          />
                        </span>
                        {fixed && (
                          <span className="flex items-center gap-1 font-mono text-[0.56rem] text-ok">
                            <Check size={9} strokeWidth={3.5} />
                            {s.verified}
                          </span>
                        )}
                      </div>

                      {low && editing !== key && (
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          <span className="flex items-center gap-1 font-mono text-[0.58rem] text-warn">
                            <AlertTriangle size={9.5} strokeWidth={2.6} />
                            {s.toCheck}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setDraft(shownValue(key))
                              setEditing(key)
                            }}
                            className="ml-auto flex items-center gap-1 rounded-lg border border-line px-1.5 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.08em] text-text-soft transition hover:border-line-strong hover:text-text"
                          >
                            <Pencil size={9} />
                            {s.fix}
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- duplicita --- */}
      <AnimatePresence>
        {phase === 'duplicate' && file && (
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-5 rounded-xl border border-warn/45 bg-warn/10 p-4"
            aria-live="polite"
          >
            <div className="flex flex-wrap items-start gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-warn/20 text-warn">
                <Copy size={15} strokeWidth={2.4} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[0.9rem] font-semibold">
                  {s.dupTitle}: {s.dupBody(file.duplicateDate)}
                </p>
                <p className="mt-0.5 font-mono text-[0.68rem] text-muted">
                  {s.dupHint} · VS {shownValue('vs')}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" variant="quiet" icon={SkipForward} iconRight={false} onClick={skip}>
                  {s.skip}
                </Button>
                <Button size="sm" variant="outline" onClick={() => writeRow(true)}>
                  {s.writeAgain}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- tabulka --- */}
      <div className="mt-6">
        <LabeledRule>{s.tableTitle}</LabeledRule>

        <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
          <StatTile label={s.statDocs} value={`${rows.length}/${FILES.length}`} icon={FileText} />
          <StatTile
            label={s.statSaved}
            value={`${rows.length * 6} ${s.minutes}`}
            delta={s.summary(rows.length, FILES.length)}
            tone="up"
            icon={ScanLine}
          />
          <StatTile
            label={s.statChecks}
            value={lowCount}
            tone={lowCount > 0 ? 'down' : 'neutral'}
            icon={AlertTriangle}
          />
        </div>

        <MiniTable className="mt-3" columns={columns} rows={rows} emptyLabel={s.tableEmpty} />
      </div>
    </DemoShell>
  )
}

/** Obsah buňky, který naskočí — řádek v MiniTable se tím rozjede zleva. */
function Pop({ children, delay = 0, reduced }) {
  return (
    <motion.span
      className="inline-flex min-w-0 items-center gap-1.5"
      initial={reduced ? { opacity: 0 } : { opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.span>
  )
}
