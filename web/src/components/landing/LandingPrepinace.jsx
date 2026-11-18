import { Moon, Sun, Waves } from 'lucide-react'
import { cn } from '../../lib/utils.js'
import { usePrefs } from '../../lib/prefs.jsx'

/**
 * Dvojice přepínačů v hlavičce: světlý/tmavý režim a omezení pohybu.
 * Obojí je uložené v nastavení webu, takže volba platí i po přechodu na
 * stránky mimo tenhle vizuální svět.
 *
 * Pozn.: neonové stránky jsou navržené jen v tmavé podobě — přepnutí na
 * světlý režim se na nich neprojeví, ale zbytek webu se přebarví.
 */
export default function LandingPrepinace({ className }) {
  const { theme, toggleTheme, motion, setMotion, reducedMotion } = usePrefs()

  const tlacitko =
    'grid size-9 place-items-center rounded-xl border transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]'

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <button
        type="button"
        onClick={() => setMotion(motion === 'reduced' ? 'full' : 'reduced')}
        aria-pressed={motion === 'reduced'}
        aria-label={reducedMotion ? 'Zapnout animace' : 'Omezit pohyb na stránce'}
        title={reducedMotion ? 'Animace jsou vypnuté' : 'Omezit pohyb'}
        className={cn(
          tlacitko,
          motion === 'reduced'
            ? 'border-[rgb(255_20_102/0.5)] bg-[rgb(255_20_102/0.14)] text-white'
            : 'border-transparent text-white/60 hover:border-white/15 hover:bg-white/[0.07] hover:text-white'
        )}
      >
        <Waves size={17} strokeWidth={2} aria-hidden />
      </button>

      <button
        type="button"
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Přepnout na světlý režim' : 'Přepnout na tmavý režim'}
        title={theme === 'dark' ? 'Světlý režim' : 'Tmavý režim'}
        className={cn(
          tlacitko,
          'border-transparent text-white/60 hover:border-white/15 hover:bg-white/[0.07] hover:text-white'
        )}
      >
        {theme === 'dark' ? (
          <Sun size={17} strokeWidth={2} aria-hidden />
        ) : (
          <Moon size={17} strokeWidth={2} aria-hidden />
        )}
      </button>
    </div>
  )
}
