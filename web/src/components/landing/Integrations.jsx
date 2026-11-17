import { Database, Plus } from 'lucide-react'
import { SectionLead } from './parts.jsx'
import { GmailLogo, N8nLogo, NotionLogo, SheetsLogo } from './toolLogos.jsx'

const TOOLS = [
  { id: 'n8n', label: 'n8n', logo: <N8nLogo className="w-[3.1rem] lp-glow-pink" /> },
  { id: 'sheets', label: ['Google', 'Sheets'], logo: <SheetsLogo className="h-[2.7rem]" /> },
  { id: 'gmail', label: 'Gmail', logo: <GmailLogo className="w-[2.9rem]" /> },
  { id: 'notion', label: 'Notion', logo: <NotionLogo className="h-[2.5rem]" /> },
  {
    id: 'db',
    label: 'Databáze',
    logo: <Database size={40} strokeWidth={1.9} className="lp-glow-cyan" />,
  },
  {
    id: 'more',
    label: 'a další…',
    logo: <Plus size={34} strokeWidth={2.6} className="text-white" />,
  },
]

export default function Integrations() {
  return (
    <section id="co-umime" className="relative z-10 scroll-mt-28">
      <div className="mx-auto w-full max-w-[82rem] px-5 py-12 sm:px-8 lg:py-16">
        {/* dělicí linka jako na předloze */}
        <div
          aria-hidden
          className="mb-12 h-px w-full bg-[linear-gradient(90deg,transparent,rgb(255_255_255/0.12)_18%,rgb(255_255_255/0.12)_82%,transparent)] lg:mb-14"
        />

        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,16rem)_1fr] lg:gap-14">
          <SectionLead eyebrow="Co umíme" title="Propojit?" className="uppercase" />

          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-6">
            {TOOLS.map((tool) => (
              <li
                key={tool.id}
                className="group flex aspect-square flex-col items-center justify-center gap-3 rounded-[1.25rem] border border-white/[0.08] bg-[rgb(10_9_22/0.75)] p-3 text-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-white/18 hover:bg-[rgb(16_14_32/0.85)]"
              >
                <span className="flex h-[2.9rem] items-center justify-center">{tool.logo}</span>
                <p className="text-[0.92rem] leading-[1.25] text-white/90">
                  {Array.isArray(tool.label) ? (
                    <>
                      {tool.label[0]}
                      <br />
                      {tool.label[1]}
                    </>
                  ) : (
                    tool.label
                  )}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
