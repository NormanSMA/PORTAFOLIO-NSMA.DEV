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
          
          <Suspense fallback={<div className="py-20 text-center">Loading...</div>}>
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
