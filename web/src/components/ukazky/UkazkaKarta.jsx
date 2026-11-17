import { Link } from 'react-router-dom'
import {
  Activity,
  ArrowUpRight,
  Bot,
  Calculator,
  CalendarCheck,
  FileText,
  KanbanSquare,
  MailCheck,
  ScanLine,
  Users,
  Workflow,
} from 'lucide-react'
import { cn } from '../../lib/utils.js'
import UkazkaNahled from './UkazkaNahled.jsx'

const IKONY = {
  Workflow,
  MailCheck,
  Users,
  Calculator,
  CalendarCheck,
  ScanLine,
  FileText,
  Bot,
  KanbanSquare,
  Activity,
}

/**
 * Dlaždice jedné ukázky podle předlohy „Neonové AI portfolio“: nahoře náhled
 * aplikace, pod ním ikona, název a dvouřádkový popis, v rohu šipka ven.
 * Celá dlaždice je jeden odkaz — šipka je jen značka, ne druhý cíl.
 */
export default function UkazkaKarta({ ukazka, popis, nazev }) {
  const Ikona = IKONY[ukazka.icon] ?? Workflow

  return (
    <Link
      to={`/ukazky/${ukazka.slug}`}
      className={cn(
        'group relative flex flex-col gap-4 rounded-[1.1rem] border border-white/[0.1] p-3.5',
        'bg-[linear-gradient(160deg,rgb(255_255_255/0.055)_0%,rgb(255_255_255/0.02)_45%,rgb(255_255_255/0.01)_100%)]',
        'transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
        'hover:-translate-y-1 hover:border-[rgb(255_20_102/0.45)]',
        'hover:shadow-[0_18px_50px_-24px_rgb(255_20_102/0.85)]'
      )}
    >
      <UkazkaNahled demo={ukazka.demo} className="aspect-[320/190] w-full" />

      <div className="flex gap-3.5 px-1 pb-9">
        <span
          aria-hidden
          className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full border border-white/25 text-white transition-colors duration-500 group-hover:border-[var(--lp-pink)] group-hover:text-[var(--lp-pink)]"
        >
          <Ikona size={18} strokeWidth={1.9} />
        </span>

        <div className="min-w-0">
          <h3 className="text-[1.08rem] font-semibold leading-tight text-white">{nazev}</h3>
          <p className="mt-1.5 text-[0.92rem] leading-[1.45] text-white/60">{popis}</p>
        </div>
      </div>

      <ArrowUpRight
        size={18}
        strokeWidth={2.2}
        aria-hidden
        className="absolute bottom-4 right-4 text-[var(--lp-pink)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      />
    </Link>
  )
}
