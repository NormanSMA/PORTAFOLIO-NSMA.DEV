// One list for Navbar and Footer; ids match the section ids every section organism renders.
export const navItems = [
  { id: 'home', labelKey: 'nav.home' },
  { id: 'about', labelKey: 'nav.about' },
  { id: 'projects', labelKey: 'nav.projects' },
  { id: 'experience', labelKey: 'nav.experience' },
  { id: 'approach', labelKey: 'nav.approach' },
  { id: 'contact', labelKey: 'nav.contact' },
] as const;

export const sectionIds = navItems.map((item) => item.id);
