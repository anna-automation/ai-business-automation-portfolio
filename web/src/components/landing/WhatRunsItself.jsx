import { CalendarDays, FileText, Mail, RefreshCw } from 'lucide-react'
import { SectionLead } from './parts.jsx'

/** Čtyři věci, které na předloze zastupují „co všechno maká samo“. */
const ITEMS = [
  { icon: Mail, label: ['Automatické', 'odpovědi'] },
  { icon: FileText, label: ['Generování', 'dokumentů'] },
  { icon: RefreshCw, label: ['Přenosy dat', 'mezi systémy'] },
  { icon: CalendarDays, label: ['Správa', 'objednávek'] },
]

export default function WhatRunsItself() {
  return (
    <section id="co-vsechno" className="relative z-10 scroll-mt-28">
      <div className="mx-auto w-full max-w-[82rem] px-5 py-10 sm:px-8 lg:py-16">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,16rem)_1fr] lg:gap-14">
          <SectionLead eyebrow="Co všechno" title="Maká samo?" />

          <ul className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {ITEMS.map((item) => (
              <li
                key={item.label.join(' ')}
                className="lp-card group flex flex-col items-center justify-center gap-4 px-4 py-7 text-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[rgb(255_20_102/0.4)] hover:bg-[rgb(255_20_102/0.05)]"
              >
                <item.icon
                  size={34}
                  strokeWidth={1.9}
                  className="lp-glow-pink transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-0.5"
                />
                <p className="text-[0.95rem] leading-[1.35] text-white/90">
                  {item.label[0]}
                  <br />
                  {item.label[1]}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
