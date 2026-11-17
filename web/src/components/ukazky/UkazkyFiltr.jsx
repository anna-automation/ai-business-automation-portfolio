import { ChevronDown, Layers, LayoutGrid, Users, Wrench } from 'lucide-react'
import { cn } from '../../lib/utils.js'

/**
 * Filtrační lišta podle předlohy: vlevo pilulka „Všechny ukázky“, za ní tři
 * výběry oddělené linkami. Výběry jsou obyčejné <select> — jdou ovládat
 * klávesnicí i odečítačem a na mobilu použijí nativní kolotoč.
 */
function Vyber({ ikona: Ikona, popisek, hodnota, onChange, moznosti, id }) {
  const aktivni = Boolean(hodnota)

  return (
    <div className="relative flex min-w-0 flex-1 items-center gap-3 px-4 sm:px-5">
      <Ikona
        size={20}
        strokeWidth={1.8}
        aria-hidden
        className={cn('shrink-0 transition-colors', aktivni ? 'text-[var(--lp-pink)]' : 'text-white/65')}
      />
      <label htmlFor={id} className="sr-only">
        {popisek}
      </label>
      <select
        id={id}
        value={hodnota}
        onChange={onChange}
        className={cn(
          'w-full cursor-pointer appearance-none truncate bg-transparent py-3.5 pr-7 text-[0.97rem] outline-none',
          '[&>option]:bg-[#140f26] [&>option]:text-white',
          aktivni ? 'text-white' : 'text-white/80'
        )}
      >
        <option value="">{popisek}</option>
        {moznosti.map((m) => (
          <option key={m.id} value={m.id}>
            {m.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={18}
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/55 sm:right-4"
      />
    </div>
  )
}

export default function UkazkyFiltr({ filtr, setFiltr, skupiny, kategorie, nastroje, pocet }) {
  const neniFiltr = !filtr.skupina && !filtr.kategorie && !filtr.nastroj
  const zmena = (klic) => (e) => setFiltr((f) => ({ ...f, [klic]: e.target.value }))

  return (
    <div className="relative z-10">
      <div className="mx-auto w-full max-w-[82rem] px-5 pt-10 sm:px-8 lg:pt-14">
        <div className="flex flex-col gap-2 rounded-[1.6rem] border border-white/[0.1] bg-white/[0.03] p-2 backdrop-blur-sm lg:flex-row lg:items-center lg:rounded-full lg:gap-0">
          <button
            type="button"
            onClick={() => setFiltr({ skupina: '', kategorie: '', nastroj: '' })}
            aria-pressed={neniFiltr}
            className={cn(
              'flex shrink-0 items-center justify-center gap-3 rounded-full px-7 py-3.5 text-[0.97rem] font-semibold transition-all duration-400',
              neniFiltr
                ? 'lp-pill'
                : 'border border-white/15 text-white/80 hover:border-white/30 hover:text-white'
            )}
          >
            <LayoutGrid size={19} strokeWidth={2} aria-hidden />
            Všechny ukázky
          </button>

          <span aria-hidden className="mx-2 hidden h-7 w-px shrink-0 bg-white/[0.12] lg:block" />

          <Vyber
            id="filtr-skupina"
            ikona={Users}
            popisek="Cílová skupina"
            hodnota={filtr.skupina}
            onChange={zmena('skupina')}
            moznosti={skupiny}
          />

          <span aria-hidden className="mx-2 hidden h-7 w-px shrink-0 bg-white/[0.12] lg:block" />

          <Vyber
            id="filtr-kategorie"
            ikona={Layers}
            popisek="Kategorie"
            hodnota={filtr.kategorie}
            onChange={zmena('kategorie')}
            moznosti={kategorie}
          />

          <span aria-hidden className="mx-2 hidden h-7 w-px shrink-0 bg-white/[0.12] lg:block" />

          <Vyber
            id="filtr-nastroj"
            ikona={Wrench}
            popisek="Použité nástroje"
            hodnota={filtr.nastroj}
            onChange={zmena('nastroj')}
            moznosti={nastroje}
          />
        </div>

        {/* počet se hlásí i odečítači, aby bylo poznat, že filtr něco udělal */}
        <p aria-live="polite" className="mt-4 min-h-[1.25rem] text-[0.88rem] text-white/50">
          {neniFiltr ? null : `Vyhovuje ${pocet} ${pocet === 1 ? 'ukázka' : pocet < 5 ? 'ukázky' : 'ukázek'}.`}
        </p>
      </div>
    </div>
  )
}
