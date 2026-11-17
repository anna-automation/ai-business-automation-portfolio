# Lokální n8n za pět minut

Prostředí pro zkoušení workflow z `automations/`. Používám ho i na kurzech —
účastníci mají vlastní instanci a nemůžou si navzájem nic rozbít.

## Co budete potřebovat

- Docker Desktop (Windows/macOS) nebo Docker Engine (Linux)
- 2 GB volné RAM
- nic víc

## Spuštění

```bash
docker compose -f infra/n8n/docker-compose.yml up -d
```

Otevřete <http://localhost:5678>. Při prvním spuštění si n8n nechá vytvořit
lokální účet — e-mail ani heslo nikam neodcházejí, zůstávají v kontejneru.

Zkratka z rootu repozitáře:

```bash
npm run n8n:up     # nastartuje
npm run n8n:down   # vypne
```

## Import workflow

Složka `automations/` je v kontejneru připojená jako `/automations`, jen pro
čtení. Workflow se dá naimportovat dvěma způsoby:

**Z rozhraní:** `Workflows` → `...` → `Import from File` → vyberte
`automations/NN-nazev/workflow.json` ze svého disku.

**Z příkazové řádky:**

```bash
docker exec abl-n8n n8n import:workflow \
  --input=/automations/01-trideni-prichozich-emailu/workflow.json
```

## Po importu je potřeba doplnit

Exporty v tomhle repozitáři **neobsahují žádné přihlašovací údaje** — to je
záměr. Po importu bude u některých nodů červený trojúhelník a je potřeba:

1. **Credentials** — Gmail, Google Sheets, Slack, Anthropic. Každý node, který
   je potřebuje, má v názvu profilu poznámku „doplnit".
2. **ID tabulek a kalendářů** — v parametrech jsou placeholdery jako
   `YOUR_SHEET_ID`. Vezměte je z URL svého dokumentu.
3. **E-mailové adresy** — všude je `vas@email.cz`.

Dokud to nedoplníte, workflow se dá otevřít a prohlédnout, ale nespustí se.
To je bezpečnější než opačné pořadí.

## Zálohování a přenos

Data žijí v pojmenovaném volume `abl_n8n_data`. Vyexportovat všechno:

```bash
docker exec abl-n8n n8n export:workflow --all --output=/automations/_export.json
```

Smazat prostředí včetně dat (pozor, nevratné):

```bash
docker compose -f infra/n8n/docker-compose.yml down -v
```

## Časté problémy

| Problém | Příčina | Řešení |
| --- | --- | --- |
| Port 5678 je obsazený | běží jiná instance n8n | `docker ps`, zastavit ji, nebo změnit port v compose |
| Webhook nefunguje z internetu | `WEBHOOK_URL` míří na localhost | pro testy použijte n8n tunel nebo ngrok |
| Credentials zmizely po restartu | změnil se `N8N_ENCRYPTION_KEY` | klíč musí zůstat stejný, jinak se nedešifrují |
| Špatné časy u schedule triggeru | jiná časová zóna | `GENERIC_TIMEZONE` je nastavená na `Europe/Prague` |

## Pro kurz

Před školením účastníkům posílám tři věci: tento soubor, `docker-compose.yml`
a odkaz na instalaci Dockeru. Kdo to spustí dopředu, má hotovo. Kdo ne,
zvládneme to v prvních dvaceti minutách — proto je ten compose tak krátký.
