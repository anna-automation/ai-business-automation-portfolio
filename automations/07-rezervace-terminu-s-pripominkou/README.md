# Rezervace termínu s připomínkou

> Klient odešle rezervační formulář, workflow zkontroluje kolizi v kalendáři, zapíše událost, pošle potvrzení s odkazem na zrušení, den předem připomene termín a při zrušení uvolní slot.

## Problém

Objednávání na termín po telefonu a e-mailem zabere víc času než samotná schůzka. Někdo musí otevřít kalendář, najít volno, odpovědět, zapsat to a den předem zavolat. Při deseti rezervacích denně je to skoro hodina práce a dvě typické chyby: dva lidé dostanou stejný čas, protože mezi odpovědí a zápisem uplynula půlhodina, a klient na termín zapomene, protože mu to nikdo nepřipomněl. Druhá chyba je dražší — neobsazený slot už se nedá použít.

## Co to dělá

1. Klient odešle rezervační formulář s jménem, kontaktem a vybraným časem.
2. Workflow si z kalendáře vytáhne události v okolí dvou hodin od požadovaného času.
3. Code node ověří formát času, odmítne termíny v minulosti a znovu zkontroluje kolizi.
4. Když je slot obsazený, vrátí prázdný výstup — zápis se neprovede a formulář zobrazí, že termín už není volný.
5. Když je volný, vygeneruje náhodný token pro odkaz na zrušení.
6. V kalendáři vznikne událost s kontaktem a tokenem v popisu.
7. Klientovi odejde potvrzení s termínem v místním čase a s odkazem na zrušení.
8. Každý den v 9:00 se spustí druhá větev: vytáhne zítřejší rezervace.
9. Každému klientovi odejde připomínka 24 hodin předem.
10. Třetí větev poslouchá na odkazu pro zrušení: podle tokenu dohledá rezervaci.
11. Událost smaže, takže slot je znovu volný.
12. Do Slacku přijde zpráva, že se termín uvolnil.

## Jak je to postavené

| Node | Typ | K čemu |
| --- | --- | --- |
| Rezervační formulář | Webhook | `POST /rezervace` z formuláře na webu |
| Obsazené termíny | Google Calendar | Události ±2 h kolem požadovaného času |
| Kontrola kolize a token | Code | Validace, kontrola překryvu, token |
| Zápis události | Google Calendar | Vytvoří rezervaci s tokenem v popisu |
| Potvrzení s odkazem na zrušení | Send Email | Termín v místním čase, odkaz na zrušení |
| Denní běh připomínek | Schedule Trigger | Každý den 9:00 |
| Zítřejší rezervace | Google Calendar | Události na zítřejší den |
| Připomínka 24 h předem | Send Email | Připomínka klientovi |
| Zrušení přes odkaz | Webhook | `GET /rezervace-zruseni?token=…` |
| Najít rezervaci podle tokenu | Google Calendar | Vyhledá událost podle tokenu |
| Uvolnit slot | Google Calendar | Smaže událost |
| Notifikace o zrušení | Slack | Zpráva do `#rezervace` |

Celkem 12 nodů, tři triggery — rezervace, denní připomínky a zrušení.

## Nastavení

1. Naimportujte workflow: `n8n → Workflows → Import from File → workflow.json`.
2. Doplňte credentials: Google Calendar, SMTP a Slack. V exportu jsou jen zástupné profily `PLACEHOLDER`.
3. Ve všech kalendářových nodech nahraďte `YOUR_CALENDAR_ID` ID kalendáře, do kterého se má zapisovat. Doporučuju samostatný kalendář jen pro rezervace, ne osobní.
4. V nastavení workflow zkontrolujte timezone — v exportu je `Europe/Prague`.
5. V nodu **Kontrola kolize a token** upravte `DELKA_MIN` podle délky vašeho slotu a v `zrusit_url` nahraďte `https://n8n.vasefirma.cz` svou adresou n8n.
6. V e-mailových nodech nastavte `fromEmail` a text podle sebe. Ve Slacku kanál místo `#rezervace`.
7. Formulář na webu musí posílat `start` v ISO formátu **včetně offsetu** (`2026-03-29T10:30:00+01:00`) a dál `jmeno`, `email`, `telefon`, `poznamka`.
8. Zkopírujte Production URL z obou webhooků — první do formuláře, druhou si zkontrolujte v prohlížeči s testovacím tokenem.
9. Otestujte celý cyklus na sobě: rezervace, potvrzení, zrušení odkazem. Teprve pak workflow aktivujte.

## Co si pohlídat

- **Dva lidé rezervují stejný slot ve stejnou sekundu.** Tohle je hlavní důvod, proč je kontrola kolize v Code nodu, a ne v IF nodu hned za dotazem do kalendáře. Mezi dotazem a zápisem je vždycky nějaká prodleva a Google Calendar sám překryv nehlídá — zapíše obě události. Opětovná kontrola těsně před zápisem okno zúží na minimum, ale nezavře ho úplně: dvě současné executions mohou projít obě. Pokud rezervujete drahé kapacity, potřebujete skutečný zámek — například řádek v databázi s unikátním indexem na `(kalendar, start)`, kde druhý zápis spadne na chybu, nebo zámek v Redisu na dobu zápisu. V n8n se to řeší tak, že workflow nastavíte na `Concurrency: 1`, čímž běhy serializujete. Formulář ať zároveň nabízí jen slotů, které jsou volné — snížíte počet kolizí, i když je nevyloučíte.
- **Časové zóny a letní čas.** Nikdy neposílejte čas jako „10:30" bez zóny. Code node proto odmítne `start` bez offsetu nebo `Z`. Poslední březnovou nedělí se hodina 2:00–3:00 neexistuje a poslední říjnovou se 2:00–3:00 opakuje dvakrát; termín uložený jako lokální text v ten den vyjde o hodinu jinak, nebo neprojde vůbec. Interně se pracuje s UTC (`toISOString`), klientovi se čas zobrazuje přes `setZone('Europe/Prague')`. Pokud máte klienty v jiných zemích, zobrazte jim čas v jejich zóně a do e-mailu zónu vždy napište slovem.
- **Odkaz na zrušení musí být token, ne ID rezervace.** Kdyby odkaz obsahoval `?id=1042`, stačí změnit číslo a zruší se cizí rezervace. Token je 32 hexadecimálních znaků z `crypto.getRandomValues`, takže ho nejde uhádnout ani vyjmenovat. Důsledky: token je jediný klíč k rezervaci, takže ho nikam nelogujte a nedávejte do URL s parametry, které se posílají analytice. Token v popisu události je kompromis — vidí ho každý, kdo má přístup do kalendáře. Pokud kalendář sdílí víc lidí nebo je veřejný, držte mapování token → událost v neveřejné tabulce a v popisu nechte jen interní ID.
- **Zrušení na poslední chvíli a no-show.** Workflow ruší bez omezení, včetně zrušení deset minut předem. Pokud na čase visí náklady, vložte před **Uvolnit slot** IF node, který povolí zrušení jen víc než 12 hodin předem; pozdější zrušení ať jen pošle notifikaci a slot nechá obsazený. Na no-show automatizace nemá nástroj: člověk nepřišel, událost v kalendáři zůstala. Praktické řešení je nechat obsluhu označit rezervaci (třeba předřazením `NEPRISEL —` do názvu) a druhým workflow jednou týdně spočítat, kolik no-show bylo a u kterých klientů se opakují. Pro opakované no-show pak zavádějte potvrzování rezervace jedním klikem v připomínce — nepotvrzené slotu po deadline uvolníte.
- **Připomínka běží jednou denně.** Rezervace založená dnes na zítra ráno dostane připomínku jen tehdy, pokud vznikla před 9:00. Buď spusťte trigger víckrát denně, nebo do potvrzovacího e-mailu u krátkodobých rezervací napište, že připomínka nemusí přijít.
- **Prázdný kalendář u prvního dotazu.** Když v okolí termínu nic není, Google Calendar node bez `alwaysOutputData` nevrátí žádný item a Code node se vůbec nespustí. V exportu je proto `alwaysOutputData: true`.
- **Limity Google Calendar API.** Běžný provoz do pár set rezervací denně se do kvót vejde. Pozor na `returnAll` při dotazu na zítřejší rezervace ve velkém kalendáři — radši používejte samostatný rezervační kalendář a filtr `query`, než abyste tahali tisíce událostí.

## Bezpečnost a osobní údaje

V tomto workflow **není žádný AI node**, takže žádné osobní údaje klienta nejdou do jazykového modelu. Rezervace je rozhodnutí podle pravidel — volno, nebo ne — a model by tam neměl co dělat.

Do kalendáře jde jméno, e-mail, telefon a poznámka klienta. Poznámka se zkracuje na 300 znaků, aby se do kalendáře nedostaly dlouhé texty včetně věcí, které tam klient napsal zbytečně (zdravotní informace a podobně). Pokud pracujete v oboru, kde poznámky bývají citlivé, poznámku do kalendáře vůbec nedávejte — nechte ji v zabezpečené tabulce a v události mějte jen interní ID.

Rezervační kalendář sdílejte jen lidem, kteří ho potřebují, a nikdy ho nezveřejňujte — veřejný kalendář znamená veřejné kontakty klientů a veřejné tokeny na zrušení. Formulář na webu ať běží přes HTTPS a má ochranu proti robotům, jinak se kalendář dá zasypat falešnými rezervacemi.

Poslední slovo má člověk u výjimek: přesun termínu, zrušení po deadline, vyřešení dvojité rezervace. Automatizace zvládá běžný průběh, ne spory.

## Kolik to ušetří

| Krok | Ručně | Automaticky |
| --- | --- | --- |
| Najít volný termín a odpovědět klientovi | 6 min / rezervace | 0 |
| Zapsat rezervaci do kalendáře | 2 min | 0 |
| Poslat potvrzení | 2 min | 0 |
| Připomenout termín den předem | 2 min | 0 |
| Zrušení a uvolnění slotu | 5 min | 0 |
| Vyřešit dvojitou rezervaci | 15 min, občas | výjimečně |

Při deseti rezervacích denně to dělá odhadem **30 až 50 minut denně**. Jde o modelovaný odhad z demo prostředí, ne o naměřená data z provozu.

## Varianty

- **Outlook a Microsoft 365.** `n8n-nodes-base.microsoftOutlook` místo SMTP, kalendář přes Microsoft Graph HTTP Requestem. Logika kontroly kolize zůstává stejná, mění se jen názvy polí u událostí.
- **Tabulka jako zdroj pravdy.** Místo hledání tokenu v kalendáři si rezervace zapisujte do Google Sheets (`token`, `event_id`, `stav`) a kalendář používejte jen pro zobrazení. Je to o dva nody víc, ale token nemusí být v popisu události a dá se nad tím stavět statistika no-show.
- **Potvrzovací krok.** Rezervace vznikne jako `tentative` a klient ji potvrdí odkazem z e-mailu. Snižuje no-show, ale přidává krok, který část lidí neudělá — zvažte to podle toho, jak drahý je neobsazený slot.
- **SMS místo e-mailu.** Připomínku pošlete HTTP Requestem do SMS gateway. Má výrazně vyšší míru přečtení, ale platí se za zprávu a text se nedá rozepsat.
