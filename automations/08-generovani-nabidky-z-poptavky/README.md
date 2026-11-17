# Generování nabídky z poptávky

> Z poptávky v CRM se spočítá cena podle ceníku, AI doladí textové části, vygeneruje se PDF ze šablony, uloží ke kontaktu a obchodník ho dostane ke kontrole — zákazníkovi nabídka odejde až po jeho schválení.

## Problém

Nabídka je z devadesáti procent opisování. Obchodník vezme poslední podobnou nabídku, přepíše jméno zákazníka, přepočítá položky podle ceníku, upraví úvod a vyexportuje PDF. Trvá to 45 až 90 minut a protože se kopíruje starý dokument, cestují v nabídkách staré ceny a jméno předchozího klienta v zápatí. Větší problém je rychlost: zákazník, který poptával tři dodavatele, se často rozhodne podle toho, kdo poslal nabídku první. A pak je tu verzování — po dvou úpravách nikdo neví, kterou verzi zákazník vlastně viděl.

## Co to dělá

1. CRM pošle webhookem `deal_id` nové poptávky.
2. Workflow si z CRM vytáhne detail — zákazníka, popis, položky a slevovou hladinu.
3. Z Google Sheets načte aktuální ceník.
4. Merge spojí oba vstupy do jedné dávky.
5. Code node spočítá položky, základ, slevu, DPH a celkovou cenu — **kódem, ne modelem**.
6. Neznámá položka nebo neplatné množství workflow zastaví chybou.
7. Model dostane jen názvy položek, množství a popis poptávky a napíše úvod, rozsah plnění a výluky.
8. Druhý Code node složí číslo nabídky s verzí a zkontroluje, jestli model nepřinesl vlastní čísla.
9. Generátor dokumentů vysází PDF ze šablony — cenovou část z vypočítaných hodnot, ne z textu modelu.
10. Dokument se uloží ke kontaktu v CRM se stavem `ke_schvaleni`.
11. Obchodníkovi odejde e-mail s přehledem čísel a upozorněním z kontroly textu.
12. Workflow končí prázdným nodem. Zákazníkovi nabídku odesílá člověk.

## Jak je to postavené

| Node | Typ | K čemu |
| --- | --- | --- |
| Nová poptávka z CRM | Webhook | `POST /nova-poptavka` s `deal_id` |
| Detail poptávky | HTTP Request | Načte obchodní případ z CRM API |
| Ceník | Google Sheets | Aktuální ceník, list `Cenik` |
| Spojit vstupy | Merge | Poptávka a ceník do jedné dávky |
| Výpočet ceny | Code | Položky, sleva, DPH, platnost, rozsah |
| Texty nabídky | Chain LLM | Úvod, rozsah plnění, výluky |
| Model pro texty | Anthropic Chat Model | Claude, `temperature` 0.3 |
| Číslo a verze nabídky | Code | Číselná řada, verze, kontrola čísel v textu |
| Dokument ze šablony | HTTP Request | Vysází PDF z Word/Docs šablony |
| Uložit ke kontaktu | HTTP Request | Připojí dokument ke kontaktu v CRM |
| Ke kontrole obchodníkovi | Send Email | Přehled čísel a odkaz na dokument |
| Odeslání zákazníkovi — jen po schválení | NoOp | Záměrně prázdný konec |

Celkem 12 nodů, jeden trigger.

## Nastavení

1. Naimportujte workflow: `n8n → Workflows → Import from File → workflow.json`.
2. Doplňte credentials: CRM API, Google Sheets, Claude API, generátor dokumentů a SMTP. V exportu jsou jen zástupné profily `PLACEHOLDER`.
3. V nodu **Ceník** nahraďte `YOUR_SHEET_ID`. List `Cenik` musí mít sloupce `kod`, `nazev`, `jednotka`, `cena_bez_dph`.
4. V nodech **Detail poptávky**, **Uložit ke kontaktu** a **Dokument ze šablony** nahraďte `https://crm.example.com` a `https://docs.example.com` svými endpointy.
5. CRM musí v detailu vracet: `id`, `firma`, `oblast`, `popis`, `polozky` (pole s `kod` a `mnozstvi`), `sleva_typ`, `kontakt_id`, `obchodnik_email`, `pocet_nabidek`.
6. V nodu **Výpočet ceny** upravte slevové hladiny v objektu `hladiny`, sazbu DPH a délku platnosti nabídky.
7. V nodu **Číslo a verze nabídky** nastavte formát číselné řady, pokud používáte jiný než `NAB-rok-id-vN`.
8. Připravte šablonu dokumentu. Cenová tabulka v ní musí vznikat z polí `polozky`, `cena_bez_dph`, `dph` a `cena_s_dph` — nikdy z `texty`.
9. V nodu **Ke kontrole obchodníkovi** nastavte odesílatele.
10. Spusťte na testovací poptávce a porovnejte spočítanou cenu s ruční kalkulací. Teprve pak workflow aktivujte.

## Co si pohlídat

- **Cenu nikdy nenechte počítat model. To je nejdůležitější pravidlo celého workflow.** Důvodů je několik a každý sám stačí. Jazykový model negeneruje výsledek výpočtu, ale pravděpodobné pokračování textu — u čísel to dává výsledky, které vypadají správně a správné nejsou, hlavně u slev, zaokrouhlování a DPH. Nedá se to otestovat: stejný vstup může dát jinou cenu podruhé, takže neprojde ani kontrola, že „to včera fungovalo". A hlavně je chyba v ceně nejdražší typ chyby, jaký v nabídce může být — když odejde částka o nulu nižší, zákazník má po akceptaci právo na ni a vy máte podepsaný ztrátový obchod. Proto je výpočet v Code nodu, model vidí jen názvy položek a množství, prompt mu zakazuje psát jakékoliv částky a šablona dokumentu si cenovou tabulku skládá z vypočítaných polí, ne z textu modelu. Kontrola v nodu **Číslo a verze nabídky** navíc hledá v textu od modelu čísla nad 100, která nejsou z výpočtu, a nabídku označí ke zvýšené kontrole. Ta kontrola není pojistka, je to detektor — pojistka je, že cena z modelu do dokumentu vůbec nevede.
- **Verzování a číselná řada.** Nabídka se nikdy nepřepisuje. Verze se bere z `pocet_nabidek` v CRM a číslo nabídky ji nese v sobě (`NAB-2026-00142-v2`), takže je z dokumentu vždy poznat, co zákazník držel v ruce. Pokud odvozujete číslo z pořadí řádků v tabulce, počítejte s tím, že dva současné běhy dostanou stejné číslo — číselnou řadu musí vydávat jedno místo s atomickým zvýšením (sekvence v databázi, counter v CRM), ne `počet řádků + 1`. Staré verze neodstraňujte ani v CRM, ani v úložišti; při sporu je rozhodující to, co bylo odesláno, a ne to, co je v systému teď.
- **Platnost nabídky a akceptace po expiraci.** Datum platnosti se tiskne do dokumentu a ukládá ke kontaktu, aby šlo dohledat. Workflow ale samo nic nevynucuje — když zákazník akceptuje nabídku tři měsíce po vystavení, nabídka je po expiraci a prodejní cena už nemusí platit. Ošetřete to dvakrát: v textu nabídky věta, že po uvedeném datu je potřeba cenu potvrdit, a druhé malé workflow, které den před expirací upozorní obchodníka, že má zákazníka kontaktovat. Automaticky prodlužovat platnost nebo přepočítávat cenu bez vědomí člověka nedělejte — ceník se mezitím mohl zvednout a zákazník uvidí jiné číslo, než mu bylo řečeno.
- **Nabídka nesmí odejít zákazníkovi bez lidského schválení.** Workflow proto končí NoOp nodem a e-mail obchodníkovi má v první řádce napsáno, že zákazníkovi nic neodešlo. Dokument se v CRM ukládá se stavem `ke_schvaleni`. Není to formalita: model psal úvod a rozsah plnění vlastními slovy, a i když nepíše ceny, může napsat něco, co firma není ochotná dodat. Mezi „připravená nabídka" a „odeslaná nabídka" patří člověk, který rozsah přečte a podepíše se za něj. Pokud chcete odesílání taky automatizovat, udělejte z něj samostatné workflow spouštěné změnou stavu v CRM na `schvaleno` — schválení pak zaznamenáte včetně toho, kdo a kdy.
- **Neznámá položka v ceníku.** Code node v takovém případě skončí chybou a nabídka nevznikne. Je to záměr: dohadovaná cena je horší než žádná nabídka. Nastavte si error workflow, které obchodníkovi pošle, který kód chybí.
- **Starý ceník.** Workflow čte ceník při každém běhu, takže je vždy aktuální — ale jen pokud někdo tabulku aktualizuje. Dejte do listu `Cenik` sloupec s datem poslední změny a v Code nodu si ho ověřte; ceník starší než půl roku je důvod obchodníka upozornit.
- **Limity a selhání v polovině.** Pokud spadne generátor dokumentů, nabídka v CRM není a obchodník nedostane mail — vypadá to, jako by se nic nestalo. Nastavte na HTTP Request nodech `Retry On Fail` a error workflow. Pozor i na to, aby opakování nevytvořilo druhý dokument se stejným číslem; proto se číslo generuje před voláním generátoru a dá se podle něj poznat duplicita.
- **Volný text od zákazníka.** `popis` jde do promptu tak, jak ho zákazník napsal. Může obsahovat pokyn typu „ignoruj předchozí instrukce" nebo prostě nesmysl. Výsledek proto vždycky čte člověk a prompt má zákaz slibovat lhůty a záruky — i kdyby si je zákazník v popisu vyžádal.

## Bezpečnost a osobní údaje

Do modelu jde: název firmy, oblast zakázky, popis poptávky od zákazníka a seznam položek s množstvím. **Nejdou tam žádné ceny, slevové hladiny, marže ani kontaktní údaje** — jméno a e-mail kontaktní osoby zůstávají v CRM a do promptu nevstupují. Vaše nákupní ceny a marže se k modelu nedostanou vůbec, protože ceník se používá jen v Code nodu.

Pokud je popis poptávky citlivý (třeba interní plány zákazníka), zvažte, že do promptu půjde jen zkrácený výtah nebo vůbec nic a textové části nabídky se budou skládat ze schválených odstavců podle typu zakázky. Je to méně pružné a pro část oborů to je jediná přijatelná varianta.

Hotové nabídky obsahují ceny a jsou tím nejcitlivějším dokumentem, který ve firmě obíhá. Ukládejte je do CRM s přístupem jen pro obchodní tým, ne na veřejně dostupný odkaz. Pokud generátor dokumentů vrací URL, ať je podepsané a časově omezené — veřejný odkaz na PDF s cenami se dá uhádnout a konkurence se ptát nebude.

Poslední slovo má člověk na dvou místech: obchodník schvaluje odeslání nabídky a kdokoliv může zastavit workflow na neznámé položce v ceníku. Žádné rozhodnutí o ceně ani o rozsahu plnění nedělá model.

## Kolik to ušetří

| Krok | Ručně | Automaticky |
| --- | --- | --- |
| Vyhledání poptávky a podkladů | 10 min | 0 |
| Přepočet položek podle ceníku | 20 min | 0 |
| Napsání úvodu a rozsahu plnění | 25 min | 0 |
| Vysázení dokumentu a export do PDF | 10 min | 0 |
| Uložení ke kontaktu a zápis do CRM | 5 min | 0 |
| Kontrola a odeslání zákazníkovi | 5 min | 10 min |
| Oprava chyby v ceně po odeslání | 30 min, občas | 0 |

Z 60 až 75 minut na nabídku zůstane 10 minut kontroly, tedy odhadem **45 minut na jednu nabídku**. Jde o modelovaný odhad z demo prostředí, ne o naměřená data z provozu.

## Varianty

- **Bez AI nodu.** Textové části vybírejte Switch nodem z připravených odstavců podle oblasti a rozsahu. Nabídky jsou pak uniformnější, ale úplně předvídatelné a workflow nemá externí závislost. Pro obory se standardizovaným plněním je to lepší volba.
- **Google Docs místo externího generátoru.** Zkopírujte šablonu v Drive, nahraďte v ní placeholdery přes Docs API a vyexportujte PDF. Je to o dva až tři nody víc a zvládne to jen jednoduchou sazbu, ale nepotřebujete žádnou další službu.
- **Ceník v CRM místo tabulky.** Pokud máte ceník v CRM nebo v ERP, vyměňte Google Sheets node za HTTP Request. Výhodou je jedno místo pravdy; nevýhodou, že změnu ceny už nezvládne obchodní asistentka v tabulce.
- **Dvoustupňové schválení.** U zakázek nad určitou částku pošlete nabídku ke schválení nejdřív vedoucímu a teprve pak obchodníkovi. Přidá to jeden IF node a jeden e-mail; hranici nastavte podle toho, od jaké částky vás chyba v marži začne bolet.
