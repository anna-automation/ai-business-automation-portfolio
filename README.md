# AI Business Automation Portfolio

Interaktivní showroom firemní automatizace. Praktické využití AI, automatizace
procesů a inteligentní workflow pro firmy — s ukázkami, které si návštěvník
rovnou vyzkouší v prohlížeči.

> **Všechna data na webu i v ukázkách jsou fiktivní.** Jde o funkční simulaci,
> nikoliv o reálné zákazníky, faktury nebo firmy.

---

## Jak je to poskládané

Repozitář je navržený tak, aby **každá automatizace žila samostatně** a dala se
ukázat jednotlivě — klientovi, na pohovoru, na kurzu. Web si z nich katalog
sestaví sám.

```
.
├─ automations/                 ← jádro portfolia, každá složka soběstačná
│  ├─ 01-trideni-prichozich-emailu/
│  │  ├─ meta.json              # metadata (čte je web)
│  │  ├─ README.md              # problém, kroky, nastavení, co si pohlídat
│  │  └─ workflow.json          # export z n8n, bez credentials
│  ├─ 02-poptavka-z-formulare-do-crm/
│  └─ …
│
├─ web/                         ← React web (showroom)
│  ├─ src/
│  │  ├─ components/            # UI kit, sekce, interaktivní dema
│  │  ├─ data/                  # obsah webu (profil, produkty, cílovky, texty)
│  │  ├─ lib/                   # nastavení, dvojjazyčnost, toasty, utility
│  │  └─ pages/                 # jednotlivé stránky
│  └─ plugins/
│     └─ vite-plugin-automations.js   # sesbírá automations/ do katalogu
│
└─ infra/
   └─ n8n/                      # docker-compose a návod na lokální n8n
```

### Proč to tak je

Web o složkách `automations/` nic nepředpokládá. Vite plugin při startu projde
`automations/*/meta.json`, přibere k tomu `README.md` a statistiky z
`workflow.json`, a nabídne je aplikaci jako modul `virtual:automations`.

Důsledky, které stály za to:

- **Novou automatizaci přidáte vytvořením složky.** Do webu se nesahá.
- **Složku lze předat samostatně** — README, export i metadata jdou s ní.
- **Při úpravě README se stránka sama překreslí** (plugin hlídá změny).
- Chybějící `meta.json` složku jen přeskočí, nerozbije build.

---

## Spuštění

```bash
npm install          # jednou, instaluje i web/ (npm workspaces)
npm run dev          # lokální náhled na http://localhost:5173
npm run build        # produkční build do web/dist
npm run preview      # náhled produkčního buildu
```

Lokální n8n pro zkoušení workflow:

```bash
npm run n8n:up       # http://localhost:5678
npm run n8n:down
```

Podrobnosti k n8n včetně importu workflow jsou v
[`infra/n8n/README.md`](infra/n8n/README.md).

---

## Co web obsahuje

**Interaktivní laboratoř** — deset ukázek, které běží přímo v prohlížeči:
workflow builder s krokováním procesu, AI třídění e-mailů, CRM s drag & drop,
cenová kalkulačka s výpočtem návratnosti, rezervační kalendář, vytěžování
faktur se skenovací animací, generování nabídek s porovnáním ručně/automaticky,
asistent nad firemními dokumenty s citací zdrojů, správa úkolů se simulací času
a živý report.

**Osm oblastí portfolia** — prompty podle rolí, automatizace v n8n, jednoduché
CRM, MS Office s AI, Claude skills a vlastní asistenti, výukové materiály,
bezpečnost a GDPR, případové studie.

**Pro koho** — překlad procesů do konkrétních automatizací pro realitní
kanceláře, HR, účetní kanceláře, řemeslníky, e-shopy a kanceláře.

**Školení** — osnova půldenního workshopu i dvoudenního kurzu, materiály pro
lektora, prostředí pro účastníky.

---

## Technologie

| Co | K čemu | Licence |
| --- | --- | --- |
| React 18 + Vite | základ webu | zdarma |
| Tailwind CSS v4 | styly a design tokeny | zdarma |
| Framer Motion | animace a přechody | zdarma |
| lucide-react | ikony | zdarma |
| n8n | skutečné automatizace | self-hosted zdarma |
| Docker Compose | prostředí pro n8n | zdarma |

Žádné platné závislosti na externích službách — fonty se načítají z balíčku,
takže web běží i offline a neposílá požadavky třetím stranám.

---

## Přístupnost a výkon

Nejsou to dodatky na konec. Konkrétně:

- Vše interaktivní je ovladatelné klávesnicí, včetně drag & drop ukázky.
- Respektuje se `prefers-reduced-motion`, navíc je v hlavičce vlastní přepínač
  pro omezení animací jen na tomto webu.
- Animované pozadí má `aria-hidden`, zastaví se na skrytém tabu a při omezeném
  pohybu se nepřehrává vůbec.
- Dema se mountují až když jsou potřeba, náhledy na kartách až při hoveru.
- Dark i light režim má vlastní barevnou paletu s kontrastem alespoň 4,5 : 1.

---

## Co je potřeba doplnit

Portfolio je demo, takže některé věci jsou zástupné. Hledejte `TODO` ve
`web/src/data/site.js`:

- celé jméno, IČO a adresa do právních dokumentů
- skutečný kontaktní e-mail a telefon
- odkazy na GitHub a LinkedIn
- případně fotka místo iniciály v sekci „O mně"

Právní texty (`web/src/data/legal.js`) jsou vzorové. Před reálným spuštěním
patří ke kontrole někomu, kdo se tomu věnuje.

---

## Licence

Kód webu a texty jsou dílem autorky. Workflow v `automations/` jsou zveřejněná
proto, aby se z nich dalo učit — použití ve vlastní firmě je vítané, přeprodej
jako vlastní produkt ne.
