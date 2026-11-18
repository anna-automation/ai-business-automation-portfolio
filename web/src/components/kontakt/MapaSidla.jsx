import { useEffect, useRef, useState } from 'react'
import { ExternalLink, MapPin, Navigation } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import { fakturace, site } from '../../data/site.js'

/**
 * Živá mapa sídla. Leaflet nad tmavými dlaždicemi CARTO, aby mapa seděla do
 * neonového světa webu — klasické světlé dlaždice by v téhle stránce svítily
 * jako svíčka.
 *
 * Dvě věci kvůli chování stránky:
 * — knihovna se načítá až v prohlížeči (`import()` v efektu), protože při
 *   serverovém renderu sahá po `document` a spadla by;
 * — kolečko myši mapu nezvětšuje, dokud do ní člověk neklikne. Jinak se na ní
 *   zasekne scrollování celé stránky.
 */

/* Pernerova 51, Karlín. Souřadnice jsou zaokrouhlené na úroveň bloku. */
const SIDLO = [50.0928, 14.4512]

export default function MapaSidla({ kompaktni = false }) {
  const plocha = useRef(null)
  const mapaRef = useRef(null)
  const [aktivni, setAktivni] = useState(false)

  useEffect(() => {
    let zruseno = false
    let mapa = null

    import('leaflet').then(({ default: L }) => {
      if (zruseno || !plocha.current || mapaRef.current) return

      mapa = L.map(plocha.current, {
        center: SIDLO,
        zoom: 14,
        zoomControl: false,
        scrollWheelZoom: false,
        attributionControl: true,
      })
      mapaRef.current = mapa

      L.control.zoom({ position: 'topright' }).addTo(mapa)

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(mapa)

      // značka je kus HTML, ne obrázek — tep se pak dá udělat v CSS
      const znacka = L.divIcon({
        className: 'lp-mapa-znacka',
        html: '<span class="lp-mapa-tep"></span><span class="lp-mapa-bod"></span>',
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      })

      L.marker(SIDLO, { icon: znacka, title: `${site.name} — ${fakturace.mesto}` })
        .addTo(mapa)
        .bindPopup(
          `<strong>${site.name}</strong><br>${fakturace.ulice}<br>${fakturace.mesto}`
        )

      // po doskládání rozvržení si mapa musí přeměřit plochu
      setTimeout(() => mapa.invalidateSize(), 250)
    })

    return () => {
      zruseno = true
      if (mapaRef.current) {
        mapaRef.current.remove()
        mapaRef.current = null
      }
    }
  }, [])

  const probudit = () => {
    if (aktivni || !mapaRef.current) return
    mapaRef.current.scrollWheelZoom.enable()
    setAktivni(true)
  }

  const naSidlo = () => {
    mapaRef.current?.flyTo(SIDLO, 16, { duration: 1.1 })
  }

  const odkaz = `https://www.openstreetmap.org/?mlat=${SIDLO[0]}&mlon=${SIDLO[1]}#map=17/${SIDLO[0]}/${SIDLO[1]}`

  return (
    <div
      className={`lp-neon lp-mapa${kompaktni ? ' lp-mapa--kompakt' : ''}`}
      style={{
        '--lp-neon-width': '1.5px',
        '--lp-neon-blur': '16px',
        '--lp-neon-glow': '0.7',
        '--lp-neon-gradient':
          'linear-gradient(104deg,#7c3aed 0%,#22d3ee 42%,#22d3ee 62%,#ff1466 100%)',
      }}
    >
      <div className="lp-mapa-ramec">
        <div ref={plocha} onPointerDown={probudit} className="lp-mapa-plocha" />

        {/* kartička s adresou sedí na mapě, ne vedle ní */}
        <div className="lp-mapa-stitek">
          <p className="flex items-center gap-2 text-[1rem] font-semibold text-white">
            <MapPin size={17} strokeWidth={2.2} className="shrink-0 text-[var(--lp-pink)]" />
            {fakturace.ulice}
          </p>
          <p className="mt-1 text-[0.9rem] text-white/60">{fakturace.mesto}</p>
          {!kompaktni && (
            <p className="mt-2.5 text-[0.84rem] leading-snug text-white/50">{site.location.cs}</p>
          )}

          <div className={kompaktni ? 'mt-2.5 flex flex-wrap gap-2' : 'mt-3.5 flex flex-wrap gap-2'}>
            <button type="button" onClick={naSidlo} className="lp-mapa-tlacitko">
              <Navigation size={14} strokeWidth={2.2} />
              Ukázat sídlo
            </button>
            <a href={odkaz} target="_blank" rel="noreferrer noopener" className="lp-mapa-tlacitko">
              <ExternalLink size={14} strokeWidth={2.2} />
              Otevřít v mapách
            </a>
          </div>
        </div>

        {!aktivni && (
          <p className="lp-mapa-napoveda">Klepnutím do mapy zapnete přibližování kolečkem</p>
        )}
      </div>
    </div>
  )
}
