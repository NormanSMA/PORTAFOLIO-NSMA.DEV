import { Suspense, lazy } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { Navbar, Hero, About, Services } from './components/organisms';
import { ScrollToTop } from './components/molecules';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

// Lazy load below-the-fold components
const Projects = lazy(() => import('./components/organisms/Projects').then(module => ({ default: module.Projects })));
const EducationSkills = lazy(() => import('./components/organisms/EducationSkills').then(module => ({ default: module.EducationSkills })));
const Contact = lazy(() => import('./components/organisms/Contact').then(module => ({ default: module.Contact })));
const Footer = lazy(() => import('./components/organisms/Footer').then(module => ({ default: module.Footer })));

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg transition-colors">
          <Navbar />
          <Hero />
          <About />
          <Services />
          
          {/* Lazy sections with skeleton fallback to prevent CLS */}
        <Suspense fallback={
          <div className="py-20 space-y-16 animate-pulse" aria-label="Loading content...">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="max-w-6xl mx-auto px-4 space-y-6">
                <div className="h-10 bg-light-border dark:bg-dark-border rounded-lg w-1/3 mx-auto" />
                <div className="h-4 bg-light-border dark:bg-dark-border rounded w-2/3 mx-auto" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-48 bg-light-border dark:bg-dark-border rounded-2xl" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        }>
            <Projects />
            <EducationSkills />
            <Contact /> 
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
