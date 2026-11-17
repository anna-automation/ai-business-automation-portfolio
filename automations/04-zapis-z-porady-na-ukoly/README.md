# Zápis z porady na úkoly

> Vstupuje nahrávka nebo surové poznámky z porady, vystupuje shrnutí a seznam úkolů s odpovědnou osobou a termínem. Po schválení zapisovatelem dostane každý účastník mail jen se svými úkoly. Ušetří to toho, kdo zápis píše a pak ho rozesílá.

## Problém

Hodinová porada se šesti lidmi vygeneruje patnáct až dvacet úkolů. Zapisovatel je pak hodinu přepisuje do zápisu, dalších dvacet minut je rozděluje a rozesílá, a část z nich si stejně špatně zapamatuje. Výsledek chodí jako jeden dlouhý e-mail všem, takže ho nikdo nečte do konce a vlastní úkoly v něm lidé nenajdou. Dva týdny po poradě pak nikdo neví, kdo měl co udělat do kdy — a to je ta skutečná škoda, mnohem větší než hodina přepisování.

## Co to dělá

1. Zapisovatel pošle na webhook nahrávku porady, nebo jen surové poznámky jako text, plus seznam účastníků se jmény a e-maily.
2. Když přišly poznámky jako text, jde se rovnou dál. Když přišla nahrávka, pošle se na službu pro přepis řeči.
3. AI z textu napíše shrnutí porady a vytáhne seznam úkolů. U každého úkolu zadání, odpovědnou osobu, termín a údaj, zda termín na poradě někdo opravdu vyslovil.
4. Kontrolní krok spáruje jména z úkolů se seznamem účastníků a označí, co je nejisté.
5. Termín, který AI doplnila, ale nikdo ho nevyslovil, se zahodí a napíše se to do poznámky u úkolu.
6. Úkoly se zapíšou do databáze v Notion ve stavu `Ke schválení`.
7. Zapisovatel dostane jeden e-mail s celým seznamem, zvýrazněnými nejistotami a odkazem na schválení. Účastníkům se zatím nic neposílá.
8. Zapisovatel si úkoly v Notion projde, opraví a klikne na odkaz pro schválení.
9. Teprve tím se spustí druhá část: úkoly se načtou z Notion, seskupí podle vlastníka a každému účastníkovi odejde mail jen s jeho úkoly.
10. Úkol bez jasného vlastníka se nikomu neposílá. Zůstane v Notion a vrátí se zapisovateli.

## Jak je to postavené

| Node | Typ | K čemu |
| --- | --- | --- |
| Nová porada | Webhook | Přijme nahrávku nebo poznámky a seznam účastníků |
| Přišly textové poznámky? | IF | Rozhodne mezi přepisem a rovnou cestou |
| Přepis nahrávky | HTTP Request | Pošle zvukový soubor na službu pro přepis řeči |
| Jazykový model Claude | Claude Chat Model | Model pro shrnutí a extrakci úkolů |
| Shrnutí a úkoly | Information Extractor | Shrnutí plus seznam úkolů s vlastníkem a termínem |
| Kontrola úkolů | Code | Páruje jména, hlídá nepodložené termíny a chybějící vlastníky |
| Zápis do Notion | HTTP Request | Vytvoří stránky ve stavu `Ke schválení` |
| Mail zapisovateli ke schválení | Send Email | Celý seznam, nejistoty a odkaz na schválení |
| Schválení zapisovatelem | Webhook | GET odkaz z e-mailu; spouští rozesílku |
| Načíst úkoly z Notion | HTTP Request | Dotaz do databáze podle ID porady |
| Rozdělit po účastnících | Code | Seskupí úkoly podle vlastníka |
| Mail jen s jeho úkoly | Send Email | Každému účastníkovi zvlášť, jen jeho úkoly |

## Nastavení

1. V n8n otevřete `Workflows → Import from File` a vyberte `workflow.json`.
2. V Notion vytvořte databázi s vlastnostmi: `Úkol` (title), `Vlastník` (text), `E-mail` (email), `Termín` (date), `Stav` (select s hodnotami `Ke schválení`, `Schváleno`, `Odesláno`, `Hotovo`), `Porada` (text), `PoradaId` (text), `Poznámka` (text).
3. Vytvořte integraci v Notion, zkopírujte její token a databázi s ní nasdílejte. Token uložte do n8n jako credential typu `Header Auth` s hlavičkou `Authorization` a hodnotou `Bearer SECRET`.
4. V nodech `Zápis do Notion` a `Načíst úkoly z Notion` vyměňte `YOUR_NOTION_DATABASE_ID` za ID vaší databáze.
5. V nodu `Přepis nahrávky` vyměňte `https://api.prepis-reci.example/v1/transcribe` za adresu své služby a vytvořte k ní credential. Služba musí vrátit text v poli `text`; pokud ho vrací jinam, přemapujte výstup. Nastavte jazyk `cs`.
6. Vytvořte credential `Anthropic` a credential `SMTP` pro odesílání.
7. V nodu `Mail zapisovateli ke schválení` vyměňte `vas@email.cz` za adresu firmy. Adresa zapisovatele chodí ve vstupních datech jako `zapisovatelEmail`.
8. V nodu `Mail zapisovateli ke schválení` vyměňte `https://vase-n8n.example` v odkazu na schválení za svou produkční adresu n8n.
9. Vstupní data posílejte na webhook `/porada-vstup` jako POST. Tělo: `poradaId` (vlastní identifikátor, například `2026-03-10-provoz`), `nazev`, `datum`, `zapisovatelEmail`, `ucastnici` jako pole objektů `{ "jmeno": "Jana Nováková", "email": "jana@..." }`, a buď `poznamky` jako text, nebo zvukový soubor jako binární pole `nahravka`.
10. Otestujte to nejdřív na vlastních poznámkách bez nahrávky. Zkontrolujte, co AI vytáhla, než pustíte rozesílku.

## Co si pohlídat

- **Nahrávání porady vyžaduje souhlas všech účastníků. Tohle je první věc, kterou je potřeba vyřešit, a není to formalita.** Pořízení zvukového záznamu osoby je zpracování osobních údajů a u porady nemáte k dispozici žádný jiný rozumný právní titul než souhlas — oprávněný zájem tady neobstojí, protože porada se dá zapsat i bez nahrávání. Prakticky to znamená: na začátku porady řekněte, že se nahrává, k čemu záznam poslouží a jak dlouho se bude uchovávat, a zapište si do zápisu, že s tím všichni souhlasili. Kdo nesouhlasí, má právo nesouhlasit a vy nemáte právo ho nahrávat — pak se nahrává jen ta část porady, kde není, nebo se nenahrává vůbec a workflow se pustí nad poznámkami. **Nikdy nespouštějte nahrávání bez ohlášení, nenahrávejte „pro sebe" a nepoužívejte nahrávku k ničemu jinému, než na co jste účastníky upozornili** — ani k hodnocení lidí, ani k dokládání, kdo co řekl. V nemocnici, u právníků, u personálních věcí a kdekoli jinde, kde se mluví o konkrétních lidech, se nahrávání obvykle nevyplatí vůbec; použijte poznámky. Záznam po přepisu smažte — není k ničemu a je to to nejcitlivější, co v celém workflow vznikne.
- **AI si vymyslí termín, který nikdo neřekl.** Tohle je nejčastější a nejnebezpečnější chyba v tomto typu automatizace. Na poradě padne „to by chtělo udělat co nejdřív" a v úkolech se objeví datum 17. 3. 2026, které nikdo nevyslovil. Z úkolu se tím stane závazek, o kterém ten, kdo ho má splnit, nic neví. Dvě opatření: AI u každého termínu vrací zvlášť údaj `terminZmineny`, tedy zda v zápisu termín opravdu byl, a Code node `Kontrola úkolů` termín bez tohoto potvrzení **zahodí** a napíše do poznámky, co se stalo. Druhá, důležitější vrstva je **krok se schválením zapisovatelem**: nic se nerozešle, dokud to nepotvrdí člověk, který na poradě byl. Mail zapisovateli proto obsahuje i úkoly s vyhozenými termíny — ať je vidí a buď je doplní správně, nebo nechá prázdné. Prázdný termín je lepší než vymyšlený.
- **Přiřazení ke špatnému jménu u podobných jmen.** Dva Petrové, dvě Novákové, nebo prostě „Petr to zjistí" bez příjmení — to má na poradě skoro každý tým. Code node proto páruje jména se seznamem účastníků ve třech krocích: nejdřív hledá přesnou shodu celého jména, pak shodu na jednu část (křestní nebo příjmení), a jen když je taková shoda **jediná**, úkol přiřadí. Jakmile křestní jméno nebo příjmení odpovídá víc účastníkům, úkol se nepřiřadí nikomu, dostane poznámku „podobných jmen je víc, přiřazení musí potvrdit zapisovatel" a čeká na člověka. Porovnání běží bez diakritiky a bez ohledu na velikost písmen, takže „jana novakova" se spáruje s „Jana Nováková". Co to nevyřeší: přezdívky a zdrobněliny („Péťa", „Kuba"), které se seznamem neporovnáte — buď je do seznamu účastníků přidejte jako druhý záznam se stejným e-mailem, nebo si zvykněte na poradě říkat celá jména. Při přepisu řeči navíc počítejte s tím, že jména jsou to první, co se zkomolí.
- **Co s úkoly bez jasného vlastníka.** Na poradě se běžně řekne „tohle by měl někdo udělat" a nikdo se nepřihlásí. Workflow se k tomu chová takto: úkol **vznikne** a zapíše se do Notion, ale s prázdným vlastníkem a poznámkou, a **nikomu se neposílá**. Je to záměrně nepohodlné — nepřiřazený úkol je viditelný v databázi a vrátí se zapisovateli v jeho mailu, takže se buď přiřadí, nebo se vědomě zruší. Dvě věci, které nedělejte: nepřiřazujte takový úkol automaticky tomu, kdo poradu svolal (spolehlivě to vede k tomu, že ten člověk má po pár poradách padesát úkolů a přestane je číst), a nezahazujte ho potichu (příští porada začne tím, že se na to zapomnělo). Pokud nepřiřazených úkolů vzniká víc než pár na poradu, není to problém automatizace, ale porady — a stojí za to to říct nahlas.
- **Přepis češtiny není dokonalý.** U nahrávky z jedné místnosti s šesti lidmi, kteří si skáčou do řeči, vám přepis zkomolí jména, čísla a odborné termíny. Co pomáhá: nastavit jazyk na `cs` explicitně (ne autodetekci), používat jeden mikrofon na blízko místo notebooku na druhém konci stolu, a hlavně brát přepis jako podklad, ne jako zápis. Zápis vzniká až schválením. Když je nahrávka delší než hodinu, rozdělte ji — většina služeb má limit na velikost souboru a dlouhý soubor znamená dlouhý běh a časový limit na webhooku.
- **Schvalovací odkaz je obyčejná URL.** Kdo ji má, spustí rozesílku. Pro interní použití to obvykle stačí, ale dejte n8n za HTTPS a do odkazu přidejte jednorázový náhodný token, který si uložíte k poradě, nebo omezte přístup k webhooku na firemní IP. Neposílejte takový odkaz nikomu kromě zapisovatele.
- **Opakované kliknutí na schválení rozešle maily dvakrát.** Workflow nekontroluje, zda už rozesílka proběhla. Ošetření je jeden krok, který si doplňte podle své databáze: po odeslání nastavte u stránek v Notion `Stav` na `Odesláno` a v dotazu je vyfiltrujte. Node `Rozdělit po účastnících` už stav `Odesláno` přeskakuje, takže stačí ten jeden zápis přidat.
- **Webhook musí odpovědět rychle.** Přepis hodinové nahrávky trvá minuty. Node `Nová porada` je proto nastavený na `Respond: Immediately` — potvrdí přijetí a zpracování běží za ním. Kdo nahrávku posílá, nedostane zpět výsledek; výsledkem je mail zapisovateli.

## Bezpečnost a osobní údaje

Do AI jde přepis nebo poznámky z porady — tedy to, co lidé říkali, včetně jmen. To je podstatně citlivější vstup než u ostatních workflow a je dobré s tím podle toho zacházet.

- **Nahrávka se modelu neposílá.** Do AI jde jen textový přepis. Samotný zvukový soubor jde na službu pro přepis a dál už nikam.
- **Záznam po přepisu smažte.** V n8n nastavte mazání dat exekucí po několika dnech (`Settings → Data pruning`) — výchozí nastavení uchovává kompletní vstupy včetně binárních dat, tedy i nahrávky porad. Nahrávka je v celém workflow to nejcitlivější a není důvod ji držet.
- **Seznam účastníků s e-maily do AI nejde.** Páruje se až v Code nodu u vás. Model dostane jen jména tak, jak padla v hovoru.
- **Na citlivé porady to nepouštějte.** Personální věci, hodnocení lidí, platy, zdravotní stav, právní spory — tam nepoužívejte ani nahrávání, ani externí model. Pokud takový obsah může zaznít, zapisovatel musí poznámky před odesláním pročistit, nebo se workflow na takovou poradu nepoužije.
- **Právní rámec.** Nahrávání stojí na souhlasu účastníků (viz první odrážka výše). Přepis a zpracování přes externí API je zpracování zpracovatelem — potřebujete DPA s poskytovatelem modelu i s přepisovou službou a zápis v záznamech o činnostech zpracování. Dobu uchování úkolů v Notion si nastavte vědomě; zápisy z porad nejsou dokument s zákonnou archivační dobou.
- **Kde má poslední slovo člověk.** Na dvou místech, a obě jsou v workflow vidět. Zapisovatel schvaluje celý seznam, než se cokoli rozešle. A úkoly bez jistého vlastníka nebo s nepodloženým termínem se nerozesílají vůbec, dokud je někdo neopraví. Workflow samo nikomu neukládá povinnost.
- Credentials (Notion, přepisová služba, Anthropic, SMTP) patří do credentialů n8n. V žádném nodu nejsou v parametrech ani v `jsCode`.

## Kolik to ušetří

| Krok | Ručně | Automaticky |
| --- | --- | --- |
| Napsat zápis z hodinové porady | 40–60 min | 0 s |
| Vypsat z něj úkoly s vlastníky | 10–15 min | 0 s |
| Zkontrolovat a opravit seznam | 0, obvykle se nedělá | 8–12 min |
| Rozdělit úkoly a rozeslat je | 15–20 min | 0 s |
| Dohledat po dvou týdnech, kdo co měl | 10–30 min na dotaz | 0 s, je to v databázi |

U hodinové porady vychází úspora na 50–70 minut, tedy při jedné poradě týdně asi 5–7 hodin měsíčně. Jde o **modelovaný odhad z demo prostředí, ne naměřená data z provozu** — ruční postup jsem stopla na dvou vzorových zápisech z porad o šesti lidech a do automatické varianty jsem připočítala dobu kontroly a schválení, která v ručním postupu obvykle chybí. Vedlejší efekt, který se do tabulky nevejde: úkoly jsou na jednom místě s vlastníkem a termínem, takže se o nich dá mluvit na příští poradě.

## Varianty

- **Baserow místo Notion.** Nahraďte oba `HTTP Request` nody za volání Baserow API, struktura polí zůstane stejná. Vyplatí se, pokud už Baserow používáte v ostatních automatizacích a nechcete další nástroj.
- **Bez nahrávání, jen poznámky.** Vynechte `Přišly textové poznámky?` a `Přepis nahrávky` a posílejte jen text. Odpadne tím celá otázka souhlasu s nahráváním a nejcitlivější část workflow. Pro většinu týmů je to lepší výchozí varianta — zapisovatel stejně píše poznámky během porady.
- **Bez AI nodu.** Když má zápis pevnou strukturu (odrážky ve formátu `jméno — úkol — termín`), stačí Code node s regulárním výrazem. Je to přesnější, zdarma a nic neodchází třetí straně. Nevýhoda: někdo musí poznámky psát disciplinovaně.
- **Se Slackem místo e-mailu.** Místo `Mail jen s jeho úkoly` použijte `Slack` node s přímou zprávou. Úkoly se tím dostanou tam, kde tým skutečně je, ale ztratíte dohledatelnost — zprávy v Slacku po čase zmizí, mail zůstane.
- **S připomínkou před termínem.** Přidejte samostatné workflow se `Schedule Trigger`, které každé ráno najde v Notion úkoly s termínem do dvou dnů a pošle jejich vlastníkům připomínku. Tohle v praxi dělá pro splnění úkolů víc než samotný zápis.
