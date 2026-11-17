# Faktury z přílohy do tabulky

> Vstupuje e-mail s fakturou v příloze, vystupuje řádek v tabulce s dodavatelem, IČO, variabilním symbolem, částkami a datem splatnosti. Nejasné případy nejdou dál, ale člověku ke kontrole. Ušetří to toho, kdo čísla z PDF přepisuje do Excelu.

## Problém

Přepisování faktur z PDF do tabulky je ta práce, kterou v kanceláři nikdo nechce. Jedna faktura zabere 3–6 minut: otevřít přílohu, najít variabilní symbol, částky, datum splatnosti, přepsat je, zkontrolovat, že se nikde neudělala chyba o jeden řád. Při šedesáti fakturách měsíčně to je půl dne čistého času. A protože je to nudné, dělají se tady chyby, které bolí nejvíc: překlep ve variabilním symbolu znamená platbu, kterou dodavatel nespáruje, a zdvojeně zaúčtovaná faktura znamená dvakrát odeslané peníze. Sken z mobilu, který někdo poslal místo PDF, to celé ještě zpomalí.

## Co to dělá

1. Každých 15 minut se podívá na nepřečtené zprávy s přílohou PDF.
2. Z přílohy se pokusí vytáhnout textovou vrstvu.
3. Když je textu méně než 200 znaků, jde o sken bez textové vrstvy a příloha se pošle na OCR.
4. AI z textu vytěží dodavatele, IČO, DIČ, variabilní symbol, základ, DPH, celkovou částku, měnu, datum vystavení a datum splatnosti.
5. Ke každému vytěžení AI připojí číslo spolehlivosti 0–1.
6. Workflow si z tabulky načte variabilní symboly, které už jsou zapsané.
7. Kontrolní krok ověří, že základ a DPH dávají celkovou částku (s tolerancí na haléřové zaokrouhlení), že variabilní symbol existuje a není duplicitní, že měna je CZK a že spolehlivost je nad 0,8.
8. Co projde, zapíše se jako řádek do tabulky.
9. Co neprojde, dostane v Gmailu štítek `Faktury/Ke kontrole` a odejde e-mail se konkrétním důvodem — nesedící součet, cizí měna, chybějící variabilní symbol, duplicita, nízká spolehlivost.
10. Nic se nikdy nezaúčtuje. Výstupem je řádek v tabulce, který schvaluje člověk.

## Jak je to postavené

| Node | Typ | K čemu |
| --- | --- | --- |
| Nová faktura v příloze | Gmail Trigger | Každých 15 minut hledá nepřečtené s přílohou PDF |
| Text z přílohy | Extract From File | Vytáhne textovou vrstvu z PDF |
| Je text čitelný? | IF | Pod 200 znaků se považuje za sken |
| OCR skenu | HTTP Request | Pošle přílohu na OCR službu a vrátí text |
| Jazykový model Claude | Claude Chat Model | Model pro vytěžení polí |
| Vytěžení faktury | Information Extractor | Dodavatel, IČO, VS, částky, data, spolehlivost |
| Načíst zaúčtované VS | Google Sheets | Seznam variabilních symbolů, které už v tabulce jsou |
| Kontrola součtů a duplicity | Code | Součty, zaokrouhlení, duplicita, měna, spolehlivost |
| Může jít do tabulky? | IF | Jediné rozhodovací místo mezi zápisem a člověkem |
| Zápis řádku do tabulky | Google Sheets | Přidá řádek, při chybě to třikrát zkusí znovu |
| Štítek Ke kontrole | Gmail | Označí zprávu štítkem `Faktury/Ke kontrole` |
| Mail ke kontrole | Send Email | Pošle důvod, proč to neprošlo |

## Nastavení

1. V n8n otevřete `Workflows → Import from File` a vyberte `workflow.json`.
2. V Gmailu si **předem vytvořte štítek** `Faktury/Ke kontrole`. Gmail API ho sám nezaloží a node by na chybějícím štítku spadl.
3. Vytvořte credential `Gmail OAuth2` se scope `gmail.modify`.
4. Vytvořte tabulku s listem `Faktury` a sloupci: `Datum`, `Dodavatel`, `ICO`, `DIC`, `VS`, `Zaklad`, `DPH`, `Celkem`, `Mena`, `DatumVystaveni`, `DatumSplatnosti`, `Spolehlivost`, `Zdroj`, `Stav`. Sloupec `VS` je ten, podle kterého se hledají duplicity — nemazejte ho a needitujte ručně.
5. V nodech `Načíst zaúčtované VS` a `Zápis řádku do tabulky` vyměňte `YOUR_SHEET_ID` za ID tabulky.
6. V nodu `Načíst zaúčtované VS` ponechte zapnuté `Always Output Data`. Bez toho se workflow nad prázdnou tabulkou zastaví při první faktuře.
7. V nodu `OCR skenu` vyměňte `https://api.ocr-sluzba.example/v1/ocr` za adresu své OCR služby a vytvořte k ní credential typu `Header Auth`. Služba musí vrátit text v poli `text`; pokud ho vrací jinam, přemapujte výstup.
8. Vytvořte credential `Anthropic` s vlastním API klíčem a credential `SMTP` pro odesílání kontrolních e-mailů.
9. V nodu `Mail ke kontrole` vyměňte `vas@email.cz` za adresu, kam mají chodit faktury ke kontrole.
10. Pusťte to nejdřív ručně na deseti fakturách různých dodavatelů a porovnejte vytěžená čísla s originály. Teprve pak zapněte plán.

## Co si pohlídat

- **Skeny nízké kvality.** Faktura vyfocená mobilem pod úhlem, s rukou ve záběru a stínem přes polovinu dokladu, je nejčastější vstup, se kterým se v praxi potkáte. OCR z ní vytáhne text, ale s chybami: `8` místo `B`, `0` místo `O`, slepené číslice v částce. Co pomáhá: nastavit OCR na češtinu (ne jen na angličtinu, jinak se rozsypou diakritická slova), zapnout automatické narovnání a odstranění stínů, pokud to služba umí, a hlavně — **nespoléhat na to, že se chyba pozná sama**. Proto je tady kontrola součtů: překlep v částce se v devíti z deseti případů projeví tím, že základ a DPH nedají celkem. Když je výstup OCR kratší než pár set znaků nebo neobsahuje žádné číslo, pošlete to člověku rovnou a nenechte AI hádat z kaše.
- **Faktury v cizí měně.** EUR faktura s částkou 1 240,00 vypadá v tabulce stejně jako korunová a nikdo si rozdílu nevšimne, dokud nesedí saldo. Workflow proto každou fakturu v jiné měně než CZK posílá ke kontrole, i když je všechno ostatní v pořádku. Automatický přepočet kurzem ČNB záměrně nedělá: pro účetnictví je rozhodující kurz k datu uskutečnění plnění, případně pevný kurz podle vnitřní směrnice, a to workflow nemůže vědět. Druhá past: v cizí měně bývá uveden i jiný formát čísel (`1,240.00` místo `1 240,00`), takže se čísla snadno vytěží o tři řády vedle.
- **Kontrola, že základ plus DPH je celkem.** To je nejsilnější záchytná síť, kterou tady máte, a stojí za to pochopit, co hlídá a co ne. Hlídá: překlep v jedné z částek, zaměněné sloupce, chybně přečtenou číslici, fakturu s více sazbami DPH shrnutou do jediné. Nehlídá: správně vytěžené, ale špatné číslo (to na faktuře opravdu je) a situaci, kdy se shodně spletly dvě částky. Když součet nevyjde, faktura **nejde do tabulky** — jde člověku s uvedením rozdílu v korunách. Nikdy to nespravujte tím, že by workflow dopočítalo chybějící hodnotu ze zbylých dvou: tím byste do účetnictví zapsali číslo, které na faktuře není, a chybu zamaskovali.
- **Zaokrouhlovací rozdíly.** Na českých fakturách je běžný haléřový rozdíl: DPH se počítá z každé položky a celková částka se zaokrouhluje na korunu, takže základ plus DPH vyjde o 0,50 Kč jinak než celkem. Proto je v kontrole tolerance 1 Kč — pod ni se rozdíl považuje za zaokrouhlení, nad ni za chybu. Tolerance je kompromis: čím je větší, tím víc skutečných chyb proklouzne. Pokud dostáváte faktury s desítkami položek, zvyšte ji na 2 Kč, ale nikdy ne na procenta celkové částky — u faktury za 300 000 Kč by vám jednoprocentní tolerance pustila chybu za tři tisíce.
- **Duplicita podle variabilního symbolu.** Hledá se mezi variabilními symboly, které už v tabulce jsou, a VS se před porovnáním zbaví mezer a nečíselných znaků. Dvě omezení, o kterých musíte vědět: někteří dodavatelé variabilní symbol nepoužívají vůbec (pak je pole prázdné a faktura jde ke kontrole, což je správně), a VS není celosvětově unikátní — dva různí dodavatelé mohou mít shodou okolností stejný. Proto se ke kontrole posílá i podezření na duplicitu místo tichého zahození. Jakmile budete mít v tabulce víc než pár tisíc řádků, přejděte na porovnání kombinace IČO plus VS plus částka, a načítejte z tabulky jen potřebný sloupec, ne všechny řádky.
- **Totožná faktura přijde dvakrát v jednom běhu.** Duplicitní kontrola se dívá do tabulky, ne na ostatní faktury ve stejném běhu. Když dodavatel pošle tu samou fakturu ve dvou mailech během patnácti minut, oba záznamy kontrolu projdou a zapíšou se. Pokud vám to dělá potíže, nastavte interval triggeru na delší a limit zpráv na jeden běh na jednu.
- **Proč nikdy neúčtovat automaticky bez schválení.** Tohle není opatrnost, je to hranice, kterou si nastavte předem a nehýbejte s ní. Tři důvody. **Právní:** za správnost účetnictví odpovídá firma a konkrétní osoba, nikoli workflow — u kontroly neobhájíte "to zapsala automatizace". **Finanční:** chybně zaúčtovaná faktura se neopravuje jedním klikem, protože už vstoupila do přiznání k DPH, do salda dodavatele a případně do platebního příkazu. Zdvojená platba se vymáhá zpátky týdny. **Praktický:** AI vrací číslo spolehlivosti, které si sama o sobě tvrdí, ne měřenou přesnost; na dodavateli s nezvyklým layoutem faktury může být vysoce "jistá" a přitom mít špatně variabilní symbol. Workflow proto končí řádkem v tabulce se stavem `nova`. Účetní ho odklikne, nebo ne. Automatizace má ušetřit přepisování, ne odpovědnost.
- **Co když Sheets vrátí chybu.** Google Sheets API vrací `429` při překročení limitu a `503` při dočasné nedostupnosti. Node `Zápis řádku do tabulky` má `Retry On Fail` na tři pokusy s dvousekundovou pauzou. Pro zbytek nastavte v nastavení workflow `Error Workflow`, které vám pošle data faktury e-mailem — bez něj ztratíte fakturu, kterou už trigger označil jako zpracovanou. Retry nikdy nedávejte nad celé workflow: zopakovalo by se i odeslání kontrolního e-mailu.
- **Pozor na jiné přílohy než faktury.** Filtr `has:attachment filename:pdf` propustí i smlouvy, letáky a výpisy z banky. AI se z nich pokusí vytěžit fakturu a vrátí nesmysl s nízkou spolehlivostí, takže to skončí ke kontrole — funguje to, ale zahltí vám to kontrolní schránku. Lepší je nechat dodavatele posílat na vyhrazenou adresu, nebo si ve Gmailu udělat filtr se štítkem a trigger pustit jen nad ním.

## Bezpečnost a osobní údaje

Faktury jsou jedna z nejcitlivějších věcí, kterou můžete do automatizace pustit. Obsahují obchodní údaje (kdo je váš dodavatel, za co a kolik platíte, jaké máte podmínky) a často i osobní údaje, zejména u faktur od živnostníků: jméno, adresa provozovny, která je zároveň adresou bydliště, IČO, u některých dokladů i rodné číslo nebo číslo účtu. Předpokládejte to a chovejte se k tomu tak.

**Co jde do AI a co ne.** Do modelu jde textová podoba faktury — ta se bez celého textu vytěžit nedá, takže na rozdíl od ostatních workflow tady nelze posílat jen výřez. Co ale nejde: samotný soubor PDF se modelu neposílá, jen vytěžený text, takže metadata dokumentu a vložené soubory zůstávají u vás. Minimalizovat se dá dvěma způsoby: v Code nodu před vytěžením můžete regulárním výrazem zamaskovat čísla bankovních účtů a rodná čísla (do účetní tabulky je obvykle nepotřebujete, a když ano, přepíše je člověk z originálu), a u dodavatelů, jejichž faktury nesmí opustit firmu, nechte vytěžení úplně na člověku a přidejte je do seznamu výjimek podle e-mailové adresy.

**Co jde do OCR.** OCR služba dostane **celou přílohu**, tedy i to, co by se do AI neposílalo. Tohle je v celém workflow nejvíc exponované místo. Pro firemní nasazení buď použijte OCR, které běží u vás (Tesseract v Dockeru vedle n8n funguje a pro české faktury je dostatečný), nebo zvolte službu s DPA, uvedeným umístěním serverů v EU a smluvním zákazem trénování na vašich datech. Cizí bezplatné OCR na vytěžování faktur nepoužívejte vůbec.

**Právní rámec.** Zpracování faktur přes externí API je zpracování osobních údajů zpracovatelem. Potřebujete DPA s poskytovatelem modelu i s OCR službou, zápis v záznamech o činnostech zpracování a posouzení, zda se vás netýká povinnost vést evidenci přenosů do třetích zemí. Právním titulem je obvykle plnění smlouvy a splnění zákonné povinnosti (archivace daňových dokladů), ne souhlas — souhlas si od dodavatele neberte, jen byste si zkomplikovali život.

**Provozní pravidla.**

- Tabulka s fakturami nesmí být sdílená odkazem "pro kohokoli" a nemá být v osobním Disku, ale ve sdíleném disku firmy s nastavenými právy.
- Přílohy nenechávejte ležet v n8n. Nastavte mazání dat exekucí po čtrnácti dnech (`Settings → Data pruning`) — výchozí nastavení uchovává kompletní vstupy včetně binárních dat, tedy i faktury.
- Credentials (Gmail, Google, OCR, Anthropic, SMTP) patří do credentialů n8n. V žádném nodu nejsou v parametrech ani v `jsCode`.
- Kontrolní e-mail obsahuje jen dodavatele, variabilní symbol a důvod — ne celou fakturu. Kdo ji potřebuje vidět, otevře si původní zprávu podle štítku.
- Doba uchování: daňové doklady se archivují podle zákona, ale **pracovní kopie v n8n a logy nejsou archiv**. Ty mažte.
- Poslední slovo má člověk ve všech případech. Workflow nemaže, neplatí, neúčtuje a neodpovídá dodavateli.

## Kolik to ušetří

| Krok | Ručně | Automaticky |
| --- | --- | --- |
| Otevřít přílohu a najít údaje | 90–150 s | 0 s |
| Přepsat dodavatele, VS, částky a data | 60–120 s | 0 s |
| Zkontrolovat, že součty sedí | 30 s | 0 s |
| Ověřit, že faktura není už zapsaná | 30–60 s, často se vynechá | 0 s |
| Vyřešit nejasnou nebo nečitelnou fakturu | 4–8 min | 2–3 min, s uvedeným důvodem |

Při 60 fakturách měsíčně, z nichž asi osm skončí ke kontrole, vychází úspora na 11–13 hodin měsíčně. Jde o **modelovaný odhad z demo prostředí, ne naměřená data z provozu** — ruční postup jsem stopla na dvanácti fakturách od různých dodavatelů, včetně dvou skenů, a do automatické varianty jsem připočítala dobu kontroly výstupů. Ve firmě, kde většina faktur chodí z jednoho systému ve stejném formátu, bude úspora vyšší; tam, kde chodí fotky z mobilu, nižší.

## Varianty

- **Outlook a Excel místo Gmailu a Sheets.** Nahraďte `Gmail Trigger` za `Microsoft Outlook` a oba Sheets nody za `Microsoft Excel`. Logika i kontroly zůstávají, jen se místo štítků pracuje s kategoriemi.
- **OCR u sebe.** Místo `HTTP Request` na externí službu spusťte vedle n8n Tesseract v Dockeru s českým jazykovým balíčkem a volejte ho lokálně. Pro faktury je kvalita srovnatelná a žádná data neopouštějí firmu. Dá se tím vyřešit většina bezpečnostních výhrad výše.
- **Bez AI nodu, jen pro známé dodavatele.** Když 80 % faktur chodí od deseti stále stejných dodavatelů ve stejném formátu, vyplatí se místo AI napsat deset regulárních výrazů v Code nodu podle IČO dodavatele. Je to přesnější, zdarma a nic neodchází třetí straně; AI nechte jen jako záchytnou větev pro zbytek.
- **Přímo do účetního systému místo tabulky.** Místo Sheets nodu `HTTP Request` na API účetního softwaru, ale **vždy do stavu "k schválení"**, nikdy ne jako zaúčtovaný doklad. Tabulka je mezitím užitečná sama o sobě: je v ní vidět, jak si AI stála se spolehlivostí, a to se v účetním systému neuchová.
