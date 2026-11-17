import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Check, Clock, Copy, FileJson2, FolderGit2, Github, Wrench } from 'lucide-react'
import automationsCatalog from 'virtual:automations'
import PageHeader from '../components/ui/PageHeader.jsx'
import ContactCTA from '../components/sections/ContactCTA.jsx'
import Markdown from '../components/ui/Markdown.jsx'
import { Section } from '../components/ui/Section.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Badge } from '../components/ui/primitives.jsx'
import { Demo } from '../components/demos/index.jsx'
import { Reveal } from '../components/ui/Reveal.jsx'
import NotFoundPage from './NotFoundPage.jsx'
import { useT } from '../lib/i18n.jsx'
import { useToast } from '../lib/toast.jsx'
import { useDocumentTitle, useMetaDescription } from '../lib/useDocumentTitle.js'
import { getProduct } from '../data/products.js'
import { audiences } from '../data/audiences.js'
import { site } from '../data/site.js'

export default function AutomationDetailPage() {
  const { slug } = useParams()
  const { t, pick, lang } = useT()
  const { push } = useToast()
  const [copied, setCopied] = useState(false)

  const item = automationsCatalog.find((a) => a.slug === slug) ?? null

  useDocumentTitle(item ? `${pick(item.title)} — ${t('brand.name')}` : null)
  useMetaDescription(item ? pick(item.summary) : null)

  if (!item) return <NotFoundPage />

  const product = item.demo ? getProduct(item.demo) : null
  const forWhom = (item.audiences ?? [])
    .map((id) => audiences.find((a) => a.id === id))
    .filter(Boolean)

  const repoPath = `${site.github}/tree/main/automations/${item.dir}`

  const copyPath = async () => {
    try {
      await navigator.clipboard.writeText(`automations/${item.dir}`)
      setCopied(true)
      push({ title: t('action.copied'), description: `automations/${item.dir}`, variant: 'success' })
      setTimeout(() => setCopied(false), 2200)
    } catch {
      push({ title: lang === 'en' ? 'Copy failed' : 'Zkopírování se nepovedlo', variant: 'warn' })
    }
  }

  return (
    <>
      <PageHeader
        eyebrow={`${t('automations.eyebrow')} · ${item.dir}`}
        title={pick(item.title)}
        subtitle={pick(item.summary)}
        breadcrumbs={[
          { label: t('nav.home'), to: '/' },
          { label: t('nav.automations'), to: '/automatizace' },
          { label: pick(item.title) },
        ]}
        aside={
          <div className="flex flex-wrap gap-2">
            <Button href={repoPath} variant="quiet" size="sm" icon={Github} iconRight={false}>
              {lang === 'en' ? 'Open folder' : 'Otevřít složku'}
            </Button>
            <Button
              onClick={copyPath}
              variant="outline"
              size="sm"
              icon={copied ? Check : Copy}
              iconRight={false}
            >
              {copied ? t('action.copied') : lang === 'en' ? 'Copy path' : 'Kopírovat cestu'}
            </Button>
          </div>
        }
      />

      <Section className="py-12 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-14">
          {/* README */}
          <div className="min-w-0">
            {item.readme ? (
              <Markdown source={item.readme} />
            ) : (
              <p className="text-muted">
                {lang === 'en'
                  ? 'This automation has no README yet.'
                  : 'Tahle automatizace ještě nemá README.'}
              </p>
            )}
          </div>

          {/* fakta */}
          <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
            <div className="card p-5">
              <p className="label-mono flex items-center gap-1.5">
                <FolderGit2 size={12} />
                {t('automations.folder')}
              </p>
              <p className="mt-2.5 break-all font-mono text-[0.8rem] text-text-soft">
                automations/{item.dir}
              </p>

              <dl className="mt-5 space-y-3.5 border-t border-line pt-4">
                {item.saves && (
                  <div className="flex items-start justify-between gap-3">
                    <dt className="label-mono flex items-center gap-1.5">
                      <Clock size={11} />
                      {t('products.saves')}
                    </dt>
                    <dd className="text-right text-[0.86rem] font-medium">
                      {item.saves.amount} {pick(item.saves.unit)}
                    </dd>
                  </div>
                )}

                {item.savesPerMonth && (
                  <div className="flex items-start justify-between gap-3">
                    <dt className="label-mono">{t('automations.savesPerMonth')}</dt>
                    <dd className="text-right text-[0.86rem] font-medium">
                      {item.savesPerMonth} h
                    </dd>
                  </div>
                )}

                {item.difficulty && (
                  <div className="flex items-start justify-between gap-3">
                    <dt className="label-mono">{t('automations.difficulty')}</dt>
                    <dd className="text-right text-[0.86rem] font-medium capitalize">
                      {item.difficulty}
                    </dd>
                  </div>
                )}

                {item.workflowStats && (
                  <div className="flex items-start justify-between gap-3">
                    <dt className="label-mono flex items-center gap-1.5">
                      <FileJson2 size={11} />
                      workflow.json
                    </dt>
                    <dd className="text-right text-[0.86rem] font-medium">
                      {item.workflowStats.nodes} {t('automations.nodes')}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {item.tools?.length > 0 && (
              <div className="card p-5">
                <p className="label-mono flex items-center gap-1.5">
                  <Wrench size={12} />
                  {t('products.stack')}
                </p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {item.tools.map((tool) => (
                    <li key={tool}>
                      <Badge tone="neutral">{tool}</Badge>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {item.workflowStats?.nodeTypes?.length > 0 && (
              <div className="card p-5">
                <p className="label-mono">
                  {lang === 'en' ? 'Nodes in the workflow' : 'Nody ve workflow'}
                </p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {item.workflowStats.nodeTypes.map((type) => (
                    <li
                      key={type}
                      className="rounded-md border border-line bg-surface-2 px-2 py-1 font-mono text-[0.68rem] text-muted"
                    >
                      {type}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {forWhom.length > 0 && (
              <div className="card p-5">
                <p className="label-mono">{t('products.forWhom')}</p>
                <ul className="mt-3 space-y-2">
                  {forWhom.map((audience) => (
                    <li key={audience.id}>
                      <Link
                        to={`/pro-koho#${audience.id}`}
                        className="link-underline text-[0.86rem] text-text-soft hover:text-text"
                      >
                        {pick(audience.name)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </Section>

      {/* navázané interaktivní demo */}
      {product && (
        <Section tone="sunk" className="border-y border-line py-14 sm:py-16">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="label-mono">{t('products.eyebrow')}</p>
              <h2 className="mt-2.5 text-[clamp(1.4rem,3.4vw,2rem)] leading-tight">
                {pick(product.title)}
              </h2>
            </div>
            <Button to={`/ukazky/${product.slug}`} variant="quiet" size="sm">
              {t('products.detail')}
            </Button>
          </div>
          <Reveal className="mt-8" y={20}>
            <Demo name={product.demo} />
          </Reveal>
        </Section>
      )}

      <ContactCTA />
    </>
  )
}
