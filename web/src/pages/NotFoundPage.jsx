import { ArrowRight, Home } from 'lucide-react'
import FlowField from '../components/bg/FlowField.jsx'
import { Button } from '../components/ui/Button.jsx'
import { KineticText } from '../components/ui/Reveal.jsx'
import { useT } from '../lib/i18n.jsx'
import { useDocumentTitle } from '../lib/useDocumentTitle.js'

export default function NotFoundPage() {
  const { t } = useT()
  useDocumentTitle(`404 — ${t('brand.name')}`)

  return (
    <section className="relative flex min-h-[70vh] items-center overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="grid-paper absolute inset-0" />
        <FlowField density={0.8} opacity={0.55} />
      </div>

      <div className="relative mx-auto w-full max-w-[82rem] px-5 sm:px-7">
        <p className="label-mono">404</p>
        <h1 className="mt-4 max-w-2xl font-display text-[clamp(2rem,6vw,3.6rem)] font-semibold leading-[1.02] tracking-[-0.035em]">
          <KineticText text={t('nf.title')} />
        </h1>
        <p className="mt-5 max-w-lg text-[1rem] leading-relaxed text-text-soft">{t('nf.body')}</p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Button to="/" size="lg" icon={Home} iconRight={false}>
            {t('action.backHome')}
          </Button>
          <Button to="/ukazky" size="lg" variant="outline" icon={ArrowRight}>
            {t('action.allProducts')}
          </Button>
        </div>
      </div>
    </section>
  )
}
