import { Suspense, lazy, useMemo } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils.js'

/**
 * Registr interaktivních ukázek.
 *
 * Soubory se hledají globem, takže chybějící demo web nerozbije — jen se místo
 * něj ukáže zástupný blok. Díky tomu lze přidat nové demo pouhým vložením
 * souboru `XyzDemo.jsx` a jednoho řádku do tabulky níž.
 */

const modules = import.meta.glob('./*Demo.jsx')

const FILES = {
  workflow: './WorkflowDemo.jsx',
  inbox: './InboxDemo.jsx',
  crm: './CrmDemo.jsx',
  calculator: './CalculatorDemo.jsx',
  booking: './BookingDemo.jsx',
  documents: './DocumentsDemo.jsx',
  quote: './QuoteDemo.jsx',
  assistant: './AssistantDemo.jsx',
  tasks: './TasksDemo.jsx',
  dashboard: './DashboardDemo.jsx',
}

const cache = new Map()

function resolve(key) {
  if (cache.has(key)) return cache.get(key)
  const path = FILES[key]
  const loader = path ? modules[path] : null
  const component = loader ? lazy(loader) : null
  cache.set(key, component)
  return component
}

export function hasDemo(key) {
  return Boolean(FILES[key] && modules[FILES[key]])
}

function DemoFallback({ compact }) {
  return (
    <div
      className={cn(
        'flex items-center justify-center gap-2 text-muted',
        compact ? 'h-full min-h-32' : 'min-h-64'
      )}
    >
      <Loader2 size={15} className="animate-spin" />
      <span className="label-mono">Načítám ukázku</span>
    </div>
  )
}

function DemoMissing({ compact }) {
  return (
    <div
      className={cn(
        'grid-paper-fine flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line-strong p-6 text-center',
        compact ? 'h-full min-h-32' : 'min-h-64'
      )}
    >
      <p className="label-mono">Ukázka se připravuje</p>
      <p className="max-w-xs text-[0.8rem] leading-snug text-muted">
        Tahle interaktivní ukázka ještě není hotová. Popis procesu najdete vedle.
      </p>
    </div>
  )
}

/** Vykreslí ukázku podle klíče z products.js. */
export function Demo({ name, compact = false }) {
  const Component = useMemo(() => resolve(name), [name])

  if (!Component) return <DemoMissing compact={compact} />

  return (
    <Suspense fallback={<DemoFallback compact={compact} />}>
      <Component compact={compact} />
    </Suspense>
  )
}

export default Demo
