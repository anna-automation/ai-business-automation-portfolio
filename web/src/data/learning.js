/**
 * Výukové materiály. Firmy je hodnotí nejvíc, takže jsou rozepsané
 * do konkrétních bloků s časy — ne jen jako "školím AI".
 */

export const courses = [
  {
    id: 'workshop',
    tone: 'accent',
    length: { cs: 'Půldenní workshop · 4 hodiny', en: 'Half-day workshop · 4 hours' },
    title: { cs: 'AI pro běžnou kancelář', en: 'AI for the everyday office' },
    audience: {
      cs: 'Úplní začátečníci. Lidé, kteří AI zkusili a nic si z toho neodnesli.',
      en: 'Complete beginners. People who tried AI and got nothing out of it.',
    },
    outcome: {
      cs: 'Každý účastník odchází se třemi prompty, které použije hned zítra, a s vlastní šablonou.',
      en: 'Every participant leaves with three prompts they will use tomorrow, plus their own template.',
    },
    blocks: [
      { time: '45 min', cs: 'Co AI umí a kde lže — na reálných příkladech', en: 'What AI can do and where it lies — on real examples' },
      { time: '60 min', cs: 'Rámec promptu: role, kontext, úkol, formát. Cvičení před a po', en: 'Prompt framework: role, context, task, format. Before/after exercise' },
      { time: '45 min', cs: 'Praxe v Excelu, Wordu a Outlooku na vlastních souborech', en: 'Hands-on in Excel, Word and Outlook with your own files' },
      { time: '40 min', cs: 'Co do AI nikdy nevkládat — GDPR a firemní pravidla', en: 'What never to paste into AI — GDPR and company rules' },
      { time: '30 min', cs: 'Každý si odnese tři vlastní prompty a šablonu', en: 'Everyone leaves with three prompts and a template' },
    ],
  },
  {
    id: 'course',
    tone: 'violet',
    length: { cs: 'Dvoudenní kurz · 2 × 6 hodin', en: 'Two-day course · 2 × 6 hours' },
    title: { cs: 'Automatizace procesů v n8n', en: 'Process automation in n8n' },
    audience: {
      cs: 'Lidé, kteří už AI používají a chtějí, aby práce běžela i bez nich.',
      en: 'People already using AI who want work to run without them.',
    },
    outcome: {
      cs: 'Na konci druhého dne má každý účastník běžící workflow na vlastních datech.',
      en: 'By the end of day two every participant has a running workflow on their own data.',
    },
    blocks: [
      { time: 'Den 1 · 2 h', cs: 'Lokální n8n v Dockeru — prostředí za pět minut', en: 'Local n8n in Docker — environment in five minutes' },
      { time: 'Den 1 · 2 h', cs: 'Mapování procesu: kde se čeká a kde se data přepisují', en: 'Process mapping: where it waits and where data is retyped' },
      { time: 'Den 1 · 2 h', cs: 'První workflow: formulář → tabulka → notifikace', en: 'First workflow: form → sheet → notification' },
      { time: 'Den 2 · 2 h', cs: 'AI node v praxi: klasifikace, vytěžování, návrh odpovědi', en: 'The AI node in practice: classification, extraction, draft replies' },
      { time: 'Den 2 · 2 h', cs: 'Chyby, opakování, limity a co dělat, když to spadne', en: 'Errors, retries, limits and what to do when it breaks' },
      { time: 'Den 2 · 2 h', cs: 'Vlastní workflow na vlastních datech, konzultace jeden na jednoho', en: 'Your own workflow on your own data, one-on-one consultation' },
    ],
  },
]

export const materials = [
  {
    id: 'slides',
    icon: 'Presentation',
    title: { cs: 'Prezentace', en: 'Slide decks' },
    body: {
      cs: 'Hotové slajdy pro oba kurzy, bez animovaných cirkusů. Včetně verze k tisku pro účastníky.',
      en: 'Ready slides for both courses, no animated circus. Includes a printable handout version.',
    },
  },
  {
    id: 'worksheets',
    icon: 'ClipboardList',
    title: { cs: 'Pracovní listy a cvičení', en: 'Worksheets & exercises' },
    body: {
      cs: 'Cvičení s řešením, takže si účastník ověří, že mu to vyšlo — a lektor nemusí hlídat každého.',
      en: 'Exercises with solutions so participants can self-check — and the trainer need not watch everyone.',
    },
  },
  {
    id: 'trainer',
    icon: 'NotebookPen',
    title: { cs: 'Poznámky pro lektora', en: 'Trainer notes' },
    body: {
      cs: 'Časování, časté dotazy, kde se skupina obvykle zasekne a jak ji odtamtud dostat.',
      en: 'Timings, common questions, where a group typically stalls and how to get it moving.',
    },
  },
  {
    id: 'feedback',
    icon: 'MessageSquareHeart',
    title: { cs: 'Hodnoticí dotazník', en: 'Feedback questionnaire' },
    body: {
      cs: 'Krátký dotazník na konci kurzu. Výsledky se sbírají do tabulky automaticky — ukázka v portfoliu.',
      en: 'A short end-of-course survey. Results collect into a sheet automatically — a demo lives in the portfolio.',
    },
  },
  {
    id: 'env',
    icon: 'Container',
    title: { cs: 'Prostředí pro účastníky', en: 'Participant environment' },
    body: {
      cs: 'docker-compose a návod, kterým si každý rozjede lokální n8n. Žádné „u mě to nefunguje“.',
      en: 'docker-compose and a guide so everyone boots local n8n. No more "it does not work on mine".',
    },
  },
  {
    id: 'security',
    icon: 'ShieldCheck',
    title: { cs: 'Příručka bezpečnosti', en: 'Security handbook' },
    body: {
      cs: 'Dvě stránky pro zaměstnance: co ano, co ne, na koho se obrátit. Čte se za pět minut.',
      en: 'Two pages for employees: do, do not, who to ask. Reads in five minutes.',
    },
  },
]

/** Fiktivní případové studie — tři malé firmy, před a po. */
export const caseStudies = [
  {
    id: 'accounting',
    company: { cs: 'Účetní kancelář (4 lidé)', en: 'Accounting office (4 people)' },
    before: {
      cs: 'Doklady od klientů přicházely mailem v různých formátech. Jedna osoba je přepisovala do Excelu, před termínem se obvolávali klienti, kteří nedodali podklady.',
      en: 'Client documents arrived by e-mail in assorted formats. One person retyped them into Excel; before deadlines the team chased clients for missing paperwork.',
    },
    after: {
      cs: 'Faktury z příloh se vytěžují samy, duplicity se odchytí podle variabilního symbolu, klienti dostávají upomínku automaticky tři dny před termínem.',
      en: 'Invoices extract themselves from attachments, duplicates get caught by reference number, and clients are nudged automatically three days before the deadline.',
    },
    saved: { hours: 34, unit: { cs: 'h / měsíc', en: 'h / month' } },
    tone: 'accent',
  },
  {
    id: 'plumber',
    company: { cs: 'Instalatér (2 lidé)', en: 'Plumber (2 people)' },
    before: {
      cs: 'Poptávky na záznamníku, kalkulace večer u stolu, dvakrát zapomenutý výjezd a jeden naštvaný zákazník na Googlu.',
      en: 'Enquiries on voicemail, quotes at the kitchen table at night, two forgotten call-outs and one angry Google review.',
    },
    after: {
      cs: 'Kalkulačka na webu předfiltruje poptávky, zákazník si rezervuje termín sám, den předem odejde připomínka oběma stranám.',
      en: 'A web calculator pre-filters enquiries, customers book their own slot, and a reminder goes to both sides a day ahead.',
    },
    saved: { hours: 18, unit: { cs: 'h / měsíc', en: 'h / month' } },
    tone: 'violet',
  },
  {
    id: 'eshop',
    company: { cs: 'E-shop (6 lidí)', en: 'E-shop (6 people)' },
    before: {
      cs: 'Dvacet dotazů denně na stav zásilky, reklamace bez jasného postupu, pondělní report se slepoval z pěti tabulek.',
      en: 'Twenty delivery questions a day, returns without a clear process, and a Monday report glued from five spreadsheets.',
    },
    after: {
      cs: 'Dotazy se třídí a rutinní odpovídají ze šablony, reklamace jde definovaným procesem s hlídanými termíny, report přijde v pondělí v sedm sám.',
      en: 'Questions sort themselves and routine ones answer from a template, returns follow a defined process with watched deadlines, and the report lands Monday at seven by itself.',
    },
    saved: { hours: 41, unit: { cs: 'h / měsíc', en: 'h / month' } },
    tone: 'coral',
  },
]
