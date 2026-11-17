import { cn } from '../../lib/utils.js'

/**
 * Značka MAKÁSAMO — písmeno O se šipkou.
 * Používá se tam, kde se celý nápis nevejde: dlaždice, odznaky, favicon.
 */
export default function Logo({ className, alt = '' }) {
  return (
    <img
      src="/media/makasamo-znacka.png"
      alt={alt}
      aria-hidden={alt ? undefined : true}
      width={227}
      height={227}
      className={cn('shrink-0 object-contain', className)}
      draggable={false}
    />
  )
}

/** Celý nápis MAKÁSAMO. Šířku řídí rodič, výška se dopočítá. */
export function Wordmark({ className, alt = 'MAKÁSAMO' }) {
  return (
    <img
      src="/media/makasamo-logo.png"
      alt={alt}
      width={1592}
      height={264}
      className={cn('h-auto shrink-0 object-contain', className)}
      draggable={false}
    />
  )
}
