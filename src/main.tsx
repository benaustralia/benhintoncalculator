import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { calculate } from '@/lib/calculate'
import { formatTape } from '@/lib/formatTape'
import { TRANSLATIONS } from '@/i18n/translations'
import { getBuildHash } from '@/lib/version'

window.tutorterm = {
  calculate,
  // Resolves translations from the quote's own inputs.lang, so a headless caller
  // doesn't need to know the Translations shape exists — just calculate() then formatTape().
  formatTape: quote => formatTape(quote, TRANSLATIONS[quote.inputs.lang]),
  version: getBuildHash(),
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
