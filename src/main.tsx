import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App'
import { loadFonts } from './lib/fonts'
import { useSite } from './lib/store'

// Paramètres de test : ?quality=eco, ?motion=reduced
const params = new URLSearchParams(window.location.search)
if (params.get('quality') === 'eco') useSite.getState().setQuality('eco')
if (params.get('motion') === 'reduced') useSite.getState().setReducedMotionOverride(true)

loadFonts()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
