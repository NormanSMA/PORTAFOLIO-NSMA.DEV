import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { Navbar } from './components/organisms';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text transition-colors">
          <Navbar />
          
          {/* Temporary content for testing */}
          <div className="pt-20">
            <section id="home" className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                  Home Section
                </h1>
                <p className="text-xl">Scroll down to test navbar behavior</p>
              </div>
            </section>

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
          </div>
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
