import Ukazky from '../components/ukazky/Ukazky.jsx'
import { useDocumentTitle, useMetaDescription } from '../lib/useDocumentTitle.js'

export default function ProductsPage() {
  useDocumentTitle('Ukázky — MAKÁSAMO')
  useMetaDescription(
    'Konkrétní automatizace, workflow a AI řešení z praxe. Filtrovat můžete podle cílové skupiny, kategorie nebo použitých nástrojů.'
  )

  return <Ukazky />
}
