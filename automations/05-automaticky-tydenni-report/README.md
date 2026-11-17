# Automatický týdenní report

> V pondělí v 7:00 se stáhnou data z tabulky a z CRM, kód spočítá změny proti minulému týdnu, model k nim napíše krátký komentář a vedení to najde v mailu a ve Slacku.

## Problém

Týdenní report většinou dělá jeden člověk a dělá ho ručně. Otevře tabulku, otevře CRM, opíše čísla, spočítá rozdíl proti minulému týdnu a napíše k tomu pár vět. Zabere to hodinu až dvě a stejně se to dvakrát do měsíce nestihne, protože to má na starost někdo, kdo má i jinou práci. Chyby přitom nevznikají ve vzorcích, ale při přepisování — číslo z nesprávného sloupce nebo ze špatného týdne pozná při čtení jen málokdo.

## Co to dělá

1. V pondělí v 7:00 se workflow spustí samo.
2. Stáhne řádky za aktuální a předchozí týden z Google Sheets.
3. Paralelně si vytáhne souhrn za stejné období z CRM API.
4. Oba zdroje spojí do jedné dávky.
5. Code node sečte metriky, spočítá rozdíl a procentuální změnu proti minulému týdnu.
6. Pokud data za aktuální týden chybí, workflow skončí chybou a report se neposílá.
7. Model dostane **už vypočítané hodnoty** a napíše k nim komentář do 120 slov.
8. Set node složí předmět a tělo zprávy — komentář nahoře, tabulka čísel pod ním.
9. Report odejde e-mailem vedení a jako zpráva do kanálu ve Slacku.

## Jak je to postavené

| Node | Typ | K čemu |
| --- | --- | --- |
| Pondělí 7:00 | Schedule Trigger | Jednou týdně, pondělí 7:00 |
| Data z tabulky | Google Sheets | Přečte list `Tydenni-data` |
| Data z CRM | HTTP Request | Souhrn za dva týdny z CRM API |
| Spojit zdroje | Merge | Spojí oba vstupy do jedné dávky |
| Výpočet změn | Code | Součty, rozdíly, procenta, kontrola prázdných dat |
| Komentář k číslům | Chain LLM | Pošle hotové hodnoty modelu s českým promptem |
| Model pro komentář | Anthropic Chat Model | Claude, `temperature` 0.2 |
| Složit report | Set | Předmět a tělo zprávy |
| E-mail vedení | Send Email | Textový e-mail na rozdělovník |
| Zpráva do Slacku | Slack | Stejný obsah do kanálu `#report` |

Celkem 10 nodů, jeden trigger.

## Nastavení

1. Naimportujte workflow: `n8n → Workflows → Import from File → workflow.json`.
2. Doplňte credentials u čtyř nodů: Google Sheets, CRM API (hlavičková autorizace), Claude API a Slack. V exportu jsou jen zástupné profily `PLACEHOLDER`.
3. V nodu **Data z tabulky** nahraďte `YOUR_SHEET_ID` ID své tabulky a zkontrolujte název listu.
4. Tabulka musí mít sloupce `obdobi` (`aktualni` / `predchozi`), `tyden_od`, `tyden_do`, `pracovni_dny` a pak metriky: `poptavky`, `uzavrene`, `obrat`, `reklamace`.
5. V nodu **Data z CRM** vyměňte `https://crm.example.com/api/v1/reports/weekly` za svůj endpoint.
6. V nodu **Výpočet změn** si upravte seznam `metriky` — názvy v reportu se berou odtud.
7. V nodu **E-mail vedení** nastavte `fromEmail` a `toEmail`, ve Slacku kanál místo `#report`.
8. Spusťte ručně přes **Execute Workflow** a přečtěte si výstup. Teprve pak zapněte plán.

## Co si pohlídat

- **Prázdná data nejsou nula.** Když se do tabulky ještě nikdo nedostal, součet vyjde 0 a report hlásí propad o 100 %. Code node proto nejdřív kontroluje, jestli vůbec existují řádky za aktuální týden, a pokud ne, skončí chybou. Lepší žádný report než report, který tvrdí, že firma stojí.
- **Dělení nulou u procent.** Pokud minulý týden byla v metrice nula, procentuální změna neexistuje. Kód v takovém případě vrací `null` a prompt modelu výslovně říká, že má napsat „bez srovnatelné základny" a procento si nevymýšlet. Bez tohoto ošetření v reportu skončí `Infinity` nebo `NaN`.
- **Svátky a zkrácené týdny.** Týden se čtyřmi pracovními dny proti pětidennímu vypadá jako pokles o pětinu. Tabulka proto nese sloupec `pracovni_dny`, kód z něj dělá příznak `srovnatelne` a model má v promptu pokyn na zkrácený týden upozornit. Přepočet na denní průměr dělejte v kódu, pokud ho chcete — ne v promptu.
- **Model komentuje, nepočítá.** Do promptu jdou jen hotové hodnoty, nikdy surové řádky. Jazykový model umí sčítat nekonzistentně a chybu v součtu nepřizná — vypadá stejně samozřejmě jako správný výsledek. Když dostane jen výsledky a zákaz počítat, je chyba viditelná: buď číslo opíše správně, nebo napíše něco, co v datech není, a to si při kontrole všimnete.
- **Report je podklad, ne rozhodnutí.** V těle e-mailu je proto věta o tom, co spočítal kód a co psal model. Vedení má vědět, na co se dívá.
- **Když CRM neodpoví.** HTTP Request bez ošetření shodí celý běh. Nastavte si v nodu `Retry On Fail` a v nastavení workflow error workflow, který vám pošle zprávu — jinak v pondělí nezjistíte, že report nedorazil, protože nedorazil.
- **Limity Slack API.** Jedna zpráva týdně žádný limit neřeší. Pozor jen na délku: Slack kráti zprávy nad 40 000 znaků, takže při rozšíření tabulky na desítky metrik posílejte místo textu odkaz na report.

## Bezpečnost a osobní údaje

Do modelu jde **jen pole `zmeny`** — názvy metrik a čísla. Žádná jména zákazníků, žádné e-maily, žádné jednotlivé obchodní případy. Surové řádky z tabulky a odpověď z CRM zůstávají v n8n a dál nejdou.

Pokud do reportu potřebujete jmenovitou část (třeba top obchody), držte ji mimo AI node — vložte ji do zprávy až v nodu **Složit report**, který s modelem nijak nekomunikuje. Rozdělovník `toEmail` nastavte na skupinovou adresu, ne na seznam osobních adres, ať se při změně ve firmě nemusí upravovat workflow.

Poslední slovo má člověk: report nikoho na nic neopravňuje a žádné rozhodnutí z něj neplyne automaticky. Při prvním nasazení si ho dva týdny nechte posílat jen sobě a porovnejte s ručním výpočtem.

## Kolik to ušetří

| Krok | Ručně | Automaticky |
| --- | --- | --- |
| Stažení dat z tabulky a CRM | 15 min | 0 |
| Výpočet změn proti minulému týdnu | 20 min | 0 |
| Napsání komentáře | 20 min | 0, kontrola 5 min |
| Rozeslání vedení a do Slacku | 5 min | 0 |
| Dohledání, proč číslo nesedí | 0–30 min | 0–10 min |

Dohromady odhadem **2 až 3 hodiny týdně** jednoho člověka. Jde o modelovaný odhad z demo prostředí, ne o naměřená data z provozu.

## Varianty

- **Bez AI nodu.** Vyhoďte **Komentář k číslům** i **Model pro komentář** a nechte jen tabulku čísel ze Set nodu. Report je pak kratší a nemá co zkreslit — pro provozní metriky to často stačí.
- **Excel a Outlook místo Google a SMTP.** Google Sheets vymění `n8n-nodes-base.microsoftExcel`, odesílání `n8n-nodes-base.microsoftOutlook`. Logika v Code nodu zůstává stejná.
- **Denní verze.** Změňte trigger na `field: days` a v tabulce porovnávejte den proti stejnému dni minulého týdne, ne proti včerejšku — jinak vám každé pondělí vyjde propad proti pátku.
- **Jen Slack.** Pokud firma e-maily nečte, nechte `Zpráva do Slacku` a e-mailový node smažte. Komentář pak dejte do vlákna, aby se o čísla dalo diskutovat na místě.
