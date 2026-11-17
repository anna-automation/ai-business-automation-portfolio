import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  CheckCheck,
  Inbox,
  Mail,
  MailOpen,
  Megaphone,
  Pencil,
  Receipt,
  Reply,
  Search,
  Send,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react'
import { DemoShell, FakeDataNote } from './_shell.jsx'
import { Badge, Skeleton } from '../ui/primitives.jsx'
import { Button } from '../ui/Button.jsx'
import { Counter } from '../ui/Counter.jsx'
import { useT } from '../../lib/i18n.jsx'
import { useReducedMotion } from '../../lib/prefs.jsx'
import { useToast } from '../../lib/toast.jsx'
import { cn, fold } from '../../lib/utils.js'

/**
 * Automatizace e-mailů — AI triage doručené pošty.
 *
 * Zprávy se třídí jedna po druhé, aby bylo vidět, že práce někde probíhá.
 * Jedna zpráva má nízkou spolehlivost a jde k člověku — demo nemá tvrdit,
 * že klasifikace je vždy správná.
 */

const STEP_MS = 350
const SORT_SECONDS = 4.1

const LABELS = {
  enquiry: { tone: 'accent', icon: Sparkles, cs: 'Poptávka', en: 'Enquiry' },
  invoice: { tone: 'violet', icon: Receipt, cs: 'Faktura', en: 'Invoice' },
  complaint: { tone: 'coral', icon: AlertTriangle, cs: 'Reklamace', en: 'Complaint' },
  internal: { tone: 'neutral', icon: Users, cs: 'Interní', en: 'Internal' },
  spam: { tone: 'warn', icon: Megaphone, cs: 'Spam', en: 'Spam' },
}

const PRIORITY = {
  high: { cs: 'vysoká', en: 'high', cls: 'text-coral' },
  mid: { cs: 'střední', en: 'medium', cls: 'text-warn' },
  low: { cs: 'nízká', en: 'low', cls: 'text-muted' },
}

const EMAILS = [
  {
    id: 'm1',
    from: 'Jana Konečná',
    org: 'Stavby Konečný s.r.o.',
    address: 'j.konecna@stavbykonecny.cz',
    time: '08:12',
    label: 'enquiry',
    priority: 'high',
    confidence: 94,
    subject: {
      cs: 'Poptávka: automatizace fakturace',
      en: 'Enquiry: invoicing automation',
    },
    snippet: {
      cs: 'Dobrý den, hledáme někoho, kdo nám srovná vystavování faktur…',
      en: 'Hello, we are looking for someone to sort out our invoicing…',
    },
    body: {
      cs: 'Dobrý den,\n\nhledáme někoho, kdo nám srovná vystavování faktur. Měsíčně jich vydáváme asi 340 a dvě kolegyně je přepisují ručně z tabulek do účetního systému. Rozpočet máme předjednaný na 180 000 Kč, ideálně nasazení v prvním kvartálu 2027.\n\nMůžeme se potkat online do konce týdne?\n\nS pozdravem\nJana Konečná, provozní ředitelka',
      en: 'Hello,\n\nwe are looking for someone to sort out our invoicing. We issue roughly 340 invoices a month and two colleagues retype them by hand from spreadsheets into the accounting system. We have a pre-approved budget of CZK 180,000, ideally going live in Q1 2027.\n\nCould we meet online before the end of the week?\n\nKind regards,\nJana Konečná, Operations Director',
    },
    found: {
      cs: ['Záměr: nová poptávka', 'Rozpočet: 180 000 Kč', 'Termín: Q1 2027', 'Objem: 340 faktur / měsíc'],
      en: ['Intent: new enquiry', 'Budget: CZK 180,000', 'Timeline: Q1 2027', 'Volume: 340 invoices / month'],
    },
    reply: {
      cs: 'Dobrý den, paní Konečná,\n\nděkuji za poptávku. Objem 340 faktur měsíčně je přesně případ, kde se automatizace vrátí do pár měsíců — přepis z tabulek do účetního systému umím odstranit celý.\n\nNavrhuji krátký online call ve čtvrtek 20. 11. v 10:00 nebo v pátek 21. 11. v 9:00. Pošlete prosím, co se vám hodí lépe, a ideálně i ukázku jedné faktury a tabulky, ze které se opisuje.\n\nS pozdravem\nAnna',
      en: 'Dear Ms. Konečná,\n\nthank you for your enquiry. A volume of 340 invoices a month is exactly the case where automation pays back within a few months — the retyping from spreadsheets into the accounting system can be removed entirely.\n\nI suggest a short online call on Thursday 20 Nov at 10:00 or Friday 21 Nov at 9:00. Please let me know which suits you better, and ideally send over a sample invoice and the spreadsheet it is copied from.\n\nKind regards,\nAnna',
    },
  },
  {
    id: 'm2',
    from: 'Fakturoid',
    org: 'automatické oznámení',
    address: 'noreply@fakturoid.cz',
    time: '07:48',
    label: 'invoice',
    priority: 'mid',
    confidence: 97,
    subject: {
      cs: 'Faktura 2026-0412 — splatnost 28. 11. 2026',
      en: 'Invoice 2026-0412 — due 28 Nov 2026',
    },
    snippet: {
      cs: 'Byla vám vystavena faktura na 42 350 Kč za hosting a licence…',
      en: 'An invoice for CZK 42,350 for hosting and licences has been issued…',
    },
    body: {
      cs: 'Dobrý den,\n\nbyla vám vystavena faktura 2026-0412 na částku 42 350 Kč za hosting a licence za období 11/2026. Splatnost je 28. 11. 2026, variabilní symbol 20260412.\n\nPDF najdete v příloze.\n\nFakturoid',
      en: 'Hello,\n\ninvoice 2026-0412 has been issued for CZK 42,350 covering hosting and licences for the 11/2026 period. Due date 28 Nov 2026, payment reference 20260412.\n\nThe PDF is attached.\n\nFakturoid',
    },
    found: {
      cs: ['Doklad: 2026-0412', 'Částka: 42 350 Kč', 'Splatnost: 28. 11. 2026', 'Variabilní symbol nalezen'],
      en: ['Document: 2026-0412', 'Amount: CZK 42,350', 'Due: 28 Nov 2026', 'Payment reference found'],
    },
    reply: {
      cs: 'Potvrzení pro účetní:\n\nFaktura 2026-0412 (42 350 Kč, VS 20260412) je zařazená k proplacení ke dni 26. 11. 2026, dva dny před splatností. Doklad jsem uložila do složky Přijaté faktury / 11-2026 a zapsala do přehledu nákladů jako „Hosting a licence“.\n\nPokud částka nesouhlasí s objednávkou, ozvěte se prosím do 24. 11.\n\nAnna',
      en: 'Confirmation for accounting:\n\nInvoice 2026-0412 (CZK 42,350, ref. 20260412) is queued for payment on 26 Nov 2026, two days before the due date. The document has been filed under Incoming invoices / 11-2026 and booked in the cost overview as "Hosting and licences".\n\nIf the amount does not match the purchase order, please let me know by 24 Nov.\n\nAnna',
    },
  },
  {
    id: 'm3',
    from: 'Martin Dvořák',
    org: 'zákazník',
    address: 'martin.dvorak@seznam.cz',
    time: '07:31',
    label: 'complaint',
    priority: 'high',
    confidence: 91,
    subject: {
      cs: 'Reklamace objednávky #8821 — chybí 2 kusy',
      en: 'Complaint about order #8821 — 2 items missing',
    },
    snippet: {
      cs: 'Dobrý den, v balíku dorazilo 4 z 6 kusů, zbytek chybí…',
      en: 'Hello, the parcel arrived with 4 of 6 items, the rest is missing…',
    },
    body: {
      cs: 'Dobrý den,\n\nvčera mi dorazila objednávka #8821, ale v balíku byly jen 4 kusy z 6. Krabice byla neporušená, takže to nevypadá na přepravce. Na dodacím listu je přitom uvedeno 6 ks.\n\nPotřebuji to dořešit do pátku, materiál mám nasazený na montáž.\n\nMartin Dvořák',
      en: 'Hello,\n\norder #8821 arrived yesterday, but the parcel contained only 4 of 6 items. The box was intact, so it does not look like a carrier issue. The delivery note still lists 6 pcs.\n\nI need this resolved by Friday, the material is scheduled for an installation.\n\nMartin Dvořák',
    },
    found: {
      cs: ['Typ: reklamace dodávky', 'Objednávka: #8821', 'Chybí: 2 ks ze 6', 'Deadline zákazníka: pátek'],
      en: ['Type: delivery complaint', 'Order: #8821', 'Missing: 2 of 6 pcs', 'Customer deadline: Friday'],
    },
    reply: {
      cs: 'Dobrý den, pane Dvořáku,\n\nomlouvám se za nepříjemnost. Reklamaci objednávky #8821 jsem přijala a vedu ji pod číslem REK-2026-114.\n\nChybějící 2 kusy posílám dnes expresní přepravou, doručení zítra do 12:00 — na vaši montáž v pátek to stihnete. Zároveň prověřujeme kompletaci balíku na našem skladu, abychom zjistili, kde se rozdíl vzal.\n\nPřepravní číslo vám pošlu dnes odpoledne.\n\nS pozdravem\nAnna',
      en: 'Dear Mr. Dvořák,\n\nmy apologies for the trouble. Your complaint about order #8821 has been registered under reference REK-2026-114.\n\nThe 2 missing items are going out today by express courier, delivery tomorrow before 12:00 — in time for your Friday installation. We are also reviewing how the parcel was packed in our warehouse to find out where the difference came from.\n\nI will send you the tracking number this afternoon.\n\nKind regards,\nAnna',
    },
  },
  {
    id: 'm4',
    from: 'Petra Hrubá',
    org: 'personální oddělení',
    address: 'petra.hruba@firma.cz',
    time: '07:05',
    label: 'internal',
    priority: 'low',
    confidence: 88,
    subject: {
      cs: 'Porada v pátek 9:00 — podklady do čtvrtka',
      en: 'Friday 9:00 meeting — materials by Thursday',
    },
    snippet: {
      cs: 'Ahoj, posílám program porady. Prosím o podklady nejpozději ve čtvrtek…',
      en: 'Hi, here is the meeting agenda. Please send materials by Thursday…',
    },
    body: {
      cs: 'Ahoj,\n\nposílám program pátkové porady (9:00, zasedačka na druhém patře):\n1. Nábor na pozici účetní\n2. Plán školení na první kvartál\n3. Revize pracovního řádu\n\nPodklady prosím nahrajte na disk nejpozději ve čtvrtek do 16:00, ať je máme před poradou pročtené.\n\nDíky, Petra',
      en: 'Hi,\n\nhere is the agenda for the Friday meeting (9:00, second floor meeting room):\n1. Hiring for the accountant role\n2. Training plan for Q1\n3. Employee handbook review\n\nPlease upload your materials to the drive by Thursday 16:00 so we can read them before the meeting.\n\nThanks, Petra',
    },
    found: {
      cs: ['Typ: interní organizace', 'Termín: pátek 9:00', 'Úkol: podklady do čtvrtka 16:00', 'Založeno do kalendáře'],
      en: ['Type: internal coordination', 'Event: Friday 9:00', 'Task: materials by Thursday 16:00', 'Added to calendar'],
    },
    reply: {
      cs: 'Ahoj Petro,\n\ndíky za program. Pátek 9:00 mám v kalendáři, podklady k bodu 2 (plán školení) nahraju ve čtvrtek dopoledne, ať je máš s rezervou.\n\nK bodu 3 bych ráda přidala krátkou poznámku k pravidlům pro používání AI nástrojů — vejde se to do pěti minut.\n\nAnna',
      en: 'Hi Petra,\n\nthanks for the agenda. Friday 9:00 is in my calendar, and I will upload the materials for item 2 (training plan) on Thursday morning so you have them with time to spare.\n\nFor item 3 I would like to add a short note on the rules for using AI tools — five minutes should cover it.\n\nAnna',
    },
  },
  {
    id: 'm5',
    from: 'Marketing Boost CZ',
    org: 'hromadná rozesílka',
    address: 'nabidka@marketingboost-cz.biz',
    time: '06:44',
    label: 'spam',
    priority: 'low',
    confidence: 99,
    subject: {
      cs: 'ZDVOJNÁSOBTE OBRAT ZA 7 DNÍ — poslední místa!!!',
      en: 'DOUBLE YOUR REVENUE IN 7 DAYS — last spots!!!',
    },
    snippet: {
      cs: 'Garantujeme +100 % obratu nebo vracíme peníze. Stačí kliknout…',
      en: 'We guarantee +100% revenue or your money back. Just click…',
    },
    body: {
      cs: 'Vážený podnikateli,\n\nGARANTUJEME +100 % OBRATU DO 7 DNÍ nebo vám vrátíme peníze! Náš tajný systém už použilo 14 000 firem. Poslední 3 místa v tomto měsíci!!!\n\nStačí kliknout na odkaz a vyplnit údaje o firmě včetně přístupů do účetnictví.\n\nMarketing Boost CZ',
      en: 'Dear entrepreneur,\n\nWE GUARANTEE +100% REVENUE IN 7 DAYS or your money back! Our secret system has already been used by 14,000 companies. Only 3 spots left this month!!!\n\nJust click the link and fill in your company details including your accounting logins.\n\nMarketing Boost CZ',
    },
    found: {
      cs: [
        'Typ: nevyžádaná rozesílka',
        'Signály: nerealistický slib, tlak na čas',
        'Žádá přístupy do účetnictví',
        'Doména mimo seznam dodavatelů',
      ],
      en: [
        'Type: unsolicited bulk mail',
        'Signals: unrealistic promise, urgency pressure',
        'Requests accounting credentials',
        'Domain not on supplier list',
      ],
    },
    reply: null,
    noReplyNote: {
      cs: 'Odpověď se nenavrhuje. Zpráva žádá přístupy do účetnictví — označeno jako pokus o phishing, k archivaci bez reakce.',
      en: 'No reply drafted. The message requests accounting credentials — flagged as a phishing attempt, to be archived without a response.',
    },
  },
  {
    id: 'm6',
    from: 'Tomáš Vlček',
    org: 'Vlček Logistics a.s.',
    address: 't.vlcek@vlceklogistics.cz',
    time: '06:20',
    label: 'complaint',
    priority: 'high',
    confidence: 93,
    subject: {
      cs: 'Třetí den bez odpovědi — tohle je naposledy',
      en: 'Third day with no reply — this is the last time',
    },
    snippet: {
      cs: 'Píšu už potřetí. Buď se dnes někdo ozve, nebo rušíme smlouvu…',
      en: 'This is my third e-mail. Either someone replies today or we cancel…',
    },
    body: {
      cs: 'Dobrý den,\n\npíšu už potřetí a nikdo se neozval. Od 10. 11. nám nefunguje napojení na váš systém, kvůli tomu nám stojí 60 expedic denně a ručně to nestíháme.\n\nBuď se dnes někdo ozve s termínem opravy, nebo k 30. 11. vypovídáme smlouvu a řešíme to právně. Vyčíslená škoda je zatím 214 000 Kč.\n\nTomáš Vlček, jednatel',
      en: 'Hello,\n\nthis is my third e-mail and nobody has replied. The integration with your system has been down since 10 Nov, which leaves 60 shipments a day stuck and we cannot keep up manually.\n\nEither someone comes back today with a fix date, or we terminate the contract on 30 Nov and take it to our lawyers. The damage so far adds up to CZK 214,000.\n\nTomáš Vlček, Managing Director',
    },
    found: {
      cs: [
        'Typ: eskalace, riziko odchodu',
        'Tón: silně negativní',
        'Třetí nevyřízený kontakt',
        'Vyčíslená škoda: 214 000 Kč',
      ],
      en: [
        'Type: escalation, churn risk',
        'Tone: strongly negative',
        'Third unanswered contact',
        'Claimed damage: CZK 214,000',
      ],
    },
    escalate: {
      cs: 'Eskalováno vedení. Návrh odpovědi je připravený, ale odeslání musí schválit člověk.',
      en: 'Escalated to management. The draft is ready, but a human has to approve sending it.',
    },
    reply: {
      cs: 'Dobrý den, pane Vlčku,\n\nmáte pravdu a omlouvám se — tři nevyřízené e-maily jsou naše chyba, ne vaše.\n\nStav k dnešnímu ránu: příčinu výpadku napojení jsme našli ve změně autorizace na našem rozhraní z 10. 11. Oprava je nasazená na testu, na produkci ji pouštíme dnes do 16:00. Do té doby vám expedice zpracujeme na naší straně, abyste dnešní den nestáli.\n\nDnes v 11:00 vám zavolá náš vedoucí provozu s termínem a návrhem kompenzace. Vaše vyčíslení 214 000 Kč bereme jako podklad k jednání, ne jako něco, co bychom chtěli rozporovat.\n\nS pozdravem\nAnna',
      en: 'Dear Mr. Vlček,\n\nyou are right and I apologise — three unanswered e-mails are our fault, not yours.\n\nStatus as of this morning: we traced the integration outage to an authorisation change on our interface on 10 Nov. The fix is deployed on staging and goes to production today before 16:00. Until then we will process your shipments on our side so today is not lost.\n\nOur head of operations will call you today at 11:00 with the timeline and a compensation proposal. We treat your figure of CZK 214,000 as a basis for that conversation, not something to argue about.\n\nKind regards,\nAnna',
    },
  },
  {
    id: 'm7',
    from: 'Lucie Němcová',
    org: 'Dentalia Praha s.r.o.',
    address: 'nemcova@dentalia-praha.cz',
    time: '05:58',
    label: 'enquiry',
    priority: 'mid',
    confidence: 90,
    subject: {
      cs: 'Dotaz na cenu školení pro 12 lidí',
      en: 'Price request: training for 12 people',
    },
    snippet: {
      cs: 'Zajímalo by nás školení práce s AI pro recepci a asistentky…',
      en: 'We would be interested in AI training for our front desk and assistants…',
    },
    body: {
      cs: 'Dobrý den,\n\nzajímalo by nás školení práce s AI pro recepci a asistentky — dohromady 12 lidí, úplní začátečníci. Potřebujeme hlavně psaní odpovědí pacientům a práci s dokumenty.\n\nMáme k dispozici jeden celý den, nejlépe v lednu. Jakou máte cenu a jestli jezdíte i k nám do ordinace?\n\nLucie Němcová',
      en: 'Hello,\n\nwe would be interested in AI training for our front desk and assistants — 12 people in total, complete beginners. We mainly need help with writing replies to patients and working with documents.\n\nWe have one full day available, preferably in January. What is your price, and do you also come to our practice?\n\nLucie Němcová',
    },
    found: {
      cs: ['Záměr: poptávka školení', 'Počet účastníků: 12', 'Úroveň: začátečníci', 'Preferovaný termín: leden'],
      en: ['Intent: training enquiry', 'Participants: 12', 'Level: beginners', 'Preferred date: January'],
    },
    reply: {
      cs: 'Dobrý den, paní Němcová,\n\nděkuji za zájem. Pro 12 začátečníků se hodí jednodenní workshop (6 hodin, dvě pauzy) zaměřený přesně na to, co píšete — odpovědi pacientům a práce s dokumenty.\n\nCena celodenního workshopu u vás na místě je 18 500 Kč bez DPH, včetně materiálů a čtrnáctidenní podpory po školení. V Praze neúčtuji dopravu.\n\nVolné termíny v lednu: 14. 1., 20. 1. a 27. 1. Mám některý z nich předběžně blokovat?\n\nS pozdravem\nAnna',
      en: 'Dear Ms. Němcová,\n\nthank you for your interest. For 12 beginners a one-day workshop (6 hours, two breaks) focused exactly on what you describe — patient replies and document handling — is the right fit.\n\nThe price for a full-day on-site workshop is CZK 18,500 excl. VAT, including materials and two weeks of follow-up support. Within Prague I do not charge for travel.\n\nAvailable January dates: 14 Jan, 20 Jan and 27 Jan. Shall I hold one of them for you?\n\nKind regards,\nAnna',
    },
  },
  {
    id: 'm8',
    from: 'ČSOB',
    org: 'bankovní oznámení',
    address: 'vypisy@csob-info.cz',
    time: '05:30',
    label: 'invoice',
    priority: 'low',
    confidence: 86,
    subject: {
      cs: 'Výpis z účtu za říjen 2026',
      en: 'Account statement for October 2026',
    },
    snippet: {
      cs: 'Výpis za období 1.–31. 10. 2026 je připraven ke stažení…',
      en: 'The statement for 1–31 Oct 2026 is ready to download…',
    },
    body: {
      cs: 'Dobrý den,\n\nvýpis z účtu 2718445092/0300 za období 1.–31. 10. 2026 je připraven ke stažení v internetovém bankovnictví. Počet transakcí: 142. Konečný zůstatek: 612 480 Kč.\n\nTento e-mail je generovaný automaticky, neodpovídejte na něj.\n\nČSOB',
      en: 'Hello,\n\nthe statement for account 2718445092/0300 covering 1–31 Oct 2026 is ready to download in internet banking. Transactions: 142. Closing balance: CZK 612,480.\n\nThis e-mail is generated automatically, please do not reply.\n\nČSOB',
    },
    found: {
      cs: ['Typ: bankovní výpis', 'Období: 10/2026', 'Transakcí: 142', 'Předáno do účetnictví'],
      en: ['Type: bank statement', 'Period: 10/2026', 'Transactions: 142', 'Forwarded to accounting'],
    },
    reply: {
      cs: 'Interní poznámka pro účetní:\n\nVýpis za 10/2026 (142 transakcí, konečný zůstatek 612 480 Kč) jsem uložila do složky Banka / 2026 / 10 a přiřadila k měsíční uzávěrce.\n\nOdesílatel je automat a odpovědi nepřijímá, takže nic neodcházím — zpráva jde do archivu.\n\nAnna',
      en: 'Internal note for accounting:\n\nThe 10/2026 statement (142 transactions, closing balance CZK 612,480) has been filed under Bank / 2026 / 10 and linked to the monthly close.\n\nThe sender is an automated mailbox that does not accept replies, so nothing is being sent — the message goes to the archive.\n\nAnna',
    },
  },
  {
    id: 'm9',
    from: 'Ondřej Šimek',
    org: 'IT podpora',
    address: 'ondrej.simek@firma.cz',
    time: '04:52',
    label: 'internal',
    priority: 'mid',
    confidence: 84,
    subject: {
      cs: 'Restart serverů v noci na čtvrtek 01:00–03:00',
      en: 'Server restart Thursday night 01:00–03:00',
    },
    snippet: {
      cs: 'Plánovaná odstávka kvůli aktualizaci. Systémy budou nedostupné…',
      en: 'Planned maintenance for updates. Systems will be unavailable…',
    },
    body: {
      cs: 'Ahoj všichni,\n\nv noci na čtvrtek 20. 11. mezi 01:00 a 03:00 proběhne plánovaná odstávka kvůli bezpečnostním aktualizacím. Nedostupné budou intranet, sdílený disk a schvalovací workflow.\n\nE-mail a kalendář pojedou normálně. Prosím, dokončete rozpracované schvalování do středy 23:00.\n\nOndra, IT',
      en: 'Hi all,\n\nplanned maintenance will run on Thursday 20 Nov between 01:00 and 03:00 for security updates. The intranet, shared drive and approval workflow will be unavailable.\n\nE-mail and calendar will keep running. Please finish any pending approvals by Wednesday 23:00.\n\nOndra, IT',
    },
    found: {
      cs: ['Typ: interní oznámení', 'Odstávka: 20. 11., 01:00–03:00', 'Dotčeno: intranet, disk, schvalování', 'Úkol: dokončit schvalování do st 23:00'],
      en: ['Type: internal notice', 'Downtime: 20 Nov, 01:00–03:00', 'Affected: intranet, drive, approvals', 'Task: finish approvals by Wed 23:00'],
    },
    reply: {
      cs: 'Ahoj Ondro,\n\ndíky za včasné upozornění. Odstávku mám v kalendáři a rozpracovaná schvalování dotáhnu ve středu během dne, aby po 23:00 nic neviselo.\n\nJen prosím potvrď, že schvalovací workflow po restartu rozjedete samo — minule jsme ho museli nahodit ručně.\n\nAnna',
      en: 'Hi Ondra,\n\nthanks for the early notice. The maintenance window is in my calendar and I will finish any pending approvals during Wednesday so nothing is left hanging after 23:00.\n\nCould you just confirm that the approval workflow comes back up on its own after the restart — last time we had to start it manually.\n\nAnna',
    },
  },
  {
    id: 'm10',
    from: 'Kateřina Bláhová',
    org: 'neurčeno',
    address: 'k.blahova@gmail.com',
    time: '04:17',
    label: 'internal',
    priority: 'mid',
    confidence: 58,
    uncertain: true,
    subject: {
      cs: 'Re: Re: Fwd: ohledně toho, co jsme řešili',
      en: 'Re: Re: Fwd: about the thing we discussed',
    },
    snippet: {
      cs: 'Dobrý den, tak jak jsme se bavili, posílám to dál. Dejte vědět…',
      en: 'Hello, as we discussed, I am forwarding this on. Let me know…',
    },
    body: {
      cs: 'Dobrý den,\n\ntak jak jsme se bavili, posílám to dál. Pan kolega říkal, že to má u sebe, ale asi se to ztratilo v tom druhém vlákně. Dejte prosím vědět, jestli to tak může zůstat, nebo to máme ještě poslat jinam.\n\nDíky, K. Bláhová',
      en: 'Hello,\n\nas we discussed, I am forwarding this on. My colleague said he had it, but it probably got lost in that other thread. Please let me know whether it can stay as it is, or whether we should send it somewhere else.\n\nThanks, K. Bláhová',
    },
    found: {
      cs: [
        'Žádný rozpoznatelný záměr',
        'Chybí předmět jednání i identifikátor',
        'Odkazuje na vlákno, které v mailboxu není',
        'Odesílatel není v CRM',
      ],
      en: [
        'No recognisable intent',
        'No subject matter or identifier present',
        'Refers to a thread not found in the mailbox',
        'Sender is not in the CRM',
      ],
    },
    reply: null,
  },
  {
    id: 'm11',
    from: 'Automatizace.cz',
    org: 'newsletter',
    address: 'news@automatizace.cz',
    time: '03:40',
    label: 'spam',
    priority: 'low',
    confidence: 95,
    subject: {
      cs: 'Týdenní přehled: 7 novinek v n8n',
      en: 'Weekly digest: 7 new things in n8n',
    },
    snippet: {
      cs: 'Nové nody, lepší error handling a tři tipy na webhooky…',
      en: 'New nodes, better error handling and three webhook tips…',
    },
    body: {
      cs: 'Dobrý den,\n\nv tomto vydání: nové nody pro práci s PDF, lepší error handling ve workflow, tři tipy na zabezpečení webhooků a rozhovor s člověkem, který automatizoval celou účtárnu.\n\nOdhlásit se můžete jedním kliknutím v patičce.\n\nRedakce Automatizace.cz',
      en: 'Hello,\n\nin this issue: new nodes for working with PDFs, better error handling in workflows, three tips on securing webhooks and an interview with someone who automated an entire accounting department.\n\nYou can unsubscribe with one click in the footer.\n\nThe Automatizace.cz team',
    },
    found: {
      cs: ['Typ: vyžádaný newsletter', 'Není obchodní ani provozní', 'Bez termínu a bez úkolu', 'Přesunuto do složky Čtení'],
      en: ['Type: opted-in newsletter', 'Neither commercial nor operational', 'No deadline, no task', 'Moved to the Reading folder'],
    },
    reply: null,
    noReplyNote: {
      cs: 'Odpověď se nenavrhuje. Newsletter nevyžaduje reakci — přesunuto do složky Čtení, odběr ponechán.',
      en: 'No reply drafted. A newsletter needs no response — moved to the Reading folder, subscription kept.',
    },
  },
  {
    id: 'm12',
    from: 'Zdeněk Prokop',
    org: 'Prokop Metal s.r.o.',
    address: 'ucetni@prokopmetal.cz',
    time: '02:55',
    label: 'invoice',
    priority: 'mid',
    confidence: 79,
    subject: {
      cs: 'Faktura 20260431 — přeplatek 4 200 Kč',
      en: 'Invoice 20260431 — overpayment of CZK 4,200',
    },
    snippet: {
      cs: 'Při kontrole jsme zjistili, že jsme uhradili o 4 200 Kč víc…',
      en: 'During a review we found we paid CZK 4,200 too much…',
    },
    body: {
      cs: 'Dobrý den,\n\npři kontrole plateb jsme zjistili, že jsme k faktuře 20260431 uhradili 58 200 Kč místo fakturovaných 54 000 Kč. Přeplatek je tedy 4 200 Kč.\n\nProsím o dobropis nebo o zápočet proti nejbližší faktuře — co je pro vás jednodušší.\n\nZdeněk Prokop, účetní',
      en: 'Hello,\n\nduring a payment review we found that we paid CZK 58,200 against invoice 20260431 instead of the invoiced CZK 54,000. The overpayment is therefore CZK 4,200.\n\nPlease issue a credit note or offset it against the next invoice — whichever is easier for you.\n\nZdeněk Prokop, Accountant',
    },
    found: {
      cs: ['Typ: oprava platby', 'Doklad: 20260431', 'Přeplatek: 4 200 Kč', 'Řešení na výběr: dobropis / zápočet'],
      en: ['Type: payment correction', 'Document: 20260431', 'Overpayment: CZK 4,200', 'Options: credit note / offset'],
    },
    reply: {
      cs: 'Dobrý den, pane Prokope,\n\nděkuji za upozornění, přeplatek 4 200 Kč u faktury 20260431 jsme dohledali a potvrzujeme ho.\n\nNavrhuji zápočet proti nejbližší faktuře, kterou vám budeme vystavovat 1. 12. 2026 — ušetří to oboum stranám papírování. Pokud byste přesto chtěli dobropis, napište a vystavím ho do dvou pracovních dnů.\n\nS pozdravem\nAnna',
      en: 'Dear Mr. Prokop,\n\nthank you for flagging this. We have traced the CZK 4,200 overpayment on invoice 20260431 and can confirm it.\n\nI suggest offsetting it against the next invoice, which we will issue on 1 Dec 2026 — it saves paperwork on both sides. If you would still prefer a credit note, just say so and I will issue it within two business days.\n\nKind regards,\nAnna',
    },
  },
]

const TOTAL = EMAILS.length
const COMPACT_IDS = ['m1', 'm2', 'm3', 'm5', 'm10']
const COMPACT_COUNT = COMPACT_IDS.length

const L = {
  cs: {
    title: 'Automatizace e-mailů',
    subtitle: 'AI triage doručené pošty — štítek, priorita, návrh odpovědi',
    inbox: 'Doručená pošta',
    unread: 'nepřečtených',
    sortedCount: 'roztříděných',
    sort: 'Roztřídit AI',
    sorting: 'Třídím…',
    sortAgain: 'Roztřídit znovu',
    progress: 'Průběh třídění',
    search: 'Hledat v poště',
    searchPlaceholder: 'Hledat podle odesílatele nebo předmětu…',
    all: 'Vše',
    unsorted: 'Neroztříděno',
    pickOne: 'Vyberte zprávu vlevo',
    pickOneHint: 'U každé zprávy uvidíte, co z ní AI přečetla, jak si je jistá a jaký text navrhuje odeslat.',
    recognised: 'Co AI rozpoznala',
    confidence: 'Spolehlivost klasifikace',
    draft: 'Návrh odpovědi',
    drafting: 'Koncept odpovědi připraven',
    send: 'Odeslat',
    edit: 'Upravit',
    editing: 'Úprava návrhu',
    done: 'Hotovo',
    sentFolder: 'Odesláno',
    sentEmpty: 'Zatím nic odeslaného.',
    uncertainTitle: 'Nejistá klasifikace — posílám člověku ke kontrole',
    uncertainBody:
      'Ze zprávy nejde určit, o co jde. Automatickou odpověď v takovém případě nenavrhuji — zpráva jde do fronty ke kontrole člověkem.',
    escalateTitle: 'Eskalováno vedení',
    priority: 'Priorita',
    label: 'Štítek',
    sumA: 'Roztříděno',
    sumB: 'zpráv za',
    sumManual: 'ručně ~18 min',
    toastTitle: 'V reálném nasazení by odpověď odešla',
    toastBody: 'Tohle je demo — nic se nikam neposílá. Zpráva se jen přesunula do složky Odesláno.',
    noneFound: 'Žádná zpráva neodpovídá filtru.',
    aiBadge: 'AI',
    sortedTag: 'Roztříděno',
    waitingTag: 'Čeká',
    toHuman: 'K člověku',
    noteHuman: 'Co si AI není jistá, nerozhoduje sama.',
    compactNote: 'AI · štítek + priorita + návrh odpovědi',
  },
  en: {
    title: 'E-mail automation',
    subtitle: 'AI inbox triage — label, priority, drafted reply',
    inbox: 'Inbox',
    unread: 'unread',
    sortedCount: 'sorted',
    sort: 'Sort with AI',
    sorting: 'Sorting…',
    sortAgain: 'Sort again',
    progress: 'Sorting progress',
    search: 'Search the inbox',
    searchPlaceholder: 'Search by sender or subject…',
    all: 'All',
    unsorted: 'Unsorted',
    pickOne: 'Pick a message on the left',
    pickOneHint: 'For every message you will see what the AI read from it, how confident it is and what text it suggests sending.',
    recognised: 'What the AI recognised',
    confidence: 'Classification confidence',
    draft: 'Drafted reply',
    drafting: 'Draft reply ready',
    send: 'Send',
    edit: 'Edit',
    editing: 'Editing the draft',
    done: 'Done',
    sentFolder: 'Sent',
    sentEmpty: 'Nothing sent yet.',
    uncertainTitle: 'Uncertain classification — handing this to a human',
    uncertainBody:
      'The message does not say what it is about. In such a case no automatic reply is drafted — the message goes into the queue for human review.',
    escalateTitle: 'Escalated to management',
    priority: 'Priority',
    label: 'Label',
    sumA: 'Sorted',
    sumB: 'messages in',
    sumManual: 'manually ~18 min',
    toastTitle: 'In a real deployment the reply would be sent',
    toastBody: 'This is a demo — nothing goes anywhere. The message only moved to the Sent folder.',
    noneFound: 'No message matches the filter.',
    aiBadge: 'AI',
    sortedTag: 'Sorted',
    waitingTag: 'Waiting',
    toHuman: 'To a human',
    noteHuman: 'What the AI is unsure about, it does not decide alone.',
    compactNote: 'AI · label + priority + drafted reply',
  },
}

export default function InboxDemo({ compact = false }) {
  const { t, lang } = useT()
  const reduced = useReducedMotion()
  const { push } = useToast()
  const s = L[lang] ?? L.cs

  const [cursor, setCursor] = useState(0)
  const [running, setRunning] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [sentIds, setSentIds] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [draftText, setDraftText] = useState('')

  // Smyčka plného režimu: jedna zpráva po druhé, ať je vidět že se něco děje.
  useEffect(() => {
    if (compact || !running) return
    if (cursor >= TOTAL) {
      setRunning(false)
      return
    }
    const id = setTimeout(() => setCursor((c) => c + 1), STEP_MS)
    return () => clearTimeout(id)
  }, [compact, running, cursor])

  const startSort = () => {
    setCursor(0)
    setSelectedId(null)
    setSentIds([])
    setEditingId(null)
    if (reduced) {
      setCursor(TOTAL)
      setRunning(false)
    } else {
      setRunning(true)
    }
  }

  const reset = () => {
    setRunning(false)
    setCursor(0)
    setSelectedId(null)
    setFilter('all')
    setQuery('')
    setSentIds([])
    setEditingId(null)
    setDraftText('')
  }

  const classified = (index) => index < cursor
  const finished = cursor >= TOTAL

  const counts = useMemo(() => {
    const out = { all: 0, enquiry: 0, invoice: 0, complaint: 0, internal: 0, spam: 0 }
    EMAILS.forEach((mail, i) => {
      if (!classified(i) || sentIds.includes(mail.id)) return
      out.all += 1
      out[mail.label] += 1
    })
    return out
  }, [cursor, sentIds])

  const visible = useMemo(() => {
    const needle = fold(query.trim())
    return EMAILS.map((mail, i) => ({ mail, index: i })).filter(({ mail, index }) => {
      if (sentIds.includes(mail.id)) return false
      if (filter !== 'all') {
        if (!classified(index)) return false
        if (mail.label !== filter) return false
      }
      if (!needle) return true
      const haystack = fold(
        [mail.from, mail.org, mail.address, mail.subject[lang] ?? mail.subject.cs, mail.snippet[lang] ?? mail.snippet.cs].join(' ')
      )
      return haystack.includes(needle)
    })
  }, [filter, query, cursor, sentIds, lang])

  const selected = EMAILS.find((m) => m.id === selectedId) ?? null
  const selectedIndex = selected ? EMAILS.indexOf(selected) : -1
  const selectedReady = selected && classified(selectedIndex)

  const pick = (value) => value?.[lang] ?? value?.cs ?? ''

  const openMail = (mail) => {
    setSelectedId(mail.id)
    setEditingId(null)
    setDraftText(pick(mail.reply))
  }

  const sendReply = (mail) => {
    setSentIds((list) => [...list, mail.id])
    setSelectedId(null)
    setEditingId(null)
    push({ title: s.toastTitle, description: s.toastBody, variant: 'info' })
  }

  /* ----------------------------------------------------------------- compact */

  if (compact) {
    return <CompactInbox s={s} lang={lang} reduced={reduced} pick={pick} />
  }

  /* -------------------------------------------------------------------- full */

  return (
    <DemoShell
      title={s.title}
      subtitle={s.subtitle}
      live={running}
      onReset={reset}
      toolbar={
        <Badge tone="accent" dot>
          {s.aiBadge}
        </Badge>
      }
    >
      <div className="flex flex-col gap-4">
        {/* hlavička: počítadla + spuštění */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="label-mono flex items-center gap-2">
              <Inbox size={12} />
              {s.inbox}
            </p>
            <p className="mt-1.5 font-mono text-[0.9rem] tabular-nums" aria-live="polite">
              <span className="font-display text-[1.6rem] font-semibold leading-none">
                {TOTAL - cursor}
              </span>{' '}
              <span className="text-muted">{s.unread}</span>
              <span aria-hidden className="mx-2 text-line-strong">
                ·
              </span>
              <span className="font-display text-[1.6rem] font-semibold leading-none text-accent">
                {cursor}
              </span>{' '}
              <span className="text-muted">{s.sortedCount}</span>
            </p>
          </div>

          <Button
            size="sm"
            variant={finished ? 'quiet' : 'primary'}
            icon={Zap}
            iconRight={false}
            onClick={startSort}
            disabled={running}
            cursorLabel={s.sort}
          >
            {running ? s.sorting : finished ? s.sortAgain : s.sort}
          </Button>
        </div>

        {/* progress */}
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="label-mono">{s.progress}</span>
            <span className="font-mono text-[0.68rem] tabular-nums text-muted">
              {cursor} / {TOTAL}
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={TOTAL}
            aria-valuenow={cursor}
            aria-label={s.progress}
            className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-2"
          >
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-300 ease-[var(--ease-out-expo)]"
              style={{ width: `${(cursor / TOTAL) * 100}%` }}
            />
          </div>
        </div>

        {/* filtry + hledání */}
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            <Chip active={filter === 'all'} onClick={() => setFilter('all')} count={counts.all}>
              {s.all}
            </Chip>
            {Object.entries(LABELS).map(([key, meta]) => (
              <Chip
                key={key}
                active={filter === key}
                onClick={() => setFilter(key)}
                count={counts[key]}
                tone={meta.tone}
              >
                {meta[lang] ?? meta.cs}
              </Chip>
            ))}
          </div>

          <label className="relative sm:w-56">
            <span className="sr-only">{s.search}</span>
            <Search
              size={13}
              aria-hidden
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={s.searchPlaceholder}
              aria-label={s.search}
              className="w-full rounded-xl border border-line bg-surface-2/60 py-2 pl-8 pr-3 text-[0.8rem] outline-none transition placeholder:text-muted focus:border-line-strong"
            />
          </label>
        </div>

        {/* seznam + detail */}
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          <div>
            <ul className="flex flex-col gap-1.5" aria-live="polite">
              <AnimatePresence initial={false}>
                {visible.map(({ mail, index }) => {
                  const ready = classified(index)
                  const meta = LABELS[mail.label]
                  const LabelIcon = meta.icon
                  return (
                    <motion.li
                      key={mail.id}
                      layout={!reduced}
                      initial={false}
                      exit={reduced ? { opacity: 0 } : { opacity: 0, x: 18, height: 0 }}
                      transition={{ duration: 0.28 }}
                    >
                      <button
                        type="button"
                        onClick={() => openMail(mail)}
                        aria-current={selectedId === mail.id}
                        className={cn(
                          'w-full rounded-xl border px-3 py-2.5 text-left transition-colors duration-300',
                          selectedId === mail.id
                            ? 'border-accent/50 bg-accent/8'
                            : 'border-line bg-surface-2/40 hover:border-line-strong'
                        )}
                      >
                        <div className="flex items-start gap-2.5">
                          <span
                            aria-hidden
                            className={cn(
                              'mt-0.5 grid size-6 shrink-0 place-items-center rounded-lg border transition-colors duration-300',
                              ready
                                ? 'border-line bg-surface text-muted'
                                : 'border-accent/40 bg-accent/12 text-text'
                            )}
                          >
                            {ready ? <MailOpen size={12} /> : <Mail size={12} />}
                          </span>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline justify-between gap-2">
                              <p
                                className={cn(
                                  'truncate text-[0.82rem]',
                                  ready ? 'font-medium' : 'font-semibold'
                                )}
                              >
                                {mail.from}
                              </p>
                              <span className="shrink-0 font-mono text-[0.66rem] text-muted">
                                {mail.time}
                              </span>
                            </div>
                            <p className="truncate text-[0.8rem] text-text-soft">
                              {pick(mail.subject)}
                            </p>
                            <p className="truncate text-[0.74rem] text-muted">{pick(mail.snippet)}</p>

                            <div className="mt-1.5 flex min-h-6 flex-wrap items-center gap-1.5">
                              {ready ? (
                                <>
                                  {mail.uncertain ? (
                                    <Badge tone="warn" icon={AlertTriangle}>
                                      {s.toHuman}
                                    </Badge>
                                  ) : (
                                    <Badge tone={meta.tone} icon={LabelIcon}>
                                      {meta[lang] ?? meta.cs}
                                    </Badge>
                                  )}
                                  <span
                                    className={cn(
                                      'font-mono text-[0.64rem] uppercase tracking-[0.1em]',
                                      PRIORITY[mail.priority].cls
                                    )}
                                  >
                                    {PRIORITY[mail.priority][lang] ?? PRIORITY[mail.priority].cs}
                                  </span>
                                  {mail.reply && (
                                    <span
                                      className="flex items-center gap-1 font-mono text-[0.64rem] text-muted"
                                      title={s.drafting}
                                    >
                                      <Reply size={11} aria-hidden />
                                      {s.drafting}
                                    </span>
                                  )}
                                </>
                              ) : running ? (
                                <Skeleton className="h-4 w-24" />
                              ) : (
                                <span className="font-mono text-[0.64rem] uppercase tracking-[0.1em] text-muted">
                                  {s.waitingTag}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    </motion.li>
                  )
                })}
              </AnimatePresence>
            </ul>

            {visible.length === 0 && (
              <p className="rounded-xl border border-line bg-surface-2/40 px-3 py-6 text-center text-[0.8rem] text-muted">
                {s.noneFound}
              </p>
            )}

            {/* odesláno */}
            <div className="mt-3 rounded-xl border border-line bg-surface-2/40 px-3 py-2.5">
              <p className="label-mono flex items-center gap-2">
                <Send size={11} />
                {s.sentFolder}
                <span className="text-accent">{sentIds.length}</span>
              </p>
              {sentIds.length === 0 ? (
                <p className="mt-1 text-[0.74rem] text-muted">{s.sentEmpty}</p>
              ) : (
                <ul className="mt-1.5 flex flex-col gap-1">
                  {sentIds.map((id) => {
                    const mail = EMAILS.find((m) => m.id === id)
                    return (
                      <li key={id} className="flex items-center gap-2 text-[0.76rem] text-muted">
                        <CheckCheck size={12} className="shrink-0 text-ok" aria-hidden />
                        <span className="truncate">
                          {mail.from} — {pick(mail.subject)}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* detail */}
          <div className="rounded-2xl border border-line bg-surface-2/40 p-3.5">
            {!selected ? (
              <div className="flex h-full min-h-48 flex-col items-center justify-center gap-2 text-center">
                <MailOpen size={22} className="text-muted" aria-hidden />
                <p className="text-[0.86rem] font-medium">{s.pickOne}</p>
                <p className="max-w-xs text-[0.76rem] leading-snug text-muted">{s.pickOneHint}</p>
              </div>
            ) : (
              <article className="flex flex-col gap-3">
                <header>
                  <p className="text-[0.92rem] font-semibold leading-snug">{pick(selected.subject)}</p>
                  <p className="mt-0.5 font-mono text-[0.7rem] text-muted">
                    {selected.from} · {selected.address} · {selected.time}
                  </p>
                </header>

                <p className="whitespace-pre-line border-l-2 border-line pl-3 text-[0.8rem] leading-relaxed text-text-soft">
                  {pick(selected.body)}
                </p>

                {!selectedReady ? (
                  <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : (
                  <>
                    <section>
                      <p className="label-mono">{s.recognised}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        {!selected.uncertain && (
                          <Badge tone={LABELS[selected.label].tone} dot>
                            {LABELS[selected.label][lang] ?? LABELS[selected.label].cs}
                          </Badge>
                        )}
                        <span className="rounded-full border border-line bg-surface px-2.5 py-1 font-mono text-[0.66rem] uppercase tracking-[0.1em] text-muted">
                          {s.priority}:{' '}
                          <span className={PRIORITY[selected.priority].cls}>
                            {PRIORITY[selected.priority][lang] ?? PRIORITY[selected.priority].cs}
                          </span>
                        </span>
                      </div>
                      <ul className="mt-2 flex flex-col gap-1">
                        {pick(selected.found).map((line) => (
                          <li key={line} className="flex items-start gap-2 text-[0.78rem] text-text-soft">
                            <span
                              aria-hidden
                              className="mt-[0.45rem] size-1 shrink-0 rounded-full bg-accent"
                            />
                            {line}
                          </li>
                        ))}
                      </ul>
                    </section>

                    <section>
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="label-mono">{s.confidence}</p>
                        <span
                          className={cn(
                            'font-mono text-[0.8rem] font-medium tabular-nums',
                            selected.uncertain ? 'text-warn' : 'text-text'
                          )}
                        >
                          {selected.confidence} %
                        </span>
                      </div>
                      <div
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={selected.confidence}
                        aria-label={s.confidence}
                        className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface"
                      >
                        <div
                          className={cn(
                            'h-full rounded-full transition-[width] duration-500 ease-[var(--ease-out-expo)]',
                            selected.uncertain ? 'bg-warn' : 'bg-accent'
                          )}
                          style={{ width: `${selected.confidence}%` }}
                        />
                      </div>
                    </section>

                    {selected.uncertain ? (
                      <div className="rounded-xl border border-warn/40 bg-warn/12 p-3">
                        <p className="flex items-center gap-2 text-[0.84rem] font-semibold">
                          <AlertTriangle size={14} className="shrink-0 text-warn" aria-hidden />
                          {s.uncertainTitle}
                        </p>
                        <p className="mt-1 text-[0.78rem] leading-snug text-text-soft">
                          {s.uncertainBody}
                        </p>
                      </div>
                    ) : selected.reply ? (
                      <section>
                        {selected.escalate && (
                          <p className="mb-2 flex items-start gap-2 rounded-xl border border-coral/40 bg-coral/12 px-3 py-2 text-[0.78rem] leading-snug">
                            <AlertTriangle size={13} className="mt-0.5 shrink-0 text-coral" aria-hidden />
                            <span>
                              <strong className="font-semibold">{s.escalateTitle}</strong>{' '}
                              {pick(selected.escalate)}
                            </span>
                          </p>
                        )}

                        <div className="flex items-center justify-between gap-2">
                          <p className="label-mono">
                            {editingId === selected.id ? s.editing : s.draft}
                          </p>
                          <Badge tone="accent">{s.aiBadge}</Badge>
                        </div>

                        {editingId === selected.id ? (
                          <textarea
                            value={draftText}
                            onChange={(e) => setDraftText(e.target.value)}
                            rows={9}
                            aria-label={s.editing}
                            className="mt-1.5 w-full resize-y rounded-xl border border-line-strong bg-surface p-3 text-[0.79rem] leading-relaxed outline-none transition focus:border-accent"
                          />
                        ) : (
                          <p className="mt-1.5 whitespace-pre-line rounded-xl border border-line bg-surface p-3 text-[0.79rem] leading-relaxed">
                            {draftText || pick(selected.reply)}
                          </p>
                        )}

                        <div className="mt-2.5 flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="primary"
                            icon={Send}
                            iconRight={false}
                            onClick={() => sendReply(selected)}
                            cursorLabel={s.send}
                          >
                            {s.send}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            icon={Pencil}
                            iconRight={false}
                            onClick={() => {
                              setDraftText(draftText || pick(selected.reply))
                              setEditingId(editingId === selected.id ? null : selected.id)
                            }}
                            cursorLabel={s.edit}
                          >
                            {editingId === selected.id ? s.done : s.edit}
                          </Button>
                        </div>
                      </section>
                    ) : (
                      <p className="rounded-xl border border-line bg-surface px-3 py-2.5 text-[0.78rem] leading-snug text-muted">
                        {pick(selected.noReplyNote)}
                      </p>
                    )}
                  </>
                )}
              </article>
            )}
          </div>
        </div>

        {/* souhrn */}
        {finished && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-accent/35 bg-accent/8 px-3.5 py-2.5">
            <CheckCheck size={15} className="shrink-0 text-accent" aria-hidden />
            <p className="text-[0.83rem]">
              <span className="font-semibold">{s.sumA}</span>{' '}
              <Counter to={TOTAL} className="font-mono tabular-nums" /> {s.sumB}{' '}
              <Counter
                to={SORT_SECONDS}
                decimals={1}
                suffix=" s"
                className="font-mono tabular-nums"
              />
              <span className="text-muted"> · {s.sumManual}</span>
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <FakeDataNote />
          <p className="text-[0.74rem] text-muted">
            {s.noteHuman} · {t('demo.safe')}
          </p>
        </div>
      </div>
    </DemoShell>
  )
}

/** Filtrační chip se počtem zpráv. */
function Chip({ children, active, onClick, count, tone }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[0.66rem] uppercase tracking-[0.1em] transition-colors duration-300',
        active
          ? 'border-accent/50 bg-accent/14 text-text'
          : 'border-line bg-surface-2/60 text-muted hover:border-line-strong hover:text-text'
      )}
    >
      {tone && (
        <span
          aria-hidden
          className={cn(
            'size-1.5 rounded-full',
            tone === 'accent' && 'bg-accent',
            tone === 'violet' && 'bg-violet',
            tone === 'coral' && 'bg-coral',
            tone === 'warn' && 'bg-warn',
            tone === 'neutral' && 'bg-muted'
          )}
        />
      )}
      {children}
      <span className="tabular-nums opacity-70">{count}</span>
    </button>
  )
}

/** Náhled v bento kartě — pět zpráv se roztřídí samo, pak se smyčka zopakuje. */
function CompactInbox({ s, lang, reduced, pick }) {
  // Záměrně i nejistá zpráva — v náhledu má být vidět, že AI něco pošle člověku.
  const list = COMPACT_IDS.map((id) => EMAILS.find((m) => m.id === id))
  const [step, setStep] = useState(reduced ? COMPACT_COUNT : 0)

  useEffect(() => {
    if (reduced) return
    const atEnd = step >= COMPACT_COUNT
    const id = setTimeout(() => setStep(atEnd ? 0 : step + 1), atEnd ? 2200 : 650)
    return () => clearTimeout(id)
  }, [reduced, step])

  return (
    <div className="flex h-full flex-col gap-2.5 overflow-hidden">
      <div className="flex items-center justify-between gap-2">
        <p className="label-mono flex items-center gap-1.5">
          <Inbox size={11} />
          {s.inbox}
        </p>
        <p className="font-mono text-[0.66rem] tabular-nums text-muted" aria-live="polite">
          <span className="text-accent">{step}</span> / {COMPACT_COUNT} {s.sortedCount}
        </p>
      </div>

      <div className="h-1 overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-500 ease-[var(--ease-out-expo)]"
          style={{ width: `${(step / COMPACT_COUNT) * 100}%` }}
        />
      </div>

      <ul className="hide-scrollbar flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto">
        {list.map((mail, i) => {
          const ready = i < step
          const meta = LABELS[mail.label]
          const LabelIcon = meta.icon
          return (
            <li
              key={mail.id}
              className={cn(
                'rounded-xl border px-2.5 py-2 transition-colors duration-500',
                ready ? 'border-line bg-surface-2/40' : 'border-accent/30 bg-accent/8'
              )}
            >
              <div className="flex items-baseline justify-between gap-2">
                <p className={cn('truncate text-[0.76rem]', ready ? 'font-medium' : 'font-semibold')}>
                  {mail.from}
                </p>
                <span className="shrink-0 font-mono text-[0.62rem] text-muted">{mail.time}</span>
              </div>
              <p className="truncate text-[0.72rem] text-muted">{pick(mail.subject)}</p>
              <div className="mt-1 flex min-h-5 items-center gap-1.5">
                {ready ? (
                  mail.uncertain ? (
                    <Badge tone="warn" icon={AlertTriangle}>
                      {s.toHuman}
                    </Badge>
                  ) : (
                    <Badge tone={meta.tone} icon={LabelIcon}>
                      {meta[lang] ?? meta.cs}
                    </Badge>
                  )
                ) : (
                  <Skeleton className="h-3.5 w-20" />
                )}
              </div>
            </li>
          )
        })}
      </ul>

      <p className="label-mono shrink-0 truncate">{s.compactNote}</p>
    </div>
  )
}
