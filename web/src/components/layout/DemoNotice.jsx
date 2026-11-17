import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Info, X } from 'lucide-react'
import { useT } from '../../lib/i18n.jsx'

/**
 * Trvalé upozornění, že jde o simulaci. Je vidět na každé stránce, dokud ho
 * návštěvník nezavře — pak se místo něj drží jen drobný štítek v patičce
 * a u jednotlivých ukázek.
 */
export default function DemoNotice() {
  const { t } = useT()
  const [hidden, setHidden] = useState(() => {
    try {
      return sessionStorage.getItem('abl-demo-notice') === 'hidden'
    } catch {
      return false
    }
  })

  useEffect(() => {
    if (!hidden) return
    try {
      sessionStorage.setItem('abl-demo-notice', 'hidden')
    } catch {
      /* nic — upozornění se při dalším načtení prostě zobrazí znovu */
    }
  }, [hidden])

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="no-print fixed inset-x-0 top-[4.5rem] z-40 overflow-hidden"
        >
          <div className="mx-auto w-full max-w-[82rem] px-5 sm:px-7">
            <div className="flex items-start gap-2.5 rounded-xl border border-warn/30 bg-warn/8 px-3.5 py-2.5 backdrop-blur-sm">
              <Info size={14} className="mt-0.5 shrink-0 text-warn" />
              <p className="flex-1 text-[0.78rem] leading-snug text-text-soft">
                <strong className="font-semibold text-text">{t('demo.notice')}.</strong>{' '}
                {t('demo.noticeLong')}
              </p>
              <button
                type="button"
                onClick={() => setHidden(true)}
                aria-label={t('nav.close')}
                className="-m-1 rounded-lg p-1 text-muted transition hover:text-text"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
