import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { calculate } from '@/lib/calculate'
import { getBuildHash } from '@/lib/version'

window.tutorterm = { calculate, version: getBuildHash() }

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
