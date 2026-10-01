import { Suspense, lazy } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { Navbar, Hero, About, Services, Process } from './components/organisms';
import { ScrollToTop } from './components/molecules';
import { SmoothCursor } from './components/atoms';
import { useLanguage, useLenis } from './hooks';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

// Lazy load below-the-fold components
const Projects = lazy(() => import('./components/organisms/Projects').then(module => ({ default: module.Projects })));
const EducationSkills = lazy(() => import('./components/organisms/EducationSkills').then(module => ({ default: module.EducationSkills })));
const Contact = lazy(() => import('./components/organisms/Contact').then(module => ({ default: module.Contact })));
const Footer = lazy(() => import('./components/organisms/Footer').then(module => ({ default: module.Footer })));

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

  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="min-h-screen">
          <SkipLink />
          <SmoothCursor />
          <Navbar />
          <main id="main" tabIndex={-1} className="outline-none">
            <Hero />
            <About />
            <Services />
            <Process />

            {/* Lazy sections with skeleton fallback to prevent CLS */}
            <Suspense fallback={
              <div className="py-20 space-y-16 animate-pulse" aria-label="Loading content...">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="max-w-container mx-auto px-gutter space-y-6">
                    <div className="h-10 bg-line rounded-control w-1/3 mx-auto" />
                    <div className="h-4 bg-line rounded-control w-2/3 mx-auto" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[...Array(3)].map((_, j) => (
                        <div key={j} className="h-48 bg-line rounded-card" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            }>
              <Projects />
              <EducationSkills />
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
    </ThemeProvider>
  );
}

export default App;
