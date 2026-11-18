import { useMemo, useRef, useState } from 'react'
import qrcode from 'qrcode-generator'
import { Check, Download, QrCode, RotateCcw, Smartphone } from 'lucide-react'
import { cn } from '../../lib/utils.js'
import { useReducedMotion } from '../../lib/prefs.jsx'
import { fakturace, site } from '../../data/site.js'

/**
 * Vizitka, kterou si člověk odnese v telefonu.
 *
 * Dvě cesty k témuž: tlačítko v rohu karty stáhne `.vcf` (otevře se rovnou
 * v kontaktech) a QR kód na rubu nese tentýž soubor — na konferenci stačí
 * namířit foťák. QR se počítá z týchž dat jako vizitka, takže nemůže
 * zestárnout.
 *
 * Ovládání drží na kartě samotné: jeden přepínač u značky QR, jedno stažení
 * v rohu. Velká růžová tlačítka pod kartou dělala ze sekce poutač.
 */

/** Řádky vCardu nesmí obsahovat holé čárky a středníky — escapují se. */
const esc = (hodnota) => String(hodnota).replace(/([,;\\])/g, '\\$1')

export function vytvoritVCard() {
  const telefon = site.phone.replace(/\s/g, '')

  // „186 00 Praha 8 – Karlín" → PSČ a město zvlášť. České PSČ je dvojice
  // skupin, proto se nedá dělit jen podle první mezery.
  const adresa = fakturace.mesto.match(/^(\d{3}\s?\d{2})\s+(.+)$/)
  const psc = adresa ? adresa[1] : ''
  const mesto = adresa ? adresa[2] : fakturace.mesto

  return [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:;${esc(site.person)};;;`,
    `FN:${esc(site.person)}`,
    `ORG:${esc(site.name)};${esc(fakturace.nazev)}`,
    'TITLE:Automatizace a AI',
    `TEL;TYPE=CELL:${telefon}`,
    `EMAIL;TYPE=INTERNET,WORK:${site.email}`,
    `ADR;TYPE=WORK:;;${esc(fakturace.ulice)};${esc(mesto)};;${esc(psc)};Česko`,
    'END:VCARD',
  ].join('\r\n')
}

/**
 * Jeden `path` místo tisíce čtverečků — prohlížeč pak kreslí QR jako jediný
 * tvar a karta se při otáčení nezadrhne.
 */
function qrKresba(text) {
  // Knihovna umí ve výchozím stavu jen jednobajtové znaky — s háčky by vyrobila
  // nesmysl. Bajty si proto spočítáme sami, UTF-8 zvládne každá čtečka.
  qrcode.stringToBytes = (s) => Array.from(new TextEncoder().encode(s))

  // Úroveň korekce L: na obrazovce se QR neumaže ani neohne, takže stačí ta
  // nejnižší — a kostky vyjdou větší, což čtečkám svědčí víc než rezerva.
  const kod = qrcode(0, 'L')
  kod.addData(text, 'Byte')
  kod.make()

  const pocet = kod.getModuleCount()
  const klid = 2 // tichá zóna kolem kódu, bez ní čtečky tápou
  let cesta = ''

  for (let r = 0; r < pocet; r += 1) {
    for (let s = 0; s < pocet; s += 1) {
      if (kod.isDark(r, s)) cesta += `M${s + klid} ${r + klid}h1v1h-1z`
    }
  }
  return { cesta, strana: pocet + klid * 2 }
}

export default function Vizitka() {
  const reduced = useReducedMotion()
  const [otoceno, setOtoceno] = useState(false)
  const [ulozeno, setUlozeno] = useState(false)
  const [naklon, setNaklon] = useState(null)
  const plocha = useRef(null)

  const vcard = useMemo(() => vytvoritVCard(), [])
  const qr = useMemo(() => qrKresba(vcard), [vcard])

  const stahnout = () => {
    const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const odkaz = document.createElement('a')
    odkaz.href = url
    odkaz.download = `${site.name.toLowerCase()}-${site.person.toLowerCase()}.vcf`
    document.body.appendChild(odkaz)
    odkaz.click()
    odkaz.remove()
    setTimeout(() => URL.revokeObjectURL(url), 2000)

    setUlozeno(true)
    setTimeout(() => setUlozeno(false), 2600)
  }

  /* Náklon za myší. Na dotykovém displeji ani s vypnutými animacemi nic. */
  const sledovat = (e) => {
    if (reduced || e.pointerType === 'touch' || !plocha.current) return
    const r = plocha.current.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    setNaklon({ x: -y * 8, y: x * 10 })
  }

  return (
    <div>
      <div className="lp-vizitka" onPointerMove={sledovat} onPointerLeave={() => setNaklon(null)}>
        <div
          style={naklon ? { transform: `rotateX(${naklon.x}deg) rotateY(${naklon.y}deg)` } : undefined}
          className="lp-vizitka-naklon"
        >
          <div ref={plocha} className={cn('lp-vizitka-plocha', otoceno && 'je-otocena')}>
            {/* ── líc ────────────────────────────────────────────────── */}
            <div className="lp-vizitka-strana lp-vizitka-lic">
              <img
                src="/media/makasamo-logo.png"
                alt=""
                width={1592}
                height={250}
                className="h-auto w-[8.5rem]"
              />

              <div className="mt-auto">
                <p className="text-[1.45rem] font-bold leading-tight text-white">{site.person}</p>
                <p className="mt-1 text-[0.88rem] text-[var(--lp-cyan)]">Automatizace &amp; AI</p>
              </div>

              <div className="mt-3.5 space-y-0.5 text-[0.86rem] text-white/70">
                <p>{site.email}</p>
                <p>{site.phone}</p>
              </div>

              <button
                type="button"
                onClick={() => setOtoceno(true)}
                className="lp-vizitka-prepinac"
                aria-label="Ukázat QR kód s kontaktem"
              >
                <QrCode size={15} strokeWidth={2} />
                QR
              </button>
            </div>

            {/* ── rub ────────────────────────────────────────────────── */}
            <div className="lp-vizitka-strana lp-vizitka-rub">
              <svg
                viewBox={`0 0 ${qr.strana} ${qr.strana}`}
                role="img"
                aria-label="QR kód s kontaktem"
                shapeRendering="crispEdges"
                className={cn('lp-qr', otoceno && !reduced && 'lp-qr-nabiha')}
              >
                <rect width={qr.strana} height={qr.strana} fill="#ffffff" />
                <path d={qr.cesta} fill="#140a1e" />
              </svg>

              <div className="min-w-0 flex-1">
                <p className="text-[0.98rem] font-semibold text-[#17101f]">Namiřte foťák</p>
                <p className="mt-1.5 text-[0.86rem] leading-snug text-[#17101f]/65">
                  Telefon rovnou nabídne uložení kontaktu. Jde to i z cizí obrazovky.
                </p>
                <p className="mt-3 flex items-center gap-1.5 whitespace-nowrap text-[0.8rem] font-medium text-[#7c3aed]">
                  <Smartphone size={14} className="shrink-0" />
                  {site.name} · {site.person}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOtoceno(false)}
                className="lp-vizitka-prepinac lp-vizitka-prepinac-rub"
                aria-label="Otočit zpět na vizitku"
              >
                <RotateCcw size={15} strokeWidth={2} />
                Zpět
              </button>
            </div>
          </div>
        </div>

        {/* Stažení sedí na rohu karty a zůstává nahoře i při otočení. */}
        <button type="button" onClick={stahnout} className="lp-vizitka-stahnout">
          {ulozeno ? <Check size={16} strokeWidth={2.6} /> : <Download size={16} strokeWidth={2.1} />}
          {ulozeno ? 'Uloženo' : 'Vizitka .vcf'}
        </button>
      </div>

      <p className="lp-poznamka">
        <span aria-hidden>*</span> Soubor <code>.vcf</code> otevře telefon rovnou v kontaktech.
        Stejná data nese i QR kód — nic se přitom nikam neodesílá.
      </p>
    </div>
  )
}
