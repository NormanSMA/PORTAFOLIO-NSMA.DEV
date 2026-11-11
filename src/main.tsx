import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { startIntroIfAllowed } from './lib/intro'
import { installTrustedTypesPolicy } from './lib/trustedTypes'

// Tells CSS that scripts did run: without this mark, index.css reveals the animated content after a few seconds.
document.documentElement.dataset.js = ''
installTrustedTypesPolicy()
// Decides before React renders whether the page opens with the frame intro.
startIntroIfAllowed()

const container = document.getElementById('root')!
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

// The build prerenders each language, so React adopts that HTML. The dev server sends only the placeholder comment.
if (container.firstElementChild) {
  hydrateRoot(container, app)
} else {
  createRoot(container).render(app)
}
