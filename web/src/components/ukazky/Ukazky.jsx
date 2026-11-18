import { useMemo, useState } from 'react'
import '../landing/landing.css'
import { Backdrop } from '../landing/parts.jsx'
import LandingHeader from '../landing/LandingHeader.jsx'
import LandingFooter from '../landing/LandingFooter.jsx'
import UkazkyHero from './UkazkyHero.jsx'
import UkazkyFiltr from './UkazkyFiltr.jsx'
import UkazkaKarta from './UkazkaKarta.jsx'
import DemoPruh from '../landing/DemoPruh.jsx'
import { categories, products } from '../../data/products.js'
import { audiences } from '../../data/audiences.js'
import { useT } from '../../lib/i18n.jsx'

/**
 * Rozcestník ukázek. Běží v neonovém světě úvodky — nese si tedy i její
 * hlavičku, pozadí a patičku. Jednotlivé ukázky za ním zatím zůstávají
 * v původním vzhledu.
 */
export default function Ukazky() {
  const { pick } = useT()
  const [filtr, setFiltr] = useState({ skupina: '', kategorie: '', nastroje: [] })

  const skupiny = useMemo(
    () => audiences.map((a) => ({ id: a.id, label: pick(a.name) })),
    [pick]
  )

  const kategorie = useMemo(
    () => categories.filter((c) => c.id !== 'all').map((c) => ({ id: c.id, label: pick(c.label) })),
    [pick]
  )

  // Nástroje nikde zvlášť vypsané nejsou — poskládáme je z toho, co ukázky používají.
  const nastroje = useMemo(() => {
    const vsechny = new Set()
    products.forEach((p) => p.stack?.forEach((n) => vsechny.add(n)))
    return [...vsechny].sort((a, b) => a.localeCompare(b, 'cs')).map((n) => ({ id: n, label: n }))
  }, [])

  const videt = useMemo(
    () =>
      products.filter((p) => {
        if (filtr.skupina && !p.forWhom?.includes(filtr.skupina)) return false
        if (filtr.kategorie && !p.categories?.includes(filtr.kategorie)) return false
        // U nástrojů stačí jeden shodný — zaškrtnutí dvou má seznam rozšířit,
        // ne zúžit na ukázky, které používají obojí najednou.
        if (filtr.nastroje.length && !filtr.nastroje.some((n) => p.stack?.includes(n))) return false
        return true
      }),
    [filtr]
  )

  return (
    <div className="lp min-h-screen">
      <Backdrop />
      <LandingHeader />
      <UkazkyHero />

      <UkazkyFiltr
        filtr={filtr}
        setFiltr={setFiltr}
        skupiny={skupiny}
        kategorie={kategorie}
        nastroje={nastroje}
        pocet={videt.length}
      />

      <section className="relative z-10">
        <div className="mx-auto w-full max-w-[82rem] px-5 pb-24 pt-6 sm:px-8 lg:pb-32">
          <DemoPruh className="mb-8 lg:mb-10" />

          {videt.length === 0 ? (
            <p className="rounded-[1.1rem] border border-white/[0.1] bg-white/[0.03] px-7 py-14 text-center text-white/70">
              Téhle kombinaci filtrů zatím žádná ukázka neodpovídá. Zkuste pustit jeden z nich.
            </p>
          ) : (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {videt.map((u) => (
                <li key={u.id}>
                  <UkazkaKarta
                    ukazka={u}
                    nazev={pick(u.title)}
                    popis={pick(u.tagline)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
