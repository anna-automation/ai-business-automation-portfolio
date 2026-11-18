import {
  GraduationCap,
  Handshake,
  Mail,
  MessageCircle,
  MessageCircleQuestion,
  Phone,
  Sparkles,
} from 'lucide-react'

/**
 * Obsah poptávkového formuláře na jednom místě. Formulář sám řeší jen
 * chování — co se ptá, stojí tady, aby se texty daly měnit bez sahání do
 * logiky.
 *
 * Pravidlo pro celý formulář: povinné jsou jen jméno, e-mail a zpráva.
 * Všechno ostatní je buď volitelné, nebo se ptá jen tehdy, když to podle
 * zvoleného záměru dává smysl.
 */

/** První krok — podle něj se skládá druhý. */
export const ZAMERY = [
  {
    id: 'nabidka',
    titulek: 'Chci nabídku',
    popis: 'Mám proces, který žere čas',
    icon: Sparkles,
  },
  {
    id: 'dotaz',
    titulek: 'Mám dotaz',
    popis: 'Nejdřív se potřebuju zeptat',
    icon: MessageCircleQuestion,
  },
  {
    id: 'kurz',
    titulek: 'Chci kurz pro firmu',
    popis: 'Školení nebo workshop pro tým',
    icon: GraduationCap,
  },
  {
    id: 'spoluprace',
    titulek: 'Spolupráce',
    popis: 'Subdodávka, partnerství, lektorování',
    icon: Handshake,
  },
]

export const VELIKOSTI = [
  { id: '1-10', label: '1–10 lidí' },
  { id: '11-50', label: '11–50 lidí' },
  { id: '50+', label: '50+ lidí' },
]

/** Rozpočtová rozmezí pro posuvník. Index 0 je nejnižší. */
export const ROZPOCTY = [
  'do 20 tis. Kč',
  '20–50 tis. Kč',
  '50–100 tis. Kč',
  '100–250 tis. Kč',
  '250 tis. Kč a víc',
]

export const TERMINY = [
  { id: 'hned', label: 'Co nejdřív' },
  { id: 'mesic', label: 'Do měsíce' },
  { id: 'info', label: 'Jen sbírám informace' },
]

export const TEMATA_DOTAZU = [
  { id: 'automatizace', label: 'Automatizace' },
  { id: 'skoleni', label: 'Školení' },
  { id: 'cena', label: 'Cena a rozsah' },
  { id: 'jine', label: 'Něco jiného' },
]

export const POCTY_LIDI = [
  { id: '1-5', label: '1–5' },
  { id: '6-15', label: '6–15' },
  { id: '16-30', label: '16–30' },
  { id: '30+', label: '30+' },
]

export const UROVNE = [
  { id: 'zacatecnici', label: 'Začátečníci' },
  { id: 'mix', label: 'Namíchaná parta' },
  { id: 'pokrocili', label: 'Pokročilí' },
]

export const FORMY = [
  { id: 'online', label: 'Online' },
  { id: 'u-nas', label: 'U nás' },
  { id: 'u-vas', label: 'U vás ve firmě' },
]

export const TYPY_SPOLUPRACE = [
  { id: 'subdodavka', label: 'Subdodávka' },
  { id: 'partnerstvi', label: 'Partnerství' },
  { id: 'lektorovani', label: 'Lektorování' },
  { id: 'jine', label: 'Něco jiného' },
]

export const KANALY = [
  { id: 'email', label: 'E-mail', icon: Mail },
  { id: 'telefon', label: 'Telefon', icon: Phone },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
]

export const ZDROJE = [
  { id: 'google', label: 'Google' },
  { id: 'doporuceni', label: 'Doporučení' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'socialni-site', label: 'Instagram / Facebook' },
  { id: 'akce', label: 'Konference nebo kurz' },
  { id: 'jinak', label: 'Jinak' },
]

export const PREDVOLBY = ['+420', '+421', '+43', '+48', '+49']

/**
 * Slovník pro doporučení ukázky podle textu zprávy. Klíče jsou záměrně
 * zkrácené kmeny, aby chytly i skloňování.
 */
export const SLUZBY = [
  {
    slug: 'trideni-emailu',
    titulek: 'Automatizace e-mailů',
    klice: ['mail', 'pošt', 'posta', 'schránk', 'inbox', 'odpovíd', 'odpověd'],
  },
  {
    slug: 'jednoduche-crm',
    titulek: 'Jednoduché CRM',
    klice: ['crm', 'klient', 'zákazn', 'zakazn', 'kontakt', 'poptáv', 'poptav', 'obchod'],
  },
  {
    slug: 'zpracovani-dokumentu',
    titulek: 'Zpracování dokumentů',
    klice: ['faktur', 'doklad', 'dokument', 'smlouv', 'sken', 'pdf', 'účten', 'ucten'],
  },
  {
    slug: 'generovani-nabidek',
    titulek: 'Generování nabídek',
    klice: ['nabídk', 'nabidk', 'cenov', 'kalkulac', 'ceník', 'cenik', 'rozpočt'],
  },
  {
    slug: 'rezervacni-kalendar',
    titulek: 'Rezervační kalendář',
    klice: ['termín', 'termin', 'rezerv', 'kalendář', 'kalendar', 'objednáv', 'schůzk', 'schuzk'],
  },
  {
    slug: 'zivy-report',
    titulek: 'Živý report',
    klice: ['report', 'přehled', 'prehled', 'statistik', 'dashboard', 'tabulk', 'excel', 'sheets'],
  },
  {
    slug: 'sprava-ukolu',
    titulek: 'Správa úkolů a procesů',
    klice: ['úkol', 'ukol', 'proces', 'workflow', 'schvalov', 'onboard', 'docház', 'dochaz'],
  },
  {
    slug: 'ai-asistent',
    titulek: 'AI asistent pro zaměstnance',
    klice: ['asisten', 'chatbot', 'chat ', 'znalost', 'návod', 'navod', 'interní dotaz'],
  },
]

/** Domény, proti kterým se hledají překlepy v e-mailu. */
export const DOMENY = [
  'gmail.com',
  'seznam.cz',
  'email.cz',
  'centrum.cz',
  'post.cz',
  'volny.cz',
  'outlook.com',
  'outlook.cz',
  'hotmail.com',
  'icloud.com',
  'yahoo.com',
  'proton.me',
]
