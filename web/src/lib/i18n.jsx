import { usePrefs } from './prefs.jsx'

/**
 * Lehký slovník bez knihovny. Čeština je primární, angličtina plnohodnotná
 * pro rozhraní a nadpisy. Delší odborné texty mají EN variantu v datech.
 *
 * Použití:  const { t, lang } = useT();  t('nav.products')
 * Interpolace:  t('contact.sent', { name: 'Anna' })
 */

const dict = {
  cs: {
    'brand.name': 'MAKÁSAMO',
    'brand.person': 'Anna',
    'brand.tagline': 'Automatizace pro byznys',

    'nav.home': 'Úvod',
    'nav.products': 'Ukázky',
    'nav.automations': 'Automatizace',
    'nav.audiences': 'Pro koho',
    'nav.learning': 'Školení',
    'nav.about': 'O mně',
    'nav.contact': 'Kontakt',
    'nav.menu': 'Menu',
    'nav.close': 'Zavřít',
    'nav.search': 'Hledat',
    'nav.searchHint': 'Hledat na webu',
    'nav.cta': 'Nezávazná poptávka',

    'action.try': 'Vyzkoušet',
    'action.tryDemo': 'Vyzkoušet demo',
    'action.open': 'Otevřít',
    'action.openDetail': 'Otevřít detail',
    'action.back': 'Zpět',
    'action.backHome': 'Zpět na úvod',
    'action.allProducts': 'Všechny ukázky',
    'action.run': 'Spustit',
    'action.runAgain': 'Spustit znovu',
    'action.reset': 'Reset',
    'action.next': 'Další',
    'action.prev': 'Předchozí',
    'action.send': 'Odeslat',
    'action.copy': 'Kopírovat',
    'action.copied': 'Zkopírováno',
    'action.download': 'Stáhnout',
    'action.more': 'Více',
    'action.less': 'Méně',
    'action.showAll': 'Zobrazit vše',
    'action.contactMe': 'Napsat mi',

    'theme.toggle': 'Přepnout světlý/tmavý režim',
    'lang.toggle': 'Přepnout jazyk',
    'motion.toggle': 'Omezit animace',
    'motion.on': 'Animace zapnuté',
    'motion.off': 'Animace omezené',
    'cursor.toggle': 'Vlastní kurzor',

    'demo.badge': 'Demo',
    'demo.notice': 'Ukázka s fiktivními daty',
    'demo.noticeLong':
      'Všechna data na tomto webu jsou vymyšlená. Jde o funkční simulaci, nikoliv o reálné zákazníky, faktury ani firmy.',
    'demo.simulated': 'simulováno',
    'demo.safe': 'Nic se nikam neposílá',

    'hero.eyebrow': 'Portfolio · AI a automatizace',
    'hero.line1': 'Nudnou práci',
    'hero.line2': 'dělá',
    'hero.line3': 'automat.',
    'hero.sub':
      'Jsem Anna. Vedu vývoj aplikace, rozumím firemním procesům a převádím je do automatizací, které ušetří lidem hodiny denně. Tady si je můžete rovnou osahat.',
    'hero.cta1': 'Projít interaktivní showroom',
    'hero.cta2': 'Co umím',
    'hero.scroll': 'Scrollujte',

    'stats.title': 'Čísla z demo prostředí',
    'stats.workflows': 'hotových workflow',
    'stats.hours': 'ušetřených hodin ročně',
    'stats.tools': 'propojených nástrojů',
    'stats.demos': 'ukázek na vyzkoušení',

    'about.eyebrow': 'O mně',
    'about.title': 'Technický typ, který umí naslouchat',
    'about.role': 'Manažerka projektu vývoje aplikace',

    'pillars.eyebrow': 'Co nabízím',
    'pillars.title': 'Osm oblastí, jedna logika',
    'pillars.sub':
      'Od promptů až po bezpečnost. Každá oblast má hmatatelný výstup — soubor, workflow nebo hotový materiál pro školení.',

    'products.eyebrow': 'Interaktivní laboratoř',
    'products.title': 'Nečtěte to. Vyzkoušejte si to.',
    'products.sub':
      'Deset ukázkových produktů, které běží přímo v prohlížeči. Kliknutím spustíte proces a uvidíte, jak se data propisují dál.',
    'products.filterAll': 'Vše',
    'products.interactive': 'Interaktivní',
    'products.detail': 'Detail ukázky',
    'products.related': 'Související ukázky',
    'products.howItWorks': 'Jak to funguje',
    'products.steps': 'Kroky procesu',
    'products.stack': 'Čím je to postavené',
    'products.saves': 'Ušetří',
    'products.forWhom': 'Komu se vyplatí',

    'automations.eyebrow': 'Katalog',
    'automations.title': 'Automatizace vedené samostatně',
    'automations.sub':
      'Každá automatizace je vlastní složka v repozitáři — README, n8n export, screenshot. Dá se ukázat zvlášť i použít v celku.',
    'automations.folder': 'Složka v repozitáři',
    'automations.nodes': 'nodů',
    'automations.openWorkflow': 'Zobrazit workflow JSON',
    'automations.difficulty': 'Náročnost',
    'automations.savesPerMonth': 'Úspora měsíčně',
    'automations.empty': 'Zatím tu není žádná automatizace.',

    'audiences.eyebrow': 'Pro koho',
    'audiences.title': 'Vyberte si, čím se zabýváte',
    'audiences.sub':
      'Procesy se opakují napříč obory. Tady je jejich překlad do konkrétních automatizací.',
    'audiences.pains': 'Co firmy nejčastěji řeší',
    'audiences.picks': 'Co doporučuji začít dělat',
    'audiences.personalize': 'Zvýraznit, co se mě týká',
    'audiences.personalized': 'Obsah je přizpůsobený',
    'audiences.clear': 'Zrušit přizpůsobení',

    'learning.eyebrow': 'Školení a lektorování',
    'learning.title': 'Materiály, se kterými se dá učit hned',

    'contact.eyebrow': 'Kontakt',
    'contact.title': 'Napište mi, co vás zdržuje',
    'contact.sub': 'Odpovím do dvou pracovních dnů. Nezávazně a bez obchodních smyček.',
    'contact.step': 'Krok',
    'contact.of': 'z',
    'contact.q1': 'Čím se vaše firma zabývá?',
    'contact.q2': 'Co vás zdržuje nejvíc?',
    'contact.q3': 'Jak velký je tým, kterého se to týká?',
    'contact.q4': 'Kam se vám mám ozvat?',
    'contact.name': 'Jméno',
    'contact.email': 'E-mail',
    'contact.company': 'Firma',
    'contact.message': 'Poznámka',
    'contact.messagePlaceholder': 'Cokoliv, co mi pomůže pochopit situaci…',
    'contact.consent': 'Souhlasím se zpracováním údajů pro účel odpovědi na poptávku.',
    'contact.consentRequired': 'Bez souhlasu formulář odeslat nejde.',
    'contact.submit': 'Odeslat poptávku',
    'contact.sending': 'Odesílám…',
    'contact.doneTitle': 'Hotovo — ale nikam to nešlo',
    'contact.doneBody':
      'Formulář je součást dema, takže se žádná data neodeslala. V reálném nasazení by poptávka doběhla do CRM, založila úkol a poslala potvrzení.',
    'contact.required': 'Povinné pole',
    'contact.invalidEmail': 'Zkontrolujte formát e-mailu',
    'contact.directTitle': 'Nebo přímo',
    'contact.responseTime': 'Odpověď do 2 pracovních dnů',
    'contact.availability': 'Dostupnost',
    'contact.location': 'Česká republika · vzdáleně i na místě',

    'footer.madeWith': 'Postaveno s',
    'footer.sections': 'Sekce',
    'footer.legal': 'Právní informace',
    'footer.social': 'Kde mě najdete',
    'footer.newsletter': 'Novinky z automatizace',
    'footer.newsletterSub': 'Jeden e-mail měsíčně. Konkrétní workflow, žádné motivační citáty.',
    'footer.newsletterCta': 'Přihlásit',
    'footer.newsletterDone': 'Díky — v demu se nic neodeslalo.',
    'footer.rights': 'Všechna práva vyhrazena.',
    'footer.disclaimer': 'Demo portfolio. Všechna data jsou fiktivní.',
    'footer.backToTop': 'Nahoru',

    'legal.privacy': 'Ochrana osobních údajů',
    'legal.terms': 'Podmínky použití',
    'legal.cookies': 'Cookies',
    'legal.accessibility': 'Přístupnost',
    'legal.withdrawal': 'Odstoupení od smlouvy',
    'legal.security': 'Bezpečnost a AI',
    'legal.updated': 'Aktualizováno',

    'cookies.title': 'Cookies, na férovku',
    'cookies.body':
      'Tenhle web je demo. Technicky si pamatuje jen vaše nastavení (téma, jazyk, pohyb) v localStorage prohlížeče. Žádné měření, žádná reklama, nic se neposílá třetím stranám.',
    'cookies.accept': 'Rozumím',
    'cookies.settings': 'Nastavení',
    'cookies.reject': 'Jen nutné',
    'cookies.necessary': 'Nezbytné',
    'cookies.necessaryDesc': 'Téma, jazyk a nastavení pohybu. Bez nich se web rozbije.',
    'cookies.analytics': 'Analytika',
    'cookies.analyticsDesc': 'Není nasazená. Přepínač je tu, aby bylo vidět, jak by to vypadalo.',
    'cookies.marketing': 'Marketing',
    'cookies.marketingDesc': 'Nepoužívá se a používat nebude.',
    'cookies.save': 'Uložit volbu',

    'palette.placeholder': 'Hledejte ukázky, sekce, automatizace…',
    'palette.hint': 'pro vyhledávání',
    'palette.empty': 'Nic nenalezeno',
    'palette.pages': 'Stránky',
    'palette.products': 'Ukázky',
    'palette.automations': 'Automatizace',
    'palette.actions': 'Akce',
    'palette.navigate': 'pro pohyb',
    'palette.select': 'pro otevření',
    'palette.close': 'pro zavření',

    'nf.title': 'Tahle stránka se neautomatizovala',
    'nf.body': 'Odkaz vede do prázdna. Zkuste vyhledávání nebo se vraťte na úvod.',

    'guide.title': 'Průvodce',
    'guide.placeholder': 'Napište, co potřebujete automatizovat…',
    'guide.cta': 'Doporučit ukázky',
    'guide.thinking': 'Hledám v portfoliu…',
    'guide.result': 'Co bych vám ukázala',
    'guide.noMatch':
      'K tomu nemám přímou ukázku. Napište mi to do formuláře, ráda se na to podívám.',
    'guide.disclaimer': 'Doporučení běží lokálně podle klíčových slov. Žádné volání do AI.',
  },

  en: {
    'brand.name': 'MAKÁSAMO',
    'brand.person': 'Anna',
    'brand.tagline': 'Automation for business',

    'nav.home': 'Home',
    'nav.products': 'Demos',
    'nav.automations': 'Automations',
    'nav.audiences': 'Who it is for',
    'nav.learning': 'Training',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.menu': 'Menu',
    'nav.close': 'Close',
    'nav.search': 'Search',
    'nav.searchHint': 'Search the site',
    'nav.cta': 'Request a quote',

    'action.try': 'Try it',
    'action.tryDemo': 'Try the demo',
    'action.open': 'Open',
    'action.openDetail': 'Open detail',
    'action.back': 'Back',
    'action.backHome': 'Back home',
    'action.allProducts': 'All demos',
    'action.run': 'Run',
    'action.runAgain': 'Run again',
    'action.reset': 'Reset',
    'action.next': 'Next',
    'action.prev': 'Previous',
    'action.send': 'Send',
    'action.copy': 'Copy',
    'action.copied': 'Copied',
    'action.download': 'Download',
    'action.more': 'More',
    'action.less': 'Less',
    'action.showAll': 'Show all',
    'action.contactMe': 'Get in touch',

    'theme.toggle': 'Toggle light/dark',
    'lang.toggle': 'Switch language',
    'motion.toggle': 'Reduce motion',
    'motion.on': 'Motion on',
    'motion.off': 'Motion reduced',
    'cursor.toggle': 'Custom cursor',

    'demo.badge': 'Demo',
    'demo.notice': 'Demo with fictional data',
    'demo.noticeLong':
      'Every piece of data on this site is made up. It is a working simulation, not real customers, invoices or companies.',
    'demo.simulated': 'simulated',
    'demo.safe': 'Nothing is sent anywhere',

    'hero.eyebrow': 'Portfolio · AI & automation',
    'hero.line1': 'Boring work',
    'hero.line2': 'belongs to',
    'hero.line3': 'machines.',
    'hero.sub':
      'I am Anna. I lead application development, I understand business processes, and I turn them into automations that give people hours back. Here you can touch them yourself.',
    'hero.cta1': 'Enter the interactive showroom',
    'hero.cta2': 'What I do',
    'hero.scroll': 'Scroll',

    'stats.title': 'Numbers from the demo environment',
    'stats.workflows': 'ready-made workflows',
    'stats.hours': 'hours saved per year',
    'stats.tools': 'connected tools',
    'stats.demos': 'demos to try',

    'about.eyebrow': 'About me',
    'about.title': 'A technical mind that actually listens',
    'about.role': 'Application development project manager',

    'pillars.eyebrow': 'What I offer',
    'pillars.title': 'Eight areas, one logic',
    'pillars.sub':
      'From prompts to security. Every area ships something tangible — a file, a workflow or a ready training pack.',

    'products.eyebrow': 'Interactive lab',
    'products.title': 'Do not read it. Try it.',
    'products.sub':
      'Ten demo products running right in your browser. Click to start a process and watch data travel between tools.',
    'products.filterAll': 'All',
    'products.interactive': 'Interactive',
    'products.detail': 'Demo detail',
    'products.related': 'Related demos',
    'products.howItWorks': 'How it works',
    'products.steps': 'Process steps',
    'products.stack': 'Built with',
    'products.saves': 'Saves',
    'products.forWhom': 'Worth it for',

    'automations.eyebrow': 'Catalogue',
    'automations.title': 'Automations kept standalone',
    'automations.sub':
      'Each automation is its own folder in the repository — README, n8n export, screenshot. Show one alone or all together.',
    'automations.folder': 'Repository folder',
    'automations.nodes': 'nodes',
    'automations.openWorkflow': 'View workflow JSON',
    'automations.difficulty': 'Difficulty',
    'automations.savesPerMonth': 'Saved per month',
    'automations.empty': 'No automation here yet.',

    'audiences.eyebrow': 'Who it is for',
    'audiences.title': 'Pick what you do',
    'audiences.sub':
      'Processes repeat across industries. Here is their translation into concrete automations.',
    'audiences.pains': 'What companies struggle with',
    'audiences.picks': 'Where I would start',
    'audiences.personalize': 'Highlight what applies to me',
    'audiences.personalized': 'Content is personalised',
    'audiences.clear': 'Clear personalisation',

    'learning.eyebrow': 'Training & teaching',
    'learning.title': 'Materials you can teach from today',

    'contact.eyebrow': 'Contact',
    'contact.title': 'Tell me what slows you down',
    'contact.sub': 'I reply within two business days. No strings, no sales loops.',
    'contact.step': 'Step',
    'contact.of': 'of',
    'contact.q1': 'What does your company do?',
    'contact.q2': 'What slows you down the most?',
    'contact.q3': 'How big is the team involved?',
    'contact.q4': 'Where should I reach you?',
    'contact.name': 'Name',
    'contact.email': 'E-mail',
    'contact.company': 'Company',
    'contact.message': 'Note',
    'contact.messagePlaceholder': 'Anything that helps me understand the situation…',
    'contact.consent': 'I agree to my data being processed in order to answer this enquiry.',
    'contact.consentRequired': 'The form cannot be sent without consent.',
    'contact.submit': 'Send enquiry',
    'contact.sending': 'Sending…',
    'contact.doneTitle': 'Done — and it went nowhere',
    'contact.doneBody':
      'This form is part of the demo, so no data was sent. In a real deployment the enquiry would land in a CRM, create a task and send a confirmation.',
    'contact.required': 'Required field',
    'contact.invalidEmail': 'Check the e-mail format',
    'contact.directTitle': 'Or directly',
    'contact.responseTime': 'Reply within 2 business days',
    'contact.availability': 'Availability',
    'contact.location': 'Czech Republic · remote or on site',

    'footer.madeWith': 'Built with',
    'footer.sections': 'Sections',
    'footer.legal': 'Legal',
    'footer.social': 'Find me at',
    'footer.newsletter': 'Automation notes',
    'footer.newsletterSub': 'One e-mail a month. Concrete workflows, no motivational quotes.',
    'footer.newsletterCta': 'Subscribe',
    'footer.newsletterDone': 'Thanks — nothing was sent in the demo.',
    'footer.rights': 'All rights reserved.',
    'footer.disclaimer': 'Demo portfolio. All data is fictional.',
    'footer.backToTop': 'Top',

    'legal.privacy': 'Privacy',
    'legal.terms': 'Terms of use',
    'legal.cookies': 'Cookies',
    'legal.accessibility': 'Accessibility',
    'legal.withdrawal': 'Right of withdrawal',
    'legal.security': 'Security & AI',
    'legal.updated': 'Updated',

    'cookies.title': 'Cookies, honestly',
    'cookies.body':
      'This site is a demo. Technically it only remembers your settings (theme, language, motion) in browser localStorage. No analytics, no ads, nothing goes to third parties.',
    'cookies.accept': 'Got it',
    'cookies.settings': 'Settings',
    'cookies.reject': 'Essential only',
    'cookies.necessary': 'Essential',
    'cookies.necessaryDesc': 'Theme, language and motion settings. Without them the site breaks.',
    'cookies.analytics': 'Analytics',
    'cookies.analyticsDesc': 'Not deployed. The switch is here to show how it would look.',
    'cookies.marketing': 'Marketing',
    'cookies.marketingDesc': 'Not used, and will not be.',
    'cookies.save': 'Save choice',

    'palette.placeholder': 'Search demos, sections, automations…',
    'palette.hint': 'to search',
    'palette.empty': 'Nothing found',
    'palette.pages': 'Pages',
    'palette.products': 'Demos',
    'palette.automations': 'Automations',
    'palette.actions': 'Actions',
    'palette.navigate': 'to move',
    'palette.select': 'to open',
    'palette.close': 'to close',

    'nf.title': 'This page did not automate itself',
    'nf.body': 'The link leads nowhere. Try the search or head back home.',

    'guide.title': 'Guide',
    'guide.placeholder': 'Describe what you need to automate…',
    'guide.cta': 'Recommend demos',
    'guide.thinking': 'Searching the portfolio…',
    'guide.result': 'What I would show you',
    'guide.noMatch': 'I have no direct demo for that. Drop it in the form, I will gladly look.',
    'guide.disclaimer': 'Recommendations run locally on keywords. No AI calls involved.',
  },
}

export function translate(lang, key, vars) {
  const table = dict[lang] ?? dict.cs
  let out = table[key] ?? dict.cs[key] ?? key
  if (vars) {
    for (const [k, v] of Object.entries(vars)) out = out.replaceAll(`{${k}}`, String(v))
  }
  return out
}

export function useT() {
  const { lang } = usePrefs()
  return {
    lang,
    t: (key, vars) => translate(lang, key, vars),
    /** Vybere jazykovou variantu z objektu { cs: …, en: … } v datech. */
    pick: (value) => {
      if (value == null) return ''
      if (typeof value === 'string') return value
      return value[lang] ?? value.cs ?? ''
    },
  }
}
