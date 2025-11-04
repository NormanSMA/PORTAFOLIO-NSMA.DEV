import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { useTheme, useLanguage } from './hooks';

function TestComponent() {
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text transition-colors">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              {t('hero.greeting')} 🚀
            </h1>
            <p className="text-xl text-light-textSecondary dark:text-dark-textSecondary">
              {t('hero.subtitle')}
            </p>
          </div>

          {/* Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Theme Toggle Card */}
            <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-semibold">🎨 {t('nav.about')}</h3>
              <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                {t('about.description')}
              </p>
              <button
                onClick={toggleTheme}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
              </button>
              <p className="text-xs text-center">
                Current: <span className="font-bold">{theme}</span>
              </p>
            </div>

            {/* Language Toggle Card */}
            <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-semibold">🌍 {t('nav.contact')}</h3>
              <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                {t('contact.subtitle')}
              </p>
              <button
                onClick={toggleLanguage}
                className="w-full bg-secondary-500 hover:bg-secondary-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {language === 'es' ? '🇬🇧 English' : '🇪🇸 Español'}
              </button>
              <p className="text-xs text-center">
                Current: <span className="font-bold">{language.toUpperCase()}</span>
              </p>
            </div>

          </div>

          {/* Features List */}
          <div className="bg-gradient-to-r from-primary-500/10 to-secondary-500/10 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-center">✅ {t('projects.title')}</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>ThemeContext (Dark/Light mode)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>LanguageContext (ES/EN)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Tailwind Colors & Dark Mode</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Custom Hooks</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Translations (i18n)</span>
              </li>
            </ul>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-light-textSecondary dark:text-dark-textSecondary">
            <p>{t('footer.madeWith')} ❤️ {t('footer.by')} Norman Martínez</p>
          </div>

        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
