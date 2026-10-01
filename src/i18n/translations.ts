import { nav as esNav } from './es/nav';
import { hero as esHero } from './es/hero';
import { intro as esIntro } from './es/intro';
import { services as esServices } from './es/services';
import { process as esProcess } from './es/process';
import { metrics as esMetrics } from './es/metrics';
import { about as esAbout } from './es/about';
import { projects as esProjects } from './es/projects';
import { skills as esSkills } from './es/skills';
import { experience as esExperience } from './es/experience';
import { contact as esContact } from './es/contact';
import { footer as esFooter } from './es/footer';
import { common as esCommon } from './es/common';
import { nav as enNav } from './en/nav';
import { hero as enHero } from './en/hero';
import { intro as enIntro } from './en/intro';
import { services as enServices } from './en/services';
import { process as enProcess } from './en/process';
import { metrics as enMetrics } from './en/metrics';
import { about as enAbout } from './en/about';
import { projects as enProjects } from './en/projects';
import { skills as enSkills } from './en/skills';
import { experience as enExperience } from './en/experience';
import { contact as enContact } from './en/contact';
import { footer as enFooter } from './en/footer';
import { common as enCommon } from './en/common';

export const translations = {
  es: {
    nav: esNav,
    hero: esHero,
    intro: esIntro,
    services: esServices,
    process: esProcess,
    metrics: esMetrics,
    about: esAbout,
    projects: esProjects,
    skills: esSkills,
    experience: esExperience,
    contact: esContact,
    footer: esFooter,
    common: esCommon,
  },
  en: {
    nav: enNav,
    hero: enHero,
    intro: enIntro,
    services: enServices,
    process: enProcess,
    metrics: enMetrics,
    about: enAbout,
    projects: enProjects,
    skills: enSkills,
    experience: enExperience,
    contact: enContact,
    footer: enFooter,
    common: enCommon,
  },
} as const;
