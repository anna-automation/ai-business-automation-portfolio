import { useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronDown, Layers, LayoutGrid, Users, Wrench } from 'lucide-react'
import { cn } from '../../lib/utils.js'

/**
 * Filtrační lišta podle předlohy: vlevo pilulka „Všechny ukázky“, za ní tři
 * rozbalovací výběry oddělené linkami.
 *
 * Rozbalovací panel je vlastní, ne nativní <select>: nativní seznam se kreslí
 * systémem, nejde mu dát odsazení ani barvy a u nástrojů bychom v něm neměli
 * kam dát zaškrtávátka. Klávesnice i odečítače obsloužené jsou — tlačítko hlásí
 * stav přes aria-expanded, panel se zavírá Escapem i klikem mimo.
 */
function Rozbalovac({
  ikona: Ikona,
  popisek,
  moznosti,
  vybrano,
  onVyber,
  vicenasobny = false,
  zarovnani = 'vlevo',
}) {
  const [otevreno, setOtevreno] = useState(false)
  const obal = useRef(null)
  const id = useId()

  const vybraneId = vicenasobny ? vybrano : vybrano ? [vybrano] : []
  const aktivni = vybraneId.length > 0

  useEffect(() => {
    if (!otevreno) return

    const mimo = (e) => {
      if (obal.current && !obal.current.contains(e.target)) setOtevreno(false)
    }
    const klavesa = (e) => {
      if (e.key === 'Escape') {
        setOtevreno(false)
        obal.current?.querySelector('button')?.focus()
      }
    }

    document.addEventListener('pointerdown', mimo)
    document.addEventListener('keydown', klavesa)
    return () => {
      document.removeEventListener('pointerdown', mimo)
      document.removeEventListener('keydown', klavesa)
    }
  }, [otevreno])

  // Popisek na tlačítku: jedna volba se vypíše, u více se jen spočítají.
  const napis = !aktivni
    ? popisek
    : vicenasobny && vybraneId.length > 1
      ? `${popisek} (${vybraneId.length})`
      : (moznosti.find((m) => m.id === vybraneId[0])?.label ?? popisek)

  const prepnout = (idVolby) => {
    if (!vicenasobny) {
      onVyber(vybrano === idVolby ? '' : idVolby)
      setOtevreno(false)
      return
    }
    onVyber(
      vybrano.includes(idVolby) ? vybrano.filter((v) => v !== idVolby) : [...vybrano, idVolby]
    )
  }

  return (
    <div ref={obal} className="relative min-w-0 flex-1">
      <button
        type="button"
        onClick={() => setOtevreno((v) => !v)}
        aria-expanded={otevreno}
        aria-haspopup="listbox"
        aria-controls={id}
        className="flex w-full items-center gap-3 rounded-full px-4 py-3.5 text-left transition-colors hover:bg-white/[0.04] sm:px-5"
      >
        <Ikona
          size={20}
          strokeWidth={1.8}
          aria-hidden
          className={cn('shrink-0 transition-colors', aktivni ? 'text-[var(--lp-pink)]' : 'text-white/65')}
        />
        <span
          className={cn('min-w-0 flex-1 truncate text-[0.97rem]', aktivni ? 'text-white' : 'text-white/80')}
        >
          {napis}
        </span>
        <ChevronDown
          size={18}
          aria-hidden
          className={cn(
            'shrink-0 text-white/55 transition-transform duration-300',
            otevreno && 'rotate-180'
          )}
        />
      </button>

      {otevreno && (
        <div
          id={id}
          role="listbox"
          aria-multiselectable={vicenasobny || undefined}
          className={cn(
            // panel sedí pod lištou s odstupem a sám má vnitřní okraje,
            // takže položky nelepí na hranu
            'absolute top-[calc(100%+0.75rem)] z-30 max-h-[21rem] w-[min(22rem,calc(100vw-2.5rem))] overflow-y-auto',
            'rounded-[1.1rem] border border-white/[0.12] bg-[#120d24] p-2.5',
            'shadow-[0_28px_60px_-20px_rgb(0_0_0/0.9)] backdrop-blur-xl',
            zarovnani === 'vpravo' ? 'right-0' : 'left-0'
          )}
        >
          {moznosti.map((m) => {
            const zvoleno = vybraneId.includes(m.id)
            return (
              <button
                key={m.id}
                type="button"
                role="option"
                aria-selected={zvoleno}
                onClick={() => prepnout(m.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-[0.95rem] transition-colors',
                  zvoleno ? 'bg-[rgb(255_20_102/0.14)] text-white' : 'text-white/80 hover:bg-white/[0.06]'
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    'grid size-5 shrink-0 place-items-center border transition-colors',
                    vicenasobny ? 'rounded-[0.35rem]' : 'rounded-full',
                    zvoleno
                      ? 'border-[var(--lp-pink)] bg-[var(--lp-pink)] text-white'
                      : 'border-white/25'
                  )}
                >
                  {zvoleno && <Check size={13} strokeWidth={3.2} />}
                </span>
                <span className="min-w-0 flex-1 truncate">{m.label}</span>
              </button>
            )
          })}

          {vicenasobny && aktivni && (
            <button
              type="button"
              onClick={() => onVyber([])}
              className="mt-1 w-full rounded-xl px-3.5 py-2.5 text-left text-[0.88rem] text-[var(--lp-pink)] transition-colors hover:bg-white/[0.06]"
            >
              Zrušit výběr
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function UkazkyFiltr({ filtr, setFiltr, skupiny, kategorie, nastroje, pocet }) {
  const neniFiltr = !filtr.skupina && !filtr.kategorie && filtr.nastroje.length === 0

  return (
    <div className="relative z-20">
      <div className="mx-auto w-full max-w-[82rem] px-5 pt-10 sm:px-8 lg:pt-14">
        <div className="flex flex-col gap-2 rounded-[1.6rem] border border-white/[0.1] bg-white/[0.03] p-2 backdrop-blur-sm lg:flex-row lg:items-center lg:gap-0 lg:rounded-full">
          <button
            type="button"
            onClick={() => setFiltr({ skupina: '', kategorie: '', nastroje: [] })}
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

          <Rozbalovac
            ikona={Users}
            popisek="Cílová skupina"
            moznosti={skupiny}
            vybrano={filtr.skupina}
            onVyber={(v) => setFiltr((f) => ({ ...f, skupina: v }))}
          />

          <span aria-hidden className="mx-2 hidden h-7 w-px shrink-0 bg-white/[0.12] lg:block" />

          <Rozbalovac
            ikona={Layers}
            popisek="Kategorie"
            moznosti={kategorie}
            vybrano={filtr.kategorie}
            onVyber={(v) => setFiltr((f) => ({ ...f, kategorie: v }))}
          />

          <span aria-hidden className="mx-2 hidden h-7 w-px shrink-0 bg-white/[0.12] lg:block" />

          <Rozbalovac
            ikona={Wrench}
            popisek="Použité nástroje"
            moznosti={nastroje}
            vybrano={filtr.nastroje}
            onVyber={(v) => setFiltr((f) => ({ ...f, nastroje: v }))}
            vicenasobny
            zarovnani="vpravo"
          />
        </div>

        {/* počet se hlásí i odečítači, aby bylo poznat, že filtr něco udělal */}
        <p aria-live="polite" className="mt-4 min-h-[1.25rem] text-[0.88rem] text-white/50">
          {neniFiltr
            ? null
            : `Vyhovuje ${pocet} ${pocet === 1 ? 'ukázka' : pocet > 1 && pocet < 5 ? 'ukázky' : 'ukázek'}.`}
        </p>
      </div>
    </div>
  )
}
