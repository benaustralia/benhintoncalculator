import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { calculate } from '@/lib/calculate'
import { formatTape } from '@/lib/formatTape'
import { TRANSLATIONS } from '@/i18n/translations'
import { getBuildHash } from '@/lib/version'
import { YEAR_DATA, getCurrentYear, getAvailableYears } from '@/data/terms'
import { SLOTS, LEVELS, DURATIONS } from '@/lib/termConstants'
import { getHelp } from '@/lib/help'

window.tutorterm = {
  calculate,
  // Resolves translations from the quote's own inputs.lang, so a headless caller
  // doesn't need to know the Translations shape exists — just calculate() then formatTape().
  formatTape: quote => formatTape(quote, TRANSLATIONS[quote.inputs.lang]),
  // The rest of calculate()'s input surface, so a caller never has to hand-type term
  // dates or guess a valid slot/level/duration key — everything it can pass is discoverable.
  yearData: YEAR_DATA,
  getCurrentYear,
  getAvailableYears,
  slots: SLOTS,
  levels: LEVELS,
  durations: DURATIONS,
  version: getBuildHash(),
  // Self-description for a caller already executing JS in the page — see /llms.txt for the
  // same information aimed at a reader without JS (a crawler, or an agent before it loads the page).
  help: getHelp,
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
