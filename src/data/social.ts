import { APP_CONFIG } from '../config/constants';
import { Github, Linkedin, Mail } from 'lucide-react';

export const socialLinks = [
  {
    name: 'GitHub',
    url: 'https://github.com/NormanSMA',
    icon: Github,
  },
  {
    name: 'LinkedIn',
    url: 'https://linkedin.com/in/norman-martinez',
    icon: Linkedin,
  },
  {
    name: 'Email',
    url: `mailto:${APP_CONFIG.email}`,
    icon: Mail,
  },
];
