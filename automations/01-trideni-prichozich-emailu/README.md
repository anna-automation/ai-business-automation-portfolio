# Třídění příchozích e-mailů

> Vstupuje nepřečtená zpráva z Gmailu, vystupuje zpráva se štítkem, prioritou a u rutinních typů s hotovým konceptem odpovědi. Ušetří to člověka, který ráno hromadu rozděluje ručně.

## Problém

Společná adresa typu `info@` dostane denně 40–80 zpráv. Někdo je ráno projde, odpoledne znovu, a mezitím leží poptávka ve stejné hromadě jako newsletter a upomínka. V demo prostředí mi samotné čtení a rozdělení vyšlo na 60–100 minut denně — a to je jen ta viditelná část. Horší je zpráva, na kterou nikdo neodpověděl, protože zapadla mezi automatické potvrzenky. Nejčastější chyba tedy není špatná odpověď, ale žádná odpověď.

## Co to dělá

1. Každých 5 minut se podívá na nepřečtené zprávy ve složce Doručená pošta.
2. Z každé zprávy vytáhne odesílatele, předmět a prvních 2000 znaků textu.
3. Zkontroluje hlavičky, které značí automat (`Auto-Submitted`, `X-Autoreply`, `List-Unsubscribe`), a takovou zprávu pošle do slepé větve.
4. AI zprávu zařadí do jedné z pěti kategorií: poptávka, faktura, reklamace, interní, spam.
5. Ke kategorii přidá prioritu (vysoká / běžná / nízká), číslo spolehlivosti 0–1 a jednu větu odůvodnění.
6. Když je spolehlivost pod 0,75, zpráva dostane štítek `Triage/Ke kontrole` a dál se o ní nerozhoduje.
7. Jinak dostane štítek podle kategorie a prioritu.
8. U poptávky a faktury AI připraví návrh odpovědi ve firemním tónu.
9. Návrh se uloží jako koncept v Gmailu ve stejném vlákně. Nic se neodesílá.
10. Řádek s kategorií, prioritou a spolehlivostí se zapíše do tabulky, aby se dalo zpětně zkontrolovat, jak AI rozhodovala.

## Jak je to postavené

| Node | Typ | K čemu |
| --- | --- | --- |
| Nová zpráva | Gmail Trigger | Každých 5 minut hledá nepřečtené v Doručené poště |
| Příprava textu | Code | Zkrátí tělo na 2000 znaků a označí automatické odpovědi |
| Je to automatická odpověď? | IF | Automaty odvede do slepé větve, zbytek dál |
| Konec — smyčka | NoOp | Záměrně nic nedělá; v logu je vidět, co se zastavilo |
| Jazykový model Claude | Claude Chat Model | Model pro klasifikaci i pro psaní návrhu |
| Klasifikace AI | Information Extractor | Vrátí kategorii, prioritu, spolehlivost a odůvodnění |
| Spolehlivá klasifikace? | IF | Hranice spolehlivosti 0,75 |
| Štítek a priorita | Gmail | Přidá štítek podle kategorie a priority |
| Ke kontrole člověku | Gmail | Přidá štítek `Triage/Ke kontrole` |
| Návrh odpovědi | Basic LLM Chain | Napíše návrh odpovědi ve firemním tónu |
| Uložit koncept | Gmail | Uloží návrh jako koncept, neodesílá |
| Zápis do přehledu | Google Sheets | Přidá řádek do auditní tabulky |

## Nastavení

1. V n8n otevřete `Workflows → Import from File` a vyberte `workflow.json`.
2. V Gmailu si **předem vytvořte štítky**, se kterými workflow pracuje: `Triage/Poptavka`, `Triage/Faktura`, `Triage/Reklamace`, `Triage/Interni`, `Triage/Spam`, `Triage/Ke kontrole`, `Priorita/Vysoka`, `Priorita/Bezna`, `Priorita/Nizka`. Gmail API štítky samo nezaloží.
3. Vytvořte credential `Gmail OAuth2` se scope `gmail.modify` (potřeba kvůli štítkům) a `gmail.compose` (kvůli konceptům).
4. Vytvořte credential `Anthropic` s vlastním API klíčem.
5. V nodech `Štítek a priorita` a `Ke kontrole člověku` doplňte ID štítků — n8n je nabídne v rozbalovacím seznamu, jakmile je credential připojený.
6. V nodu `Zápis do přehledu` vyměňte `YOUR_SHEET_ID` za ID vaší tabulky a zkontrolujte názvy sloupců.
7. V nodu `Návrh odpovědi` přepište blok `FIRMNÍ TÓN` — jméno firmy, oslovení, podpis, čím se zabýváte a co nikdy neslibovat.
8. Pusťte to nejdřív ručně přes `Execute Workflow` na pár zprávách a projděte, co AI vrátila. Teprve pak zapněte plán.

## Co si pohlídat

- **Limity Gmail API.** Kvóta se nepočítá v požadavcích, ale v jednotkách: výpis zpráv i čtení jedné zprávy stojí 5 jednotek, úprava štítků 5, vytvoření konceptu 10. Projekt má denní strop řádově milion jednotek a sekundový limit 250 jednotek na uživatele. Při 80 zprávách denně se tomu ani nepřiblížíte. Jakmile ale workflow pustíte na archiv několika tisíc zpráv, narazíte na sekundový limit a dostanete `429`. Řešení: do nodu `Nová zpráva` dejte limit zpráv na jeden běh (třeba 25) a interval nechte na 5 minutách — zpracuje se to postupně.
- **Nejistá klasifikace.** Hranice spolehlivosti 0,75 není svatá. Je to číslo, které AI sama o sobě tvrdí, ne měřená přesnost. První dva týdny si v tabulce porovnávejte, co AI vrátila, s tím, co to opravdu bylo. Pokud pod hranicí propadává hodně správně zařazených zpráv, hranici snižte. Pokud nad hranicí prolézají chyby, zvyšte ji. Všechno pod hranicí musí končit u člověka, nikdy ne v automatické odpovědi.
- **Smyčka automatických odpovědí.** Tohle je ta nejnepříjemnější chyba. Pošlete automatickou odpověď na automatickou odpověď, protistrana odpoví automatem a dvě schránky si pingají tisíce mailů za noc. Proto se tady neodesílá nic — jen se ukládá koncept. Navíc node `Je to automatická odpověď?` filtruje podle hlaviček `Auto-Submitted`, `X-Autoreply`, `X-Autorespond` a `List-Unsubscribe` a podle předmětu. Pokud se k odesílání někdy rozhodnete, přidejte k tomu ještě počítadlo na vlákno: na jedno vlákno nejvýš jedna automatická zpráva za 24 hodin.
- **Štítky se musí v Gmailu vytvořit dopředu.** Gmail API neumí "přidej štítek, a když neexistuje, založ ho". Když štítek chybí, node spadne na `Invalid label` a zpráva zůstane nepřečtená — příští běh to zkusí znovu a znovu. Vytvořte je ručně podle seznamu v Nastavení.
- **Zpráva se nesmí označit jako přečtená dřív, než projde.** Pokud trigger zprávu rovnou označí jako přečtenou a workflow pak spadne, zpráva se už nikdy nezpracuje. V importované verzi se stav nemění; nechte to tak.
- **Vlákna, ne jednotlivé zprávy.** Když klient odpoví na svou vlastní poptávku, přijde druhá zpráva ve stejném vlákně a AI ji klasifikuje znovu. Štítek se tím nerozbije, ale koncept vznikne podruhé. Pokud vás to ruší, přidejte před `Návrh odpovědi` kontrolu, zda ve vlákně koncept už není.

## Bezpečnost a osobní údaje

Do AI jde odesílatelova adresa, předmět a prvních 2000 znaků textu. Přílohy se neposílají vůbec — workflow je ani nečte. Celé tělo se posílá záměrně zkrácené: delší zprávy obvykle obsahují citované historie starších konverzací, které ke klasifikaci nic nepřidají a jen rozšiřují množinu dat odeslaných třetí straně.

Co z toho plyne pro nasazení ve firmě:

- Zpracování e-mailu přes externí API je zpracování osobních údajů zpracovatelem. Potřebujete smlouvu s poskytovatelem modelu (Anthropic má DPA) a zápis v záznamech o činnostech zpracování.
- Pokud schránka dostává zdravotní, platební nebo jiné citlivé údaje, nenechávejte filtr na AI. Před nodem `Klasifikace AI` přidejte Code node, který maskuje čísla karet, rodná čísla a čísla účtů regulárním výrazem, nebo takové adresy odfiltrujte podle odesílatele ještě dřív.
- API klíč patří do credentialu v n8n, nikdy do parametru nodu ani do `jsCode`.
- Poslední slovo má vždy člověk. Workflow nepíše odesílateli, nemaže, nearchivuje. Nejhorší, co udělá, je špatně obarvený štítek a koncept, který někdo zahodí.
- Auditní tabulka je součást bezpečnosti, ne zbytečnost. Bez ní nedoložíte, proč systém zprávu zařadil tak, jak ji zařadil.

## Kolik to ušetří

| Krok | Ručně | Automaticky |
| --- | --- | --- |
| Přečíst a zařadit jednu zprávu | 25–40 s | 0 s |
| Nastavit prioritu | 5 s | 0 s |
| Napsat rutinní odpověď | 3–6 min | 30 s na kontrolu konceptu |
| Ranní průchod 60 zprávami | 35–50 min | 5 min na kontrolu štítků |

Při 60 zprávách denně a asi 10 rutinních odpovědích vychází úspora na 70–110 minut denně, tedy přibližně 30 hodin měsíčně. Jde o **modelovaný odhad z demo prostředí, ne naměřená data z provozu** — čísla vznikla stopnutím ručního postupu na vzorku 60 zpráv a porovnáním s dobou kontroly výstupů. Ve firmě, kde je většina pošty interní, bude úspora menší.

## Varianty

- **Outlook místo Gmailu.** Nahraďte `Gmail Trigger` a `Gmail` nody za `Microsoft Outlook`. Místo štítků se pracuje s kategoriemi a složkami, logika zůstává stejná. Hlavičky automatických odpovědí jsou tytéž.
- **Bez AI nodu.** Pro schránku s předvídatelným provozem stačí `Switch` node nad klíčovými slovy v předmětu a doménou odesílatele. Je to méně přesné, ale zdarma, bez odesílání dat třetí straně a snadno vysvětlitelné.
- **Jen štítky, bez konceptů.** Vynechte `Návrh odpovědi` a `Uložit koncept`. Zbyde tříděná schránka, což je samo o sobě většina úspory a nejmenší možné riziko.
- **S úkolem místo konceptu.** U vysoké priority místo konceptu vytvořte úkol v Notion nebo zprávu do Slacku. Vhodné tam, kde odpovídá někdo jiný než ten, kdo schránku čte.
