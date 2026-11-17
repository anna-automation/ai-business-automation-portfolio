import Landing from '../components/landing/Landing.jsx'
import { useDocumentTitle } from '../lib/useDocumentTitle.js'

export default function HomePage() {
  useDocumentTitle('MAKÁSAMO — automatizace šetří čas, peníze a nervy')

  return <Landing />
}
