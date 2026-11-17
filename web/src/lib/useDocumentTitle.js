import { useEffect } from 'react'

/** Nastaví titulek stránky a po odchodu ho vrátí zpět. */
export function useDocumentTitle(title) {
  useEffect(() => {
    if (!title) return
    const previous = document.title
    document.title = title
    return () => {
      document.title = previous
    }
  }, [title])
}

/** Nastaví meta description — kvůli sdílení odkazů na jednotlivé ukázky. */
export function useMetaDescription(description) {
  useEffect(() => {
    if (!description) return
    const tag = document.querySelector('meta[name="description"]')
    if (!tag) return
    const previous = tag.getAttribute('content')
    tag.setAttribute('content', description)
    return () => {
      if (previous != null) tag.setAttribute('content', previous)
    }
  }, [description])
}
