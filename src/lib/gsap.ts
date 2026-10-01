import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Single registration point: import gsap and ScrollTrigger from here, not from the packages.
gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };
