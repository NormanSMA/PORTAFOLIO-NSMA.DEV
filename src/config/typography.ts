// Sistema de tipografía consistente para todo el portfolio

export const typography = {
  // Títulos de sección (Hero, About, Services, etc.)
  // Keep section titles large but consistent across breakpoints to avoid
  // jarring jumps in scale. Max at lg:text-5xl for a balanced layout.
  sectionTitle: 'text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-bold',
  
  // Subtítulos de sección
  sectionSubtitle: 'text-base sm:text-lg md:text-xl',
  
  // Títulos de tarjetas/componentes
  cardTitle: 'text-xl sm:text-2xl md:text-2xl font-bold',
  
  // Subtítulos de tarjetas
  cardSubtitle: 'text-lg sm:text-xl md:text-2xl font-semibold',
  
  // Texto de cuerpo
  body: 'text-sm sm:text-base md:text-lg',
  
  // Texto secundario/descripción
  secondary: 'text-sm sm:text-base',
  
  // Texto pequeño
  small: 'text-xs sm:text-sm',
  // Texto para el 'tag' o línea corta en el Hero (p.ej. "Diseño y construyo...")
  // Un poco más grande que `small`, visible y legible en móvil y escalando en pantallas mayores.
  tag: 'text-sm sm:text-base md:text-lg font-medium',
  // Número grande para estadísticas (About) — más prominente
  statsNumber: 'text-4xl sm:text-5xl md:text-6xl lg:text-6xl font-extrabold',
} as const;
