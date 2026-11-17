import { useMemo, useRef, useState } from 'react'
import qrcode from 'qrcode-generator'
import { Check, Download, QrCode, RotateCcw, Smartphone } from 'lucide-react'
import { cn } from '../../lib/utils.js'
import { useReducedMotion } from '../../lib/prefs.jsx'
import { fakturace, site } from '../../data/site.js'

/**
 * Vizitka, kterou si člověk odnese v telefonu.
 *
 * Dvě cesty k témuž: tlačítko stáhne `.vcf` (otevře se rovnou v kontaktech)
 * a QR kód na rubu karty nese tentýž soubor — na konferenci stačí namířit
 * foťák. QR se počítá z těch samých dat jako vizitka, takže nemůže zestárnout.
 */

/** Řádky vCardu nesmí obsahovat holé čárky a středníky — escapují se. */
const esc = (hodnota) => String(hodnota).replace(/([,;\\])/g, '\\$1')

export function vytvoritVCard() {
  const telefon = site.phone.replace(/\s/g, '')
  const [psc, ...mesto] = fakturace.mesto.split(' ')

  return [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:;${esc(site.person)};;;`,
    `FN:${esc(site.person)}`,
    `ORG:${esc(site.name)};${esc(fakturace.nazev)}`,
    `TITLE:${esc(site.role.cs)}`,
    `TEL;TYPE=CELL:${telefon}`,
    `EMAIL;TYPE=INTERNET,WORK:${site.email}`,
    `ADR;TYPE=WORK:;;${esc(fakturace.ulice)};${esc(mesto.join(' '))};;${esc(psc)};Česko`,
    `NOTE:${esc(site.claim.cs)}`,
    'END:VCARD',
  ].join('\r\n')
}

/**
 * Jeden `path` místo tisíce čtverečků — prohlížeč pak kreslí QR jako jediný
 * tvar a karta se při otáčení nezadrhne.
 */
function qrKresba(text) {
  qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8']
  const kod = qrcode(0, 'M')
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
    setNaklon({ x: -y * 9, y: x * 11 })
  }

  return (
    <div className="flex flex-col gap-5">
      <div
        className="lp-vizitka"
        onPointerMove={sledovat}
        onPointerLeave={() => setNaklon(null)}
      >
        <div
          ref={plocha}
          style={naklon ? { transform: `rotateX(${naklon.x}deg) rotateY(${naklon.y}deg)` } : undefined}
          className="lp-vizitka-naklon"
        >
          <button
            type="button"
            onClick={() => setOtoceno((o) => !o)}
            aria-pressed={otoceno}
            aria-label={otoceno ? 'Otočit vizitku na přední stranu' : 'Otočit vizitku a ukázat QR kód'}
            className={cn('lp-vizitka-plocha', otoceno && 'je-otocena')}
          >
            {/* ── líc ──────────────────────────────────────────────── */}
            <span className="lp-vizitka-strana lp-vizitka-lic">
              <img
                src="/media/makasamo-logo.png"
                alt=""
                width={1592}
                height={250}
                className="h-auto w-[8.5rem]"
              />

              <span className="mt-auto block">
                <span className="block text-[1.45rem] font-bold leading-tight text-white">
                  {site.person}
                </span>
                <span className="mt-1 block text-[0.9rem] text-white/60">Automatizace &amp; AI</span>
              </span>

              <span className="mt-4 block space-y-0.5 text-[0.86rem] text-white/70">
                <span className="block">{site.email}</span>
                <span className="block">{site.phone}</span>
              </span>

              <span aria-hidden className="lp-vizitka-otocit">
                <QrCode size={16} />
                QR
              </span>
            </span>

            {/* ── rub ──────────────────────────────────────────────── */}
            <span className="lp-vizitka-strana lp-vizitka-rub">
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

              <span className="min-w-0 flex-1 text-left">
                <span className="block text-[0.95rem] font-semibold text-[#17101f]">
                  Namiřte foťák
                </span>
                <span className="mt-1.5 block text-[0.84rem] leading-snug text-[#17101f]/65">
                  Telefon nabídne uložení kontaktu. Funguje i z cizí obrazovky — třeba když
                  posíláte doporučení kolegovi.
                </span>
                <span className="mt-3 flex items-center gap-1.5 text-[0.8rem] font-medium text-[var(--lp-pink-deep)]">
                  <Smartphone size={14} />
                  {site.name} · {site.person}
                </span>
              </span>
            </span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={stahnout} className="lp-submit w-auto px-7">
          {ulozeno ? <Check size={20} strokeWidth={2.6} /> : <Download size={20} strokeWidth={2.2} />}
          {ulozeno ? 'Staženo' : 'Stáhnout vizitku'}
        </button>

        <button type="button" onClick={() => setOtoceno((o) => !o)} className="lp-cip">
          {otoceno ? <RotateCcw size={16} /> : <QrCode size={16} />}
          {otoceno ? 'Zpět na vizitku' : 'Ukázat QR kód'}
        </button>
      </div>

      <p className="text-[0.86rem] leading-snug text-white/50">
        Soubor <code className="text-white/70">.vcf</code> otevře telefon rovnou v kontaktech.
        Stejná data nese i QR kód — nic se přitom nikam neodesílá.
      </p>
    </div>
  )
}
