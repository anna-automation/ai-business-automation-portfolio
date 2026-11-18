# Onboarding nového zaměstnance

> Podepsaná smlouva nebo formulář od HR spustí celý nástup: checklist úkolů pro vedoucího a IT, žádost o přístupy, uvítací e-mail, schůzku na první den a připomínku zkušební doby.

## Problém

Nástup nového člověka je sekvence patnácti malých věcí, ze kterých si nikdo nepamatuje všechny. Personalistka obejde vedoucího, napíše do IT, pošle uvítací mail, založí schůzku. Trvá to tři až čtyři hodiny rozprostřené do několika dnů a část se dělá na poslední chvíli. Nejčastější selhání nejsou velká: notebook se objedná pozdě, nový kolega nemá první den účet v e-mailu, nebo se dva měsíce po nástupu nikdo nezeptá, jak to jde, a zkušební doba uteče bez vyhodnocení.

## Co to dělá

1. HR odešle formulář nebo se vyplní řádek v tabulce — webhook přijme `id_nastupu`.
2. Workflow dohledá v tabulce `Nastupy` celý záznam o nástupu.
3. IF node zkontroluje, že nástup má stav `potvrzeno` a vyplněné datum. Jinak se sekvence zastaví.
4. Switch rozřadí nového kolegu podle typu pozice.
5. Set node podle větve přiřadí profil přístupů a jméno člověka, který je schvaluje.
6. Code node z datumu nástupu spočítá checklist šesti úkolů s absolutními termíny a datum konce zkušební doby.
7. Úkoly se zapíšou do tabulky `Ukoly` — každý s vlastníkem a termínem.
8. Do Slacku přijde IT žádost o přístupy s profilem a jménem schvalovatele.
9. Novému kolegovi odejde uvítací e-mail s praktickými informacemi na osobní adresu.
10. V kalendáři vznikne schůzka na první den s vedoucím.
11. A druhá událost dva měsíce po nástupu — vyhodnocení zkušební doby.

## Jak je to postavené

| Node | Typ | K čemu |
| --- | --- | --- |
| Podepsaná smlouva | Webhook | `POST /nastup-zamestnance` s `id_nastupu` |
| Údaje o nástupu | Google Sheets | Dohledá řádek v tabulce `Nastupy` |
| Nástup platí? | IF | Stav `potvrzeno` a vyplněné datum, jinak stop |
| Rozřazení podle pozice | Switch | Větve `obchod` / `provoz`, fallback na `provoz` |
| Přístupy — obchod | Set | Profil přístupů pro obchodní pozice |
| Přístupy — provoz | Set | Základní, nejvíc omezený profil |
| Checklist úkolů | Code | Šest úkolů s termíny, datum zkušební doby |
| Zapsat úkoly | Google Sheets | Append do tabulky `Ukoly` |
| Žádost o přístupy pro IT | Slack | Zpráva do `#it-pristupy`, bez hesel |
| Uvítací e-mail | Send Email | Praktické informace k prvnímu dni |
| Schůzka první den | Google Calendar | Hodinová událost s vedoucím |
| Připomínka zkušební doby | Google Calendar | Událost dva měsíce po nástupu |

Celkem 12 nodů, jeden trigger.

## Nastavení

1. Naimportujte workflow: `n8n → Workflows → Import from File → workflow.json`.
2. Doplňte credentials: Google Sheets, Google Calendar, SMTP a Slack. V exportu jsou jen zástupné profily `PLACEHOLDER`.
3. Všude nahraďte `YOUR_SHEET_ID` a `YOUR_CALENDAR_ID` svými ID.
4. Připravte tabulku `Nastupy` se sloupci: `id_nastupu`, `jmeno`, `email_osobni`, `pozice`, `pozice_typ`, `datum_nastupu`, `cas_srazu`, `stav`, `vedouci`, `vedouci_kontakt`, `it_kontakt`, `adresa_pracoviste`, `parkovani`.
5. Vytvořte tabulku `Ukoly` se sloupci: `id_nastupu`, `jmeno`, `pozice`, `ukol`, `vlastnik`, `termin`, `stav`.
6. V nodech **Přístupy — obchod** a **Přístupy — provoz** přepište seznamy systémů podle své firmy. Větví si přidejte, kolik potřebujete — switch zvládne víc výstupů.
7. V nodu **Checklist úkolů** upravte šablonu úkolů a offsety ve dnech.
8. V nodech **Uvítací e-mail** a **Žádost o přístupy pro IT** nastavte odesílatele a kanál.
9. Zkopírujte Production URL z webhooku do formuláře nebo do Apps Scriptu u tabulky.
10. Otestujte s vymyšleným záznamem, kde `email_osobni` je vaše adresa. Teprve pak workflow aktivujte.

## Co si pohlídat

- **Nástup se posune nebo zruší.** To je nejčastější případ, ne výjimka. Sekvence proto nikde nepočítá relativní čas typu „za tři dny" — všechny termíny se odvozují z `datum_nastupu`, takže při změně datumu se checklist přepočítá znovu. Zastavit celou sekvenci jde dvěma způsoby: změnou `stav` na cokoliv jiného než `potvrzeno` (IF node další běh nepustí dál) a smazáním naplánovaných událostí z kalendáře. Pokud si přidáte Wait nody na pozdější kroky, počítejte s tím, že běžící execution se při zrušení nezastaví sám — běžící běhy je nutné zrušit v `Executions` ručně, nebo si do každého pokračování vložit kontrolu stavu v tabulce. Druhá varianta je spolehlivější.
- **Různé role potřebují různé přístupy.** Switch podle `pozice_typ` je tam právě proto. Nepoužívejte jednu univerzální sadu přístupů „ať to mají všichni" — opravit přebytečná práva po roce je mnohem dražší než je nepřidělit. Fallback výstup switche vede na **nejvíc omezený** profil, ne na ten nejbohatší: když se objeví nová pozice, kterou nikdo do větví nepřidal, dostane nový kolega minimum a přijde se na to první den.
- **Přístupy negenerujte a neposílejte automaticky.** Workflow pošle IT jen **žádost** s profilem a jménem schvalovatele. Nezakládá účty, negeneruje hesla a žádné přihlašovací údaje neposílá e-mailem ani do Slacku. Mail i Slack jsou trvalé a prohledávatelné archivy; heslo, které tam jednou skončí, tam zůstane. Údaje předejte osobně nebo přes správce hesel a vynuťte změnu při prvním přihlášení. Uvítací e-mail to novému kolegovi říká předem, aby se po přihlašovacích údajích neptal.
- **Mzdové údaje do tohoto workflow nepatří.** Plat, bonusy, srážky ani číslo účtu v tabulce `Nastupy` nemají co dělat. Tabulku vidí vedoucí i IT, protože z ní čerpají úkoly, a mzdové údaje jsou citlivější než zbytek nástupu. Zůstávají v mzdovém systému, kam má přístup jen personální oddělení. Pokud potřebujete propojení, předávejte jen `id_nastupu` a ať si mzdový systém zbytek dohledá sám.
- **Duplicitní spuštění.** Formulář odeslaný dvakrát vytvoří dvě sady úkolů a dvě schůzky. Před zápisem si proto v tabulce `Ukoly` ověřte, jestli už `id_nastupu` neexistuje — v n8n to jde IF nodem po dohledání, nebo jednodušeji tak, že webhook přijímá jen záznamy se stavem `potvrzeno` a tabulka má na `id_nastupu` unikátní kontrolu.
- **Nástup na poslední chvíli.** Když smlouva přijde den před nástupem, úkoly s offsetem `-5` vyjdou do minulosti. Je to tak správně — znamená to „hned". Jen do Slacku zprávy přidejte varování, aby IT vědělo, že nemá pět dní.
- **Chybějící vedoucí.** Prázdný `vedouci_kontakt` shodí vytvoření schůzky až na konci sekvence, kdy už úkoly i e-mail odešly. Ověřte si vyplněnost polí hned v IF nodu na začátku, ne až tam, kde se poprvé použijí.

## Bezpečnost a osobní údaje

V tomto workflow **není žádný AI node** a je to záměr. Nástup je sekvence pevných kroků, žádný text se negeneruje a není co nechávat na modelu. Do externí služby tedy nejdou žádné osobní údaje nového zaměstnance.

Co kam jde: jméno, pozice a profil přístupů jdou do Slacku pro IT a do tabulky úkolů, protože bez nich nejde nástup připravit. Osobní e-mailová adresa jde **jen** do nodu **Uvítací e-mail** — ne do Slacku a ne do tabulky úkolů. Mzdové údaje, rodné číslo, zdravotní informace a kopie dokladů do tohoto workflow nevstupují vůbec; patří do personálního systému s omezeným přístupem.

Poslední slovo má člověk na dvou místech: přístupy zakládá IT až po schválení vedoucím a vyhodnocení zkušební doby je schůzka dvou lidí, ne automatický verdikt. Workflow jen připomíná, že se má rozhodnout.

## Kolik to ušetří

| Krok | Ručně | Automaticky |
| --- | --- | --- |
| Sestavení checklistu a rozeslání úkolů | 45 min | 0 |
| Žádost o přístupy a dohledání, kdo schvaluje | 30 min | 0 |
| Napsání uvítacího e-mailu | 25 min | 0 |
| Založení schůzky na první den | 10 min | 0 |
| Připomínka zkušební doby | často se nestane | 0 |
| Dohánění zapomenutého kroku | 30–60 min | 0–15 min |

Dohromady odhadem **3 až 4 hodiny na jeden nástup**, při dvou nástupech měsíčně okolo 6 hodin. Jde o modelovaný odhad z demo prostředí, ne o naměřená data z provozu.

## Varianty

- **Místo tabulky HR systém.** Pokud máte personální systém s API, vyměňte **Údaje o nástupu** za `n8n-nodes-base.httpRequest`. Zbytek sekvence zůstává, mění se jen názvy polí v Code nodu.
- **Úkoly do nástroje na projekty.** Append do Google Sheets jde nahradit HTTP Requestem do Asany, Jiry nebo Notionu. Checklist pak vzniká jako skutečné úkoly s notifikacemi a nemusíte se o stav starat v tabulce.
- **Výstup nástupu jako samostatné workflow.** Stejná logika obráceně: odebrání přístupů, předání techniky, odhlášení z rozdělovníků. Při odchodu zaměstnance to firmy řeší ještě hůř než nástup a selhání má větší dopad.
- **Microsoft stack.** `microsoftExcel` místo Sheets, `microsoftOutlook` místo SMTP a kalendáře. Switch i Code node zůstanou nezměněné.
