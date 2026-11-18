import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils.js'

/**
 * Přepínač jazyka — malé tlačítko s kódem, po rozkliknutí nabídka.
 *
 * Nabídka je schválně seznam, ne dvojice tlačítek: jazyků může časem přibýt
 * a tenhle tvar unese pět položek stejně dobře jako dvě.
 *
 * Zatím jen přepíná vlastní stav; překlady obsahu se teprve chystají, proto
 * jsou nehotové jazyky označené a volba nikam neukládá.
 */
const JAZYKY = [
  { kod: 'cs', nazev: 'Čeština', hotovo: true },
  { kod: 'en', nazev: 'English', hotovo: false },
]

export default function LandingLang({ className }) {
  const [jazyk, setJazyk] = useState('cs')
  const [otevreno, setOtevreno] = useState(false)
  const obal = useRef(null)

  useEffect(() => {
    if (!otevreno) return
    const mimo = (e) => {
      if (obal.current && !obal.current.contains(e.target)) setOtevreno(false)
    }
    const klavesa = (e) => e.key === 'Escape' && setOtevreno(false)
    document.addEventListener('mousedown', mimo)
    document.addEventListener('keydown', klavesa)
    return () => {
      document.removeEventListener('mousedown', mimo)
      document.removeEventListener('keydown', klavesa)
    }
  }, [otevreno])

  return (
    <div ref={obal} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOtevreno((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={otevreno}
        aria-label={`Jazyk: ${JAZYKY.find((j) => j.kod === jazyk)?.nazev}`}
        className={cn(
          'flex items-center gap-1 rounded-lg px-1.5 py-1 text-[0.8rem] font-semibold uppercase tracking-[0.08em] transition-colors',
          otevreno ? 'bg-white/[0.1] text-white' : 'text-white/55 hover:text-white'
        )}
      >
        {jazyk}
        <ChevronDown
          size={13}
          strokeWidth={2.4}
          aria-hidden
          className={cn('transition-transform duration-300', otevreno && 'rotate-180')}
        />
      </button>

      {otevreno && (
        <ul
          role="listbox"
          aria-label="Jazyk webu"
          className="absolute right-0 top-[calc(100%+0.4rem)] z-50 min-w-[9rem] overflow-hidden rounded-xl border border-white/[0.1] bg-[rgb(12_8_26/0.97)] py-1 shadow-[0_20px_50px_-20px_rgb(0_0_0/0.9)] backdrop-blur-xl"
        >
          {JAZYKY.map((j) => (
            <li key={j.kod}>
              <button
                type="button"
                role="option"
                aria-selected={j.kod === jazyk}
                onClick={() => {
                  setJazyk(j.kod)
                  setOtevreno(false)
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-[0.88rem] text-white/85 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                <Check
                  size={14}
                  strokeWidth={2.6}
                  aria-hidden
                  className={cn(
                    'shrink-0 text-[var(--lp-pink)]',
                    j.kod === jazyk ? 'opacity-100' : 'opacity-0'
                  )}
                />
                <span className="flex-1">{j.nazev}</span>
                {!j.hotovo && (
                  <span className="text-[0.68rem] uppercase tracking-[0.08em] text-white/35">
                    brzy
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
