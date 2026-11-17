import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCheck,
  Loader2,
  Mail,
  Send,
  Sparkles,
  Users,
} from 'lucide-react'
import { Button } from '../ui/Button.jsx'
import { Badge, Switch } from '../ui/primitives.jsx'
import { useT } from '../../lib/i18n.jsx'
import { usePrefs } from '../../lib/prefs.jsx'
import { useToast } from '../../lib/toast.jsx'
import { audiences } from '../../data/audiences.js'
import { getProduct } from '../../data/products.js'
import { cn } from '../../lib/utils.js'

/**
 * Poptávkový formulář rozdělený na krátké kroky. Druhý krok se odvíjí od
 * prvního — návštěvník vidí bolesti svého oboru a jen je odklikává. Odesláním
 * se nikam nic neposílá; místo toho se ukáže, co by automatizace udělala.
 */

const TEAM_SIZES = [
  { id: 'solo', label: { cs: '1–2 lidé', en: '1–2 people' } },
  { id: 'small', label: { cs: '3–10 lidí', en: '3–10 people' } },
  { id: 'mid', label: { cs: '11–30 lidí', en: '11–30 people' } },
  { id: 'big', label: { cs: '30+ lidí', en: '30+ people' } },
]

const GENERIC_PAINS = [
  { cs: 'Ruční přepisování dat mezi systémy', en: 'Retyping data between systems' },
  { cs: 'Příliš mnoho e-mailů', en: 'Too much e-mail' },
  { cs: 'Chybějící přehled o úkolech', en: 'No overview of tasks' },
  { cs: 'Reporty se dělají ručně', en: 'Reports are built by hand' },
]

const STEPS = 4

export default function ContactForm({ className }) {
  const { t, lang, pick } = useT()
  const { role, reducedMotion } = usePrefs()
  const { push } = useToast()

  const [step, setStep] = useState(0)
  const [industry, setIndustry] = useState(role ?? null)
  const [pains, setPains] = useState([])
  const [team, setTeam] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '' })
  const [consent, setConsent] = useState(false)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('editing')

  const audience = audiences.find((a) => a.id === industry) ?? null

  const painOptions = useMemo(() => {
    const base = audience ? audience.pains : GENERIC_PAINS
    return [...base, ...GENERIC_PAINS.slice(0, 2)].slice(0, 6)
  }, [audience])

  const recommended = useMemo(() => {
    const ids = audience?.picks ?? ['workflow', 'inbox', 'dashboard']
    return ids.map(getProduct).filter(Boolean)
  }, [audience])

  const togglePain = (value) =>
    setPains((list) => (list.includes(value) ? list.filter((p) => p !== value) : [...list, value]))

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = t('contact.required')
    if (!form.email.trim()) next.email = t('contact.required')
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) next.email = t('contact.invalidEmail')
    if (!consent) next.consent = t('contact.consentRequired')
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const canContinue =
    (step === 0 && Boolean(industry)) ||
    (step === 1 && pains.length > 0) ||
    (step === 2 && Boolean(team)) ||
    step === 3

  const submit = (event) => {
    event.preventDefault()
    if (!validate()) {
      push({ title: t('contact.required'), variant: 'warn' })
      return
    }
    setStatus('sending')
    setTimeout(
      () => {
        setStatus('done')
        push({
          title: t('contact.doneTitle'),
          description: t('demo.safe'),
          variant: 'success',
        })
      },
      reducedMotion ? 0 : 1100
    )
  }

  const reset = () => {
    setStep(0)
    setIndustry(role ?? null)
    setPains([])
    setTeam(null)
    setForm({ name: '', email: '', company: '', message: '' })
    setConsent(false)
    setErrors({})
    setStatus('editing')
  }

  if (status === 'done') {
    return (
      <div className={cn('card relative overflow-hidden p-6 sm:p-9', className)}>
        <div className="grid-paper absolute inset-0 opacity-40" aria-hidden />
        <div className="relative">
          <motion.span
            initial={reducedMotion ? false : { scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 20 }}
            className="grid size-12 place-items-center rounded-2xl bg-accent text-accent-ink"
          >
            <CheckCheck size={22} strokeWidth={2.4} />
          </motion.span>

          <h3 className="mt-5 text-[1.6rem] leading-tight">{t('contact.doneTitle')}</h3>
          <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-text-soft">
            {t('contact.doneBody')}
          </p>

          {/* co by se stalo v reálném nasazení */}
          <ol className="mt-7 space-y-2.5">
            {[
              { cs: 'Poptávka zapsána do CRM jako nový kontakt', en: 'Enquiry filed in the CRM as a new contact' },
              { cs: 'Vytvořen úkol „ozvat se do 2 pracovních dnů“', en: 'Task created: "reply within 2 business days"' },
              { cs: 'Odesláno potvrzení na váš e-mail', en: 'Confirmation sent to your e-mail' },
              { cs: 'Podle oboru připravena doporučená ukázka', en: 'A recommended demo prepared for your field' },
            ].map((line, i) => (
              <motion.li
                key={i}
                initial={reducedMotion ? false : { opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.12 * i + 0.2, duration: 0.4 }}
                className="flex items-start gap-2.5 text-[0.88rem] text-text-soft"
              >
                <Check size={14} strokeWidth={2.6} className="mt-1 shrink-0 text-accent" />
                {pick(line)}
              </motion.li>
            ))}
          </ol>

          {recommended.length > 0 && (
            <div className="mt-8">
              <p className="label-mono">{t('audiences.picks')}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {recommended.map((product) => (
                  <Button
                    key={product.id}
                    to={`/ukazky/${product.slug}`}
                    size="sm"
                    variant="quiet"
                    icon={ArrowRight}
                    magnetic={false}
                  >
                    {pick(product.title)}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <Button onClick={reset} variant="ghost" size="sm" className="mt-8">
            {t('action.reset')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className={cn('card p-6 sm:p-8', className)}>
      {/* postup */}
      <div className="flex items-center gap-3">
        <p className="label-mono shrink-0">
          {t('contact.step')} {step + 1} {t('contact.of')} {STEPS}
        </p>
        <div className="flex flex-1 gap-1.5">
          {Array.from({ length: STEPS }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => i < step && setStep(i)}
              aria-label={`${t('contact.step')} ${i + 1}`}
              className={cn(
                'h-1 flex-1 rounded-full transition-all duration-500',
                i < step ? 'bg-accent' : i === step ? 'bg-accent/50' : 'bg-line',
                i < step && 'cursor-pointer'
              )}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={reducedMotion ? false : { opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reducedMotion ? undefined : { opacity: 0, x: -16 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          className="mt-7 min-h-[17rem]"
        >
          {step === 0 && (
            <fieldset>
              <legend className="font-display text-[1.3rem] font-semibold leading-snug">
                {t('contact.q1')}
              </legend>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {audiences.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setIndustry(item.id)
                      setPains([])
                    }}
                    className={cn(
                      'flex items-center gap-2.5 rounded-xl border px-3.5 py-3 text-left text-[0.88rem] transition-all duration-300',
                      industry === item.id
                        ? 'border-accent bg-accent/12'
                        : 'border-line hover:border-line-strong hover:bg-surface-2'
                    )}
                  >
                    <Building2 size={15} className="shrink-0 text-muted" />
                    <span className="min-w-0 flex-1 truncate">{pick(item.name)}</span>
                    {industry === item.id && <Check size={14} className="shrink-0 text-accent" />}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setIndustry('other')}
                  className={cn(
                    'flex items-center gap-2.5 rounded-xl border px-3.5 py-3 text-left text-[0.88rem] transition-all duration-300',
                    industry === 'other'
                      ? 'border-accent bg-accent/12'
                      : 'border-line hover:border-line-strong hover:bg-surface-2'
                  )}
                >
                  <Sparkles size={15} className="shrink-0 text-muted" />
                  <span className="flex-1">{lang === 'en' ? 'Something else' : 'Něco jiného'}</span>
                  {industry === 'other' && <Check size={14} className="shrink-0 text-accent" />}
                </button>
              </div>
            </fieldset>
          )}

          {step === 1 && (
            <fieldset>
              <legend className="font-display text-[1.3rem] font-semibold leading-snug">
                {t('contact.q2')}
              </legend>
              <p className="mt-1.5 text-[0.82rem] text-muted">
                {lang === 'en' ? 'Pick anything that fits.' : 'Vyberte, co se vás týká.'}
              </p>
              <div className="mt-5 space-y-2">
                {painOptions.map((pain, i) => {
                  const label = pick(pain)
                  const selected = pains.includes(label)
                  return (
                    <button
                      key={`${label}-${i}`}
                      type="button"
                      onClick={() => togglePain(label)}
                      className={cn(
                        'flex w-full items-start gap-2.5 rounded-xl border px-3.5 py-3 text-left text-[0.88rem] leading-snug transition-all duration-300',
                        selected
                          ? 'border-accent bg-accent/12'
                          : 'border-line hover:border-line-strong hover:bg-surface-2'
                      )}
                    >
                      <span
                        className={cn(
                          'mt-0.5 grid size-4 shrink-0 place-items-center rounded border transition-colors',
                          selected ? 'border-accent bg-accent' : 'border-line-strong'
                        )}
                      >
                        {selected && <Check size={11} strokeWidth={3} className="text-accent-ink" />}
                      </span>
                      <span className="flex-1">{label}</span>
                    </button>
                  )
                })}
              </div>
            </fieldset>
          )}

          {step === 2 && (
            <fieldset>
              <legend className="font-display text-[1.3rem] font-semibold leading-snug">
                {t('contact.q3')}
              </legend>
              <div className="mt-5 grid grid-cols-2 gap-2">
                {TEAM_SIZES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTeam(item.id)}
                    className={cn(
                      'flex items-center gap-2.5 rounded-xl border px-3.5 py-4 text-[0.9rem] transition-all duration-300',
                      team === item.id
                        ? 'border-accent bg-accent/12'
                        : 'border-line hover:border-line-strong hover:bg-surface-2'
                    )}
                  >
                    <Users size={15} className="shrink-0 text-muted" />
                    {pick(item.label)}
                  </button>
                ))}
              </div>

              {/* živá rekapitulace — návštěvník vidí, že se ptám k něčemu */}
              {pains.length > 0 && (
                <div className="mt-6 rounded-xl border border-line bg-surface-2/60 p-4">
                  <p className="label-mono">
                    {lang === 'en' ? 'What I already know' : 'Co už o vás vím'}
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {audience && <Badge tone="accent">{pick(audience.name)}</Badge>}
                    {pains.slice(0, 3).map((pain) => (
                      <Badge key={pain} tone="neutral">
                        {pain.length > 34 ? `${pain.slice(0, 32)}…` : pain}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </fieldset>
          )}

          {step === 3 && (
            <fieldset className="space-y-4">
              <legend className="font-display text-[1.3rem] font-semibold leading-snug">
                {t('contact.q4')}
              </legend>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  id="cf-name"
                  label={t('contact.name')}
                  value={form.name}
                  error={errors.name}
                  onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                  autoComplete="name"
                />
                <Field
                  id="cf-email"
                  type="email"
                  label={t('contact.email')}
                  value={form.email}
                  error={errors.email}
                  onChange={(v) => setForm((f) => ({ ...f, email: v }))}
                  autoComplete="email"
                  icon={Mail}
                />
              </div>

              <Field
                id="cf-company"
                label={t('contact.company')}
                value={form.company}
                onChange={(v) => setForm((f) => ({ ...f, company: v }))}
                autoComplete="organization"
                optional
              />

              <div>
                <label htmlFor="cf-message" className="label-mono">
                  {t('contact.message')}
                </label>
                <textarea
                  id="cf-message"
                  rows={3}
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  placeholder={t('contact.messagePlaceholder')}
                  className="mt-2 w-full resize-y rounded-xl border border-line bg-surface px-3.5 py-3 text-[0.9rem] outline-none transition-colors placeholder:text-muted focus:border-accent"
                />
              </div>

              <div
                className={cn(
                  'rounded-xl border p-3.5 transition-colors',
                  errors.consent ? 'border-coral/50 bg-coral/8' : 'border-line bg-surface-2/50'
                )}
              >
                <Switch
                  id="cf-consent"
                  checked={consent}
                  onChange={(v) => {
                    setConsent(v)
                    setErrors((e) => ({ ...e, consent: undefined }))
                  }}
                  label={t('contact.consent')}
                  description={errors.consent ?? t('demo.safe')}
                />
              </div>
            </fieldset>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ovládání */}
      <div className="mt-7 flex items-center justify-between gap-3 border-t border-line pt-5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          icon={ArrowLeft}
          iconRight={false}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          magnetic={false}
        >
          {t('action.prev')}
        </Button>

        {step < STEPS - 1 ? (
          <Button
            type="button"
            size="md"
            icon={ArrowRight}
            onClick={() => setStep((s) => Math.min(STEPS - 1, s + 1))}
            disabled={!canContinue}
          >
            {t('action.next')}
          </Button>
        ) : (
          <Button
            type="submit"
            size="md"
            icon={status === 'sending' ? Loader2 : Send}
            disabled={status === 'sending'}
          >
            {status === 'sending' ? t('contact.sending') : t('contact.submit')}
          </Button>
        )}
      </div>
    </form>
  )
}

function Field({ id, label, value, onChange, error, type = 'text', icon: Icon, optional, autoComplete }) {
  const { lang } = useT()
  return (
    <div>
      <label htmlFor={id} className="label-mono flex items-center gap-2">
        {label}
        {optional && (
          <span className="normal-case tracking-normal text-muted">
            ({lang === 'en' ? 'optional' : 'nepovinné'})
          </span>
        )}
      </label>
      <div className="relative mt-2">
        {Icon && (
          <Icon
            size={15}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          />
        )}
        <input
          id={id}
          type={type}
          value={value}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'h-11 w-full rounded-xl border bg-surface px-3.5 text-[0.9rem] outline-none transition-colors',
            Icon && 'pl-10',
            error ? 'border-coral' : 'border-line focus:border-accent'
          )}
        />
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-[0.76rem] text-coral">
          {error}
        </p>
      )}
    </div>
  )
}
