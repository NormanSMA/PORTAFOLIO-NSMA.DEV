import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { Navbar, Hero, Footer } from './components/organisms';
import { ScrollToTop } from './components/molecules';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text transition-colors">
          {/* Navbar con auto-hide */}
          <Navbar />
          
          {/* Hero Section */}
          <Hero />
          
          {/* Temporary sections */}
          <section id="about" className="min-h-screen flex items-center justify-center bg-light-card dark:bg-dark-card">
            <h2 className="text-4xl font-bold">About Section</h2>
          </section>

          <section id="projects" className="min-h-screen flex items-center justify-center">
            <h2 className="text-4xl font-bold">Projects Section</h2>
          </section>

          <section id="skills" className="min-h-screen flex items-center justify-center bg-light-card dark:bg-dark-card">
            <h2 className="text-4xl font-bold">Skills Section</h2>
          </section>

          <section id="experience" className="min-h-screen flex items-center justify-center">
            <h2 className="text-4xl font-bold">Experience Section</h2>
          </section>

          <section id="contact" className="min-h-screen flex items-center justify-center bg-light-card dark:bg-dark-card">
            <h2 className="text-4xl font-bold">Contact Section</h2>
          </section>

          {/* Footer */}
          <Footer />

          {/* Scroll to Top Button */}
          <ScrollToTop />
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
