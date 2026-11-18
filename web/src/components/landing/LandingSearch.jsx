import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { cn } from '../../lib/utils.js'
import { hledej, zvyrazni } from '../../lib/hledani.js'

/**
 * Vyhledávání v hlavičce s našeptávačem.
 *
 * Výsledky se počítají při psaní z místního indexu — žádné volání na server.
 * Dotaz se porovnává na kmenech slov, takže „automatizaci“ najde
 * „Automatizace e-mailů“ a „fakturám“ najde „faktury“.
 *
 * Ovládání odpovídá tomu, co lidé znají z vyhledávačů: šipky procházejí
 * návrhy, Enter otevře vybraný, Esc zavře.
 */
export default function LandingSearch({ className, smerVzhuru = false, maly = false }) {
  const navigate = useNavigate()
  const id = useId()
  const obal = useRef(null)
  const vstup = useRef(null)
  const seznam = useRef(null)

  const [dotaz, setDotaz] = useState('')
  const [otevreno, setOtevreno] = useState(false)
  const [aktivni, setAktivni] = useState(0)

  const navrhy = useMemo(() => hledej(dotaz), [dotaz])

  // Kliknutí mimo zavře našeptávač.
  useEffect(() => {
    if (!otevreno) return
    const mimo = (e) => {
      if (obal.current && !obal.current.contains(e.target)) setOtevreno(false)
    }
    document.addEventListener('mousedown', mimo)
    return () => document.removeEventListener('mousedown', mimo)
  }, [otevreno])

  useEffect(() => setAktivni(0), [dotaz])

  // Vybraná položka musí zůstat ve výřezu i při procházení šipkami.
  useEffect(() => {
    seznam.current?.querySelector('[data-aktivni="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [aktivni])

  const otevri = (polozka) => {
    if (!polozka) return
    setOtevreno(false)
    setDotaz('')
    vstup.current?.blur()
    navigate(polozka.cesta)
  }

  const naKlavesu = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (navrhy.length) setAktivni((i) => (i + 1) % navrhy.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (navrhy.length) setAktivni((i) => (i - 1 + navrhy.length) % navrhy.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      otevri(navrhy[aktivni])
    } else if (e.key === 'Escape') {
      e.preventDefault()
      if (dotaz) setDotaz('')
      else setOtevreno(false)
    }
  }

  const zobrazit = otevreno && dotaz.trim().length >= 2

  return (
    <div ref={obal} className={cn('relative', className)}>
      <div className={cn('lp-search', maly && 'lp-search-maly')}>
        <Search
          size={maly ? 15 : 17}
          strokeWidth={2.2}
          aria-hidden
          className="shrink-0 text-white/50"
        />
        <input
          ref={vstup}
          type="text"
          value={dotaz}
          onChange={(e) => {
            setDotaz(e.target.value)
            setOtevreno(true)
          }}
          onFocus={() => setOtevreno(true)}
          onKeyDown={naKlavesu}
          placeholder="Hledat"
          aria-label="Hledat na webu"
          role="combobox"
          aria-expanded={zobrazit}
          aria-controls={`${id}-navrhy`}
          aria-autocomplete="list"
          aria-activedescendant={zobrazit && navrhy.length ? `${id}-polozka-${aktivni}` : undefined}
          autoComplete="off"
          className={cn(
            'w-full bg-transparent text-white outline-none placeholder:text-white/40',
            maly ? 'text-[0.86rem]' : 'text-[0.95rem]'
          )}
        />
        {dotaz && (
          <button
            type="button"
            onClick={() => {
              setDotaz('')
              vstup.current?.focus()
            }}
            aria-label="Vymazat hledání"
            className="-mr-1 shrink-0 rounded-lg p-1 text-white/50 transition-colors hover:text-white"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {zobrazit && (
        <div
          ref={seznam}
          id={`${id}-navrhy`}
          role="listbox"
          aria-label="Návrhy"
          className={cn('lp-search-navrhy', smerVzhuru && 'lp-search-navrhy-nahoru')}
        >
          {navrhy.length === 0 ? (
            <p className="px-4 py-5 text-center text-[0.9rem] text-white/55">
              Nic jsme nenašli. Zkuste jiné slovo.
            </p>
          ) : (
            navrhy.map((p, i) => (
              <button
                key={`${p.cesta}-${p.nazev}`}
                type="button"
                id={`${id}-polozka-${i}`}
                role="option"
                aria-selected={i === aktivni}
                data-aktivni={i === aktivni}
                onMouseEnter={() => setAktivni(i)}
                onClick={() => otevri(p)}
                className={cn(
                  'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors',
                  i === aktivni ? 'bg-[rgb(255_20_102/0.14)]' : 'hover:bg-white/[0.05]'
                )}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.95rem] font-semibold text-white">
                    {zvyrazni(p.nazev, dotaz).map((c, j) => (
                      <span key={j} className={c.shoda ? 'text-[var(--lp-pink)]' : undefined}>
                        {c.text}
                      </span>
                    ))}
                  </span>
                  {p.popis && (
                    <span className="mt-0.5 block truncate text-[0.82rem] text-white/55">
                      {p.popis}
                    </span>
                  )}
                </span>
                <span className="mt-0.5 shrink-0 rounded-md border border-white/12 px-2 py-0.5 text-[0.68rem] uppercase tracking-[0.08em] text-white/50">
                  {p.druh}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
