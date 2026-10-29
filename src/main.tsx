import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { startIntroIfAllowed } from './lib/intro'

// Decides before React renders whether the page opens with the frame intro.
startIntroIfAllowed()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
