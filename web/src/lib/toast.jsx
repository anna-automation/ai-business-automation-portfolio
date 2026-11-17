import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, Check, Info, X, Zap } from 'lucide-react'
import { cn, uid } from './utils.js'
import { useReducedMotion } from './prefs.jsx'

const ToastContext = createContext(null)

const ICONS = {
  success: Check,
  info: Info,
  warn: AlertTriangle,
  run: Zap,
}

export function ToastProvider({ children }) {
  const [items, setItems] = useState([])
  const timers = useRef(new Map())

  const dismiss = useCallback((id) => {
    setItems((list) => list.filter((i) => i.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const push = useCallback(
    ({ title, description, variant = 'success', duration = 4200 }) => {
      const id = uid('toast')
      setItems((list) => [...list.slice(-3), { id, title, description, variant }])
      if (duration > 0) {
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), duration)
        )
      }
      return id
    },
    [dismiss]
  )

  const value = useMemo(() => ({ push, dismiss }), [push, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport items={items} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

function ToastViewport({ items, onDismiss }) {
  const reduced = useReducedMotion()

  return (
    <div
      className="no-print pointer-events-none fixed inset-x-0 bottom-0 z-[90] flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6"
      role="region"
      aria-live="polite"
      aria-label="Oznámení"
    >
      <AnimatePresence initial={false}>
        {items.map((item) => {
          const Icon = ICONS[item.variant] ?? Info
          return (
            <motion.div
              key={item.id}
              layout={!reduced}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, x: 24, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              className="glass pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl p-3.5 shadow-[var(--shadow-lift)]"
            >
              <span
                className={cn(
                  'mt-0.5 grid size-7 shrink-0 place-items-center rounded-full',
                  item.variant === 'success' && 'bg-accent text-accent-ink',
                  item.variant === 'run' && 'bg-violet text-white',
                  item.variant === 'warn' && 'bg-warn text-accent-ink',
                  item.variant === 'info' && 'bg-surface-2 text-text-soft'
                )}
              >
                <Icon size={15} strokeWidth={2.6} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[0.9rem] font-semibold leading-snug">{item.title}</p>
                {item.description && (
                  <p className="mt-0.5 text-[0.8rem] leading-snug text-muted">{item.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => onDismiss(item.id)}
                aria-label="Zavřít oznámení"
                className="-m-1 rounded-lg p-1 text-muted transition hover:bg-surface-2 hover:text-text"
              >
                <X size={14} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast musí být uvnitř <ToastProvider>')
  return ctx
}
