import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowUpRight,
  Clock,
  FileJson2,
  FolderGit2,
  Github,
  Search,
  SignalHigh,
  SignalLow,
  SignalMedium,
} from 'lucide-react'
import automationsCatalog from 'virtual:automations'
import PageHeader from '../components/ui/PageHeader.jsx'
import ContactCTA from '../components/sections/ContactCTA.jsx'
import { Section } from '../components/ui/Section.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Badge } from '../components/ui/primitives.jsx'
import { useT } from '../lib/i18n.jsx'
import { usePrefs } from '../lib/prefs.jsx'
import { useDocumentTitle } from '../lib/useDocumentTitle.js'
import { site } from '../data/site.js'
import { cn, fold } from '../lib/utils.js'

const DIFFICULTY = {
  beginner: { icon: SignalLow, tone: 'ok', label: { cs: 'Začátečník', en: 'Beginner' } },
  intermediate: { icon: SignalMedium, tone: 'accent', label: { cs: 'Středně', en: 'Intermediate' } },
  advanced: { icon: SignalHigh, tone: 'coral', label: { cs: 'Pokročilé', en: 'Advanced' } },
}

/**
 * Katalog automatizací. Čte se přímo ze složek v repozitáři (viz
 * plugins/vite-plugin-automations.js), takže přidání nové automatizace
 * neznamená sahat do webu — stačí nová složka s meta.json.
 */
export default function AutomationsPage() {
  const { t, pick, lang } = useT()
  const { reducedMotion } = usePrefs()
  const [query, setQuery] = useState('')
  const [tag, setTag] = useState('all')

  useDocumentTitle(`${t('automations.title')} — ${t('brand.name')}`)

  const tags = useMemo(() => {
    const all = new Set()
    for (const item of automationsCatalog) (item.tags ?? []).forEach((x) => all.add(x))
    return ['all', ...[...all].sort()]
  }, [])

  const visible = useMemo(() => {
    const q = fold(query.trim())
    return automationsCatalog.filter((item) => {
      if (tag !== 'all' && !(item.tags ?? []).includes(tag)) return false
      if (!q) return true
      const haystack = fold(
        [
          pick(item.title),
          pick(item.summary),
          item.dir,
          ...(item.tools ?? []),
          ...(item.tags ?? []),
        ].join(' ')
      )
      return haystack.includes(q)
    })
  }, [query, tag, pick])

  return (
    <>
      <PageHeader
        eyebrow={t('automations.eyebrow')}
        title={t('automations.title')}
        subtitle={t('automations.sub')}
        breadcrumbs={[{ label: t('nav.home'), to: '/' }, { label: t('nav.automations') }]}
        aside={
          <Button href={site.github} variant="quiet" size="sm" icon={Github} iconRight={false}>
            {lang === 'en' ? 'Repository' : 'Repozitář'}
          </Button>
        }
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative sm:max-w-xs sm:flex-1">
            <Search
              size={15}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={lang === 'en' ? 'Search automations…' : 'Hledat automatizace…'}
              aria-label={t('nav.search')}
              className="h-10 w-full rounded-xl border border-line bg-surface pl-10 pr-3 text-[0.86rem] outline-none transition-colors placeholder:text-muted focus:border-accent"
            />
          </div>

          <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-0.5">
            {tags.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTag(item)}
                className={cn(
                  'shrink-0 rounded-xl border px-3 py-2 font-mono text-[0.72rem] uppercase tracking-[0.08em] transition-all duration-300',
                  tag === item
                    ? 'border-accent/50 bg-accent/12 text-text'
                    : 'border-line bg-surface text-muted hover:border-line-strong hover:text-text'
                )}
              >
                {item === 'all' ? t('products.filterAll') : item}
              </button>
            ))}
          </div>
        </div>
      </PageHeader>

      <Section className="py-14 sm:py-16">
        {visible.length === 0 ? (
          <p className="py-16 text-center text-muted">
            {automationsCatalog.length === 0 ? t('automations.empty') : t('palette.empty')}
          </p>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((item, i) => {
              const difficulty = DIFFICULTY[item.difficulty] ?? DIFFICULTY.intermediate
              const DifficultyIcon = difficulty.icon

              return (
                <motion.li
                  key={item.slug}
                  initial={reducedMotion ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: Math.min(0.04 * i, 0.3) }}
                >
                  <Link
                    to={`/automatizace/${item.slug}`}
                    data-cursor-label={t('action.open')}
                    className="card group flex h-full flex-col p-5 transition-all duration-500 ease-[var(--ease-out-expo)] hover:border-accent/45 hover:shadow-[var(--shadow-lift)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="label-mono flex items-center gap-1.5">
                        <FolderGit2 size={12} />
                        {item.dir}
                      </span>
                      <ArrowUpRight
                        size={15}
                        className="shrink-0 text-muted transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-text"
                      />
                    </div>

                    <h2 className="mt-3.5 text-[1.15rem] leading-snug">{pick(item.title)}</h2>
                    <p className="mt-2 flex-1 text-[0.87rem] leading-relaxed text-muted">
                      {pick(item.summary)}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-1.5">
                      <Badge tone={difficulty.tone} icon={DifficultyIcon}>
                        {pick(difficulty.label)}
                      </Badge>
                      {item.saves && (
                        <Badge tone="neutral" icon={Clock}>
                          {item.saves.amount} {pick(item.saves.unit)}
                        </Badge>
                      )}
                      {item.hasWorkflow && (
                        <Badge tone="violet" icon={FileJson2}>
                          {item.workflowStats?.nodes ?? '?'} {t('automations.nodes')}
                        </Badge>
                      )}
                    </div>

                    {item.tools?.length > 0 && (
                      <p className="mt-3 truncate font-mono text-[0.7rem] text-muted">
                        {item.tools.join(' · ')}
                      </p>
                    )}
                  </Link>
                </motion.li>
              )
            })}
          </ul>
        )}

        {/* vysvětlení struktury repozitáře */}
        <div className="card mt-10 p-6">
          <p className="label-mono">{t('automations.folder')}</p>
          <p className="mt-3 max-w-2xl text-[0.9rem] leading-relaxed text-text-soft">
            {lang === 'en'
              ? 'Every automation is a self-contained folder. You can hand one over on its own — the README, the n8n export and the metadata travel together.'
              : 'Každá automatizace je samostatná složka. Dá se předat jednotlivě — README, n8n export i metadata jdou s ní.'}
          </p>
          <pre className="hide-scrollbar mt-4 overflow-x-auto rounded-xl border border-line bg-bg-sunk p-4 font-mono text-[0.76rem] leading-relaxed text-text-soft">
{`automations/
└─ 01-trideni-prichozich-emailu/
   ├─ meta.json       ${lang === 'en' ? '# metadata for the site' : '# metadata pro web'}
   ├─ README.md       ${lang === 'en' ? '# how it works, setup' : '# jak to funguje, nasazení'}
   ├─ workflow.json   ${lang === 'en' ? '# n8n export' : '# export z n8n'}
   └─ assets/         ${lang === 'en' ? '# screenshots' : '# screenshoty'}`}
          </pre>
        </div>
      </Section>

      <ContactCTA />
    </>
  )
}
