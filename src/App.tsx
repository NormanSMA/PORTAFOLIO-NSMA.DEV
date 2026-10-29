import { Suspense, lazy, useEffect } from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import { Navbar, Hero } from './components/organisms';
import { PageIntro } from './components/organisms/PageIntro';
import { ScrollToTop } from './components/molecules';
import { useLanguage, useLenis } from './hooks';
import { ScrollTrigger } from './lib/gsap';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

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

const IDLE_PRELOAD_DELAY_MS = 2500;

// Preloading after the first paint keeps anchor links and scroll triggers stable without weighing on the initial load.
function usePreloadSections() {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const loaders = [loadAbout, loadProjects, loadExperience, loadApproach, loadContact, loadFooter];
      Promise.all(loaders.map((load) => load())).then(() => {
        requestAnimationFrame(() => ScrollTrigger.refresh());
      });
    }, IDLE_PRELOAD_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, []);
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

function App() {
  useLenis();
  usePreloadSections();
  useRefreshOnHeightChange();

  return (
    <LanguageProvider>
      <div className="min-h-screen">
        <PageIntro />
        <SkipLink />
        <Navbar />
        <main id="main" tabIndex={-1} className="outline-none">
          <Hero />
          <Suspense fallback={<div className="min-h-svh" aria-hidden="true" />}>
            <About />
            <Projects />
            <Experience />
            <Approach />
            <Contact />
          </Suspense>
        </main>

        <Suspense fallback={null}>
          <Footer />
        </Suspense>

        <ScrollToTop />
        <Analytics />
        <SpeedInsights />
      </div>
    </LanguageProvider>
  );
}

export default App;
