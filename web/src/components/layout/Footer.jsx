import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Accessibility,
  AtSign,
  Check,
  FileText,
  Github,
  Linkedin,
  Mail,
  ScrollText,
  ShieldCheck,
  Undo2,
} from 'lucide-react'
import { useT } from '../../lib/i18n.jsx'
import { useToast } from '../../lib/toast.jsx'
import { site } from '../../data/site.js'
import { Button } from '../ui/Button.jsx'
import { Badge } from '../ui/primitives.jsx'
import { BackToTop } from './Chrome.jsx'
import { Wordmark } from '../ui/Logo.jsx'

const SECTION_LINKS = [
  { to: '/ukazky', key: 'nav.products' },
  { to: '/automatizace', key: 'nav.automations' },
  { to: '/pro-koho', key: 'nav.audiences' },
  { to: '/skoleni', key: 'nav.learning' },
  { to: '/o-mne', key: 'nav.about' },
  { to: '/kontakt', key: 'nav.contact' },
]

const LEGAL_LINKS = [
  { to: '/ochrana-osobnich-udaju', key: 'legal.privacy', icon: ShieldCheck },
  { to: '/podminky', key: 'legal.terms', icon: ScrollText },
  { to: '/cookies', key: 'legal.cookies', icon: FileText },
  { to: '/pristupnost', key: 'legal.accessibility', icon: Accessibility },
  { to: '/odstoupeni-od-smlouvy', key: 'legal.withdrawal', icon: Undo2 },
  { to: '/bezpecnost-ai', key: 'legal.security', icon: ShieldCheck },
]

const SOCIAL_ICONS = { github: Github, linkedin: Linkedin, email: Mail }

export default function Footer() {
  const { t } = useT()
  const { push } = useToast()
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const subscribe = (event) => {
    event.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      push({
        title: t('contact.invalidEmail'),
        variant: 'warn',
      })
      return
    }
    setSubscribed(true)
    push({
      title: t('footer.newsletterDone'),
      description: t('demo.safe'),
      variant: 'info',
    })
  }

  return (
    <footer className="no-print relative mt-24 border-t border-line bg-bg-sunk">
      <div className="grid-paper absolute inset-0 opacity-60" aria-hidden />

      <div className="relative mx-auto w-full max-w-[82rem] px-5 py-14 sm:px-7">
        {/* Newsletter */}
        <div className="card flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between lg:p-8">
          <div className="max-w-md">
            <p className="label-mono">{t('footer.newsletter')}</p>
            <h3 className="mt-2 text-[1.5rem] leading-tight">
              {t('footer.newsletterSub')}
            </h3>
          </div>

          {subscribed ? (
            <p className="flex items-center gap-2 rounded-xl border border-ok/35 bg-ok/10 px-4 py-3 text-[0.86rem]">
              <Check size={16} className="text-ok" />
              {t('footer.newsletterDone')}
            </p>
          ) : (
            <form onSubmit={subscribe} className="flex w-full max-w-md flex-col gap-2 sm:flex-row">
              <label className="sr-only" htmlFor="newsletter-email">
                {t('contact.email')}
              </label>
              <div className="relative flex-1">
                <AtSign
                  size={15}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vas@email.cz"
                  className="h-11 w-full rounded-xl border border-line bg-surface pl-10 pr-3 text-[0.88rem] outline-none transition-colors placeholder:text-muted focus:border-accent"
                />
              </div>
              <Button type="submit" size="md" variant="primary" magnetic={false}>
                {t('footer.newsletterCta')}
              </Button>
            </form>
          )}
        </div>

        {/* Odkazy */}
        <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="inline-flex items-center" aria-label={`${site.name} — domů`}>
              <Wordmark alt={site.name} className="w-[11rem]" />
            </Link>
            <p className="mt-4 max-w-[22rem] text-[0.84rem] leading-relaxed text-muted">
              {t('footer.disclaimer')}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone="warn" dot>
                {t('demo.badge')}
              </Badge>
              <Badge tone="neutral">WCAG 2.2 AA</Badge>
            </div>
          </div>

          <nav aria-label={t('footer.sections')}>
            <p className="label-mono">{t('footer.sections')}</p>
            <ul className="mt-4 space-y-2.5">
              {SECTION_LINKS.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="link-underline text-[0.86rem] text-text-soft transition-colors hover:text-text"
                  >
                    {t(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={t('footer.legal')}>
            <p className="label-mono">{t('footer.legal')}</p>
            <ul className="mt-4 space-y-2.5">
              {LEGAL_LINKS.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="group flex items-center gap-2 text-[0.86rem] text-text-soft transition-colors hover:text-text"
                  >
                    <item.icon size={13} className="shrink-0 text-muted" />
                    <span className="link-underline">{t(item.key)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="label-mono">{t('footer.social')}</p>
            <ul className="mt-4 space-y-2.5">
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="link-underline text-[0.86rem] text-text-soft hover:text-text"
                >
                  {site.email}
                </a>
              </li>
              <li className="text-[0.86rem] text-muted">{site.phone}</li>
            </ul>
            <div className="mt-4 flex gap-2">
              {Object.entries(SOCIAL_ICONS).map(([id, Icon]) => {
                const href =
                  id === 'email' ? `mailto:${site.email}` : id === 'github' ? site.github : site.linkedin
                const external = id !== 'email'
                return (
                  <a
                    key={id}
                    href={href}
                    aria-label={id}
                    {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
                    className="grid size-9 place-items-center rounded-xl border border-line text-text-soft transition-all duration-300 hover:border-accent/50 hover:bg-accent/10 hover:text-text"
                  >
                    <Icon size={15.5} />
                  </a>
                )
              })}
            </div>
          </div>
        </div>

        {/* Pata paty */}
        <div className="mt-12 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.76rem] text-muted">
            © {new Date().getFullYear()} {site.person} · {site.name}. {t('footer.rights')}
          </p>
          <div className="flex items-center gap-3">
            <p className="hidden text-[0.76rem] text-muted sm:block">
              {t('footer.madeWith')} React · Tailwind · n8n
            </p>
            <BackToTop />
          </div>
        </div>
      </div>
    </footer>
  )
}
