# Poptávka z formuláře do CRM

> Vstupuje odeslaný formulář z webu, vystupuje řádek v tabulce, zpráva obchodníkovi do Slacku a potvrzovací e-mail zákazníkovi. Ušetří to člověka, který poptávky ručně přepisuje a hlídá, aby se na žádnou nezapomnělo.

## Problém

Formulář na webu obvykle pošle e-mail na jednu adresu. Odtamtud ho někdo přepíše do tabulky nebo do CRM, případně přepošle kolegovi. Na jednu poptávku to vyjde na 15–25 minut včetně hledání, komu patří. Zákazník přitom nedostane žádné potvrzení, takže do hodiny napíše znovu nebo zavolá — a vznikne druhý záznam o téže věci. Mezi tím se poptávky ztrácejí v nepřečtené poště a nikdo nepozná rozdíl mezi vážným zájemcem a robotem, který vyplňuje formuláře nabídkami SEO.

## Co to dělá

1. Formulář na webu pošle data na webhook (POST, JSON nebo formulářová data).
2. Validace zkontroluje povinná pole, formát e-mailu, délku zprávy, honeypot a souhlas se zpracováním údajů.
3. Z e-mailu a textu zprávy se spočítá kontrolní součet, kterým se pozná opakované odeslání téhož formuláře.
4. Co validací neprojde, skončí ve slepé větvi a do CRM se nedostane.
5. AI z volného textu vytáhne obor, odhad hodnoty v Kč, časový horizont a jednovětou rekapitulaci.
6. Workflow se podívá do tabulky, zda už řádek se stejným kontrolním součtem existuje.
7. Duplicita se zahodí. Nová poptávka se zapíše jako řádek do Google Sheets.
8. Obchodníkovi odejde zpráva do Slacku s odhadem hodnoty a odkazem na řádek.
9. Zákazníkovi odejde potvrzovací e-mail s očekávanou dobou odpovědi (jeden pracovní den).

## Jak je to postavené

| Node | Typ | K čemu |
| --- | --- | --- |
| Formulář z webu | Webhook | Přijímá POST z formuláře na webu |
| Validace a antispam | Code | Povinná pole, formát e-mailu, honeypot, souhlas, kontrolní součet |
| Prošla validace? | IF | Nevalidní data dál nepouští |
| Zamítnuto | NoOp | Záměrně nic nedělá; v logu je vidět důvod zamítnutí |
| Jazykový model Claude | Claude Chat Model | Model pro vytěžení oboru a hodnoty |
| Doplnění oboru a hodnoty | Information Extractor | Obor, odhad hodnoty, horizont, rekapitulace |
| Hledat duplicitu | Google Sheets | Hledá řádek se stejným kontrolním součtem |
| Už to máme? | IF | Rozhodne mezi novým řádkem a zahozením |
| Duplicitní poptávka | NoOp | Konec pro opakované odeslání |
| Zápis do CRM | Google Sheets | Přidá řádek, při chybě to třikrát zkusí znovu |
| Notifikace obchodníkovi | Slack | Zpráva do kanálu s odhadem hodnoty |
| Potvrzení zákazníkovi | Send Email | Potvrzení s očekávanou dobou odpovědi |

## Nastavení

1. V n8n otevřete `Workflows → Import from File` a vyberte `workflow.json`.
2. Zkopírujte produkční URL z nodu `Formulář z webu` a nastavte ji jako cíl formuláře na webu. Cesta je `/poptavka-web`.
3. Do formuláře přidejte skryté pole `web_url` (honeypot). Nechte ho prázdné a schovejte ho CSS, ne atributem `type="hidden"` — roboti skrytá pole vyplňují, lidé ne.
4. Do formuláře přidejte zaškrtávátko souhlasu, které posílá `souhlas: true`, a skryté pole `souhlas_text` s přesným textem, který uživatel u zaškrtávátka viděl.
5. Vytvořte tabulku se listem `Poptavky` a sloupci: `Datum`, `Jmeno`, `Email`, `Telefon`, `Zprava`, `Obor`, `OdhadKc`, `Horizont`, `Rekapitulace`, `Souhlas`, `SouhlasText`, `Hash`, `Stav`.
6. V nodech `Hledat duplicitu` a `Zápis do CRM` vyměňte `YOUR_SHEET_ID` za ID tabulky.
7. V nodu `Hledat duplicitu` zapněte v nastavení nodu `Always Output Data`. Bez toho se workflow při první, ještě neexistující poptávce zastaví.
8. Vytvořte credentials: `Google Sheets OAuth2`, `Slack API` (scope `chat:write`), `SMTP` pro odesílání potvrzení a `Anthropic`.
9. V nodu `Notifikace obchodníkovi` nastavte svůj kanál (v importu je `#poptavky`).
10. V nodu `Potvrzení zákazníkovi` vyměňte `vas@email.cz` za adresu firmy a přepište text podpisu.
11. Otestujte to na vlastním vyplnění formuláře, než to pustíte na web. Zkuste i prázdný e-mail a vyplněný honeypot, ať vidíte, že validace zabírá.

## Co si pohlídat

- **Spam ve formuláři.** Veřejný webhook je otevřená adresa, kterou někdo najde do týdne. Tři vrstvy, které v praxi stačí: **honeypot** (skryté pole `web_url`, jakmile je vyplněné, poptávka jde do slepé větve), **minimální doba vyplnění** (skryté pole s časovým razítkem načtení stránky; pod tři sekundy to nevyplnil člověk) a **rate limit** na reverzní proxy před n8n, například deset požadavků za minutu na jednu IP. CAPTCHA se dá přidat, ale snižuje počet skutečných poptávek — nechávám ji až jako poslední krok, když první tři vrstvy nestačí. Nikdy nespoléhejte jen na validaci v prohlížeči; robot posílá POST přímo na webhook a JavaScript na stránce ho nezajímá.
- **Duplicitní odeslání téhož formuláře.** Stává se to pořád: zákazník klikne dvakrát, prohlížeč pošle požadavek znovu, nebo se někdo vrátí zpátky a odešle to podruhé. Workflow proto počítá kontrolní součet z e-mailu a prvních 200 znaků zprávy a hledá ho v tabulce. Detail, který to rozhoduje: e-mail se před hashováním normalizuje na malá písmena a bez mezer, jinak by `Jan@firma.cz` a `jan@firma.cz` byly dvě různé poptávky. Dvě známá omezení: hledá se v celé tabulce, takže stejný zákazník se stejnou potřebou po roce se zahodí jako duplicita (chcete-li časové okno, přidejte do listu sloupec s datem a filtrujte na posledních 30 dní); a pokud zákazník do zprávy pokaždé napíše něco jiného, hash se liší a projdou dvě poptávky. Proti druhému pomáhá až kontrola podle e-mailu samotného, ta ale zahodí i legitimní druhou poptávku — volím radši dvě poptávky navíc než jednu zahozenou.
- **Co když Sheets vrátí chybu.** Google Sheets API vrací `429` při překročení limitu (řádově 60 požadavků za minutu na uživatele) a `503` při dočasné nedostupnosti. Node `Zápis do CRM` má proto nastaveno `Retry On Fail` na tři pokusy s dvousekundovou pauzou — to pokryje většinu dočasných chyb. Co retry nepokryje, musí mít **dead-letter**: v nastavení workflow nastavte `Error Workflow` na samostatné workflow, které vezme vstupní data a pošle je na e-mail správce, nebo je uloží jako soubor. Bez dead-letter nenávratně ztratíte poptávku, o které zákazník ví, že ji poslal. Retry nikdy nesmí být nad celým workflow: zopakovalo by se odeslání Slacku a potvrzovacího e-mailu, které už proběhly.
- **Pořadí kroků je součást ošetření chyb.** Zápis do tabulky je první, notifikace a e-mail až po něm. Kdyby to bylo naopak, zákazník by dostal potvrzení o poptávce, která v CRM není. Potvrzovací e-mail je záměrně úplně poslední krok.
- **GDPR — souhlas se musí uložit s časem a textem.** Nestačí uložit `souhlas: true`. Potřebujete doložit, s čím konkrétně uživatel souhlasil, a to se v čase mění: přepíšete text u zaškrtávátka a starý souhlas už nic nedokládá. Proto se do tabulky ukládají tři věci: časové razítko odeslání, přesný text, který uživatel u zaškrtávátka viděl (posílá se ze stránky ve skrytém poli `souhlas_text`), a verze textu. Když souhlas chybí, poptávka projde validací jako nevalidní a nikam se nezapíše — radši o poptávku přijít než ji zpracovávat bez právního titulu. Dál si pohlídejte: do tabulky nepatří nic nad rámec toho, co potřebujete k obchodu, u tabulky musí být nastavená doba uchování (například dva roky od poslední komunikace) a přístup k tabulce jen pro lidi, kteří ji k práci potřebují. Žádost o výmaz musíte umět vyřídit — s jedním listem v Sheets je to řádek, ve pěti systémech už problém.
- **Odhad hodnoty je odhad, ne nabídka.** AI tipuje číslo z volného textu zákazníka. Může se mýlit o řád. Nikdy ho neposílejte zákazníkovi a nepoužívejte ho k automatickému rozdělení poptávek mezi obchodníky bez kontroly. Slouží k tomu, aby se obchodník podíval nejdřív na větší případy.
- **Webhook musí odpovědět rychle.** Když za webhookem visí AI node a tři API volání, celé zpracování trvá několik sekund a formulář na webu by mezitím mohl zobrazit chybu z časového limitu. Proto je node `Formulář z webu` nastavený na `Respond: Immediately` — potvrdí přijetí a zpracování běží za ním. Důsledek, se kterým musíte počítat: formulář na webu nedostane zpět žádný výsledek, takže na stránce zobrazte neutrální „děkujeme, potvrzení přijde e-mailem“, ne „poptávka byla uložena“.

## Bezpečnost a osobní údaje

Do AI jde pouze text zprávy a obor, který z ní plyne. Jméno, e-mail ani telefon se do promptu neposílají — AI je k odhadu oboru a hodnoty nepotřebuje a zbytečně by se tím rozšiřovala množina osobních údajů odeslaných třetí straně. Ve workflow je to vidět v nodu `Doplnění oboru a hodnoty`: na vstupu je jen `zprava`.

- Webhook URL obsahuje náhodnou cestu, ale není to autentizace. Pokud formulář posílá cokoli citlivého, dejte před n8n reverzní proxy s HTTPS a omezte přístup na IP svého webu.
- Údaje v tabulce jsou osobní údaje. Tabulka nesmí být sdílená odkazem "pro kohokoli".
- Poslední slovo má člověk: workflow nic neslibuje a nic nenabízí. Potvrzovací e-mail obsahuje jen to, že poptávka přišla a kdy se někdo ozve.
- Credentials (SMTP, Slack, Google, Anthropic) patří do credentialů v n8n. V žádném nodu nejsou v parametrech.

## Kolik to ušetří

| Krok | Ručně | Automaticky |
| --- | --- | --- |
| Přečíst poptávku a přepsat ji do tabulky | 6–10 min | 0 s |
| Rozhodnout, komu patří, a předat ji | 3–5 min | 0 s |
| Napsat zákazníkovi potvrzení | 3–5 min | 0 s |
| Odhalit duplicitní odeslání | 2 min, často vůbec | 0 s |
| Odfiltrovat spam z formuláře | 1–2 min na kus | 0 s |

Při 25 poptávkách měsíčně vychází úspora na 7–9 hodin měsíčně. Jde o **modelovaný odhad z demo prostředí, ne naměřená data z provozu** — ruční postup jsem stopla na deseti vzorových poptávkách a odečetla dobu, kterou člověku zbývá na skutečnou práci s poptávkou. Vedlejší efekt, který se do tabulky nevejde: zákazník dostane potvrzení do minuty a přestane volat, jestli to došlo.

## Varianty

- **Baserow nebo Airtable místo Sheets.** Nahraďte oba Sheets nody za `HTTP Request` na API Baserow. Hodí se, jakmile potřebujete stavy obchodu, filtrovaná zobrazení a historii změn — Sheets na to po několika stovkách řádků přestává stačit.
- **Bez AI nodu.** Obor se dá určit z rozbalovacího seznamu ve formuláři, odhad hodnoty z vybrané služby a množství. Je to přesnější než odhad z volného textu, protože to vyplnil zákazník sám, a nic neodchází třetí straně. Nevýhoda: delší formulář znamená méně odeslání.
- **Teams nebo e-mail místo Slacku.** `Microsoft Teams` node, nebo druhý `Send Email` na adresu obchodního týmu. Logika zůstává.
- **S úkolem a termínem.** Za zápis do CRM přidejte vytvoření úkolu v Notion s termínem na následující pracovní den. Vhodné tam, kde se poptávky stejně obvolávají a je potřeba hlídat, že se to opravdu stalo.
