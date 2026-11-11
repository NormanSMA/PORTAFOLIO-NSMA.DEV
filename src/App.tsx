import { Suspense, lazy, useEffect, useState } from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import { Navbar, Hero } from './components/organisms';
import { PageIntro } from './components/organisms/PageIntro';
import { ScrollToTop } from './components/molecules';
import { useLanguage, useLenis } from './hooks';
import { ScrollTrigger } from './lib/gsap';
import type { Language } from './types';

const loadAbout = () => import('./components/organisms/About').then((m) => ({ default: m.About }));
const loadProjects = () => import('./components/organisms/Projects').then((m) => ({ default: m.Projects }));
const loadExperience = () => import('./components/organisms/Experience').then((m) => ({ default: m.Experience }));
const loadApproach = () => import('./components/organisms/Approach').then((m) => ({ default: m.Approach }));
const loadContact = () => import('./components/organisms/Contact').then((m) => ({ default: m.Contact }));
const loadFooter = () => import('./components/organisms/Footer').then((m) => ({ default: m.Footer }));

const About = lazy(loadAbout);
const Projects = lazy(loadProjects);
const Experience = lazy(loadExperience);
const Approach = lazy(loadApproach);
const Contact = lazy(loadContact);
const Footer = lazy(loadFooter);

// Analytics measure the visit; they wait until the page has loaded and the main thread is idle.
const VercelInsights = lazy(() =>
  Promise.all([import('@vercel/analytics/react'), import('@vercel/speed-insights/react')]).then(
    ([{ Analytics }, { SpeedInsights }]) => ({
      default: () => (
        <>
          <Analytics />
          <SpeedInsights />
        </>
      ),
    }),
  ),
);

const IDLE_TIMEOUT_MS = 4000;

function useIdleAfterLoad(): boolean {
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    let idleId: number | undefined;
    const markIdle = () => setIdle(true);
    const wait = () => {
      idleId =
        typeof window.requestIdleCallback === 'function'
          ? window.requestIdleCallback(markIdle, { timeout: IDLE_TIMEOUT_MS })
          : window.setTimeout(markIdle, IDLE_TIMEOUT_MS);
    };

    if (document.readyState === 'complete') wait();
    else window.addEventListener('load', wait, { once: true });

    return () => {
      window.removeEventListener('load', wait);
      if (idleId === undefined) return;
      if (typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(idleId);
      else window.clearTimeout(idleId);
    };
  }, []);

  return idle;
}

const REFRESH_DEBOUNCE_MS = 250;

// Images, fonts, the project ficha and a viewport change all alter the page height after the
// triggers measured it, which leaves every later reveal offset until the next refresh.
function useRefreshOnHeightChange() {
  useEffect(() => {
    const main = document.getElementById('main');
    if (!main || typeof ResizeObserver === 'undefined') return;

    let lastHeight = main.offsetHeight;
    let timer: number | undefined;
    const observer = new ResizeObserver(() => {
      const height = main.offsetHeight;
      if (Math.abs(height - lastHeight) < 2) return;
      lastHeight = height;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => ScrollTrigger.refresh(), REFRESH_DEBOUNCE_MS);
    });
    observer.observe(main);

    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, []);
}

function SkipLink() {
  const { t } = useLanguage();

  return (
    <a href="#main" className="skip-link">
      {t('common.skipToContent')}
    </a>
  );
}

interface AppProps {
  initialLanguage?: Language;
}

function App({ initialLanguage }: AppProps) {
  useLenis();
  useRefreshOnHeightChange();
  const isIdle = useIdleAfterLoad();

  return (
    <LanguageProvider initialLanguage={initialLanguage}>
      <div className="min-h-screen">
        <PageIntro />
        <SkipLink />
        <Navbar />
        <main id="main" tabIndex={-1} className="outline-none">
          <Hero />
          {/* One boundary per section: each hydrates as soon as its own chunk arrives, over the prerendered HTML. */}
          <Suspense fallback={<div className="min-h-svh" aria-hidden="true" />}>
            <About />
          </Suspense>
          <Suspense fallback={null}>
            <Projects />
          </Suspense>
          <Suspense fallback={null}>
            <Experience />
          </Suspense>
          <Suspense fallback={null}>
            <Approach />
          </Suspense>
          <Suspense fallback={null}>
            <Contact />
          </Suspense>
        </main>

        <Suspense fallback={null}>
          <Footer />
        </Suspense>

        <ScrollToTop />
        {isIdle && (
          <Suspense fallback={null}>
            <VercelInsights />
          </Suspense>
        )}
      </div>
    </LanguageProvider>
  );
}

export default App;
