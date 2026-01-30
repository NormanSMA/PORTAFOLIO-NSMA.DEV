// Sistema de tipografía Yaldevi para el portfolio
// Jerarquía: Display → H1-H5 → Body (Large/Regular/Small) → Caption

export const typography = {
  // Display - Priority heading text (títulos destacados)
  display: 'text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold',
  
  // H1 - Primary page heading
  h1: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold',
  
  // H2 - Section heading
  h2: 'text-2xl sm:text-3xl md:text-4xl font-bold',
  
  // H3 - Sub-section heading
  h3: 'text-xl sm:text-2xl md:text-3xl font-semibold',
  
  // H4 - Minor heading
  h4: 'text-lg sm:text-xl md:text-2xl font-semibold',
  
  // H5 - Small heading
  h5: 'text-base sm:text-lg md:text-xl font-medium',
  
  // Body Large - Lead paragraph text
  bodyLarge: 'text-lg sm:text-xl md:text-xl font-normal',
  
  // Body - Regular paragraph text
  body: 'text-base sm:text-base md:text-lg font-normal',
  
  // Body Small - Secondary text
  bodySmall: 'text-sm sm:text-sm md:text-base font-normal',
  
  // Caption - Fine print and labels
  caption: 'text-xs sm:text-xs md:text-sm font-normal',

  // ═══════════════════════════════════════════════════
  // Aliases para compatibilidad con componentes existentes
  // ═══════════════════════════════════════════════════
  
  // sectionTitle → h1 (títulos de sección como Hero, About, etc.)
  sectionTitle: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold',
  
  // sectionSubtitle → bodyLarge
  sectionSubtitle: 'text-lg sm:text-xl md:text-xl font-normal',
  
  // cardTitle → h3
  cardTitle: 'text-xl sm:text-2xl md:text-3xl font-semibold',
  
  // cardSubtitle → h4
  cardSubtitle: 'text-lg sm:text-xl md:text-2xl font-semibold',
  
  // secondary → bodySmall
  secondary: 'text-sm sm:text-sm md:text-base font-normal',
  
  // small → caption
  small: 'text-xs sm:text-xs md:text-sm font-normal',
  
  // tag → h5 con medium weight
  tag: 'text-base sm:text-lg md:text-xl font-medium',
  
  // statsNumber → display para números grandes
  statsNumber: 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold',
} as const;
