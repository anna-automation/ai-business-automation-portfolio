import { cn } from '../../lib/utils.js'

/**
 * Náhled ukázky — stylizované okno aplikace, jaké je na předloze v hlavičce
 * každé dlaždice. Je to kresba, ne screenshot: drží se neonové palety, váží
 * nula bajtů navíc a nezastará, když se demo uvnitř změní.
 *
 * Vzor se vybírá podle klíče dema; neznámý klíč spadne na okno se seznamem.
 */

const VZOR_PODLE_DEMA = {
  workflow: 'uzly',
  inbox: 'seznam',
  crm: 'kanban',
  tasks: 'kanban',
  calculator: 'formular',
  booking: 'kalendar',
  documents: 'dokument',
  quote: 'dokument',
  assistant: 'chat',
  dashboard: 'graf',
}

const RUZOVA = '#ff1466'
const CYAN = '#22d3ee'

/** Okenní rám s titulkovým pruhem — společný pro všechny vzory. */
function Okno({ children }) {
  return (
    <svg viewBox="0 0 320 190" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="lp-okno-plocha" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#15102a" />
          <stop offset="1" stopColor="#0c0918" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="320" height="190" rx="10" fill="url(#lp-okno-plocha)" />
      <rect
        x="0.5"
        y="0.5"
        width="319"
        height="189"
        rx="9.5"
        fill="none"
        stroke="rgb(255 255 255 / 0.12)"
      />

      {/* titulkový pruh */}
      <path d="M0 10a10 10 0 0 1 10-10h300a10 10 0 0 1 10 10v12H0z" fill="rgb(255 255 255 / 0.05)" />
      <circle cx="14" cy="11" r="3" fill={RUZOVA} opacity="0.85" />
      <circle cx="26" cy="11" r="3" fill="rgb(255 255 255 / 0.25)" />
      <circle cx="38" cy="11" r="3" fill="rgb(255 255 255 / 0.25)" />
      <rect x="120" y="7" width="80" height="8" rx="4" fill="rgb(255 255 255 / 0.07)" />

      {children}
    </svg>
  )
}

/** Vodorovný proužek textu. */
function Radek({ x, y, w, o = 0.22, h = 6 }) {
  return <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={`rgb(255 255 255 / ${o})`} />
}

function Kanban() {
  const sloupce = [16, 118, 220]
  const karty = [
    [0, 1, 2],
    [0, 1],
    [0, 1, 2],
  ]
  return (
    <>
      {sloupce.map((x, s) => (
        <g key={x}>
          <rect x={x} y={34} width={84} height={142} rx="7" fill="rgb(255 255 255 / 0.035)" />
          <Radek x={x + 10} y={44} w={38} o={0.3} h={5} />
          {karty[s].map((k) => (
            <g key={k}>
              <rect
                x={x + 8}
                y={60 + k * 36}
                width={68}
                height={28}
                rx="5"
                fill="rgb(255 255 255 / 0.06)"
                stroke={s === 0 && k === 0 ? RUZOVA : 'rgb(255 255 255 / 0.08)'}
                strokeWidth={s === 0 && k === 0 ? 1.2 : 1}
              />
              <Radek x={x + 15} y={67 + k * 36} w={46} o={0.26} h={4} />
              <rect
                x={x + 15}
                y={76 + k * 36}
                width={16}
                height={5}
                rx="2.5"
                fill={k % 2 ? CYAN : RUZOVA}
                opacity="0.75"
              />
            </g>
          ))}
        </g>
      ))}
    </>
  )
}

function Seznam() {
  return (
    <>
      <rect x="14" y="34" width="70" height="142" rx="7" fill="rgb(255 255 255 / 0.035)" />
      {[0, 1, 2, 3].map((i) => (
        <Radek key={i} x={24} y={48 + i * 20} w={48} o={i === 0 ? 0.34 : 0.16} h={5} />
      ))}

      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <rect
            x="94"
            y={36 + i * 28}
            width="212"
            height="22"
            rx="5"
            fill={i === 0 ? 'rgb(255 20 102 / 0.1)' : 'rgb(255 255 255 / 0.04)'}
            stroke={i === 0 ? RUZOVA : 'transparent'}
            strokeWidth="1"
          />
          <circle cx="106" cy={47 + i * 28} r="4" fill={i % 2 ? CYAN : RUZOVA} opacity="0.8" />
          <Radek x={118} y={42 + i * 28} w={i % 2 ? 108 : 138} o={0.24} h={5} />
          <Radek x={262} y={42 + i * 28} w={32} o={0.12} h={5} />
        </g>
      ))}
    </>
  )
}

function Uzly() {
  const uzly = [
    { x: 40, y: 62 },
    { x: 130, y: 62 },
    { x: 130, y: 134 },
    { x: 232, y: 98 },
  ]
  return (
    <>
      <path
        d="M72 70h26M162 70h18c10 0 10 28 20 28M162 142h18c10 0 10-28 20-28"
        stroke={RUZOVA}
        strokeWidth="1.6"
        fill="none"
        opacity="0.8"
      />
      {uzly.map((u, i) => (
        <g key={i}>
          <rect
            x={u.x}
            y={u.y - 16}
            width={i === 3 ? 56 : 64}
            height="32"
            rx="7"
            fill="rgb(255 255 255 / 0.06)"
            stroke={i === 0 ? RUZOVA : i === 3 ? CYAN : 'rgb(255 255 255 / 0.14)'}
            strokeWidth="1.2"
          />
          <circle cx={u.x + 14} cy={u.y} r="5" fill={i === 3 ? CYAN : RUZOVA} opacity="0.85" />
          <Radek x={u.x + 24} y={u.y - 3} w={i === 3 ? 22 : 30} o={0.26} h={5} />
        </g>
      ))}
    </>
  )
}

function Formular() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Radek x={20} y={42 + i * 36} w={54} o={0.2} h={5} />
          <rect
            x="20"
            y={52 + i * 36}
            width="150"
            height="22"
            rx="5"
            fill="rgb(255 255 255 / 0.05)"
            stroke={i === 1 ? RUZOVA : 'rgb(255 255 255 / 0.1)'}
            strokeWidth="1"
          />
          <Radek x={30} y={60 + i * 36} w={i === 1 ? 86 : 60} o={0.24} h={5} />
        </g>
      ))}

      {/* výsledek */}
      <rect
        x="190"
        y="42"
        width="116"
        height="134"
        rx="8"
        fill="rgb(255 20 102 / 0.08)"
        stroke={RUZOVA}
        strokeWidth="1.2"
      />
      <Radek x={204} y={56} w={54} o={0.3} h={5} />
      <rect x="204" y="76" width="78" height="18" rx="4" fill={RUZOVA} opacity="0.85" />
      <Radek x={204} y={110} w={88} o={0.16} h={5} />
      <Radek x={204} y={124} w={64} o={0.16} h={5} />
      <rect
        x="204"
        y="146"
        width="60"
        height="16"
        rx="8"
        fill="none"
        stroke={CYAN}
        strokeWidth="1.2"
      />
    </>
  )
}

function Kalendar() {
  return (
    <>
      <Radek x={20} y={38} w={70} o={0.3} h={6} />
      {[0, 1, 2, 3, 4, 5, 6].map((d) => (
        <Radek key={d} x={20 + d * 42} y={56} w={22} o={0.14} h={4} />
      ))}
      {[0, 1, 2, 3].map((r) =>
        [0, 1, 2, 3, 4, 5, 6].map((d) => {
          const aktivni = (r === 1 && d === 2) || (r === 2 && d === 4)
          return (
            <rect
              key={`${r}-${d}`}
              x={20 + d * 42}
              y={70 + r * 26}
              width="34"
              height="20"
              rx="4"
              fill={aktivni ? 'rgb(255 20 102 / 0.75)' : 'rgb(255 255 255 / 0.045)'}
              stroke={aktivni ? RUZOVA : 'transparent'}
              strokeWidth="1"
            />
          )
        })
      )}
      <rect x="20" y="176" width="286" height="2" rx="1" fill={CYAN} opacity="0.4" />
    </>
  )
}

function Dokument() {
  return (
    <>
      {/* vstup */}
      <rect
        x="18"
        y="36"
        width="118"
        height="140"
        rx="7"
        fill="rgb(255 255 255 / 0.04)"
        stroke="rgb(255 255 255 / 0.1)"
      />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Radek key={i} x={30} y={52 + i * 18} w={i === 5 ? 56 : 94} o={0.14} h={5} />
      ))}

      {/* šipka */}
      <path
        d="M146 106h26m0 0-8-7m8 7-8 7"
        stroke={RUZOVA}
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* výstup */}
      <rect
        x="184"
        y="36"
        width="118"
        height="140"
        rx="7"
        fill="rgb(255 20 102 / 0.07)"
        stroke={RUZOVA}
        strokeWidth="1.2"
      />
      <Radek x={196} y={50} w={62} o={0.34} h={6} />
      {[0, 1, 2, 3].map((i) => (
        <Radek key={i} x={196} y={72 + i * 18} w={i === 3 ? 48 : 92} o={0.2} h={5} />
      ))}
      <rect x="196" y="150" width="46" height="14" rx="7" fill={CYAN} opacity="0.7" />
    </>
  )
}

function Chat() {
  const zpravy = [
    { x: 20, w: 150, prava: false },
    { x: 150, w: 152, prava: true },
    { x: 20, w: 120, prava: false },
    { x: 118, w: 184, prava: true },
  ]
  return (
    <>
      {zpravy.map((z, i) => (
        <g key={i}>
          <rect
            x={z.x}
            y={38 + i * 34}
            width={z.w}
            height="26"
            rx="8"
            fill={z.prava ? 'rgb(255 20 102 / 0.14)' : 'rgb(255 255 255 / 0.05)'}
            stroke={z.prava ? RUZOVA : 'rgb(255 255 255 / 0.08)'}
            strokeWidth="1"
          />
          <Radek x={z.x + 12} y={47 + i * 34} w={z.w - 34} o={0.22} h={5} />
        </g>
      ))}
      <rect
        x="20"
        y="172"
        width="282"
        height="2"
        rx="1"
        fill="rgb(255 255 255 / 0.08)"
      />
    </>
  )
}

function Graf() {
  const sloupce = [38, 62, 46, 88, 70, 104, 92]
  return (
    <>
      {/* dlaždice s čísly */}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect
            x={18 + i * 98}
            y={34}
            width="88"
            height="40"
            rx="6"
            fill="rgb(255 255 255 / 0.045)"
            stroke={i === 0 ? RUZOVA : 'rgb(255 255 255 / 0.08)'}
            strokeWidth="1"
          />
          <Radek x={28 + i * 98} y={43} w={34} o={0.18} h={4} />
          <Radek x={28 + i * 98} y={54} w={52} o={0.34} h={8} />
        </g>
      ))}

      {/* sloupcový graf */}
      {sloupce.map((v, i) => (
        <rect
          key={i}
          x={20 + i * 42}
          y={176 - v}
          width="24"
          height={v}
          rx="4"
          fill={i === 5 ? RUZOVA : 'rgb(255 255 255 / 0.12)'}
          opacity={i === 5 ? 0.9 : 1}
        />
      ))}
      <path
        d="M20 150 L62 136 L104 142 L146 118 L188 126 L230 102 L272 110"
        stroke={CYAN}
        strokeWidth="1.6"
        fill="none"
        opacity="0.7"
      />
    </>
  )
}

const VZORY = {
  kanban: Kanban,
  seznam: Seznam,
  uzly: Uzly,
  formular: Formular,
  kalendar: Kalendar,
  dokument: Dokument,
  chat: Chat,
  graf: Graf,
}

export default function UkazkaNahled({ demo, className }) {
  const Vzor = VZORY[VZOR_PODLE_DEMA[demo] ?? 'seznam'] ?? Seznam

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[0.85rem] border border-white/[0.09] bg-[#0b0817]',
        className
      )}
    >
      <Okno>
        <Vzor />
      </Okno>
      {/* neonový nádech přes okno, aby náhled nebyl plochý */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_15%_0%,rgb(255_20_102/0.16)_0%,transparent_58%),radial-gradient(90%_80%_at_100%_100%,rgb(34_211_238/0.12)_0%,transparent_62%)]"
      />
    </div>
  )
}
