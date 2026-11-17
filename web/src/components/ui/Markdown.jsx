import { Fragment, useMemo } from 'react'
import { cn } from '../../lib/utils.js'

/**
 * Malý renderer Markdownu pro README automatizací.
 *
 * Záměrně bez knihovny: obsah píšu sama a potřebuju jen nadpisy, odrážky,
 * tabulky, kód a odkazy. Žádné HTML se nevkládá přes dangerouslySetInnerHTML,
 * takže není co sanitizovat.
 */

/** **tučně**, `kód`, [odkaz](cíl), *kurzíva* */
function inline(text, keyPrefix = 'i') {
  const tokens = []
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|\*[^*]+\*)/g
  let last = 0
  let match
  let index = 0

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) tokens.push(text.slice(last, match.index))
    const token = match[0]
    const key = `${keyPrefix}-${index++}`

    if (token.startsWith('**')) {
      tokens.push(
        <strong key={key} className="font-semibold text-text">
          {token.slice(2, -2)}
        </strong>
      )
    } else if (token.startsWith('`')) {
      tokens.push(
        <code
          key={key}
          className="rounded-md border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[0.84em]"
        >
          {token.slice(1, -1)}
        </code>
      )
    } else if (token.startsWith('[')) {
      const [, label, href] = token.match(/\[([^\]]+)\]\(([^)]+)\)/) ?? []
      const external = /^https?:/.test(href ?? '')
      tokens.push(
        <a
          key={key}
          href={href}
          {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
          className="link-underline font-medium text-text"
        >
          {label}
        </a>
      )
    } else {
      tokens.push(
        <em key={key} className="italic">
          {token.slice(1, -1)}
        </em>
      )
    }
    last = pattern.lastIndex
  }

  if (last < text.length) tokens.push(text.slice(last))
  return tokens
}

function parse(source) {
  const lines = source.replace(/\r\n/g, '\n').split('\n')
  const blocks = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // blok kódu
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim()
      const body = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        body.push(lines[i])
        i++
      }
      i++
      blocks.push({ type: 'code', lang, text: body.join('\n') })
      continue
    }

    // vodorovná linka
    if (/^(-{3,}|\*{3,})$/.test(line.trim())) {
      blocks.push({ type: 'rule' })
      i++
      continue
    }

    // nadpis
    const heading = line.match(/^(#{1,4})\s+(.*)$/)
    if (heading) {
      blocks.push({ type: 'heading', level: heading[1].length, text: heading[2] })
      i++
      continue
    }

    // citace
    if (line.startsWith('> ')) {
      const body = []
      while (i < lines.length && lines[i].startsWith('> ')) {
        body.push(lines[i].slice(2))
        i++
      }
      blocks.push({ type: 'quote', text: body.join(' ') })
      continue
    }

    // tabulka
    if (line.includes('|') && lines[i + 1]?.match(/^\s*\|?[\s:-]+\|/)) {
      const header = line.split('|').map((c) => c.trim()).filter(Boolean)
      i += 2
      const rows = []
      while (i < lines.length && lines[i].includes('|')) {
        rows.push(lines[i].split('|').map((c) => c.trim()).filter((c, idx, arr) => !(c === '' && (idx === 0 || idx === arr.length - 1))))
        i++
      }
      blocks.push({ type: 'table', header, rows })
      continue
    }

    // odrážky
    if (/^\s*[-*+]\s+/.test(line)) {
      const items = []
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*+]\s+/, ''))
        i++
      }
      blocks.push({ type: 'list', ordered: false, items })
      continue
    }

    // číslovaný seznam
    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items = []
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+[.)]\s+/, ''))
        i++
      }
      blocks.push({ type: 'list', ordered: true, items })
      continue
    }

    // prázdný řádek
    if (!line.trim()) {
      i++
      continue
    }

    // odstavec
    const body = []
    while (i < lines.length && lines[i].trim() && !/^(#{1,4}\s|```|>\s|\s*[-*+]\s|\s*\d+[.)]\s)/.test(lines[i])) {
      body.push(lines[i])
      i++
    }
    blocks.push({ type: 'paragraph', text: body.join(' ') })
  }

  return blocks
}

const HEADING_CLASS = {
  1: 'text-[clamp(1.5rem,3.4vw,2.1rem)] mt-10 first:mt-0',
  2: 'text-[clamp(1.25rem,2.8vw,1.6rem)] mt-9 first:mt-0',
  3: 'text-[1.1rem] mt-7 first:mt-0',
  4: 'text-[0.98rem] mt-6 first:mt-0',
}

export default function Markdown({ source, className }) {
  const blocks = useMemo(() => (source ? parse(source) : []), [source])

  if (!source) return null

  return (
    <div className={cn('max-w-none', className)}>
      {blocks.map((block, index) => {
        const key = `b-${index}`

        switch (block.type) {
          case 'heading': {
            const Tag = `h${Math.min(block.level + 1, 6)}`
            return (
              <Tag key={key} className={cn('leading-tight', HEADING_CLASS[block.level])}>
                {inline(block.text, key)}
              </Tag>
            )
          }

          case 'paragraph':
            return (
              <p key={key} className="mt-4 text-[0.95rem] leading-relaxed text-text-soft">
                {inline(block.text, key)}
              </p>
            )

          case 'list': {
            const Tag = block.ordered ? 'ol' : 'ul'
            return (
              <Tag key={key} className="mt-4 space-y-2">
                {block.items.map((item, i) => (
                  <li key={`${key}-${i}`} className="flex gap-3 text-[0.95rem] leading-relaxed text-text-soft">
                    <span
                      aria-hidden
                      className={cn(
                        'mt-[0.55em] shrink-0',
                        block.ordered
                          ? 'label-mono mt-0 w-5 tabular-nums text-accent'
                          : 'size-1.5 rounded-full bg-accent'
                      )}
                    >
                      {block.ordered ? String(i + 1).padStart(2, '0') : null}
                    </span>
                    <span className="flex-1">{inline(item, `${key}-${i}`)}</span>
                  </li>
                ))}
              </Tag>
            )
          }

          case 'code':
            return (
              <pre
                key={key}
                className="hide-scrollbar mt-5 overflow-x-auto rounded-xl border border-line bg-bg-sunk p-4"
              >
                {block.lang && <span className="label-mono mb-2 block">{block.lang}</span>}
                <code className="font-mono text-[0.8rem] leading-relaxed text-text-soft">
                  {block.text}
                </code>
              </pre>
            )

          case 'quote':
            return (
              <blockquote key={key} className="mt-5 border-l-2 border-accent pl-4">
                <p className="text-[0.95rem] leading-relaxed text-text-soft">
                  {inline(block.text, key)}
                </p>
              </blockquote>
            )

          case 'rule':
            return <hr key={key} className="mt-8 border-line" />

          case 'table':
            return (
              <div key={key} className="hide-scrollbar mt-5 overflow-x-auto">
                <table className="w-full min-w-[26rem] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-line">
                      {block.header.map((cell, i) => (
                        <th key={i} className="label-mono whitespace-nowrap py-2 pr-4 font-medium">
                          {inline(cell, `${key}-h-${i}`)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, r) => (
                      <tr key={r} className="border-b border-line/60 last:border-0">
                        {row.map((cell, c) => (
                          <td key={c} className="py-2.5 pr-4 text-[0.88rem] text-text-soft">
                            {inline(cell, `${key}-${r}-${c}`)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )

          default:
            return <Fragment key={key} />
        }
      })}
    </div>
  )
}
