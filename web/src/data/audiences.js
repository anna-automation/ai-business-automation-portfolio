/**
 * Cílové skupiny. Záměrně jich je šest a všechny mají jedno společné:
 * malý tým, hodně opakované administrativy a žádné vlastní IT.
 */

export const audiences = [
  {
    id: 'realestate',
    icon: 'Building2',
    tone: 'accent',
    name: { cs: 'Realitní kanceláře', en: 'Real estate agencies' },
    tagline: {
      cs: 'Poptávky ve třech kanálech, prohlídky v hlavě, smlouvy v šabloně z roku 2019.',
      en: 'Enquiries in three channels, viewings in your head, contracts from a 2019 template.',
    },
    pains: [
      { cs: 'Poptávky přicházejí z portálů, webu i telefonu a nikde se nescházejí', en: 'Enquiries arrive from portals, the web and phone — and never meet in one place' },
      { cs: 'Domlouvání prohlídek zabere víc času než samotná prohlídka', en: 'Scheduling a viewing takes longer than the viewing' },
      { cs: 'Klient se neozve a nikdo si nevšimne', en: 'A client goes quiet and nobody notices' },
    ],
    picks: ['booking', 'crm', 'inbox'],
    win: {
      cs: 'Poptávka z portálu se sama založí jako kontakt, klient si rovnou vybere termín prohlídky a makléř dostane úkol s připomínkou.',
      en: 'A portal enquiry becomes a contact by itself, the client books a viewing slot, and the agent gets a task with a reminder.',
    },
  },
  {
    id: 'hr',
    icon: 'UserPlus',
    tone: 'violet',
    name: { cs: 'HR a personalistika', en: 'HR & people ops' },
    tagline: {
      cs: 'Onboarding na patnáct kroků, z nichž si každý pamatuje jiných deset.',
      en: 'A fifteen-step onboarding where everyone remembers a different ten.',
    },
    pains: [
      { cs: 'Nástup nového člověka je checklist v hlavě jednoho člověka', en: 'A new hire\'s first day lives in one person\'s head' },
      { cs: 'Životopisy se čtou ručně, i když 80 % nesplňuje zadání', en: 'CVs are read by hand even though 80 % miss the brief' },
      { cs: 'Zaměstnanci se ptají na totéž, co je ve směrnici', en: 'Employees keep asking what the policy already says' },
    ],
    picks: ['assistant', 'tasks', 'booking'],
    win: {
      cs: 'Podepsaná smlouva spustí onboarding: přístupy, uvítací e-mail, úkoly pro vedoucího i IT. Na otázky zaměstnanců odpovídá asistent nad směrnicemi.',
      en: 'A signed contract kicks off onboarding: access, welcome e-mail, tasks for the manager and IT. Employee questions go to an assistant over the policies.',
    },
  },
  {
    id: 'accounting',
    icon: 'Receipt',
    tone: 'coral',
    name: { cs: 'Účetní a daňové kanceláře', en: 'Accounting & tax offices' },
    tagline: {
      cs: 'Přepisování z PDF do Excelu jako hlavní pracovní náplň.',
      en: 'Retyping PDFs into Excel as the main job description.',
    },
    pains: [
      { cs: 'Doklady od klientů přicházejí mailem v deseti formátech', en: 'Client documents arrive by e-mail in ten different formats' },
      { cs: 'Před termínem se obvolávají klienti, kteří nedodali podklady', en: 'Before deadlines you chase clients for missing paperwork' },
      { cs: 'Stejná čísla se přepisují do tří systémů', en: 'The same numbers get retyped into three systems' },
    ],
    picks: ['documents', 'dashboard', 'inbox'],
    win: {
      cs: 'Faktura z přílohy se vytěží a zapíše sama, duplicita se odchytí a klient, který nedodal podklady, dostane upomínku bez vašeho zásahu.',
      en: 'An attached invoice extracts and files itself, duplicates get caught, and a client missing paperwork is nudged without you lifting a finger.',
    },
  },
  {
    id: 'services',
    icon: 'Wrench',
    tone: 'accent',
    name: { cs: 'Řemeslníci a servisy', en: 'Trades & service businesses' },
    tagline: {
      cs: 'Práce na střeše, poptávky na záznamníku, kalkulace večer u stolu.',
      en: 'On the roof all day, enquiries on voicemail, quotes at the kitchen table at night.',
    },
    pains: [
      { cs: 'Poptávka přijde během práce a odpověď se posune na večer', en: 'An enquiry lands mid-job and the reply slips to the evening' },
      { cs: 'Cena se počítá pokaždé znovu a jinak', en: 'Pricing gets recalculated from scratch, differently each time' },
      { cs: 'Zapomenutý výjezd znamená naštvaného zákazníka', en: 'A forgotten call-out means an angry customer' },
    ],
    picks: ['calculator', 'quote', 'booking'],
    win: {
      cs: 'Zákazník si naklikne rozsah v kalkulačce, dostane orientační cenu a rezervuje termín. Vám přijde hotová poptávka s čísly, ne hlasová zpráva.',
      en: 'The customer clicks the scope, gets an indicative price and books a slot. You receive a finished enquiry with numbers, not a voicemail.',
    },
  },
  {
    id: 'eshop',
    icon: 'ShoppingBag',
    tone: 'violet',
    name: { cs: 'Malé e-shopy', en: 'Small e-shops' },
    tagline: {
      cs: 'Stejných dvacet dotazů denně, na každý se odpovídá ručně.',
      en: 'The same twenty questions a day, each answered by hand.',
    },
    pains: [
      { cs: '„Kde mám balík?“ jako nejčastější e-mail dne', en: '"Where is my parcel?" as the most common e-mail of the day' },
      { cs: 'Reklamace se řeší bez jasného postupu', en: 'Returns get handled without a clear process' },
      { cs: 'Nikdo neví, co se prodávalo minulý týden, dokud to někdo nespočítá', en: 'Nobody knows last week\'s sales until someone adds them up' },
    ],
    picks: ['inbox', 'dashboard', 'assistant'],
    win: {
      cs: 'Dotazy na stav zásilky se třídí a odpovídají samy, reklamace jde definovaným procesem a v pondělí ráno máte report, který jste nepsali.',
      en: 'Delivery questions sort and answer themselves, returns follow a defined process, and Monday morning brings a report you did not write.',
    },
  },
  {
    id: 'office',
    icon: 'Briefcase',
    tone: 'coral',
    name: { cs: 'Kanceláře a asistentky', en: 'Office & assistants' },
    tagline: {
      cs: 'Role, na které stojí celá firma a kterou nikdo nepočítá do procesů.',
      en: 'The role the whole company rests on, and nobody counts into the process.',
    },
    pains: [
      { cs: 'Zápis z porady se píše ještě hodinu po poradě', en: 'Meeting minutes take another hour after the meeting' },
      { cs: 'Report pro vedení se slepuje z pěti tabulek', en: 'The management report is glued together from five spreadsheets' },
      { cs: 'Polovina dne padne na přeposílání a hledání v mailu', en: 'Half the day goes to forwarding and digging through e-mail' },
    ],
    picks: ['workflow', 'tasks', 'dashboard'],
    win: {
      cs: 'Ze zápisu vzniknou úkoly s odpovědnými lidmi, report se vygeneruje sám a maily se roztřídí před tím, než si je otevřete.',
      en: 'Minutes turn into assigned tasks, the report generates itself, and e-mail is sorted before you open it.',
    },
  },
]

export function getAudience(id) {
  return audiences.find((a) => a.id === id) ?? null
}
