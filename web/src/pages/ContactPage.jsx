import Kontakt from '../components/kontakt/Kontakt.jsx'
import { useDocumentTitle, useMetaDescription } from '../lib/useDocumentTitle.js'

export default function ContactPage() {
  useDocumentTitle('Kontakt — MAKÁSAMO')
  useMetaDescription(
    'Máte nápad, proces nebo problém? Napište nám a do 24 hodin se ozveme s konkrétním návrhem, jak to vyřešit.'
  )

  return <Kontakt />
}
