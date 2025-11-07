import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { Navbar, Hero, About, Services, Footer, Projects } from './components/organisms';
import { ScrollToTop } from './components/molecules';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg transition-colors">
          <Navbar />
          <Hero />
          <About />
          <Services />
          <Projects />
          {/* Próximas: Experience, Contact */}
          <Footer />
          <ScrollToTop />
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
