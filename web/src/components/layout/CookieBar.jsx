import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Cookie, X } from 'lucide-react'
import { usePrefs } from '../../lib/prefs.jsx'
import { useT } from '../../lib/i18n.jsx'
import { Button } from '../ui/Button.jsx'
import { Switch } from '../ui/primitives.jsx'

/**
 * Cookie lišta. Web žádné sledovací cookies nepoužívá, takže je napsaná
 * narovinu — a přepínače pro analytiku i marketing jsou tu jen jako ukázka,
 * jak by souhlas vypadal. To je samo o sobě součást portfolia.
 */
export default function CookieBar() {
  const { cookies, setCookies } = usePrefs()
  const { t } = useT()
  const [detail, setDetail] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const [marketing, setMarketing] = useState(false)

  const decided = cookies != null

  return (
    <AnimatePresence>
      {!decided && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
          className="no-print fixed inset-x-0 bottom-0 z-[75] p-3 sm:p-4"
          role="dialog"
          aria-label={t('cookies.title')}
        >
          <div className="glass mx-auto w-full max-w-3xl overflow-hidden rounded-2xl shadow-[var(--shadow-lift)]">
            <div className="flex items-start gap-3.5 p-4">
              <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent">
                <Cookie size={16} strokeWidth={2.2} />
              </span>

              <div className="min-w-0 flex-1">
                <p className="font-display text-[1rem] font-semibold">{t('cookies.title')}</p>
                <p className="mt-1 text-[0.82rem] leading-relaxed text-text-soft">
                  {t('cookies.body')}{' '}
                  <Link to="/cookies" className="link-underline text-text">
                    {t('legal.cookies')}
                  </Link>
                </p>

                <AnimatePresence>
                  {detail && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 space-y-3 rounded-xl border border-line bg-surface-2/60 p-3.5">
                        <Switch
                          checked
                          onChange={() => {}}
                          label={t('cookies.necessary')}
                          description={t('cookies.necessaryDesc')}
                        />
                        <Switch
                          checked={analytics}
                          onChange={setAnalytics}
                          label={t('cookies.analytics')}
                          description={t('cookies.analyticsDesc')}
                        />
                        <Switch
                          checked={marketing}
                          onChange={setMarketing}
                          label={t('cookies.marketing')}
                          description={t('cookies.marketingDesc')}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    magnetic={false}
                    onClick={() =>
                      setCookies(
                        detail ? JSON.stringify({ analytics, marketing }) : 'necessary'
                      )
                    }
                  >
                    {detail ? t('cookies.save') : t('cookies.accept')}
                  </Button>
                  {!detail && (
                    <Button
                      size="sm"
                      variant="ghost"
                      magnetic={false}
                      onClick={() => setDetail(true)}
                    >
                      {t('cookies.settings')}
                    </Button>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCookies('necessary')}
                aria-label={t('cookies.reject')}
                className="-m-1 rounded-lg p-1 text-muted transition hover:bg-surface-2 hover:text-text"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
