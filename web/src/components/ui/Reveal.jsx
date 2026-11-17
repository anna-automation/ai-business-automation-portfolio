import { motion } from 'framer-motion'
import { cn, words } from '../../lib/utils.js'
import { useReducedMotion } from '../../lib/prefs.jsx'

/** Obsah, který se vynoří při scrollování. Při omezeném pohybu se jen objeví. */
export function Reveal({
  children,
  delay = 0,
  y = 22,
  blur = true,
  once = true,
  className,
  as = 'div',
}) {
  const reduced = useReducedMotion()
  const Tag = motion[as] ?? motion.div

  if (reduced) {
    const Plain = as
    return <Plain className={className}>{children}</Plain>
  }

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y, filter: blur ? 'blur(6px)' : 'none' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once, margin: '-12% 0px -8% 0px' }}
      transition={{ duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </Tag>
  )
}

/** Děti se vynoří jedno po druhém. */
export function RevealGroup({ children, stagger = 0.07, className, as = 'div' }) {
  const reduced = useReducedMotion()
  const Tag = motion[as] ?? motion.div

  if (reduced) {
    const Plain = as
    return <Plain className={className}>{children}</Plain>
  }

  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: '-10% 0px' }}
      variants={{ hidden: {}, shown: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </Tag>
  )
}

export function RevealItem({ children, className, y = 18, as = 'div' }) {
  const reduced = useReducedMotion()
  const Tag = motion[as] ?? motion.div

  if (reduced) {
    const Plain = as
    return <Plain className={className}>{children}</Plain>
  }

  return (
    <Tag
      className={className}
      variants={{
        hidden: { opacity: 0, y, filter: 'blur(5px)' },
        shown: { opacity: 1, y: 0, filter: 'blur(0px)' },
      }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </Tag>
  )
}

/**
 * Kinetická typografie — nadpis se skládá po slovech.
 * Každé slovo vyjede zdola za maskou, takže to působí jako sázení textu.
 */
export function KineticText({ text, className, delay = 0, stagger = 0.045, as: Tag = 'span' }) {
  const reduced = useReducedMotion()

  if (reduced) return <Tag className={className}>{text}</Tag>

  return (
    <Tag className={cn('inline-block', className)} aria-label={text}>
      {words(text).map((word, i) =>
        /^\s+$/.test(word) ? (
          <span key={`s-${i}`}> </span>
        ) : (
          <span key={`${word}-${i}`} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
            <motion.span
              aria-hidden
              className="inline-block"
              initial={{ y: '110%', opacity: 0 }}
              animate={{ y: '0%', opacity: 1 }}
              transition={{
                duration: 0.95,
                delay: delay + i * stagger,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {word}
            </motion.span>
          </span>
        )
      )}
    </Tag>
  )
}

/** Varianta kinetického textu spouštěná scrollováním. */
export function KineticHeading({ text, className, stagger = 0.04, as: Tag = 'span' }) {
  const reduced = useReducedMotion()

  if (reduced) return <Tag className={className}>{text}</Tag>

  return (
    <Tag className={cn('inline-block', className)}>
      {words(text).map((word, i) =>
        /^\s+$/.test(word) ? (
          <span key={`s-${i}`}> </span>
        ) : (
          <span key={`${word}-${i}`} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
            <motion.span
              className="inline-block"
              initial={{ y: '110%' }}
              whileInView={{ y: '0%' }}
              viewport={{ once: true, margin: '-8% 0px' }}
              transition={{ duration: 0.9, delay: i * stagger, ease: [0.16, 1, 0.3, 1] }}
            >
              {word}
            </motion.span>
          </span>
        )
      )}
    </Tag>
  )
}
