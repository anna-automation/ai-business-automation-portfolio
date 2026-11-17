import { cn } from '../../lib/utils.js'

/**
 * Klidový náhled karty ukázky — schematický nákres toho, co uvnitř je.
 *
 * Živé demo se mountuje až při najetí myší (deset běžících animací naráz by
 * byla zbytečná zátěž). Aby karta mezitím nepůsobila prázdně, drží místo
 * statická kresba. Je to zároveň čitelné i pro toho, kdo myš nemá.
 *
 * Všechno je inline SVG s `currentColor` a tokeny, takže to sedí v obou
 * režimech bez jediného obrázku.
 */

const S = {
  line: 'stroke-line-strong',
  fill: 'fill-line',
  soft: 'fill-surface-2',
  accent: 'fill-accent',
  accentStroke: 'stroke-accent',
  violet: 'fill-violet',
  coral: 'fill-coral',
  muted: 'fill-muted',
}

function Frame({ children, className }) {
  return (
    <svg
      viewBox="0 0 300 150"
      className={cn('h-full w-full', className)}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      {children}
    </svg>
  )
}

/** Řetěz bloků se spojnicemi — proces od spouštěče k výsledku. */
function WorkflowSketch() {
  const blocks = [18, 92, 166, 240]
  return (
    <Frame>
      {blocks.map((x, i) => (
        <g key={x}>
          {i < blocks.length - 1 && (
            <path
              d={`M${x + 42} 72 H${x + 72}`}
              className={i === 0 ? S.accentStroke : S.line}
              strokeWidth="1.5"
              strokeDasharray={i === 0 ? undefined : '3 3'}
              fill="none"
            />
          )}
          <rect
            x={x}
            y={52}
            width={42}
            height={40}
            rx="7"
            className={cn(S.soft, i === 0 ? S.accentStroke : S.line)}
            strokeWidth="1"
          />
          <rect x={x + 8} y={62} width={16} height={3} rx="1.5" className={i === 0 ? S.accent : S.fill} />
          <rect x={x + 8} y={70} width={26} height={2.5} rx="1.25" className={S.fill} />
          <rect x={x + 8} y={77} width={20} height={2.5} rx="1.25" className={S.fill} />
        </g>
      ))}
      <circle cx="80" cy="72" r="3" className={S.accent} />
    </Frame>
  )
}

/** Seznam zpráv s barevnými štítky. */
function InboxSketch() {
  const rows = [0, 1, 2, 3, 4]
  const tones = [S.accent, S.violet, S.coral, S.fill, S.accent]
  return (
    <Frame>
      {rows.map((i) => (
        <g key={i} transform={`translate(0, ${18 + i * 25})`}>
          <rect x="16" y="0" width="268" height="20" rx="5" className={cn(S.soft, S.line)} strokeWidth="0.8" />
          <circle cx="29" cy="10" r="4" className={S.fill} />
          <rect x="40" y="6" width={70 - i * 6} height="3" rx="1.5" className={S.fill} />
          <rect x="40" y="13" width={110 - i * 10} height="2.5" rx="1.25" className={S.fill} opacity="0.6" />
          <rect x="236" y="5.5" width="36" height="9" rx="4.5" className={tones[i]} opacity="0.85" />
        </g>
      ))}
    </Frame>
  )
}

/** Tři sloupce pipeline s kartami. */
function CrmSketch() {
  const columns = [20, 110, 200]
  const counts = [3, 2, 1]
  return (
    <Frame>
      {columns.map((x, c) => (
        <g key={x}>
          <rect x={x} y="14" width="80" height="124" rx="7" className={cn(S.soft, S.line)} strokeWidth="0.8" />
          <rect x={x + 10} y="24" width="34" height="3" rx="1.5" className={S.fill} />
          {Array.from({ length: counts[c] }, (_, i) => (
            <g key={i} transform={`translate(${x + 8}, ${36 + i * 30})`}>
              <rect
                width="64"
                height="24"
                rx="5"
                className={cn('fill-surface', c === 1 && i === 0 ? S.accentStroke : S.line)}
                strokeWidth="1"
              />
              <circle cx="11" cy="12" r="5" className={c === 1 && i === 0 ? S.accent : S.fill} />
              <rect x="21" y="7" width="32" height="3" rx="1.5" className={S.fill} />
              <rect x="21" y="14" width="22" height="2.5" rx="1.25" className={S.fill} opacity="0.6" />
            </g>
          ))}
        </g>
      ))}
    </Frame>
  )
}

/** Posuvník a velké číslo ceny. */
function CalculatorSketch() {
  return (
    <Frame>
      <rect x="20" y="22" width="150" height="8" rx="4" className={S.fill} />
      <rect x="20" y="22" width="92" height="8" rx="4" className={S.accent} />
      <circle cx="112" cy="26" r="9" className={cn('fill-surface', S.accentStroke)} strokeWidth="2" />

      <rect x="20" y="52" width="150" height="6" rx="3" className={S.fill} />
      <rect x="20" y="52" width="48" height="6" rx="3" className={S.violet} opacity="0.7" />
      <circle cx="68" cy="55" r="7" className={cn('fill-surface', S.line)} strokeWidth="1.5" />

      <rect x="20" y="76" width="150" height="6" rx="3" className={S.fill} />
      <rect x="20" y="76" width="118" height="6" rx="3" className={S.fill} opacity="0.5" />
      <circle cx="138" cy="79" r="7" className={cn('fill-surface', S.line)} strokeWidth="1.5" />

      {/* cena */}
      <rect x="196" y="20" width="84" height="66" rx="8" className={cn(S.soft, S.accentStroke)} strokeWidth="1" />
      <rect x="208" y="32" width="30" height="3" rx="1.5" className={S.fill} />
      <rect x="208" y="44" width="60" height="12" rx="3" className={S.accent} />
      <rect x="208" y="64" width="42" height="3" rx="1.5" className={S.fill} opacity="0.7" />

      {/* návratnost */}
      <path d="M20 128 L80 118 L140 104 L200 96 L280 92" className={S.accentStroke} strokeWidth="1.5" fill="none" />
      <path d="M20 100 L90 110 L160 118 L230 126 L280 130" className="stroke-coral" strokeWidth="1.2" fill="none" opacity="0.65" />
      <circle cx="112" cy="112" r="3.5" className={S.accent} />
    </Frame>
  )
}

/** Kalendářní mřížka s volnými a obsazenými dny. */
function BookingSketch() {
  const taken = new Set([2, 5, 9, 13, 17, 20, 24])
  return (
    <Frame>
      {Array.from({ length: 7 }, (_, i) => (
        <rect key={`h-${i}`} x={20 + i * 26} y="16" width="14" height="3" rx="1.5" className={S.fill} />
      ))}
      {Array.from({ length: 28 }, (_, i) => {
        const col = i % 7
        const row = Math.floor(i / 7)
        const isTaken = taken.has(i)
        const isPick = i === 11
        return (
          <rect
            key={i}
            x={20 + col * 26}
            y={28 + row * 22}
            width="20"
            height="17"
            rx="4"
            className={cn(
              isPick ? S.accent : isTaken ? S.fill : S.soft,
              !isPick && S.line
            )}
            strokeWidth="0.8"
            opacity={isTaken ? 0.45 : 1}
          />
        )
      })}
      {/* sloty */}
      {[0, 1, 2].map((i) => (
        <rect
          key={`s-${i}`}
          x={212}
          y={30 + i * 26}
          width="68"
          height="19"
          rx="5"
          className={cn(i === 1 ? S.accent : S.soft, i !== 1 && S.line)}
          strokeWidth="0.8"
          opacity={i === 2 ? 0.45 : 1}
        />
      ))}
    </Frame>
  )
}

/** Dokument se skenovací linkou a vytěženými poli. */
function DocumentsSketch() {
  return (
    <Frame>
      <rect x="20" y="14" width="110" height="124" rx="6" className={cn('fill-surface', S.line)} strokeWidth="1" />
      <rect x="32" y="26" width="42" height="5" rx="2" className={S.fill} />
      <rect x="32" y="38" width="66" height="3" rx="1.5" className={S.fill} opacity="0.6" />
      <rect x="32" y="46" width="52" height="3" rx="1.5" className={S.fill} opacity="0.6" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x="32" y={66 + i * 12} width="40" height="3" rx="1.5" className={S.fill} opacity="0.5" />
          <rect x="84" y={66 + i * 12} width="30" height="3" rx="1.5" className={S.fill} opacity="0.5" />
        </g>
      ))}
      {/* skenovací linka */}
      <rect x="20" y="78" width="110" height="1.6" className={S.accent} />
      <rect x="20" y="62" width="110" height="18" className={S.accent} opacity="0.1" />
      {/* zvýrazněné pole */}
      <rect x="29" y="63" width="48" height="9" rx="2.5" className={cn('fill-none', S.accentStroke)} strokeWidth="1.2" />

      {/* vytěžená pole */}
      {[0, 1, 2, 3].map((i) => (
        <g key={`f-${i}`} transform={`translate(150, ${22 + i * 29})`}>
          <rect width="130" height="22" rx="5" className={cn(S.soft, S.line)} strokeWidth="0.8" />
          <rect x="10" y="6" width="34" height="3" rx="1.5" className={S.fill} />
          <rect x="10" y="13" width="56" height="3.5" rx="1.75" className={i < 3 ? S.accent : S.coral} opacity={i < 3 ? 0.8 : 0.9} />
          <rect x="100" y="9" width="20" height="4" rx="2" className={i < 3 ? S.fill : S.coral} opacity="0.6" />
        </g>
      ))}
    </Frame>
  )
}

/** Stránka nabídky s hlavičkou, tabulkou a součtem. */
function QuoteSketch() {
  return (
    <Frame>
      <rect x="86" y="10" width="128" height="132" rx="6" className={cn('fill-surface', S.line)} strokeWidth="1" />
      <rect x="98" y="22" width="18" height="18" rx="4" className={S.accent} />
      <rect x="124" y="25" width="44" height="4" rx="2" className={S.fill} />
      <rect x="124" y="34" width="30" height="3" rx="1.5" className={S.fill} opacity="0.6" />

      <rect x="98" y="52" width="104" height="1" className={S.fill} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x="98" y={60 + i * 13} width={58 - i * 8} height="3" rx="1.5" className={S.fill} opacity="0.7" />
          <rect x="176" y={60 + i * 13} width="26" height="3" rx="1.5" className={S.fill} />
        </g>
      ))}
      <rect x="98" y="104" width="104" height="1" className={S.fill} />
      <rect x="98" y="112" width="34" height="4" rx="2" className={S.fill} />
      <rect x="166" y="110" width="36" height="8" rx="3" className={S.accent} />
      <rect x="98" y="128" width="46" height="3" rx="1.5" className={S.fill} opacity="0.5" />
    </Frame>
  )
}

/** Chat s citací zdroje. */
function AssistantSketch() {
  return (
    <Frame>
      <g>
        <rect x="150" y="16" width="126" height="26" rx="8" className={cn(S.soft, S.line)} strokeWidth="0.8" />
        <rect x="162" y="25" width="74" height="3.5" rx="1.75" className={S.fill} />
        <rect x="162" y="33" width="52" height="3" rx="1.5" className={S.fill} opacity="0.6" />
      </g>
      <g>
        <rect x="20" y="52" width="150" height="40" rx="8" className={cn('fill-surface', S.violet)} strokeWidth="0" opacity="0.1" />
        <rect x="20" y="52" width="150" height="40" rx="8" className="fill-none stroke-violet" strokeWidth="1" opacity="0.4" />
        <rect x="32" y="62" width="108" height="3.5" rx="1.75" className={S.fill} />
        <rect x="32" y="70" width="90" height="3.5" rx="1.75" className={S.fill} opacity="0.75" />
        <rect x="32" y="78" width="66" height="3.5" rx="1.75" className={S.fill} opacity="0.55" />
      </g>
      {/* citace zdroje */}
      <g>
        <rect x="32" y="100" width="96" height="20" rx="5" className={cn('fill-none', 'stroke-violet')} strokeWidth="1" strokeDasharray="3 2" opacity="0.75" />
        <rect x="41" y="107" width="8" height="7" rx="1.5" className={S.violet} />
        <rect x="55" y="108" width="58" height="3" rx="1.5" className={S.fill} />
      </g>
      {/* vstupní pole */}
      <rect x="20" y="128" width="222" height="14" rx="7" className={cn(S.soft, S.line)} strokeWidth="0.8" />
      <circle cx="262" cy="135" r="9" className={S.violet} />
    </Frame>
  )
}

/** Checklist s termíny. */
function TasksSketch() {
  const done = [true, true, false, false, false]
  const tones = [S.fill, S.fill, S.accent, S.coral, S.fill]
  return (
    <Frame>
      {done.map((isDone, i) => (
        <g key={i} transform={`translate(0, ${16 + i * 25})`}>
          <rect x="18" y="0" width="200" height="20" rx="5" className={cn(S.soft, S.line)} strokeWidth="0.8" />
          <rect
            x="28"
            y="5.5"
            width="9"
            height="9"
            rx="2.5"
            className={cn(isDone ? S.accent : 'fill-none', !isDone && S.line)}
            strokeWidth="1.2"
          />
          <rect x="45" y="6" width={92 - i * 9} height="3.5" rx="1.75" className={S.fill} opacity={isDone ? 0.45 : 1} />
          <rect x="45" y="13" width={56 - i * 5} height="2.5" rx="1.25" className={S.fill} opacity="0.45" />
          <rect x="186" y="7" width="22" height="6" rx="3" className={tones[i]} opacity="0.75" />
          {/* osa termínu */}
          <rect x="228" y="8" width={i === 3 ? 14 : 40 - i * 7} height="4" rx="2" className={tones[i]} opacity="0.6" />
        </g>
      ))}
      <rect x="246" y="10" width="1.5" height="130" className={S.accent} opacity="0.6" />
    </Frame>
  )
}

/** Dlaždice s čísly a sloupcový graf. */
function DashboardSketch() {
  const bars = [34, 52, 28, 66, 44, 72, 58]
  return (
    <Frame>
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(${18 + i * 68}, 14)`}>
          <rect width="60" height="40" rx="6" className={cn(S.soft, S.line)} strokeWidth="0.8" />
          <rect x="9" y="9" width="24" height="3" rx="1.5" className={S.fill} />
          <rect x="9" y="19" width={34 - i * 4} height="10" rx="2.5" className={i === 0 ? S.accent : S.fill} opacity={i === 0 ? 0.9 : 0.7} />
        </g>
      ))}
      {bars.map((h, i) => (
        <rect
          key={i}
          x={20 + i * 26}
          y={138 - h}
          width="16"
          height={h}
          rx="3"
          className={h === 72 ? S.accent : S.fill}
          opacity={h === 72 ? 0.95 : 0.6}
        />
      ))}
      <path
        d="M210 120 L226 108 L242 114 L258 96 L276 86"
        className={S.accentStroke}
        strokeWidth="1.6"
        fill="none"
      />
      <circle cx="276" cy="86" r="3" className={S.accent} />
      <rect x="208" y="70" width="34" height="3" rx="1.5" className={S.fill} />
    </Frame>
  )
}

const SKETCHES = {
  workflow: WorkflowSketch,
  inbox: InboxSketch,
  crm: CrmSketch,
  calculator: CalculatorSketch,
  booking: BookingSketch,
  documents: DocumentsSketch,
  quote: QuoteSketch,
  assistant: AssistantSketch,
  tasks: TasksSketch,
  dashboard: DashboardSketch,
}

export default function ProductSketch({ name, className }) {
  const Sketch = SKETCHES[name] ?? WorkflowSketch
  return (
    <div className={cn('flex h-full w-full items-center justify-center p-3', className)}>
      <Sketch />
    </div>
  )
}
