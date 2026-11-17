import { Link } from 'react-router-dom'
import { ArrowRight, CalendarClock } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader.jsx'
import Markdown from '../components/ui/Markdown.jsx'
import { Section } from '../components/ui/Section.jsx'
import { Badge } from '../components/ui/primitives.jsx'
import NotFoundPage from './NotFoundPage.jsx'
import { useT } from '../lib/i18n.jsx'
import { useDocumentTitle } from '../lib/useDocumentTitle.js'
import { getLegalDoc, legalDocs } from '../data/legal.js'
import { formatDate } from '../lib/utils.js'

const ROUTES = {
  privacy: '/ochrana-osobnich-udaju',
  terms: '/podminky',
  cookies: '/cookies',
  accessibility: '/pristupnost',
  withdrawal: '/odstoupeni-od-smlouvy',
  security: '/bezpecnost-ai',
}

export default function LegalPage({ doc }) {
  const { t, lang, pick } = useT()
  const document = getLegalDoc(doc)

  useDocumentTitle(document ? `${t(document.titleKey)} — ${t('brand.name')}` : null)

  if (!document) return <NotFoundPage />

  const others = Object.entries(legalDocs).filter(([id]) => id !== doc)

  return (
    <>
      <PageHeader
        eyebrow={t('footer.legal')}
        title={t(document.titleKey)}
        breadcrumbs={[{ label: t('nav.home'), to: '/' }, { label: t(document.titleKey) }]}
        flow={false}
        aside={
          <Badge tone="neutral" icon={CalendarClock}>
            {t('legal.updated')} {formatDate(document.updated, lang === 'en' ? 'en-US' : 'cs-CZ')}
          </Badge>
        }
      />

      <Section className="py-14 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-14">
          <article className="min-w-0 max-w-[46rem]">
            <Markdown source={pick(document.body)} />
          </article>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <p className="label-mono">{t('footer.legal')}</p>
            <ul className="mt-4 space-y-1">
              {others.map(([id, other]) => (
                <li key={id}>
                  <Link
                    to={ROUTES[id]}
                    className="group flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-[0.86rem] text-text-soft transition-colors hover:bg-surface-2 hover:text-text"
                  >
                    <span className="truncate">{t(other.titleKey)}</span>
                    <ArrowRight
                      size={13}
                      className="shrink-0 text-muted transition-transform duration-400 group-hover:translate-x-0.5"
                    />
                  </Link>
                </li>
              ))}
            </ul>

            <p className="mt-6 rounded-xl border border-warn/30 bg-warn/8 p-3.5 text-[0.78rem] leading-relaxed text-text-soft">
              {lang === 'en'
                ? 'Sample text for a demo portfolio. Not legal advice — have it reviewed before real use.'
                : 'Vzorový text pro demo portfolio. Nejde o právní poradenství — před reálným použitím nechte zkontrolovat.'}
            </p>
          </aside>
        </div>
      </Section>
    </>
  )
}
