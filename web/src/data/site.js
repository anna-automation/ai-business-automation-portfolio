/**
 * Jedno místo pro identitu webu. Texty jsou dvojjazyčné: { cs, en }.
 * TODO Anna: doplnit skutečné kontakty a odkazy — teď jsou tu zástupné.
 */

export const site = {
  name: 'MAKÁSAMO',
  person: 'Anna',
  // TODO: doplnit příjmení, ať to není jen "Anna"
  role: {
    cs: 'Manažerka projektu vývoje aplikace · lektorka AI a automatizací',
    en: 'Application development project manager · AI & automation trainer',
  },
  claim: {
    cs: 'Rozumím procesům i lidem, kteří v nich pracují. Pak je zautomatizuji.',
    en: 'I understand processes and the people inside them. Then I automate them.',
  },
  email: 'ahoj@example.cz',
  phone: '+420 000 000 000',
  location: { cs: 'Česká republika · vzdáleně i na místě', en: 'Czech Republic · remote or on site' },
  github: 'https://github.com/anna-automation/ai-business-automation-portfolio',
  linkedin: 'https://www.linkedin.com/',
  responseTime: { cs: 'do 2 pracovních dnů', en: 'within 2 business days' },
}

/**
 * Fakturační údaje pro patu kontaktní stránky.
 * TODO Anna: nahradit skutečnými — tohle jsou čísla z návrhu, ne z rejstříku.
 */
export const fakturace = {
  nazev: 'AI Business Lab s.r.o.',
  ico: '123 45 678',
  dic: 'CZ12345678',
  spisovaZnacka: 'C 987654, Městský soud v Praze',
  ulice: 'Pernerova 676/51',
  mesto: '186 00 Praha 8 – Karlín',
  dph: 'Jsme plátci DPH.',
}

export const socials = [
  { id: 'github', label: 'GitHub', href: site.github },
  { id: 'linkedin', label: 'LinkedIn', href: site.linkedin },
  { id: 'email', label: 'E-mail', href: `mailto:${site.email}` },
]

/** Čísla v hero sekci. Jsou z demo prostředí, nikoliv z reálných projektů. */
export const stats = [
  { id: 'workflows', value: 12, suffix: '', labelKey: 'stats.workflows' },
  { id: 'hours', value: 940, suffix: '+', labelKey: 'stats.hours' },
  { id: 'tools', value: 18, suffix: '', labelKey: 'stats.tools' },
  { id: 'demos', value: 10, suffix: '', labelKey: 'stats.demos' },
]

/**
 * Osobní profil — tahle sekce má unést "technický typ, který umí naslouchat".
 * Každá vlastnost je napsaná jako fakt s důkazem, ne jako přídavné jméno.
 */
export const profile = {
  intro: {
    cs: 'Vedu vývoj aplikace — od zadání přes tým až po termíny. Dřív jsem viděla zblízka, kolik času v kancelářích sežere ruční přepisování, hledání v mailu a vyplňování stejných polí dokola. Dneska to dělám tak, že ten čas vracím zpátky lidem.',
    en: 'I lead application development — from the brief through the team to the deadlines. Before that I saw up close how much office time goes into retyping, digging through mailboxes and filling the same fields over and over. Now I give that time back to people.',
  },
  traits: [
    {
      id: 'process',
      icon: 'GitBranch',
      title: { cs: 'Procesy čtu jako kód', en: 'I read processes like code' },
      body: {
        cs: 'Než něco zautomatizuju, nakreslím to. Kde se čeká, kde se data přepisují dvakrát, kde chybí vlastník kroku. Teprve pak sahám po nástroji.',
        en: 'Before automating anything I map it. Where it waits, where data gets retyped twice, where a step has no owner. Only then do I reach for a tool.',
      },
      tone: 'accent',
    },
    {
      id: 'listen',
      icon: 'Ear',
      title: { cs: 'Nejdřív se ptám', en: 'I ask first' },
      body: {
        cs: 'Nejlepší automatizace vznikne z půlhodiny u kávy s člověkem, který tu práci dělá denně. Ten ví, kde to drhne. Já to pak jen převedu do kroků.',
        en: 'The best automation comes from half an hour with the person who does the work daily. They know where it hurts. I just turn it into steps.',
      },
      tone: 'violet',
    },
    {
      id: 'order',
      icon: 'LayoutGrid',
      title: { cs: 'Pořádek je součást výsledku', en: 'Order is part of the deliverable' },
      body: {
        cs: 'Každé workflow má README, pojmenované nody, exportovaný JSON a popis, kolik času ušetří. Předávám to tak, aby s tím šlo pracovat i beze mě.',
        en: 'Every workflow ships with a README, named nodes, an exported JSON and a note on time saved. I hand it over so it works without me.',
      },
      tone: 'accent',
    },
    {
      id: 'bold',
      icon: 'Sparkles',
      title: { cs: 'Zkouším to, co ostatní odkládají', en: 'I try what others postpone' },
      body: {
        cs: 'Agentické nástroje, vibecoding, vlastní Claude skills. Ne proto, že je to trend — ale protože to zkrátí cestu od nápadu k fungující věci na odpoledne.',
        en: 'Agentic tooling, vibecoding, custom Claude skills. Not because it trends, but because it shortens idea-to-working-thing to an afternoon.',
      },
      tone: 'coral',
    },
  ],
  /** Jak probíhá spolupráce — "rozumím procesům" ukázané na vlastním procesu. */
  process: [
    {
      id: 'map',
      title: { cs: 'Zmapujeme', en: 'Map it' },
      body: {
        cs: 'Hodina hovoru. Vypíšeme kroky, nástroje a lidi. Najdeme tři místa s největší ztrátou času.',
        en: 'One call. We list steps, tools and people, and find the three biggest time sinks.',
      },
      duration: { cs: '1–2 dny', en: '1–2 days' },
    },
    {
      id: 'proto',
      title: { cs: 'Postavím prototyp', en: 'Build a prototype' },
      body: {
        cs: 'Jedno workflow nasucho, na vašich vzorových datech. Uvidíte výsledek, než se rozhodnete pokračovat.',
        en: 'One workflow dry-run on your sample data. You see the result before committing.',
      },
      duration: { cs: '3–5 dní', en: '3–5 days' },
    },
    {
      id: 'deploy',
      title: { cs: 'Nasadíme a zaučím tým', en: 'Deploy and train' },
      body: {
        cs: 'Spustíme naostro, projdeme obsluhu a výjimky. Dostanete dokumentaci a kontakt na mě.',
        en: 'Go live, walk through operation and edge cases. You get documentation and my contact.',
      },
      duration: { cs: '1 týden', en: '1 week' },
    },
    {
      id: 'hand',
      title: { cs: 'Předám vlastnictví', en: 'Hand over ownership' },
      body: {
        cs: 'Cílem není závislost na mně. Ukážu vám, jak workflow upravit, a kdy mě naopak zavolat.',
        en: 'The goal is not dependence on me. I show you how to change it — and when to call me instead.',
      },
      duration: { cs: 'průběžně', en: 'ongoing' },
    },
  ],
}

/** Nástroje, se kterými reálně pracuji. Zobrazí se jako běžící pás. */
export const toolbelt = [
  'n8n',
  'Claude',
  'ChatGPT',
  'Google Sheets',
  'Excel',
  'Outlook',
  'Baserow',
  'NocoDB',
  'Docker',
  'React',
  'Python',
  'Power Automate',
  'Notion',
  'Make',
  'Zapier',
  'Gmail API',
]
