import { Suspense, lazy, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { Navbar, Hero, About, Services } from './components/organisms';
import { ScrollToTop } from './components/molecules';
import { IntroScreen } from './components/atoms';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

// Lazy load below-the-fold components
const Projects = lazy(() => import('./components/organisms/Projects').then(module => ({ default: module.Projects })));
const ImpactMetrics = lazy(() => import('./components/organisms/ImpactMetrics').then(module => ({ default: module.ImpactMetrics })));
const Process = lazy(() => import('./components/organisms/Process').then(module => ({ default: module.Process })));
const EducationSkills = lazy(() => import('./components/organisms/EducationSkills').then(module => ({ default: module.EducationSkills })));
const Contact = lazy(() => import('./components/organisms/Contact').then(module => ({ default: module.Contact })));
const Footer = lazy(() => import('./components/organisms/Footer').then(module => ({ default: module.Footer })));

const SHOW_IMPACT_METRICS = false;

function App() {
  const reduceMotion = useReducedMotion();
  const [introVisible, setIntroVisible] = useState<boolean>(
    () => !sessionStorage.getItem('intro-seen')
  );

  const handleIntroDone = () => {
    sessionStorage.setItem('intro-seen', '1');
    setIntroVisible(false);
  };

  return (
    <ThemeProvider>
      <LanguageProvider>
        {introVisible && <IntroScreen onDone={handleIntroDone} />}
        <motion.div
          className="min-h-screen bg-light-bg dark:bg-dark-bg transition-colors"
          style={introVisible ? { visibility: 'hidden' } : undefined}
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: introVisible ? 0 : 0.05 }}
        >
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
          {SHOW_IMPACT_METRICS ? <ImpactMetrics /> : null}
            <Process />
            <Projects />
            <EducationSkills />
            <Contact /> 
            <Footer />
          </Suspense>

          <ScrollToTop />
          <Analytics />
          <SpeedInsights />
        </motion.div>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
