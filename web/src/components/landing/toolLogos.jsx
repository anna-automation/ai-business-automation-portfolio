/**
 * Loga nástrojů kreslená inline, aby se nikde nenačítalo šest obrázků navíc.
 * Značky jsou zjednodušené na tvar, který je v dlaždici 40 px poznat.
 */

/** n8n — řetízek uzlů, který se vpravo rozdvojí. */
export function N8nLogo({ className }) {
  return (
    <svg viewBox="0 0 54 34" fill="none" className={className} aria-hidden>
      <g stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" fill="none">
        <path d="M8.4 17h4.2" />
        <path d="M21.6 17h3.4" />
        <path d="M30 17c4 0 3.2-7.4 7.4-7.4" />
        <path d="M30 17c4 0 3.2 7.4 7.4 7.4" />
        <circle cx="17.1" cy="17" r="4.5" />
        <circle cx="42.4" cy="9.6" r="4.6" />
        <circle cx="42.4" cy="24.4" r="4.6" />
      </g>
      <circle cx="5" cy="17" r="3.4" fill="currentColor" />
      <circle cx="27.6" cy="17" r="2.8" fill="currentColor" />
    </svg>
  )
}

/** Google Sheets — zelený list s ohnutým rohem a tabulkou. */
export function SheetsLogo({ className }) {
  return (
    <svg viewBox="0 0 32 40" fill="none" className={className} aria-hidden>
      <path d="M4 3.2A2.2 2.2 0 0 1 6.2 1h12.4L30 12.3v24.5A2.2 2.2 0 0 1 27.8 39H6.2A2.2 2.2 0 0 1 4 36.8z" fill="#21A366" />
      <path d="M18.6 1 30 12.3H20.8a2.2 2.2 0 0 1-2.2-2.2z" fill="#107C41" />
      <rect x="9.4" y="17" width="15.2" height="13.4" rx="1.1" fill="#fff" />
      <path
        d="M9.4 21.6h15.2M9.4 26h15.2M14.5 17v13.4M19.5 17v13.4"
        stroke="#21A366"
        strokeWidth="1.3"
      />
    </svg>
  )
}

/** Gmail — barevné „M“ z obálky. */
export function GmailLogo({ className }) {
  return (
    <svg viewBox="0 0 44 32" fill="none" className={className} aria-hidden>
      <path d="M3.3 32h6.5V16.4L0 9.1v19.6A3.3 3.3 0 0 0 3.3 32" fill="#4285F4" />
      <path d="M34.2 32h6.5a3.3 3.3 0 0 0 3.3-3.3V9.1l-9.8 7.3z" fill="#34A853" />
      <path d="M34.2 3.3v13.1L44 9.1V4.9c0-4.05-4.62-6.36-7.86-3.93z" fill="#FBBC04" />
      <path d="M9.8 16.4V3.3L22 12.45 34.2 3.3v13.1L22 25.55z" fill="#EA4335" />
      <path d="M0 4.9v4.2l9.8 7.3V3.3L7.86.97C4.62-1.46 0 .85 0 4.9" fill="#C5221F" />
    </svg>
  )
}

/** Notion — bílý blok s „N“. */
export function NotionLogo({ className }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden>
      <rect x="1.6" y="1.6" width="36.8" height="36.8" rx="6" fill="#fff" stroke="#111" strokeWidth="2.4" />
      <path
        d="M13 28.4V13.2l1.4-.5 11 14.1V12.6"
        stroke="#111"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M13 13.2h1.4M24.2 12.6h2.6" stroke="#111" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  )
}
