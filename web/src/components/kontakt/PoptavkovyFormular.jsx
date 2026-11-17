import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCheck,
  Clock,
  Link as Odkaz,
  Loader2,
  Mail,
  Pencil,
  Phone,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from 'lucide-react'
import { cn } from '../../lib/utils.js'
import { useReducedMotion } from '../../lib/prefs.jsx'
import { useToast } from '../../lib/toast.jsx'
import {
  FORMY,
  KANALY,
  POCTY_LIDI,
  PREDVOLBY,
  ROZPOCTY,
  TEMATA_DOTAZU,
  TERMINY,
  TYPY_SPOLUPRACE,
  UROVNE,
  VELIKOSTI,
  ZAMERY,
  ZDROJE,
} from './formularData.js'
import {
  VYCHOZI_DATA,
  chybaPole,
  chybaZpravy,
  doplnujiciOtazka,
  doporucitSluzbu,
  formatTelefon,
  jePrazdny,
  nabidkaTerminu,
  nacistKoncept,
  navrhEmailu,
  navrhZpravy,
  shrnuti,
  ulozitKoncept,
  vypadaJakoRobot,
  zapomenoutKoncept,
} from './formularLogika.js'
import { Cipy, Hlasovka, Karty, Konfety, Oblast, Otazka, Pole, Posuvnik, Prilohy } from './formularPrvky.jsx'

/**
 * Poptávkový formulář kontaktní stránky.
 *
 * Vede přes čtyři krátké kroky: záměr → detaily podle záměru → zpráva →
 * kontakt. Povinné je jen jméno, e-mail a zpráva; všechno ostatní je
 * volitelné nebo podmíněné, protože každé další povinné pole stojí odeslání.
 *
 * Nic se nikam neposílá — web je ukázka. Rozepsaný text si formulář ukládá
 * do prohlížeče, aby se po návratu dalo pokračovat.
 */

const KROKU = 4
const NADPISY = ['Co vás přivádí?', 'Pár detailů', 'O co jde?', 'Kam se ozvat?']

export default function PoptavkovyFormular() {
  const reduced = useReducedMotion()
  const { push } = useToast()
  const id = useId()

  const [krok, setKrok] = useState(0)
  const [data, setData] = useState(VYCHOZI_DATA)
  const [soubory, setSoubory] = useState([])
  const [hlasovka, setHlasovka] = useState(null)
  const [dotknuto, setDotknuto] = useState({})
  const [pokus, setPokus] = useState(false)
  const [stav, setStav] = useState('editace')
  const [obnoveno, setObnoveno] = useState(false)
  const [pomocnik, setPomocnik] = useState(false)
  const [veta, setVeta] = useState('')
  const [zpetZprava, setZpetZprava] = useState(null)
  const [navrhSkryt, setNavrhSkryt] = useState(false)
  const zacatek = useRef(Date.now())

  const uprav = (zmena) => setData((d) => ({ ...d, ...zmena }))
  const oznacit = (klic) => setDotknuto((t) => ({ ...t, [klic]: true }))

  /* rozepsaný koncept — načíst jednou, ukládat průběžně */
  useEffect(() => {
    const koncept = nacistKoncept()
    if (koncept) {
      setData(koncept)
      setObnoveno(true)
    }
  }, [])

  useEffect(() => {
    if (stav !== 'editace' || jePrazdny(data)) return undefined
    const casovac = setTimeout(() => ulozitKoncept(data), 500)
    return () => clearTimeout(casovac)
  }, [data, stav])

  const sloty = useMemo(() => nabidkaTerminu(), [])
  const doporuceni = useMemo(() => doporucitSluzbu(data.zprava), [data.zprava])
  const otazkaNavic = useMemo(() => doplnujiciOtazka(data), [data])
  const opravaEmailu = useMemo(() => (navrhSkryt ? null : navrhEmailu(data.email)), [data.email, navrhSkryt])
  const rekapitulace = useMemo(() => shrnuti(data), [data])

  /* chyby se ukazují až tam, kde už člověk byl, nebo po pokusu o odeslání */
  const chyba = (klic) => ((dotknuto[klic] || pokus) ? chybaPole(klic, data) : null)
  const chybaTextu = (dotknuto.zprava || pokus) ? chybaZpravy(data, Boolean(hlasovka)) : null

  const chybyKroku = (cislo) => {
    if (cislo === 2) {
      const c = chybaZpravy(data, Boolean(hlasovka))
      return c ? { zprava: c } : {}
    }
    if (cislo === 3) {
      return ['jmeno', 'email', 'telefon', 'souhlas'].reduce((acc, klic) => {
        const c = chybaPole(klic, data)
        return c ? { ...acc, [klic]: c } : acc
      }, {})
    }
    return {}
  }

  const dal = () => {
    const chyby = chybyKroku(krok)
    if (Object.keys(chyby).length > 0) {
      setPokus(true)
      push({ title: 'Ještě kousek', description: Object.values(chyby)[0], variant: 'warn' })
      return
    }
    setPokus(false)
    setKrok((k) => Math.min(KROKU - 1, k + 1))
  }

  const zpet = () => {
    setPokus(false)
    setKrok((k) => Math.max(0, k - 1))
  }

  /* Enter posouvá dál, v textu nechává psát odstavce */
  const klavesa = (e) => {
    if (e.key !== 'Enter' || e.shiftKey || krok === KROKU - 1) return
    if (['TEXTAREA', 'BUTTON', 'A'].includes(e.target.tagName)) return
    e.preventDefault()
    dal()
  }

  const vybratZamer = (zamer) => {
    uprav({ zamer })
    // po výběru se jde rovnou dál — jedno kliknutí navíc nikoho nebaví
    setTimeout(() => setKrok(1), reduced ? 0 : 220)
  }

  const pouzitNavrh = () => {
    setZpetZprava(data.zprava)
    uprav({ zprava: navrhZpravy(veta, data) })
    setPomocnik(false)
    setVeta('')
  }

  const odeslat = (e) => {
    e.preventDefault()
    const chyby = chybyKroku(3)
    if (Object.keys(chyby).length > 0) {
      setPokus(true)
      push({ title: 'Zkontrolujte prosím formulář', description: Object.values(chyby)[0], variant: 'warn' })
      return
    }

    // past na roboty: vyplněné skryté pole nebo odeslání za tři vteřiny
    if (vypadaJakoRobot(data, zacatek.current)) {
      setStav('hotovo')
      return
    }

    setStav('odesilam')
    setTimeout(
      () => {
        setStav('odeslano')
        setTimeout(
          () => {
            setStav('hotovo')
            zapomenoutKoncept()
            push({
              title: 'Hotovo — ale nikam to nešlo',
              description: 'Formulář je součástí dema, žádná data se neodeslala.',
              variant: 'success',
            })
          },
          reduced ? 0 : 650
        )
      },
      reduced ? 0 : 1000
    )
  }

  const zacitZnovu = () => {
    zapomenoutKoncept()
    setData(VYCHOZI_DATA)
    setSoubory([])
    setHlasovka(null)
    setDotknuto({})
    setPokus(false)
    setObnoveno(false)
    setKrok(0)
    setStav('editace')
    zacatek.current = Date.now()
  }

  /* ── po odeslání ────────────────────────────────────────────────────── */
  if (stav === 'hotovo') {
    return (
      <div className="lp-form-card relative z-10 overflow-hidden">
        {!reduced && <Konfety />}
        <div className="relative">
          <motion.span
            initial={reduced ? false : { scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 20 }}
            className="grid size-14 place-items-center rounded-2xl bg-[var(--lp-pink)] text-white"
          >
            <CheckCheck size={28} strokeWidth={2.6} />
          </motion.span>

          <h3 className="mt-5 text-[1.45rem]">Díky, máme to{data.jmeno.trim() ? `, ${data.jmeno.trim().split(' ')[0]}` : ''}!</h3>
          <p className="mt-3 text-[0.98rem] leading-relaxed text-white/70">
            Formulář je součástí dema, takže se žádná data neodeslala. V ostrém provozu by se teď
            stalo tohle:
          </p>

          <ol className="mt-6 space-y-2.5">
            {[
              'Poptávka padne do CRM jako nový kontakt',
              'Založí se úkol „ozvat se do 24 hodin"',
              'Vám přijde potvrzení na e-mail',
              'Podle textu se připraví doporučená ukázka',
            ].map((radek, i) => (
              <motion.li
                key={radek}
                initial={reduced ? false : { opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.12 * i + 0.15, duration: 0.4 }}
                className="flex items-start gap-2.5 text-[0.92rem] text-white/70"
              >
                <Check size={15} strokeWidth={2.6} className="mt-0.5 shrink-0 text-[var(--lp-pink)]" />
                {radek}
              </motion.li>
            ))}
          </ol>

          {doporuceni && (
            <Link
              to={`/ukazky/${doporuceni.slug}`}
              className="lp-navrh mt-7 inline-flex w-auto items-center gap-2 text-left"
            >
              <Sparkles size={16} className="text-[var(--lp-pink)]" />
              Než se ozveme, mrkněte na ukázku: {doporuceni.titulek}
              <ArrowRight size={15} />
            </Link>
          )}

          <button
            type="button"
            onClick={zacitZnovu}
            className="mt-8 block text-[0.95rem] text-[var(--lp-pink)] underline-offset-4 hover:underline"
          >
            Napsat další zprávu
          </button>
        </div>
      </div>
    )
  }

  /* ── formulář ───────────────────────────────────────────────────────── */
  return (
    <form onSubmit={odeslat} onKeyDown={klavesa} noValidate className="lp-form-card relative z-10">
      <div className="flex items-center gap-4">
        <span className="grid size-[2.8rem] shrink-0 place-items-center rounded-2xl border-2 border-[var(--lp-pink)] text-[var(--lp-pink)]">
          <Mail size={23} strokeWidth={2} />
        </span>
        <h2 className="text-[clamp(1.5rem,2.3vw,1.9rem)]">Napište nám</h2>
      </div>

      {obnoveno && (
        <div className="lp-obnoveno mt-5">
          <span>Pokračujeme tam, kde jste minule skončili.</span>
          <button type="button" onClick={zacitZnovu} className="underline underline-offset-2">
            Začít znovu
          </button>
        </div>
      )}

      {/* postup */}
      <div className="mt-6 flex items-center gap-3">
        <p className="lp-krok shrink-0">
          Krok {krok + 1} ze {KROKU}
        </p>
        <div className="flex flex-1 gap-1.5">
          {Array.from({ length: KROKU }, (_, i) => (
            <button
              key={i}
              type="button"
              disabled={i >= krok}
              onClick={() => i < krok && setKrok(i)}
              aria-label={`Krok ${i + 1}: ${NADPISY[i]}`}
              className={cn(
                'h-1 flex-1 rounded-full transition-all duration-500',
                i < krok ? 'cursor-pointer bg-[var(--lp-pink)]' : i === krok ? 'bg-[rgb(255_20_102/0.5)]' : 'bg-white/12'
              )}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={krok}
          initial={reduced ? false : { opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduced ? undefined : { opacity: 0, x: -18 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 min-h-[22rem] space-y-6"
        >
          <p className="text-[1.25rem] font-semibold leading-snug">{NADPISY[krok]}</p>

          {/* ── 1. záměr ─────────────────────────────────────────────── */}
          {krok === 0 && (
            <>
              <Karty moznosti={ZAMERY} hodnota={data.zamer} onZmena={vybratZamer} nazev="Co vás přivádí?" />
              <p className="text-[0.88rem] text-white/50">
                Podle odpovědi se ptáme dál — ať nevyplňujete nic zbytečného.
              </p>
            </>
          )}

          {/* ── 2. detaily podle záměru ──────────────────────────────── */}
          {krok === 1 && (
            <>
              {data.zamer === 'kurz' && (
                <>
                  <Otazka titulek="Kolik lidí budete školit?">
                    <Cipy moznosti={POCTY_LIDI} hodnota={data.pocetLidi} onZmena={(v) => uprav({ pocetLidi: v })} />
                  </Otazka>
                  <Otazka titulek="Jak jsou na tom s technikou?">
                    <Cipy moznosti={UROVNE} hodnota={data.uroven} onZmena={(v) => uprav({ uroven: v })} />
                  </Otazka>
                  <Otazka titulek="Online, nebo osobně?">
                    <Cipy moznosti={FORMY} hodnota={data.forma} onZmena={(v) => uprav({ forma: v })} />
                  </Otazka>
                </>
              )}

              {data.zamer === 'dotaz' && (
                <Otazka titulek="Čeho se dotaz týká?">
                  <Cipy moznosti={TEMATA_DOTAZU} hodnota={data.tema} onZmena={(v) => uprav({ tema: v })} />
                </Otazka>
              )}

              {data.zamer === 'spoluprace' && (
                <Otazka titulek="O jakou spolupráci jde?">
                  <Cipy
                    moznosti={TYPY_SPOLUPRACE}
                    hodnota={data.typSpoluprace}
                    onZmena={(v) => uprav({ typSpoluprace: v })}
                  />
                </Otazka>
              )}

              {data.zamer !== 'dotaz' && (
                <Otazka titulek="Jak velká je firma?">
                  <Cipy moznosti={VELIKOSTI} hodnota={data.velikost} onZmena={(v) => uprav({ velikost: v })} />
                </Otazka>
              )}

              {data.zamer === 'nabidka' && (
                <Otazka titulek="S jakým rozpočtem počítáte?" popis="Orientačně, ať víme, co má smysl navrhnout.">
                  <Posuvnik
                    id={`${id}-rozpocet`}
                    moznosti={ROZPOCTY}
                    index={data.rozpocetIdx}
                    nevim={data.rozpocetNevim}
                    onIndex={(v) => uprav({ rozpocetIdx: v })}
                    onNevim={(v) => uprav({ rozpocetNevim: v })}
                  />
                </Otazka>
              )}

              <Otazka titulek="Kdy by to mělo běžet?">
                <Cipy moznosti={TERMINY} hodnota={data.termin} onZmena={(v) => uprav({ termin: v })} />
              </Otazka>

              <p className="text-[0.88rem] text-white/50">Nic z toho není povinné — klidně pokračujte dál.</p>
            </>
          )}

          {/* ── 3. zpráva ────────────────────────────────────────────── */}
          {krok === 2 && (
            <>
              <Oblast
                id={`${id}-zprava`}
                label="Popište, co řešíte"
                hodnota={data.zprava}
                onZmena={(v) => uprav({ zprava: v })}
                onBlur={() => oznacit('zprava')}
                chyba={chybaTextu}
                placeholder={
                  'Například: Každý den nám přijde 30 objednávek e-mailem a ručně je přepisujeme do Excelu. ' +
                  'Zabere to hodinu denně a občas něco vypadne.'
                }
              />

              {zpetZprava !== null && (
                <button
                  type="button"
                  onClick={() => {
                    uprav({ zprava: zpetZprava })
                    setZpetZprava(null)
                  }}
                  className="text-[0.85rem] text-white/55 underline underline-offset-2 hover:text-white"
                >
                  Vrátit můj původní text
                </button>
              )}

              {/* pomocník s textem — jen šablona, nic se nikam neposílá */}
              <div className="lp-pomocnik">
                <button
                  type="button"
                  onClick={() => setPomocnik((p) => !p)}
                  aria-expanded={pomocnik}
                  className="flex w-full items-center gap-2.5 text-left text-[0.95rem] font-semibold text-white"
                >
                  <WandSparkles size={18} className="text-[var(--lp-pink)]" />
                  Nevíte, jak to napsat?
                </button>

                {pomocnik && (
                  <div className="mt-3.5 space-y-3">
                    <Pole
                      id={`${id}-veta`}
                      label="Řekněte to jednou větou"
                      hodnota={veta}
                      onZmena={setVeta}
                    />
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={pouzitNavrh}
                        disabled={veta.trim().length < 5}
                        className="lp-cip lp-cip-aktivni disabled:opacity-40"
                      >
                        Sestavit zprávu
                      </button>
                      <span className="text-[0.82rem] text-white/50">
                        Poskládá se z vašich odpovědí přímo v prohlížeči.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {otazkaNavic && (
                <div className="lp-navrh">
                  <span className="flex-1">
                    Ještě mě napadá: <strong className="font-semibold text-white">{otazkaNavic.otazka}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      uprav({ zprava: `${data.zprava.trimEnd()}\n\n${otazkaNavic.doplnek}` })
                    }
                    className="shrink-0 text-[var(--lp-pink)] underline underline-offset-2"
                  >
                    Doplnit
                  </button>
                </div>
              )}

              {doporuceni && (
                <div className="lp-navrh">
                  <Sparkles size={16} className="mt-0.5 shrink-0 text-[var(--lp-pink)]" />
                  <span className="flex-1">
                    Tohle zní na <strong className="font-semibold text-white">{doporuceni.titulek}</strong>.
                  </span>
                  <Link
                    to={`/ukazky/${doporuceni.slug}`}
                    className="shrink-0 text-[var(--lp-pink)] underline underline-offset-2"
                  >
                    Ukázka
                  </Link>
                </div>
              )}

              <Prilohy soubory={soubory} onZmena={setSoubory} />
              <Hlasovka nahravka={hlasovka} onZmena={setHlasovka} />

              <Pole
                id={`${id}-loom`}
                label="Odkaz na nahrávku obrazovky (Loom a podobně)"
                hodnota={data.loom}
                onZmena={(v) => uprav({ loom: v })}
                typ="url"
                inputMode="url"
                ikona={Odkaz}
                nepovinne
              />
            </>
          )}

          {/* ── 4. kontakt ───────────────────────────────────────────── */}
          {krok === 3 && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Pole
                  id={`${id}-jmeno`}
                  label="Jméno"
                  hodnota={data.jmeno}
                  onZmena={(v) => uprav({ jmeno: v })}
                  onBlur={() => oznacit('jmeno')}
                  autoComplete="name"
                  chyba={chyba('jmeno')}
                />
                <Pole
                  id={`${id}-email`}
                  label="E-mail"
                  hodnota={data.email}
                  onZmena={(v) => {
                    uprav({ email: v })
                    setNavrhSkryt(false)
                  }}
                  onBlur={() => oznacit('email')}
                  typ="email"
                  inputMode="email"
                  autoComplete="email"
                  chyba={chyba('email')}
                />
              </div>

              {opravaEmailu && (
                <div className="lp-navrh">
                  <span className="flex-1">
                    Mysleli jste <strong className="font-semibold text-white">{opravaEmailu}</strong>?
                  </span>
                  <button
                    type="button"
                    onClick={() => uprav({ email: opravaEmailu })}
                    className="shrink-0 text-[var(--lp-pink)] underline underline-offset-2"
                  >
                    Opravit
                  </button>
                  <button
                    type="button"
                    onClick={() => setNavrhSkryt(true)}
                    className="shrink-0 text-white/50 underline underline-offset-2"
                  >
                    Je to správně
                  </button>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <Pole
                  id={`${id}-telefon`}
                  label="Telefon"
                  hodnota={data.telefon}
                  onZmena={(v) => uprav({ telefon: formatTelefon(v) })}
                  onBlur={() => oznacit('telefon')}
                  typ="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  chyba={chyba('telefon')}
                  nepovinne
                  pred={
                    <select
                      value={data.predvolba}
                      onChange={(e) => uprav({ predvolba: e.target.value })}
                      aria-label="Předvolba"
                      className="lp-predvolba"
                    >
                      {PREDVOLBY.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  }
                />
                <Pole
                  id={`${id}-firma`}
                  label="Firma"
                  hodnota={data.firma}
                  onZmena={(v) => uprav({ firma: v })}
                  autoComplete="organization"
                  nepovinne
                />
              </div>

              <Otazka titulek="Kam se vám nejlíp ozveme?">
                <Cipy moznosti={KANALY} hodnota={data.kanal} onZmena={(v) => uprav({ kanal: v ?? 'email' })} />
                {data.kanal !== 'email' && !data.telefon.trim() && (
                  <p className="lp-napoveda">K tomu budeme potřebovat ještě telefon.</p>
                )}
              </Otazka>

              <Otazka titulek="Chcete rovnou navrhnout termín?" popis="Nezávazně — jen ať se netrefujeme naslepo.">
                <Cipy
                  moznosti={sloty.map((s) => ({ id: s, label: s }))}
                  hodnota={data.slot}
                  onZmena={(v) => uprav({ slot: v })}
                />
              </Otazka>

              <Otazka titulek="Jak jste se o nás dozvěděli?">
                <Cipy moznosti={ZDROJE} hodnota={data.zdroj} onZmena={(v) => uprav({ zdroj: v })} />
              </Otazka>

              {/* rekapitulace — poslední pohled před odesláním */}
              <div className="lp-rekap">
                <p className="text-[0.95rem] font-semibold text-white">Takto jsem vaši poptávku pochopila. Sedí to?</p>
                <dl className="mt-3 space-y-2">
                  {rekapitulace.map((radek) => (
                    <div key={radek.popis} className="flex items-start gap-3 text-[0.88rem]">
                      <dt className="w-[8.5rem] shrink-0 text-white/45">{radek.popis}</dt>
                      <dd className="min-w-0 flex-1 text-white/85">{radek.hodnota}</dd>
                      <button
                        type="button"
                        onClick={() => setKrok(radek.krok)}
                        aria-label={`Upravit: ${radek.popis}`}
                        className="lp-ikona-tlacitko shrink-0"
                      >
                        <Pencil size={14} />
                      </button>
                    </div>
                  ))}
                </dl>
              </div>

              {/* souhlasy — nic předzaškrtnutého */}
              <div className="space-y-3.5">
                <label className="flex cursor-pointer items-start gap-3.5">
                  <input
                    type="checkbox"
                    checked={data.souhlas}
                    onChange={(e) => {
                      uprav({ souhlas: e.target.checked })
                      oznacit('souhlas')
                    }}
                    aria-invalid={Boolean(chyba('souhlas'))}
                    className="lp-checkbox"
                  />
                  <span className="text-[0.86rem] leading-snug text-white/75">
                    Souhlasím se{' '}
                    <Link to="/ochrana-osobnich-udaju" className="underline underline-offset-2">
                      zpracováním osobních údajů
                    </Link>{' '}
                    pro účely odpovědi na můj dotaz.
                  </span>
                </label>
                {chyba('souhlas') && <p className="lp-chyba !mt-0">{chyba('souhlas')}</p>}

                <label className="flex cursor-pointer items-start gap-3.5">
                  <input
                    type="checkbox"
                    checked={data.newsletter}
                    onChange={(e) => uprav({ newsletter: e.target.checked })}
                    className="lp-checkbox"
                  />
                  <span className="text-[0.86rem] leading-snug text-white/75">
                    Posílejte mi občas tipy k automatizaci. <span className="text-white/45">Nepovinné.</span>
                  </span>
                </label>
              </div>

              {/* past na roboty — pole pro lidi neviditelné a mimo tabulátor */}
              <div className="lp-past" aria-hidden>
                <label htmlFor={`${id}-web`}>Web (nevyplňujte)</label>
                <input
                  id={`${id}-web`}
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={data.webUrl}
                  onChange={(e) => uprav({ webUrl: e.target.value })}
                />
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── ovládání ─────────────────────────────────────────────────── */}
      <div className="mt-7 border-t border-white/[0.08] pt-5">
        {krok < KROKU - 1 ? (
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={zpet}
              disabled={krok === 0}
              className="lp-zpet disabled:pointer-events-none disabled:opacity-30"
            >
              <ArrowLeft size={18} />
              Zpět
            </button>
            <button type="button" onClick={dal} className="lp-submit w-auto px-8">
              Pokračovat
              <ArrowRight size={20} strokeWidth={2.4} />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <button type="submit" disabled={stav !== 'editace'} className="lp-submit group">
              {stav === 'odesilam' && <Loader2 size={20} className="animate-spin" />}
              {stav === 'odeslano' && <Check size={20} strokeWidth={2.6} />}
              {stav === 'editace' ? 'Odeslat poptávku' : stav === 'odesilam' ? 'Odesílám…' : 'Odesláno'}
              {stav === 'editace' && (
                <ArrowRight
                  size={22}
                  strokeWidth={2.4}
                  className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
                />
              )}
            </button>

            <div className="flex items-center justify-between gap-3">
              <button type="button" onClick={zpet} className="lp-zpet">
                <ArrowLeft size={18} />
                Zpět
              </button>
              <p className="flex items-center gap-2 text-[0.88rem] text-white/60">
                <Clock size={16} strokeWidth={1.9} />
                Odpovíme do 24 hodin
              </p>
            </div>
          </div>
        )}

        <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[0.86rem] text-white/50">
          <li className="flex items-center gap-2">
            <ShieldCheck size={15} strokeWidth={1.9} />
            Nezavazuje, nespamujeme
          </li>
          <li className="flex items-center gap-2">
            <Phone size={15} strokeWidth={1.9} />
            Vaše data zůstávají u nás
          </li>
        </ul>
      </div>
    </form>
  )
}
