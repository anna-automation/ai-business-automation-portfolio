import { useEffect, useMemo, useRef, useState } from 'react'
import {
  BookOpen,
  Bot,
  ChevronDown,
  CornerDownLeft,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  Quote,
  Search,
  Send,
  Sparkles,
  User,
} from 'lucide-react'
import { DemoShell, FakeDataNote } from './_shell.jsx'
import { Badge, Kbd, Skeleton } from '../ui/primitives.jsx'
import { Button } from '../ui/Button.jsx'
import { useT } from '../../lib/i18n.jsx'
import { useReducedMotion } from '../../lib/prefs.jsx'
import { cn, fold, formatDate, uid } from '../../lib/utils.js'

/**
 * AI asistent pro zaměstnance — chatbot nad firemními dokumenty.
 *
 * Dvě věci, na kterých tohle demo stojí:
 *   1. každá odpověď má citaci s dokumentem a stranou,
 *   2. na co v bázi není podklad, to asistent přizná a pošle dál na člověka.
 * Odpovědi se vybírají lokálně podle klíčových slov, nikam se nic neposílá.
 */

const TYPE_CHUNK = 4
const TYPE_TICK = 14
const SEARCH_MS = 950
const FOUND_MS = 800

const DOCS = [
  {
    id: 'rad',
    kind: 'pdf',
    pages: 42,
    date: '2026-01-12',
    name: { cs: 'Pracovní řád 2026.pdf', en: 'Employee Handbook 2026.pdf' },
    unit: { cs: 'stran', en: 'pages' },
  },
  {
    id: 'cestovni',
    kind: 'doc',
    pages: 18,
    date: '2026-02-03',
    name: { cs: 'Směrnice o cestovních náhradách.docx', en: 'Travel Expenses Policy.docx' },
    unit: { cs: 'stran', en: 'pages' },
  },
  {
    id: 'mzdy',
    kind: 'pdf',
    pages: 26,
    date: '2026-01-01',
    name: { cs: 'Mzdový předpis.pdf', en: 'Payroll Rules.pdf' },
    unit: { cs: 'stran', en: 'pages' },
  },
  {
    id: 'cenik',
    kind: 'sheet',
    pages: 7,
    date: '2026-03-15',
    name: { cs: 'Ceník služeb 2026.xlsx', en: 'Service Price List 2026.xlsx' },
    unit: { cs: 'listů', en: 'sheets' },
  },
  {
    id: 'bezpecnost',
    kind: 'pdf',
    pages: 11,
    date: '2026-04-20',
    name: { cs: 'Bezpečnostní pravidla pro AI.pdf', en: 'AI Security Rules.pdf' },
    unit: { cs: 'stran', en: 'pages' },
  },
]

const DOC_ICONS = { pdf: FileText, doc: FileText, sheet: FileSpreadsheet }

const ANSWERS = [
  {
    id: 'dovolena',
    keys: ['dovolen', 'volno', 'vacation', 'holiday', 'leave', 'pto'],
    question: { cs: 'Kolik mám dní dovolené?', en: 'How many days of leave do I get?' },
    text: {
      cs: 'Podle pracovního řádu máte nárok na 25 dní dovolené za kalendářní rok. Pokud u firmy pracujete nepřetržitě alespoň pět let, nárok se zvyšuje o 1 den, nejvýše do 28 dní.\n\nNevyčerpanou dovolenou lze převést do dalšího roku, ale jen v rozsahu 5 dní, a musíte ji vybrat do 31. 3. Žádost se podává v intranetu nejpozději 14 dní před nástupem, u dovolené delší než 10 dní 30 dní předem.\n\nVáš konkrétní zůstatek v dokumentech není — ten najdete v portálu Moje mzda.',
      en: 'Under the employee handbook you are entitled to 25 days of leave per calendar year. If you have been with the company continuously for at least five years, the entitlement rises by 1 day, up to a maximum of 28 days.\n\nUnused leave can be carried over into the next year, but only up to 5 days, and it has to be taken by 31 March. Requests go through the intranet at least 14 days in advance, or 30 days in advance for leave longer than 10 days.\n\nYour personal balance is not in the documents — you will find it in the My Payroll portal.',
    },
    compact: {
      cs: 'Máte nárok na 25 dní dovolené za rok. Po pěti letech u firmy se nárok zvyšuje o 1 den, nejvýše do 28 dní.',
      en: 'You are entitled to 25 days of leave per year. After five years with the company it rises by 1 day, up to 28 days.',
    },
    cites: [
      {
        doc: 'rad',
        at: { cs: 'strana 12', en: 'page 12' },
        quote: {
          cs: 'Čl. 7.2 — Zaměstnanci přísluší dovolená v délce 25 pracovních dnů za kalendářní rok. Zaměstnanci, jehož pracovní poměr u společnosti trvá nepřetržitě alespoň pět let, přísluší dovolená delší o jeden pracovní den, nejvýše však v délce 28 pracovních dnů.',
          en: 'Art. 7.2 — An employee is entitled to 25 working days of leave per calendar year. An employee whose employment with the company has lasted continuously for at least five years is entitled to one additional working day, up to a maximum of 28 working days.',
        },
      },
      {
        doc: 'mzdy',
        at: { cs: 'strana 8', en: 'page 8' },
        quote: {
          cs: '§ 4 odst. 3 — Nevyčerpanou část dovolené lze převést do následujícího kalendářního roku v rozsahu nejvýše pěti pracovních dnů. Převedenou dovolenou je zaměstnanec povinen vyčerpat do 31. března následujícího roku, jinak její nástup určí zaměstnavatel.',
          en: 'Sec. 4 (3) — Up to five working days of unused leave may be carried over into the following calendar year. Carried-over leave must be taken by 31 March of the following year, otherwise the employer sets the dates.',
        },
      },
    ],
  },
  {
    id: 'cestovni',
    keys: ['cestov', 'nahrad', 'stravn', 'kilometr', 'travel', 'expense', 'mileage', 'diem', 'allowance'],
    question: { cs: 'Jak se účtuje cestovní náhrada?', en: 'How are travel expenses reimbursed?' },
    text: {
      cs: 'Při použití vlastního vozidla se náhrada počítá jako 6 Kč za kilometr plus náhrada za spotřebované palivo podle průměrné ceny vyhlášené pro rok 2026. Podmínkou je předchozí souhlas nadřízeného.\n\nStravné je odstupňované podle délky cesty: 160 Kč při 5–12 hodinách, 250 Kč při 12–18 hodinách a 380 Kč nad 18 hodin. Jízdenky, parkování a dálniční známka se hradí v plné výši proti dokladu.\n\nVyúčtování odevzdejte do 10 pracovních dnů od konce cesty. Po této lhůtě se náhrada vyplatí až v dalším mzdovém období.',
      en: 'When you use your own vehicle, the reimbursement is CZK 6 per kilometre plus the cost of fuel consumed, based on the average price published for 2026. Prior approval from your manager is required.\n\nMeal allowances are tiered by trip length: CZK 160 for 5–12 hours, CZK 250 for 12–18 hours and CZK 380 above 18 hours. Tickets, parking and motorway tolls are reimbursed in full against a receipt.\n\nSubmit your expense report within 10 working days of the end of the trip. After that deadline the reimbursement is paid out in the next payroll period.',
    },
    cites: [
      {
        doc: 'cestovni',
        at: { cs: 'strana 4', en: 'page 4' },
        quote: {
          cs: 'Čl. 3.1 — Použije-li zaměstnanec se souhlasem zaměstnavatele vlastní silniční motorové vozidlo, přísluší mu základní náhrada ve výši 6,00 Kč za 1 km jízdy a náhrada za spotřebovanou pohonnou hmotu podle průměrné ceny vyhlášené pro příslušný kalendářní rok.',
          en: 'Art. 3.1 — If an employee uses their own road motor vehicle with the employer’s consent, they are entitled to a basic allowance of CZK 6.00 per kilometre plus reimbursement of fuel consumed, based on the average price published for the relevant calendar year.',
        },
      },
      {
        doc: 'cestovni',
        at: { cs: 'strana 9', en: 'page 9' },
        quote: {
          cs: 'Čl. 5.4 — Zaměstnanec předloží vyúčtování cestovních náhrad nejpozději do 10 pracovních dnů ode dne ukončení cesty. Vyúčtování předložené po této lhůtě se zpracuje v nejblíže následujícím mzdovém období.',
          en: 'Art. 5.4 — The employee shall submit the travel expense report within 10 working days of the end of the trip at the latest. A report submitted after this deadline is processed in the next payroll period.',
        },
      },
    ],
  },
  {
    id: 'vypoved',
    keys: ['vypoved', 'vypovedn', 'zkusebn', 'odchod', 'skonc', 'notice', 'resign', 'probation', 'terminat'],
    question: { cs: 'Jaká je výpovědní lhůta?', en: 'What is the notice period?' },
    text: {
      cs: 'Výpovědní doba je 2 měsíce a je stejná pro zaměstnance i zaměstnavatele. Začíná běžet prvním dnem kalendářního měsíce, který následuje po doručení výpovědi — výpověď doručená 20. listopadu tedy znamená konec pracovního poměru 31. ledna.\n\nVe zkušební době, sjednané na 3 měsíce, lze pracovní poměr ukončit bez udání důvodu; písemné oznámení má být doručeno alespoň 3 dny před požadovaným koncem.\n\nDohodou se dá poměr ukončit kdykoli ke dni, na kterém se obě strany shodnou — výpovědní doba se pak neuplatní.',
      en: 'The notice period is 2 months and it is the same for the employee and the employer. It starts on the first day of the calendar month following delivery of the notice — so a notice delivered on 20 November means employment ends on 31 January.\n\nDuring the probationary period, set at 3 months, employment can be ended without giving a reason; the written notification should be delivered at least 3 days before the intended end date.\n\nBy mutual agreement employment can end on any date both parties agree on — the notice period then does not apply.',
    },
    cites: [
      {
        doc: 'rad',
        at: { cs: 'strana 31', en: 'page 31' },
        quote: {
          cs: 'Čl. 11.4 — Výpovědní doba činí dva měsíce a je shodná pro zaměstnavatele i zaměstnance. Začíná prvním dnem kalendářního měsíce následujícího po doručení výpovědi a končí uplynutím posledního dne příslušného kalendářního měsíce.',
          en: 'Art. 11.4 — The notice period is two months and is identical for the employer and the employee. It begins on the first day of the calendar month following delivery of the notice and ends on the last day of the relevant calendar month.',
        },
      },
    ],
  },
  {
    id: 'cenik',
    keys: ['cenik', 'cena', 'ceny', 'sazb', 'kolik stoji', 'price', 'pricing', 'rate', 'cost', 'fee'],
    question: { cs: 'Kolik stojí celodenní workshop?', en: 'How much does a full-day workshop cost?' },
    text: {
      cs: 'Pro rok 2026 platí tři sazby: konzultace a vývoj 1 450 Kč za hodinu, celodenní workshop 18 500 Kč za den (max. 14 účastníků) a paušál průběžné podpory 24 000 Kč za měsíc, který zahrnuje 12 hodin práce a reakci do 24 hodin.\n\nVšechny ceny jsou bez DPH. Na projekty nad 150 000 Kč se uplatňuje sleva 8 %. Dopravu v Praze neúčtujeme, mimo Prahu 12 Kč za kilometr.\n\nCeník platí do 31. 12. 2026, novější verzi v bázi nemám.',
      en: 'Three rates apply for 2026: consulting and development at CZK 1,450 per hour, a full-day workshop at CZK 18,500 per day (max. 14 participants), and a retainer for ongoing support at CZK 24,000 per month, covering 12 hours of work and a 24-hour response time.\n\nAll prices exclude VAT. Projects above CZK 150,000 get an 8% discount. Travel within Prague is not charged, outside Prague it is CZK 12 per kilometre.\n\nThe price list is valid until 31 December 2026; I have no newer version in the knowledge base.',
    },
    cites: [
      {
        doc: 'cenik',
        at: { cs: 'list „Sazby 2026“, řádky 4–6', en: 'sheet "Rates 2026", rows 4–6' },
        quote: {
          cs: 'Sazby 2026 — Konzultace a vývoj: 1 450 Kč / h. Workshop celodenní (max. 14 osob): 18 500 Kč / den. Paušál průběžné podpory: 24 000 Kč / měsíc, zahrnuje 12 h práce a reakci do 24 h. Ceny bez DPH. Platnost do 31. 12. 2026.',
          en: 'Rates 2026 — Consulting and development: CZK 1,450 / h. Full-day workshop (max. 14 people): CZK 18,500 / day. Ongoing support retainer: CZK 24,000 / month, covering 12 h of work and a 24-hour response. Prices exclude VAT. Valid until 31 December 2026.',
        },
      },
    ],
  },
  {
    id: 'bezpecnost',
    keys: ['bezpec', 'gdpr', 'ai', 'umel', 'osobni udaj', 'chatgpt', 'security', 'privacy', 'personal data', 'incident'],
    question: {
      cs: 'Můžu dát klientská data do AI nástroje?',
      en: 'Can I put client data into an AI tool?',
    },
    text: {
      cs: 'Ne do veřejných nástrojů. Osobní údaje klientů a zaměstnanců, údaje o zdravotním stavu, přihlašovací údaje a neveřejné finanční výkazy se smí zpracovávat jen ve schváleném firemním prostředí, kde je vypnuté učení z vstupů.\n\nVýstup AI vždy kontroluje člověk. U textů, které jdou externímu příjemci, platí princip dvou párů očí a do evidence se zapisuje, kdo a kdy schválil.\n\nPodezření na únik dat hlaste do 24 hodin na bezpecnost@firma.cz. Lhůta pro případné ohlášení úřadu je podle GDPR 72 hodin, takže zdržení bolí.',
      en: 'Not into public tools. Personal data of clients and employees, health data, login credentials and non-public financial statements may only be processed in the approved company environment, where training on inputs is switched off.\n\nAI output is always reviewed by a human. For texts going to an external recipient the four-eyes principle applies, and the register records who approved it and when.\n\nReport any suspected data breach within 24 hours to bezpecnost@firma.cz. Under the GDPR the deadline for notifying the authority is 72 hours, so delays hurt.',
    },
    cites: [
      {
        doc: 'bezpecnost',
        at: { cs: 'strana 3', en: 'page 3' },
        quote: {
          cs: 'Čl. 2.1 — Do nástrojů generativní umělé inteligence provozovaných mimo schválené firemní prostředí je zakázáno vkládat osobní údaje klientů a zaměstnanců, údaje o zdravotním stavu, přihlašovací údaje a neveřejné finanční výkazy.',
          en: 'Art. 2.1 — It is prohibited to enter personal data of clients and employees, health data, login credentials and non-public financial statements into generative AI tools operated outside the approved company environment.',
        },
      },
      {
        doc: 'bezpecnost',
        at: { cs: 'strana 7', en: 'page 7' },
        quote: {
          cs: 'Čl. 6.3 — Každý výstup generativní AI určený pro externího příjemce podléhá kontrole druhou osobou. Jméno schvalující osoby a čas schválení se zaznamenávají do evidence schválených výstupů.',
          en: 'Art. 6.3 — Every generative AI output intended for an external recipient is subject to review by a second person. The name of the approver and the time of approval are recorded in the register of approved outputs.',
        },
      },
    ],
  },
]

const SUGGESTED = ['dovolena', 'cestovni', 'vypoved']

const L = {
  cs: {
    title: 'AI asistent pro zaměstnance',
    subtitle: 'Odpovídá jen z firemních dokumentů — a vždy ukáže zdroj',
    kb: 'Znalostní báze',
    kbNote: 'Jen tyto dokumenty. Nic jiného asistent nezná.',
    used: 'Použito v poslední odpovědi',
    intro:
      'Dobrý den. Jsem asistentka nad firemními dokumenty — pracovním řádem, směrnicemi, mzdovým předpisem a ceníkem. Odpovídám jen z nich a u každé odpovědi ukážu, odkud ji mám.\n\nZkuste jednu z otázek níž, nebo se zeptejte vlastními slovy.',
    suggestions: 'Zkuste se zeptat',
    searching: 'Prohledávám 5 dokumentů…',
    found: 'Našla jsem 2 relevantní pasáže',
    foundOne: 'Našla jsem 1 relevantní pasáž',
    foundNone: 'Nenašla jsem žádnou relevantní pasáž',
    sources: 'Zdroje',
    showQuote: 'Zobrazit citovaný odstavec',
    hideQuote: 'Skrýt odstavec',
    placeholder: 'Zeptejte se na cokoliv z firemních dokumentů…',
    inputLabel: 'Dotaz na asistenta',
    send: 'Odeslat dotaz',
    enter: 'odešle',
    you: 'Vy',
    assistant: 'Asistentka',
    fallbackTitle: 'Tohle v bázi nemám',
    fallback:
      'Na tohle v znalostní bázi podklad nemám. Prohledala jsem všech 5 dokumentů a žádná pasáž vaší otázce neodpovídá, takže si odpověď nebudu vymýšlet.\n\nZkuste prosím personální oddělení — Petra Hrubá, linka 214, petra.hruba@firma.cz. Pokud jde o techniku, napište na IT podporu: Ondřej Šimek, linka 231.\n\nAž dokument s touhle informací do báze přidáte, odpovím rovnou.',
    noteTitle: 'Proč je důležité, že asistent umí říct „nevím“',
    note:
      'Většina chatbotů si na otázku bez podkladu něco vymyslí a zaměstnanec se podle toho zařídí. Tenhle asistent odpovídá jen tam, kde má v dokumentu oporu, a jinak pošle člověka za konkrétním kolegou. Zkuste se zeptat na něco, co v pěti dokumentech není — třeba na parkování nebo firemní telefony.',
    aiBadge: 'AI',
    cited: 'Citace',
    docsWord: 'dokumentů',
    compactNote: 'AI · každá odpověď s citací zdroje',
  },
  en: {
    title: 'AI assistant for employees',
    subtitle: 'Answers only from company documents — and always shows the source',
    kb: 'Knowledge base',
    kbNote: 'Only these documents. The assistant knows nothing else.',
    used: 'Used in the last answer',
    intro:
      'Hello. I am an assistant working over your company documents — the employee handbook, policies, payroll rules and price list. I answer only from those, and for every answer I show where it came from.\n\nTry one of the questions below, or ask in your own words.',
    suggestions: 'Try asking',
    searching: 'Searching 5 documents…',
    found: 'Found 2 relevant passages',
    foundOne: 'Found 1 relevant passage',
    foundNone: 'Found no relevant passage',
    sources: 'Sources',
    showQuote: 'Show the quoted paragraph',
    hideQuote: 'Hide the paragraph',
    placeholder: 'Ask anything from the company documents…',
    inputLabel: 'Question for the assistant',
    send: 'Send question',
    enter: 'sends',
    you: 'You',
    assistant: 'Assistant',
    fallbackTitle: 'I do not have this',
    fallback:
      'I have no basis for this in the knowledge base. I searched all 5 documents and no passage matches your question, so I am not going to invent an answer.\n\nPlease try the HR department — Petra Hrubá, extension 214, petra.hruba@firma.cz. For anything technical, write to IT support: Ondřej Šimek, extension 231.\n\nOnce a document with that information is added to the base, I will answer straight away.',
    noteTitle: 'Why it matters that the assistant can say "I do not know"',
    note:
      'Most chatbots make something up when a question has no basis, and the employee acts on it. This assistant answers only where a document backs it up, and otherwise points the person to a specific colleague. Try asking about something the five documents do not cover — parking, for instance, or company phones.',
    aiBadge: 'AI',
    cited: 'Quote',
    docsWord: 'documents',
    compactNote: 'AI · every answer cites its source',
  },
}

/** Lokální výběr odpovědi podle klíčových slov — žádné volání do AI. */
function matchAnswer(query) {
  const needle = fold(query)
  if (!needle.trim()) return null
  let best = null
  let bestScore = 0
  for (const answer of ANSWERS) {
    let score = 0
    for (const key of answer.keys) {
      const re = new RegExp(`(^|[^a-z0-9])${key.replace(/ /g, '[ -]')}`)
      if (re.test(needle)) score += 1
    }
    if (score > bestScore) {
      bestScore = score
      best = answer
    }
  }
  return bestScore > 0 ? best : null
}

export default function AssistantDemo({ compact = false }) {
  const { t, lang } = useT()
  const reduced = useReducedMotion()
  const s = L[lang] ?? L.cs

  const pick = (value) => value?.[lang] ?? value?.cs ?? ''

  const [messages, setMessages] = useState([{ id: 'intro', role: 'assistant', key: 'intro' }])
  const [pending, setPending] = useState(null)
  const [input, setInput] = useState('')
  const [openQuotes, setOpenQuotes] = useState([])
  const threadRef = useRef(null)

  const answerFor = (key) => (key === 'intro' ? s.intro : key === 'fallback' ? s.fallback : pick(ANSWERS.find((a) => a.id === key)?.text))
  const citesFor = (key) =>
    key === 'intro' || key === 'fallback' ? [] : (ANSWERS.find((a) => a.id === key)?.cites ?? [])

  // Fáze jedné odpovědi: hledání → nalezené pasáže → vypisování po znacích.
  useEffect(() => {
    if (compact || !pending) return

    if (pending.stage === 'search') {
      const id = setTimeout(
        () => setPending((p) => (p ? { ...p, stage: 'found' } : p)),
        SEARCH_MS
      )
      return () => clearTimeout(id)
    }

    if (pending.stage === 'found') {
      const id = setTimeout(
        () => setPending((p) => (p ? { ...p, stage: 'type', typed: 0 } : p)),
        FOUND_MS
      )
      return () => clearTimeout(id)
    }

    const full = answerFor(pending.key)
    if (pending.typed >= full.length) {
      setMessages((list) => [...list, { id: pending.id, role: 'assistant', key: pending.key }])
      setPending(null)
      return
    }
    const id = setTimeout(
      () =>
        setPending((p) =>
          p && p.stage === 'type'
            ? { ...p, typed: Math.min(full.length, p.typed + TYPE_CHUNK) }
            : p
        ),
      TYPE_TICK
    )
    return () => clearTimeout(id)
  }, [compact, pending, lang])

  // Vlákno drží poslední zprávu v dohledu.
  useEffect(() => {
    if (compact || reduced) return
    const el = threadRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [compact, reduced, messages, pending])

  const ask = (raw) => {
    const text = raw.trim()
    if (!text || pending) return
    const match = matchAnswer(text)
    const key = match ? match.id : 'fallback'
    const answerId = uid('a')

    setMessages((list) => [...list, { id: uid('q'), role: 'user', text }])
    setInput('')

    if (reduced) {
      setMessages((list) => [...list, { id: answerId, role: 'assistant', key }])
    } else {
      setPending({ id: answerId, key, stage: 'search', typed: 0 })
    }
  }

  const reset = () => {
    setPending(null)
    setMessages([{ id: 'intro', role: 'assistant', key: 'intro' }])
    setInput('')
    setOpenQuotes([])
  }

  const toggleQuote = (id) =>
    setOpenQuotes((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]))

  const lastAnswerKey = useMemo(() => {
    if (pending) return pending.key
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].role === 'assistant' && messages[i].key !== 'intro') return messages[i].key
    }
    return null
  }, [messages, pending])

  const usedDocs = useMemo(
    () => (lastAnswerKey ? citesFor(lastAnswerKey).map((c) => c.doc) : []),
    [lastAnswerKey]
  )

  /* ----------------------------------------------------------------- compact */

  if (compact) {
    return <CompactAssistant s={s} pick={pick} reduced={reduced} />
  }

  /* -------------------------------------------------------------------- full */

  const hasConversation = messages.length > 1 || pending

  return (
    <DemoShell
      title={s.title}
      subtitle={s.subtitle}
      live={Boolean(pending)}
      onReset={reset}
      toolbar={
        <Badge tone="violet" dot>
          {s.aiBadge}
        </Badge>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)]">
        {/* znalostní báze */}
        <aside className="rounded-2xl border border-line bg-surface-2/40 p-3">
          <p className="label-mono flex items-center gap-2">
            <BookOpen size={12} />
            {s.kb}
          </p>
          <ul className="mt-2.5 flex flex-col gap-1.5">
            {DOCS.map((doc) => {
              const Icon = DOC_ICONS[doc.kind] ?? FileText
              const used = usedDocs.includes(doc.id)
              return (
                <li
                  key={doc.id}
                  className={cn(
                    'flex items-start gap-2.5 rounded-xl border px-2.5 py-2 transition-colors duration-500',
                    used ? 'border-violet/45 bg-violet/12' : 'border-line bg-surface'
                  )}
                >
                  <Icon
                    size={14}
                    aria-hidden
                    className={cn('mt-0.5 shrink-0', used ? 'text-violet' : 'text-muted')}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-[0.78rem] font-medium">{pick(doc.name)}</p>
                    <p className="font-mono text-[0.65rem] text-muted">
                      {doc.pages} {pick(doc.unit)} ·{' '}
                      {formatDate(doc.date, lang === 'en' ? 'en-US' : 'cs-CZ')}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
          {usedDocs.length > 0 && (
            <p className="mt-2 flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-[0.1em] text-muted">
              <span aria-hidden className="size-1.5 rounded-full bg-violet" />
              {s.used}
            </p>
          )}
          <p className="mt-2 text-[0.72rem] leading-snug text-muted">{s.kbNote}</p>
        </aside>

        {/* chat */}
        <div className="flex min-w-0 flex-col gap-2.5">
          <div
            ref={threadRef}
            aria-live="polite"
            className="hide-scrollbar flex max-h-[26rem] min-h-[18rem] flex-col gap-3 overflow-y-auto rounded-2xl border border-line bg-surface-2/30 p-3"
          >
            {messages.map((msg) =>
              msg.role === 'user' ? (
                <UserBubble key={msg.id} label={s.you} text={msg.text} />
              ) : (
                <AssistantBubble
                  key={msg.id}
                  label={s.assistant}
                  s={s}
                  pick={pick}
                  text={answerFor(msg.key)}
                  cites={citesFor(msg.key)}
                  fallback={msg.key === 'fallback'}
                  msgId={msg.id}
                  openQuotes={openQuotes}
                  onToggleQuote={toggleQuote}
                />
              )
            )}

            {pending && (
              <div className="flex items-start gap-2.5">
                <Avatar assistant />
                <div className="min-w-0 flex-1">
                  <p className="label-mono">{s.assistant}</p>
                  {pending.stage === 'search' && (
                    <p className="mt-1 flex items-center gap-2 text-[0.82rem] text-text-soft">
                      <Search size={13} aria-hidden className="text-violet" />
                      {s.searching}
                      <Dots />
                    </p>
                  )}
                  {pending.stage === 'found' && (
                    <div className="mt-1">
                      <p className="flex items-center gap-2 text-[0.82rem] text-text-soft">
                        <Sparkles size={13} aria-hidden className="text-violet" />
                        {citesFor(pending.key).length === 0
                          ? s.foundNone
                          : citesFor(pending.key).length === 1
                            ? s.foundOne
                            : s.found}
                      </p>
                      <div className="mt-2 flex flex-col gap-1.5">
                        <Skeleton className="h-3.5 w-11/12" />
                        <Skeleton className="h-3.5 w-9/12" />
                      </div>
                    </div>
                  )}
                  {pending.stage === 'type' && (
                    <p className="caret mt-1 whitespace-pre-line text-[0.84rem] leading-relaxed">
                      {answerFor(pending.key).slice(0, pending.typed)}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* nabízené otázky */}
          {!hasConversation && (
            <div>
              <p className="label-mono">{s.suggestions}</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {SUGGESTED.map((id) => {
                  const answer = ANSWERS.find((a) => a.id === id)
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => ask(pick(answer.question))}
                      className="rounded-full border border-line bg-surface-2/60 px-3 py-1.5 text-[0.78rem] text-text-soft transition-colors duration-300 hover:border-violet/50 hover:text-text"
                    >
                      {pick(answer.question)}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* vstup */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              ask(input)
            }}
            className="flex items-center gap-2"
          >
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">{s.inputLabel}</span>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={s.placeholder}
                aria-label={s.inputLabel}
                className="w-full rounded-xl border border-line bg-surface py-2.5 pl-3.5 pr-3 text-[0.84rem] outline-none transition placeholder:text-muted focus:border-violet"
              />
            </label>
            <Button
              type="submit"
              size="sm"
              variant="violet"
              icon={Send}
              iconRight={false}
              disabled={Boolean(pending) || !input.trim()}
              cursorLabel={s.send}
            >
              {t('action.send')}
            </Button>
          </form>

          <p className="flex items-center gap-1.5 font-mono text-[0.66rem] text-muted">
            <Kbd>
              <CornerDownLeft size={10} aria-hidden />
            </Kbd>
            {s.enter}
          </p>

          {/* nota o přiznané neznalosti */}
          <div className="rounded-xl border border-line bg-surface-2/50 p-3">
            <p className="flex items-center gap-2 text-[0.82rem] font-semibold">
              <HelpCircle size={14} className="shrink-0 text-violet" aria-hidden />
              {s.noteTitle}
            </p>
            <p className="mt-1 text-[0.78rem] leading-snug text-text-soft">{s.note}</p>
          </div>

          <FakeDataNote />
        </div>
      </div>
    </DemoShell>
  )
}

function Avatar({ assistant }) {
  const Icon = assistant ? Bot : User
  return (
    <span
      aria-hidden
      className={cn(
        'mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg border',
        assistant ? 'border-violet/40 bg-violet/12 text-violet' : 'border-line bg-surface-2 text-muted'
      )}
    >
      <Icon size={13} />
    </span>
  )
}

function Dots() {
  return (
    <span aria-hidden className="inline-flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 animate-pulse rounded-full bg-violet"
          style={{ animationDelay: `${i * 160}ms` }}
        />
      ))}
    </span>
  )
}

function UserBubble({ label, text }) {
  return (
    <div className="flex items-start gap-2.5">
      <Avatar />
      <div className="min-w-0 flex-1">
        <p className="label-mono">{label}</p>
        <p className="mt-1 rounded-xl border border-line bg-surface px-3 py-2 text-[0.84rem] leading-snug">
          {text}
        </p>
      </div>
    </div>
  )
}

function AssistantBubble({
  label,
  s,
  pick,
  text,
  cites,
  fallback,
  msgId,
  openQuotes,
  onToggleQuote,
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Avatar assistant />
      <div className="min-w-0 flex-1">
        <p className="label-mono">{label}</p>

        {fallback && (
          <p className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-warn/40 bg-warn/14 px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-[0.1em]">
            <HelpCircle size={11} aria-hidden />
            {s.fallbackTitle}
          </p>
        )}

        <p className="mt-1 whitespace-pre-line text-[0.84rem] leading-relaxed">{text}</p>

        {cites.length > 0 && (
          <div className="mt-2.5">
            <p className="label-mono">{s.sources}</p>
            <ul className="mt-1.5 flex flex-col gap-1.5">
              {cites.map((cite, i) => {
                const doc = DOCS.find((d) => d.id === cite.doc)
                const Icon = DOC_ICONS[doc.kind] ?? FileText
                const key = `${msgId}-${i}`
                const open = openQuotes.includes(key)
                return (
                  <li key={key}>
                    <button
                      type="button"
                      onClick={() => onToggleQuote(key)}
                      aria-expanded={open}
                      className={cn(
                        'flex w-full items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left transition-colors duration-300',
                        open
                          ? 'border-violet/50 bg-violet/10'
                          : 'border-line bg-surface hover:border-violet/40'
                      )}
                    >
                      <Icon size={13} aria-hidden className="shrink-0 text-violet" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[0.78rem] font-medium">
                          {pick(doc.name)}
                        </span>
                        <span className="block font-mono text-[0.65rem] text-muted">
                          {pick(cite.at)}
                        </span>
                      </span>
                      <ChevronDown
                        size={13}
                        aria-hidden
                        className={cn(
                          'shrink-0 text-muted transition-transform duration-300',
                          open && 'rotate-180'
                        )}
                      />
                      <span className="sr-only">{open ? s.hideQuote : s.showQuote}</span>
                    </button>

                    {open && (
                      <figure className="mt-1.5 rounded-xl border border-line bg-surface-2/60 p-3">
                        <figcaption className="label-mono flex items-center gap-1.5">
                          <Quote size={11} aria-hidden />
                          {s.cited} · {pick(doc.name)}, {pick(cite.at)}
                        </figcaption>
                        <blockquote className="mt-1.5 border-l-2 border-violet/50 pl-2.5 text-[0.78rem] leading-relaxed text-text-soft">
                          {pick(cite.quote)}
                        </blockquote>
                      </figure>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

/** Náhled v bento kartě — jedna otázka s odpovědí a citací, ve smyčce. */
function CompactAssistant({ s, pick, reduced }) {
  const answer = ANSWERS[0]
  const question = pick(answer.question)
  const full = pick(answer.compact)
  const cite = answer.cites[0]
  const doc = DOCS.find((d) => d.id === cite.doc)
  const Icon = DOC_ICONS[doc.kind] ?? FileText

  const [phase, setPhase] = useState(reduced ? 3 : 0)
  const [typed, setTyped] = useState(reduced ? full.length : 0)

  useEffect(() => {
    if (reduced) return

    if (phase === 0) {
      const id = setTimeout(() => setPhase(1), 900)
      return () => clearTimeout(id)
    }
    if (phase === 1) {
      const id = setTimeout(() => setPhase(2), 1200)
      return () => clearTimeout(id)
    }
    if (phase === 2) {
      if (typed >= full.length) {
        const id = setTimeout(() => setPhase(3), 260)
        return () => clearTimeout(id)
      }
      const id = setTimeout(() => setTyped((n) => Math.min(full.length, n + 3)), 20)
      return () => clearTimeout(id)
    }
    const id = setTimeout(() => {
      setTyped(0)
      setPhase(0)
    }, 3000)
    return () => clearTimeout(id)
  }, [reduced, phase, typed, full.length])

  return (
    <div className="flex h-full flex-col gap-2.5 overflow-hidden">
      <div className="flex items-center justify-between gap-2">
        <p className="label-mono flex items-center gap-1.5">
          <BookOpen size={11} />
          {s.kb}
        </p>
        <span className="font-mono text-[0.64rem] text-muted">
          {DOCS.length} {s.docsWord}
        </span>
      </div>

      <div className="hide-scrollbar flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto" aria-live="polite">
        {phase === 0 && (
          <p className="text-[0.73rem] leading-snug text-muted">{s.placeholder}</p>
        )}

        {phase >= 1 && (
          <p className="self-end rounded-xl rounded-br-sm border border-line bg-surface-2/70 px-2.5 py-1.5 text-[0.74rem] leading-snug">
            {question}
          </p>
        )}

        {phase === 1 && (
          <p className="flex items-center gap-1.5 text-[0.72rem] text-muted">
            <Search size={11} aria-hidden className="text-violet" />
            {s.searching}
            <Dots />
          </p>
        )}

        {phase >= 2 && (
          <div className="flex items-start gap-2">
            <span
              aria-hidden
              className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border border-violet/40 bg-violet/12 text-violet"
            >
              <Bot size={11} />
            </span>
            <p
              className={cn(
                'min-w-0 text-[0.75rem] leading-relaxed',
                phase === 2 && 'caret'
              )}
            >
              {full.slice(0, typed)}
            </p>
          </div>
        )}

        {phase >= 3 && (
          <div className="flex items-center gap-2 rounded-xl border border-violet/45 bg-violet/10 px-2.5 py-1.5">
            <Icon size={12} aria-hidden className="shrink-0 text-violet" />
            <span className="min-w-0">
              <span className="block truncate text-[0.7rem] font-medium">{pick(doc.name)}</span>
              <span className="block font-mono text-[0.6rem] text-muted">{pick(cite.at)}</span>
            </span>
          </div>
        )}
      </div>

      <p className="label-mono shrink-0 truncate">{s.compactNote}</p>
    </div>
  )
}
