/**
 * Osm oblastí portfolia. Pořadí odpovídá číslování 01–08,
 * které se objevuje i ve struktuře repozitáře.
 */

export const pillars = [
  {
    id: 'prompts',
    index: 1,
    icon: 'MessageSquareCode',
    tone: 'accent',
    title: { cs: 'Prompty a práce s AI pro běžné role', en: 'Prompts & AI for everyday roles' },
    summary: {
      cs: 'Knihovna promptů podle rolí a jednoduchý rámec, díky kterému si je lidé napíšou sami.',
      en: 'A prompt library by role plus a simple framework so people write their own.',
    },
    items: [
      {
        cs: 'Knihovna promptů pro office manažerku, HR, obchod, asistentku a marketing',
        en: 'Prompt library for office managers, HR, sales, assistants and marketing',
      },
      {
        cs: 'Rámec role → kontext → úkol → formát, s příklady před a po',
        en: 'Framework role → context → task → format, with before/after examples',
      },
      {
        cs: 'Srovnání ChatGPT a Claude na stejných úkolech — kdy co použít',
        en: 'ChatGPT vs. Claude on identical tasks — when to use which',
      },
    ],
    deliverable: { cs: 'Knihovna promptů + návod', en: 'Prompt library + guide' },
  },
  {
    id: 'n8n',
    index: 2,
    icon: 'Workflow',
    tone: 'violet',
    title: { cs: 'Automatizace v n8n', en: 'Automation in n8n' },
    summary: {
      cs: 'Jádro portfolia. Každé workflow jako exportovaný JSON s README, screenshotem a vyčíslenou úsporou.',
      en: 'The core of the portfolio. Every workflow as an exported JSON with README, screenshot and measured saving.',
    },
    items: [
      { cs: 'Třídění příchozích e-mailů, štítky a návrh odpovědi', en: 'Inbox triage, labels and draft replies' },
      { cs: 'Poptávka z formuláře → tabulka/CRM → upozornění', en: 'Form enquiry → sheet/CRM → notification' },
      { cs: 'Faktury z příloh → vytěžení údajů → Excel/Sheets', en: 'Invoices from attachments → data extraction → Excel/Sheets' },
      { cs: 'Zápis z porady → shrnutí → seznam úkolů', en: 'Meeting notes → summary → task list' },
      { cs: 'Automatický týdenní report', en: 'Automatic weekly report' },
      { cs: 'Onboarding nového zaměstnance', en: 'New employee onboarding' },
    ],
    deliverable: { cs: 'JSON export + docker-compose', en: 'JSON export + docker-compose' },
    highlight: {
      cs: 'Součástí je docker-compose a návod na lokální n8n — účastníci kurzu mají prostředí za pět minut.',
      en: 'Ships with docker-compose and a local n8n guide — course participants are up in five minutes.',
    },
  },
  {
    id: 'crm',
    index: 3,
    icon: 'Users',
    tone: 'accent',
    title: { cs: 'Jednoduché CRM', en: 'A simple CRM' },
    summary: {
      cs: 'Tři varianty podle toho, co firma unese — od tabulky až po vlastní malou appku.',
      en: 'Three variants depending on what the company can carry — from a spreadsheet to a small custom app.',
    },
    items: [
      { cs: 'A: Google Sheets nebo Excel + n8n — nejsrozumitelnější', en: 'A: Google Sheets or Excel + n8n — the most legible' },
      { cs: 'B: Baserow nebo NocoDB self-hosted, napojené na e-mail', en: 'B: Baserow or NocoDB self-hosted, wired to e-mail' },
      { cs: 'C: malá webová appka postavená vibecodingem, včetně zadání pro AI', en: 'C: a small web app built by vibecoding, including the AI brief' },
    ],
    deliverable: { cs: 'Funkční CRM + postup', en: 'Working CRM + write-up' },
  },
  {
    id: 'office',
    index: 4,
    icon: 'FileSpreadsheet',
    tone: 'coral',
    title: { cs: 'MS Office a AI', en: 'MS Office & AI' },
    summary: {
      cs: 'Tam, kde firmy skutečně pracují. Excel, Word, PowerPoint a Outlook s AI po ruce.',
      en: 'Where companies actually work. Excel, Word, PowerPoint and Outlook with AI at hand.',
    },
    items: [
      { cs: 'Excel: čištění dat, vzorce vysvětlené AI, kontingenční tabulky', en: 'Excel: data cleanup, AI-explained formulas, pivot tables' },
      { cs: 'Word: šablony, report a nabídka ze zadání', en: 'Word: templates, reports and quotes from a brief' },
      { cs: 'PowerPoint: prezentace z poznámek', en: 'PowerPoint: a deck from rough notes' },
      { cs: 'Outlook: pravidla, šablony, hromadné odpovědi', en: 'Outlook: rules, templates, bulk replies' },
    ],
    deliverable: { cs: 'Ukázkové soubory s fiktivními daty', en: 'Sample files with fictional data' },
  },
  {
    id: 'skills',
    index: 5,
    icon: 'Bot',
    tone: 'violet',
    title: { cs: 'Skills, projekty a vlastní asistenti', en: 'Skills, projects & custom assistants' },
    summary: {
      cs: 'Firemní znalost zabalená do nástroje, který se dá dát zaměstnanci do ruky.',
      en: 'Company knowledge packaged into a tool you can hand to an employee.',
    },
    items: [
      { cs: 'Claude skills: firemní styl e-mailů, zápisy z porad, tvorba nabídek', en: 'Claude skills: company e-mail voice, meeting notes, quote drafting' },
      { cs: 'Claude Projects a Custom GPTs s popisem nastavení', en: 'Claude Projects and Custom GPTs with setup notes' },
      { cs: 'Systémové instrukce přenositelné mezi nástroji', en: 'System instructions portable between tools' },
    ],
    deliverable: { cs: 'Skill soubory + instrukce', en: 'Skill files + instructions' },
  },
  {
    id: 'learning',
    index: 6,
    icon: 'GraduationCap',
    tone: 'accent',
    title: { cs: 'Výukové materiály', en: 'Training materials' },
    summary: {
      cs: 'To, co firmy hodnotí nejvíc: připravený kurz, který může běžet zítra.',
      en: 'What companies value most: a course ready to run tomorrow.',
    },
    items: [
      { cs: 'Osnova půldenního workshopu a dvoudenního kurzu', en: 'Half-day workshop and two-day course outlines' },
      { cs: 'Prezentace, pracovní listy, cvičení s řešením', en: 'Slides, worksheets, exercises with solutions' },
      { cs: 'Poznámky pro lektora a hodnoticí dotazník', en: 'Trainer notes and a feedback questionnaire' },
      { cs: 'Varianta pro úplné začátečníky i pro pokročilé', en: 'Beginner and advanced variants' },
    ],
    deliverable: { cs: 'Kompletní kurz k převzetí', en: 'A complete course to take over' },
  },
  {
    id: 'security',
    index: 7,
    icon: 'ShieldCheck',
    tone: 'coral',
    title: { cs: 'Bezpečnost a GDPR při práci s AI', en: 'Security & GDPR when using AI' },
    summary: {
      cs: 'Téma, kterého se firmy bojí nejvíc. Proto se vyplatí mít na něj jasnou odpověď.',
      en: 'The topic companies fear most. Which is why a clear answer pays off.',
    },
    items: [
      { cs: 'Checklist: co nikdy nevkládat do AI nástrojů', en: 'Checklist: what never to paste into AI tools' },
      { cs: 'Základní pravidla pro firmu a krátká příručka pro zaměstnance', en: 'Company rules plus a short employee handbook' },
      { cs: 'AI Act v překladu „co to znamená pro běžnou firmu“', en: 'The AI Act translated into "what it means for a normal company"' },
    ],
    deliverable: { cs: 'Checklist + firemní směrnice', en: 'Checklist + company policy' },
  },
  {
    id: 'cases',
    index: 8,
    icon: 'LineChart',
    tone: 'violet',
    title: { cs: 'Případové studie', en: 'Case studies' },
    summary: {
      cs: 'Tři fiktivní malé firmy: proces před, proces po a kolik času se ušetřilo.',
      en: 'Three fictional small companies: the process before, after, and the hours saved.',
    },
    items: [
      { cs: 'Účetní kancelář — faktury a termíny', en: 'Accounting office — invoices and deadlines' },
      { cs: 'Instalatér — poptávky a výjezdy', en: 'Plumber — enquiries and call-outs' },
      { cs: 'E-shop — dotazy a reklamace', en: 'E-shop — questions and returns' },
    ],
    deliverable: { cs: 'Před / po s vyčíslením', en: 'Before / after with numbers' },
  },
]

export function getPillar(id) {
  return pillars.find((p) => p.id === id) ?? null
}
