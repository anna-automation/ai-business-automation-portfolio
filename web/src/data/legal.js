/**
 * Právní a doprovodné dokumenty.
 *
 * POZOR: jde o vzorové texty pro demo portfolio, nikoliv o právní službu.
 * Před skutečným spuštěním je potřeba doplnit identifikační údaje
 * (jméno, IČO, adresa) a nechat texty projít někým, kdo tomu rozumí.
 * Každý dokument to říká i návštěvníkovi hned v úvodu.
 */

export const legalDocs = {
  privacy: {
    titleKey: 'legal.privacy',
    updated: '2026-11-17',
    body: {
      cs: `> Tohle je demo portfolio. Web neběží na produkční domény, nesbírá platby a formuláře nic neodesílají. Text níž popisuje, jak by zpracování vypadalo v reálném provozu, a je připravený k doplnění identifikačních údajů.

## Kdo je správce
Správcem osobních údajů je **Anna** (dále „správce"), fyzická osoba podnikající v oblasti automatizace firemních procesů a školení.

*Doplnit: celé jméno, IČO, sídlo, kontaktní e-mail pro uplatnění práv.*

## Jaké údaje bychom zpracovávali
V reálném provozu by web pracoval jen s tím, co sami napíšete do poptávkového formuláře:

- jméno a e-mail — abych mohla odpovědět
- název firmy a obor — abych odpověď napsala k věci
- popis problému — to je vlastně celé zadání
- volitelně telefon, pokud ho uvedete

Nic z toho se dnes nikam neposílá. Formulář na tomto webu je simulace.

## Co web ukládá dnes
Jen do **localStorage vašeho prohlížeče**, a jen tohle:

| Položka | K čemu | Jak dlouho |
| --- | --- | --- |
| \`abl-theme\` | světlý/tmavý režim | do smazání |
| \`abl-lang\` | zvolený jazyk | do smazání |
| \`abl-motion\` | omezení animací | do smazání |
| \`abl-cursor\` | vlastní kurzor | do smazání |
| \`abl-role\` | zvolený obor pro přizpůsobení obsahu | do smazání |
| \`abl-cookies\` | vaše volba v cookie liště | do smazání |

Tyto údaje neopouštějí váš prohlížeč. Nemám k nim přístup, protože se nikam neodesílají.

## Právní základ
V reálném provozu by zpracování poptávky stálo na **oprávněném zájmu** (čl. 6 odst. 1 písm. f GDPR) — odpovědět na dotaz, který jste sami poslali — a u newsletteru na **souhlasu** (čl. 6 odst. 1 písm. a GDPR), odvolatelném jedním kliknutím.

## Jak dlouho
Poptávky bych držela **24 měsíců** od posledního kontaktu, pak je mazala. Souhlas s newsletterem platí, dokud ho neodvoláte.

## Komu by se údaje předávaly
- poskytovatel e-mailu a hostingu jako zpracovatel
- účetní, pokud ze poptávky vznikne zakázka

**AI nástrojům se osobní údaje nepředávají.** Když s nimi při práci pomáhám, data se nejdřív zbaví identifikátorů. Tohle je součást každé smlouvy, kterou podepíšu.

## Vaše práva
Máte právo na přístup, opravu, výmaz, omezení zpracování, přenositelnost a vznést námitku. Uplatníte je e-mailem na adresu správce; odpověď přijde do 30 dnů. Stěžovat si můžete u **Úřadu pro ochranu osobních údajů** (uoou.gov.cz).

## Automatizované rozhodování
Neděje se. Žádné profilování, žádná automatická rozhodnutí s právním dopadem.`,
      en: `> This is a demo portfolio. The site is not in production, takes no payments and its forms send nothing. The text below describes how processing would work in real operation and is ready for identification details to be filled in.

## Who is the controller
The data controller is **Anna** (the "controller"), a sole trader working in business process automation and training.

*To fill in: full name, company ID, registered address, contact e-mail for exercising rights.*

## What data would be processed
In real operation the site would handle only what you type into the enquiry form:

- name and e-mail — so I can reply
- company name and industry — so the reply is relevant
- description of the problem — which is effectively the brief
- optionally a phone number, if you provide one

None of this is sent anywhere today. The form on this site is a simulation.

## What the site stores today
Only in **your browser's localStorage**, and only this:

| Item | Purpose | How long |
| --- | --- | --- |
| \`abl-theme\` | light/dark mode | until cleared |
| \`abl-lang\` | chosen language | until cleared |
| \`abl-motion\` | reduced motion | until cleared |
| \`abl-cursor\` | custom cursor | until cleared |
| \`abl-role\` | chosen industry for content personalisation | until cleared |
| \`abl-cookies\` | your cookie bar choice | until cleared |

This data never leaves your browser. I have no access to it because nothing is transmitted.

## Legal basis
In real operation, handling an enquiry would rest on **legitimate interest** (Art. 6(1)(f) GDPR) — answering a question you sent yourself — and the newsletter on **consent** (Art. 6(1)(a) GDPR), withdrawable in one click.

## Retention
Enquiries would be kept for **24 months** from the last contact, then deleted. Newsletter consent lasts until you withdraw it.

## Who would receive the data
- the e-mail and hosting provider as a processor
- an accountant, if the enquiry turns into a contract

**Personal data is not passed to AI tools.** When I use them in my work, data is stripped of identifiers first. This is part of every contract I sign.

## Your rights
You have the right of access, rectification, erasure, restriction, portability and objection. Exercise them by e-mailing the controller; a reply arrives within 30 days. You may complain to the **Czech Data Protection Authority** (uoou.gov.cz).

## Automated decision-making
None takes place. No profiling, no automated decisions with legal effect.`,
    },
  },

  terms: {
    titleKey: 'legal.terms',
    updated: '2026-11-17',
    body: {
      cs: `> Vzorové podmínky pro demo portfolio. Před reálným spuštěním doplnit identifikační údaje a nechat zkontrolovat.

## K čemu tento web je
Jde o **ukázkové portfolio**. Prezentuje, co umím v oblasti automatizace firemních procesů a školení AI. Všechny interaktivní ukázky běží lokálně v prohlížeči nad vymyšlenými daty.

## Co tady není
- žádná reálná aplikace k objednání
- žádná platební brána
- žádné skutečné zákaznické účty
- žádná data reálných firem ani osob

Pokud vám cokoliv na tomto webu připomíná konkrétní firmu nebo osobu, je to náhoda. Jména, adresy, IČO, částky i faktury v ukázkách jsou vymyšlené.

## Obsah a autorská práva
Texty, kód webu, grafika a struktura ukázek jsou dílem autorky. Můžete si je **prohlížet, zkoušet a sdílet odkazy**. Nemůžete je přebírat jako vlastní portfolio ani komerčně dál šířit bez dohody.

Exportovaná n8n workflow v repozitáři jsou zveřejněná proto, aby se z nich dalo učit. Použití ve vaší firmě je vítané; prodávat je dál jako vlastní produkt není v pořádku.

## Odpovědnost
Ukázky jsou demonstrační. **Nejsou to hotové produkty** a nenesu odpovědnost za rozhodnutí, která na jejich základě uděláte bez další konzultace. U reálného nasazení platí vždy to, co je ve smlouvě.

Informace o GDPR a AI Actu na tomto webu jsou **orientační vysvětlení pro laiky**, nikoliv právní poradenství.

## Dostupnost
Web je portfolio, nikoliv služba s garantovanou dostupností. Může být kdykoliv změněn nebo odstaven.

## Rozhodné právo
Vztahy se řídí právem České republiky.`,
      en: `> Sample terms for a demo portfolio. Fill in identification details and have them reviewed before real launch.

## What this site is for
It is a **demo portfolio**. It shows what I can do in business process automation and AI training. Every interactive demo runs locally in your browser on invented data.

## What is not here
- no real application to order
- no payment gateway
- no actual customer accounts
- no data from real companies or people

If anything on this site reminds you of a specific company or person, it is coincidence. Names, addresses, company IDs, amounts and invoices in the demos are made up.

## Content and copyright
The texts, site code, graphics and demo structure are the author's work. You may **view, try and share links**. You may not pass them off as your own portfolio or redistribute them commercially without agreement.

The exported n8n workflows in the repository are published so people can learn from them. Using them in your company is welcome; reselling them as your own product is not.

## Liability
The demos are demonstrations. **They are not finished products** and I accept no liability for decisions you make on their basis without further consultation. For real deployments, the contract governs.

The GDPR and AI Act information on this site is a **plain-language orientation**, not legal advice.

## Availability
This is a portfolio, not a service with guaranteed uptime. It may change or go offline at any time.

## Governing law
Czech law applies.`,
    },
  },

  cookies: {
    titleKey: 'legal.cookies',
    updated: '2026-11-17',
    body: {
      cs: `> Krátká verze: tenhle web vám do prohlížeče neukládá nic, čím by vás šel sledovat.

## Co se ukládá
Technicky nejde ani o cookies, ale o **localStorage** — úložiště, které se neodesílá na server s každým požadavkem. Ukládá se do něj jen vaše nastavení: téma, jazyk, omezení animací, vlastní kurzor, zvolený obor a volba z cookie lišty.

## Co se neukládá
- žádná analytika (Google Analytics, Plausible, nic)
- žádné reklamní ani sledovací skripty
- žádné cookies třetích stran
- žádná fingerprint identifikace

## Proč tady tedy cookie lišta je
Ze dvou důvodů. První: je slušné říct, co se ukládá, i když je to neškodné. Druhý: tenhle web je **portfolio**, a lišta se třemi kategoriemi souhlasu je ukázka toho, jak má souhlas vypadat — dobrovolný, odmítnutelný stejně snadno jako přijatelný a bez předem zaškrtnutých polí.

Přepínače „Analytika" a „Marketing" v nastavení lišty nic nezapínají. Nic takového tu nasazené není.

## Jak se toho zbavíte
Vymazáním dat webu v prohlížeči. V Chromu i Firefoxu: zámeček v adresním řádku → nastavení webu → vymazat data. Nebo prostě soukromé okno.

## Fonty a externí zdroje
Fonty se načítají z webu samotného, ne z Google Fonts. Žádný požadavek tedy neodchází na cizí server.`,
      en: `> Short version: this site stores nothing in your browser that could track you.

## What is stored
Technically these are not even cookies but **localStorage** — storage that is not sent to a server with every request. It holds only your settings: theme, language, reduced motion, custom cursor, chosen industry and your cookie bar choice.

## What is not stored
- no analytics (Google Analytics, Plausible, nothing)
- no advertising or tracking scripts
- no third-party cookies
- no fingerprinting

## So why is there a cookie bar
Two reasons. First: it is decent to say what is stored even when it is harmless. Second: this site is a **portfolio**, and a bar with three consent categories demonstrates what consent should look like — freely given, as easy to refuse as to accept, with nothing pre-ticked.

The "Analytics" and "Marketing" switches in the bar settings turn nothing on. Nothing of the sort is deployed here.

## How to clear it
Clear site data in your browser. In Chrome and Firefox: the padlock in the address bar → site settings → clear data. Or simply use a private window.

## Fonts and external resources
Fonts load from this site, not from Google Fonts. No request goes to a third-party server.`,
    },
  },

  accessibility: {
    titleKey: 'legal.accessibility',
    updated: '2026-11-17',
    body: {
      cs: `> Přístupnost tady není dodatek na konci projektu. Web, který nejde ovládat klávesnicí, je prostě nedodělaný.

## Na co se web snaží
Cílem je soulad s **WCAG 2.2 na úrovni AA**. To konkrétně znamená:

- **Klávesnice.** Všechno interaktivní je dosažitelné tabulátorem, včetně drag & drop v CRM ukázce, která má tlačítka pro posun karty. Fokus je vždy viditelný.
- **Kontrast.** Text proti pozadí drží poměr alespoň 4,5 : 1 ve světlém i tmavém režimu.
- **Pohyb.** Respektuju systémové nastavení \`prefers-reduced-motion\`. Navíc je v hlavičce **vlastní přepínač**, kterým animace omezíte jen na tomto webu — i když je máte v systému zapnuté.

## Když si vypnete pohyb

Tohle je na webu pravidlo, ne výjimka pro pár prvků. Platí všude a týká se obojího — systémového nastavení i přepínače v hlavičce. Konkrétně se zastaví:

- **Animace a přechody v CSS** — jedním pravidlem pro všechny prvky na stránce, takže nejde zapomenout na nově přidanou věc
- **Animované pozadí** s datovými pulzy se vůbec nerozběhne, místo něj zůstane klidná kresba
- **Vynořování obsahu při scrollování** — obsah je rovnou na svém místě
- **Interaktivní ukázky** se nepřehrávají samy ve smyčce; spustíte je kliknutím a výsledek se zobrazí rovnou, bez krokování
- **Plynulé posouvání stránky** se změní na okamžitý skok. Tohle si CSS zakázat nedokáže, takže o to každé místo v kódu žádá zvlášť
- **Vlastní kurzor** se vypne a vrátí se standardní šipka
- **Běžící pás** s nástroji se zalomí do klidné mřížky

Žádná funkce se tím neztratí. Všechno, co jde udělat s animacemi, jde udělat i bez nich — ukázky dojdou ke stejnému výsledku, jen rovnou.
- **Čtečky.** Sekce mají správné nadpisové úrovně, ikonová tlačítka mají popis, oblasti, které se mění samy, mají \`aria-live\`.
- **Přeskočení na obsah.** První tabulátor na stránce nabídne odkaz, který přeskočí navigaci.
- **Zvětšení.** Rozvržení funguje do 200 % zvětšení bez vodorovného scrollování.

## Kde to má limity
- **Interaktivní ukázky** jsou vizuálně bohaté. Dělám je ovladatelné klávesnicí, ale jejich smyslem je ukázat rozhraní — u čtečky obrazovky nebude zážitek stejný jako u zrakem. Popis procesu je proto u každé ukázky i v textu vedle.
- **Vlastní kurzor** se zapíná jen na zařízeních s myší a dá se vypnout v hlavičce.
- **Animované pozadí** je dekorativní, má \`aria-hidden\` a při omezeném pohybu se zastaví.

## Našli jste problém?
Napište mi. Přístupnost je věc, kterou beru jako chybu k opravě, ne jako přání. Kontakt je na stránce **Kontakt**.`,
      en: `> Accessibility is not an appendix at the end of a project. A site you cannot operate by keyboard is simply unfinished.

## What the site aims for
The target is **WCAG 2.2 level AA**. Concretely:

- **Keyboard.** Everything interactive is reachable by Tab, including the drag & drop CRM demo, which has buttons for moving a card. Focus is always visible.
- **Contrast.** Text against background holds at least 4.5 : 1 in both light and dark mode.
- **Motion.** I respect the system \`prefers-reduced-motion\` setting. On top of that there is a **dedicated toggle** in the header that reduces motion on this site only — even if your system has it enabled.

## What happens when you turn motion off

This is a site-wide rule, not an exception for a handful of elements. It covers both the system setting and the header toggle. Specifically, the following stop:

- **CSS animations and transitions** — one rule covers every element on the page, so a newly added animation cannot be forgotten
- **The animated background** with its data pulses never starts; a still drawing stays in its place
- **Content revealing on scroll** — content simply sits where it belongs
- **Interactive demos** no longer autoplay in a loop; you start them with a click and the result appears at once, without step-by-step animation
- **Smooth page scrolling** turns into an instant jump. CSS cannot disable this one, so every place in the code asks for it explicitly
- **The custom cursor** switches off and the standard arrow returns
- **The scrolling marquee** of tools folds into a calm grid

No functionality is lost. Everything you can do with animations you can do without them — the demos reach the same result, just immediately.
- **Screen readers.** Sections use correct heading levels, icon buttons have labels, and regions that update on their own carry \`aria-live\`.
- **Skip to content.** The first Tab on a page offers a link that skips the navigation.
- **Zoom.** The layout works up to 200 % zoom without horizontal scrolling.

## Where the limits are
- **Interactive demos** are visually rich. I make them keyboard-operable, but their point is to show an interface — with a screen reader the experience will not match seeing it. That is why every demo also has the process described in text beside it.
- **The custom cursor** activates only on pointer devices and can be switched off in the header.
- **The animated background** is decorative, carries \`aria-hidden\` and stops under reduced motion.

## Found a problem?
Write to me. I treat accessibility as a bug to fix, not a feature request. Contact details are on the **Contact** page.`,
    },
  },

  withdrawal: {
    titleKey: 'legal.withdrawal',
    updated: '2026-11-17',
    body: {
      cs: `> Na tomto webu si nic nekoupíte — není tu platební brána ani objednávkový proces. Text níž je vzorový pro případ, kdy by se služba prodávala.

## Kdy máte právo odstoupit
Jste-li **spotřebitel** (fyzická osoba, která nejedná v rámci podnikání) a smlouva byla uzavřena **distančně** — tedy přes internet, e-mailem nebo po telefonu — máte právo odstoupit od smlouvy ve lhůtě **14 dnů** bez uvedení důvodu.

Lhůta se počítá ode dne uzavření smlouvy.

## Jak odstoupit
Stačí jednoznačné sdělení. Nejjednodušší je e-mail na adresu uvedenou v kontaktech, se zněním:

\`\`\`
Odstupuji od smlouvy o poskytnutí služby ze dne [datum].
Jméno: [vaše jméno]
Adresa: [vaše adresa]
E-mail: [váš e-mail]
Datum: [datum odeslání]
\`\`\`

Potvrzení o přijetí dostanete obratem. Žádný formulář v PDF ani doporučený dopis není potřeba.

## Co když už se začalo pracovat
Pokud jste **výslovně požádali o zahájení prací před uplynutím čtrnáctidenní lhůty**, máte právo odstoupit i tak — uhradíte ale poměrnou část ceny za to, co už bylo provedeno. U školení, které už proběhlo, právo na odstoupení zaniká dnem jeho poskytnutí.

## Vrácení peněz
Do **14 dnů** od odstoupení, stejným způsobem, jakým platba přišla, pokud se nedohodneme jinak.

## Nejste spotřebitel?
Firmy a podnikatelé (nákup na IČO) právo na odstoupení ze zákona nemají. Co platí místo toho, bývá ve smlouvě — a u mě to vždycky zahrnuje možnost ukončit spolupráci po dokončené fázi.

## Mimosoudní řešení sporů
Pro spotřebitelské spory je příslušná **Česká obchodní inspekce** (coi.cz).`,
      en: `> You cannot buy anything on this site — there is no payment gateway and no ordering flow. The text below is a sample for the case where a service were sold.

## When you have the right to withdraw
If you are a **consumer** (a natural person not acting in the course of business) and the contract was concluded **at a distance** — online, by e-mail or by phone — you have the right to withdraw within **14 days** without giving a reason.

The period runs from the day the contract was concluded.

## How to withdraw
An unambiguous statement is enough. The simplest route is an e-mail to the address in the contacts, reading:

\`\`\`
I withdraw from the service contract dated [date].
Name: [your name]
Address: [your address]
E-mail: [your e-mail]
Date: [date sent]
\`\`\`

You will get an acknowledgement promptly. No PDF form or registered letter is needed.

## What if work has already started
If you **expressly asked for work to begin before the 14-day period expired**, you may still withdraw — but you will pay a proportionate share for what was already done. For training that has already taken place, the right to withdraw ends on the day it was delivered.

## Refunds
Within **14 days** of withdrawal, by the same means the payment arrived, unless we agree otherwise.

## Not a consumer?
Companies and sole traders (buying on a company ID) have no statutory right of withdrawal. What applies instead is in the contract — and with me that always includes the option to end the engagement after a completed phase.

## Out-of-court dispute resolution
For consumer disputes the competent body is the **Czech Trade Inspection Authority** (coi.cz).`,
    },
  },

  security: {
    titleKey: 'legal.security',
    updated: '2026-11-17',
    body: {
      cs: `> Tohle je ta část, kvůli které firmy AI odkládají. Proto ji mám napsanou dřív, než se začne stavět cokoliv jiného.

## Co nikdy nevkládat do AI nástrojů
Tenhle seznam dávám do každé firmy, kde školím. Vytiskněte si ho a dejte ho na nástěnku.

- **osobní údaje klientů** — jména, adresy, rodná čísla, čísla dokladů, zdravotní informace
- **přihlašovací údaje** — hesla, API klíče, tokeny, obsah .env souborů
- **celé smlouvy a mzdové podklady** — i když jde „jen o kontrolu formulace"
- **interní čísla před zveřejněním** — obrat, marže, chystané akvizice
- **cokoliv, co máte pod NDA** — ani v parafrázi

## Co vložit můžete
- obecné dotazy a vysvětlení pojmů
- vlastní texty, u kterých chcete pomoc se stylem
- **anonymizovaná** data: „zákazník A", „firma B", částky zaokrouhlené
- veřejně dostupné informace

## Jak to řeším technicky
1. **Anonymizace před odesláním.** Workflow, které posílá text modelu, nejdřív odstraní identifikátory. Model vidí strukturu, ne lidi.
2. **Člověk má poslední slovo.** U každé AI klasifikace nebo návrhu odpovědi je krok, kde to někdo potvrdí. Nikde neposílám e-mail, který člověk neviděl.
3. **Spolehlivost se měří.** Když model není dostatečně jistý, případ jde na člověka — a je to vidět i v ukázkách na tomto webu.
4. **Logy bez obsahu.** Logujeme, že zpráva prošla, ne co v ní bylo.
5. **Lokální nasazení, kde to jde.** n8n běží na vašem serveru. Data neopouštějí vaši infrastrukturu, pokud to proces nevyžaduje.

## AI Act v jedné stránce
Nařízení EU o AI dělí systémy podle rizika. Pro běžnou firmu platí v praxi tři věci:

| Co děláte | Co to znamená |
| --- | --- |
| Používáte AI na texty, třídění, přepisy | **Minimální riziko.** Nic zvláštního neřešíte, jen transparentnost. |
| AI mluví se zákazníkem | **Musíte říct, že je to AI.** Chatbot se nesmí vydávat za člověka. |
| AI rozhoduje o lidech (nábor, hodnocení, úvěry) | **Vysoké riziko.** Potřebujete dokumentaci, dohled člověka a posouzení. Tady doporučuji právníka. |

Zakázané je například vyhodnocování emocí zaměstnanců nebo sociální skórování. To se běžné firmy netýká, ale je dobré vědět, že ta hranice existuje.

## Co dostanete ode mě
- dvoustránkovou příručku pro zaměstnance v češtině
- checklist pro vedení: co musíme mít, než AI pustíme do provozu
- vzorovou firemní směrnici k použití AI nástrojů
- seznam míst v procesu, kde data opouštějí vaši infrastrukturu

*Tyto materiály jsou praktické vysvětlení, nikoliv právní poradenství. U vysoce rizikových použití potřebujete právníka — řeknu vám, kdy ten případ nastává.*`,
      en: `> This is the part that makes companies postpone AI. Which is why I have it written down before anything else gets built.

## What never to paste into AI tools
I hand this list to every company I train. Print it and pin it up.

- **client personal data** — names, addresses, national ID numbers, document numbers, health information
- **credentials** — passwords, API keys, tokens, .env contents
- **whole contracts and payroll documents** — even when it is "just to check the wording"
- **internal figures before publication** — revenue, margins, upcoming acquisitions
- **anything under NDA** — not even paraphrased

## What you can paste
- general questions and explanations of terms
- your own text where you want help with style
- **anonymised** data: "customer A", "company B", rounded amounts
- publicly available information

## How I handle it technically
1. **Anonymise before sending.** A workflow that sends text to a model strips identifiers first. The model sees structure, not people.
2. **A human gets the last word.** Every AI classification or draft reply has a step where someone confirms it. I never send an e-mail a human has not seen.
3. **Confidence is measured.** When the model is not confident enough, the case goes to a human — and that is visible in the demos on this site.
4. **Logs without content.** We log that a message passed through, not what was in it.
5. **Local deployment where possible.** n8n runs on your server. Data does not leave your infrastructure unless the process requires it.

## The AI Act in one page
The EU AI regulation grades systems by risk. For a normal company, three things matter in practice:

| What you do | What it means |
| --- | --- |
| Using AI for text, sorting, transcripts | **Minimal risk.** Nothing special to handle, just transparency. |
| AI talks to your customer | **You must say it is AI.** A chatbot may not pose as a human. |
| AI decides about people (hiring, appraisal, credit) | **High risk.** You need documentation, human oversight and an assessment. Get a lawyer here. |

Prohibited uses include emotion recognition on employees and social scoring. That does not touch a normal company, but it is worth knowing the line exists.

## What you get from me
- a two-page employee handbook
- a management checklist: what we must have before AI goes live
- a sample company policy for AI tool usage
- a list of points in the process where data leaves your infrastructure

*These materials are a practical explanation, not legal advice. High-risk use needs a lawyer — I will tell you when that is the case.*`,
    },
  },
}

export function getLegalDoc(id) {
  return legalDocs[id] ?? null
}
