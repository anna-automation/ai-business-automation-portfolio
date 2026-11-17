import { useEffect, useMemo, useRef, useState } from 'react'
import { Mic, Paperclip, Play, Square, Trash2, X } from 'lucide-react'
import { cn } from '../../lib/utils.js'

/**
 * Stavební díly poptávkového formuláře. Nic z toho nezná stav formuláře —
 * všechno si bere hodnotu a vrací změnu, aby se díly daly skládat v jakémkoliv
 * pořadí.
 *
 * Plovoucí popisky stojí na pořadí v DOM: `input` musí být před `label`,
 * jinak CSS nemá na co sáhnout sourozeneckým selektorem.
 */

/** Nadpis jedné otázky v kroku. */
export function Otazka({ titulek, popis, children, className }) {
  return (
    <div className={className}>
      <p className="text-[1.02rem] font-semibold leading-snug text-white">{titulek}</p>
      {popis && <p className="mt-1 text-[0.88rem] leading-snug text-white/55">{popis}</p>}
      <div className="mt-3">{children}</div>
    </div>
  )
}

/** Textové pole s plovoucím popiskem. */
export function Pole({
  id,
  label,
  hodnota,
  onZmena,
  onBlur,
  typ = 'text',
  inputMode,
  autoComplete,
  chyba,
  napoveda,
  ikona: Ikona,
  pred,
  nepovinne,
}) {
  return (
    <div>
      <div className={cn('lp-pole', Ikona && 'lp-pole-ikona', pred && 'lp-pole-pred')}>
        {pred}
        <input
          id={id}
          type={typ}
          value={hodnota}
          inputMode={inputMode}
          autoComplete={autoComplete}
          placeholder=" "
          aria-invalid={Boolean(chyba)}
          aria-describedby={chyba ? `${id}-chyba` : napoveda ? `${id}-napoveda` : undefined}
          onChange={(e) => onZmena(e.target.value)}
          onBlur={onBlur}
          className={cn('lp-field', Ikona && 'lp-field-ikona', chyba && 'lp-field-chyba')}
        />
        <label htmlFor={id}>
          {label}
          {nepovinne && <span className="text-white/40"> · nepovinné</span>}
        </label>
        {Ikona && (
          <Ikona
            size={19}
            aria-hidden
            className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-white/55"
          />
        )}
      </div>
      {chyba ? (
        <p id={`${id}-chyba`} className="lp-chyba">
          {chyba}
        </p>
      ) : napoveda ? (
        <p id={`${id}-napoveda`} className="lp-napoveda">
          {napoveda}
        </p>
      ) : null}
    </div>
  )
}

/** Víceřádkové pole s plovoucím popiskem a počítadlem znaků. */
export function Oblast({ id, label, hodnota, onZmena, onBlur, placeholder, chyba, radku = 6, maximum = 1500 }) {
  return (
    <div>
      {/* s viditelným příkladem v placeholderu nemá popisek kam klesnout —
          zůstává nahoře, aby se texty nepřekrývaly */}
      <div className={cn('lp-pole', placeholder && 'lp-pole-stale')}>
        <textarea
          id={id}
          rows={radku}
          value={hodnota}
          maxLength={maximum}
          placeholder={placeholder ?? ' '}
          aria-invalid={Boolean(chyba)}
          onChange={(e) => onZmena(e.target.value)}
          onBlur={onBlur}
          className={cn('lp-field lp-field-oblast', chyba && 'lp-field-chyba')}
        />
        <label htmlFor={id}>{label}</label>
      </div>
      <div className="mt-1.5 flex items-start justify-between gap-4">
        {chyba ? <p className="lp-chyba !mt-0">{chyba}</p> : <span />}
        <span
          className={cn(
            'shrink-0 text-[0.78rem] tabular-nums',
            hodnota.length > maximum - 100 ? 'text-[var(--lp-pink-bright)]' : 'text-white/40'
          )}
        >
          {hodnota.length} / {maximum}
        </span>
      </div>
    </div>
  )
}

/** Skupina čipů. `multi` přepíná na výběr více hodnot. */
export function Cipy({ moznosti, hodnota, onZmena, multi = false, nazev }) {
  const vybrano = (id) => (multi ? (hodnota ?? []).includes(id) : hodnota === id)

  const prepnout = (id) => {
    if (!multi) {
      onZmena(hodnota === id ? null : id)
      return
    }
    const seznam = hodnota ?? []
    onZmena(seznam.includes(id) ? seznam.filter((x) => x !== id) : [...seznam, id])
  }

  return (
    <div role="group" aria-label={nazev} className="flex flex-wrap gap-2">
      {moznosti.map((m) => {
        const Ikona = m.icon
        return (
          <button
            key={m.id}
            type="button"
            aria-pressed={vybrano(m.id)}
            onClick={() => prepnout(m.id)}
            className={cn('lp-cip', vybrano(m.id) && 'lp-cip-aktivni')}
          >
            {Ikona && <Ikona size={16} strokeWidth={2} aria-hidden />}
            {m.label}
          </button>
        )
      })}
    </div>
  )
}

/** Velké karty pro první krok — záměr návštěvníka. */
export function Karty({ moznosti, hodnota, onZmena, nazev }) {
  return (
    <div role="group" aria-label={nazev} className="grid gap-2.5 sm:grid-cols-2">
      {moznosti.map((m) => {
        const Ikona = m.icon
        return (
          <button
            key={m.id}
            type="button"
            aria-pressed={hodnota === m.id}
            onClick={() => onZmena(m.id)}
            className={cn('lp-karta', hodnota === m.id && 'lp-karta-aktivni')}
          >
            {Ikona && <Ikona size={22} strokeWidth={1.9} aria-hidden className="text-[var(--lp-pink)]" />}
            <span className="mt-2.5 block text-[1rem] font-semibold leading-snug text-white">{m.titulek}</span>
            <span className="mt-1 block text-[0.85rem] leading-snug text-white/55">{m.popis}</span>
          </button>
        )
      })}
    </div>
  )
}

/** Posuvník rozpočtu. „Zatím nevím" je plnohodnotná odpověď, ne únik. */
export function Posuvnik({ id, moznosti, index, nevim, onIndex, onNevim }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <span className={cn('text-[1.05rem] font-semibold', nevim ? 'text-white/40' : 'text-white')}>
          {nevim ? 'Zatím nevím' : moznosti[index]}
        </span>
        <button
          type="button"
          aria-pressed={nevim}
          onClick={() => onNevim(!nevim)}
          className={cn('lp-cip lp-cip-maly', nevim && 'lp-cip-aktivni')}
        >
          Zatím nevím
        </button>
      </div>
      <input
        id={id}
        type="range"
        min={0}
        max={moznosti.length - 1}
        step={1}
        value={index}
        disabled={nevim}
        aria-label="Rozpočet"
        aria-valuetext={nevim ? 'Zatím nevím' : moznosti[index]}
        onChange={(e) => {
          onNevim(false)
          onIndex(Number(e.target.value))
        }}
        className={cn('lp-posuvnik mt-3', nevim && 'opacity-40')}
      />
      <div className="mt-1 flex justify-between text-[0.76rem] text-white/35">
        <span>{moznosti[0]}</span>
        <span>{moznosti[moznosti.length - 1]}</span>
      </div>
    </div>
  )
}

const LIMIT_MB = 10
const MAX_SOUBORU = 3

/** Přetažení příloh. Obrázky dostanou náhled, ostatní jen jméno a velikost. */
export function Prilohy({ soubory, onZmena }) {
  const [pretahuje, setPretahuje] = useState(false)
  const [chyba, setChyba] = useState(null)

  // náhledy drží paměť, dokud je ručně nepustíme
  useEffect(
    () => () => soubory.forEach((s) => s.nahled && URL.revokeObjectURL(s.nahled)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const pridat = (seznam) => {
    const nove = []
    for (const f of Array.from(seznam ?? [])) {
      if (soubory.length + nove.length >= MAX_SOUBORU) {
        setChyba(`Víc než ${MAX_SOUBORU} soubory zatím nezvládneme — pošlete zbytek v odpovědi.`)
        break
      }
      if (f.size > LIMIT_MB * 1024 * 1024) {
        setChyba(`${f.name} má přes ${LIMIT_MB} MB. Pošlete prosím odkaz na úložiště.`)
        continue
      }
      nove.push({
        id: `${f.name}-${f.size}-${f.lastModified}`,
        jmeno: f.name,
        kb: Math.max(1, Math.round(f.size / 1024)),
        nahled: f.type.startsWith('image/') ? URL.createObjectURL(f) : null,
      })
    }
    if (nove.length) {
      setChyba(null)
      onZmena([...soubory, ...nove])
    }
  }

  const odebrat = (id) => {
    const soubor = soubory.find((s) => s.id === id)
    if (soubor?.nahled) URL.revokeObjectURL(soubor.nahled)
    onZmena(soubory.filter((s) => s.id !== id))
  }

  return (
    <div>
      <label
        onDragOver={(e) => {
          e.preventDefault()
          setPretahuje(true)
        }}
        onDragLeave={() => setPretahuje(false)}
        onDrop={(e) => {
          e.preventDefault()
          setPretahuje(false)
          pridat(e.dataTransfer.files)
        }}
        className={cn('lp-dropzone', pretahuje && 'lp-dropzone-aktivni')}
      >
        <input
          type="file"
          multiple
          className="sr-only"
          accept="image/*,.pdf,.csv,.xlsx,.xls,.docx,.doc,.txt"
          onChange={(e) => {
            pridat(e.target.files)
            e.target.value = ''
          }}
        />
        <Paperclip size={19} strokeWidth={1.9} className="text-white/60" />
        <span>
          Přetáhněte zadání, tabulku nebo fotku — nebo <span className="underline">vyberte</span>
        </span>
      </label>

      {chyba && <p className="lp-chyba">{chyba}</p>}

      {soubory.length > 0 && (
        <ul className="mt-2.5 space-y-2">
          {soubory.map((s) => (
            <li key={s.id} className="lp-priloha">
              {s.nahled ? (
                <img src={s.nahled} alt="" className="size-10 shrink-0 rounded-lg object-cover" />
              ) : (
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-white/[0.06] text-white/60">
                  <Paperclip size={16} />
                </span>
              )}
              <span className="min-w-0 flex-1 truncate text-[0.9rem] text-white/85">{s.jmeno}</span>
              <span className="shrink-0 text-[0.8rem] tabular-nums text-white/40">{s.kb} kB</span>
              <button
                type="button"
                onClick={() => odebrat(s.id)}
                aria-label={`Odebrat ${s.jmeno}`}
                className="lp-ikona-tlacitko"
              >
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const MAX_VTERIN = 120

/**
 * Hlasovka přímo v prohlížeči. Když prohlížeč nahrávání neumí nebo člověk
 * nepustí mikrofon, prvek se prostě neukáže — psaní nikdy nezablokuje.
 */
export function Hlasovka({ nahravka, onZmena }) {
  const [nahrava, setNahrava] = useState(false)
  const [vteriny, setVteriny] = useState(0)
  const [zamitnuto, setZamitnuto] = useState(false)
  const rekorder = useRef(null)
  const tiky = useRef(null)

  const podporovano =
    typeof navigator !== 'undefined' &&
    Boolean(navigator.mediaDevices?.getUserMedia) &&
    typeof window !== 'undefined' &&
    typeof window.MediaRecorder !== 'undefined'

  useEffect(
    () => () => {
      clearInterval(tiky.current)
      if (rekorder.current?.state === 'recording') rekorder.current.stop()
    },
    []
  )

  if (!podporovano) return null

  const stop = () => {
    clearInterval(tiky.current)
    if (rekorder.current?.state === 'recording') rekorder.current.stop()
    setNahrava(false)
  }

  const start = async () => {
    try {
      const proud = await navigator.mediaDevices.getUserMedia({ audio: true })
      const rek = new window.MediaRecorder(proud)
      const kousky = []

      rek.ondataavailable = (e) => e.data.size > 0 && kousky.push(e.data)
      rek.onstop = () => {
        proud.getTracks().forEach((t) => t.stop())
        const blob = new Blob(kousky, { type: rek.mimeType || 'audio/webm' })
        if (nahravka?.url) URL.revokeObjectURL(nahravka.url)
        onZmena({ url: URL.createObjectURL(blob), vteriny, kb: Math.max(1, Math.round(blob.size / 1024)) })
      }

      rekorder.current = rek
      rek.start()
      setZamitnuto(false)
      setNahrava(true)
      setVteriny(0)
      tiky.current = setInterval(() => {
        setVteriny((v) => {
          if (v + 1 >= MAX_VTERIN) stop()
          return v + 1
        })
      }, 1000)
    } catch {
      setZamitnuto(true)
    }
  }

  const smazat = () => {
    if (nahravka?.url) URL.revokeObjectURL(nahravka.url)
    onZmena(null)
  }

  if (nahravka) {
    return (
      <div className="lp-priloha">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-[rgb(255_20_102/0.18)] text-[var(--lp-pink-bright)]">
          <Play size={16} />
        </span>
        <audio controls src={nahravka.url} className="h-9 min-w-0 flex-1" />
        <button type="button" onClick={smazat} aria-label="Smazat hlasovku" className="lp-ikona-tlacitko">
          <Trash2 size={16} />
        </button>
      </div>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={nahrava ? stop : start}
        className={cn('lp-dropzone', nahrava && 'lp-dropzone-aktivni')}
      >
        {nahrava ? <Square size={17} strokeWidth={2.4} /> : <Mic size={19} strokeWidth={1.9} />}
        {nahrava ? (
          <span className="tabular-nums">
            Nahrávám… {String(Math.floor(vteriny / 60)).padStart(2, '0')}:
            {String(vteriny % 60).padStart(2, '0')} — klepnutím ukončíte
          </span>
        ) : (
          <span>Radši to řeknete? Nahrajte hlasovku (do 2 minut)</span>
        )}
      </button>
      {zamitnuto && <p className="lp-napoveda">Mikrofon se nepodařilo zapnout. Nevadí — stačí to napsat.</p>}
    </div>
  )
}

/** Konfety po odeslání. Kdo má vypnuté animace, dostane klidnou obrazovku. */
export function Konfety({ pocet = 26 }) {
  const kousky = useMemo(
    () =>
      Array.from({ length: pocet }, (_, i) => ({
        i,
        zleva: Math.round(Math.random() * 100),
        zpozdeni: Math.round(Math.random() * 400),
        doba: 1500 + Math.round(Math.random() * 1200),
        otoceni: Math.round(Math.random() * 360),
        barva: ['#ff1466', '#22d3ee', '#c026d3', '#ffffff'][i % 4],
      })),
    [pocet]
  )

  return (
    <div aria-hidden className="lp-konfety">
      {kousky.map((k) => (
        <span
          key={k.i}
          style={{
            left: `${k.zleva}%`,
            background: k.barva,
            animationDelay: `${k.zpozdeni}ms`,
            animationDuration: `${k.doba}ms`,
            transform: `rotate(${k.otoceni}deg)`,
          }}
        />
      ))}
    </div>
  )
}
