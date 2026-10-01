export const educationSkills = {
  title: 'Education & Skills',
  subtitle: 'My academic background and technical skill set',
  tabs: {
    education: 'Education',
    skills: 'Technical Skills',
  },
  education: {
    university: {
      title: 'Universidad Americana (UAM)',
      degree: 'Information Systems Engineering',
      year: '5th Year',
      period: '2022 - 2026',
    },
    certifications: {
      title: 'Certifications',
      scrum: 'Scrum Foundation Professional Certificate (SFPC) - CertiProf',
      rpa: 'RPA Developer Foundation - UiPath Spanish',
    },
    languages: {
      title: 'Languages',
      spanish: 'Spanish',
      native: 'Native',
      english: 'English',
      level: 'B2',
    },
  },
  skills: {
    title: 'Technologies & Tools',
    concepts: {
      title: 'Key Concepts',
      agile: 'Agile Methodologies (Scrum)',
      uxui: 'UX/UI Design',
    },
  },
} as const;
