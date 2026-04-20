import { useRef, useState, useCallback, type MouseEvent as ReactMouseEvent } from 'react';
import { useLanguage } from '../../hooks';
import {
  motion,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useTransform,
  type Variants,
} from 'framer-motion';
import { Container, Button } from '../atoms';
import { typography } from '../../config/typography';

/* ─── Spline viewer URL ─── */
const SPLINE_VIEWER_URL =
  (import.meta.env.VITE_HERO_SPLINE_SCENE as string | undefined) ||
  'https://my.spline.design/nexbotrobotcharacterconcept-GxBh5KPg0h5sda6P5K1aVpwj/';

/* ─── animation presets ─── */
const ease = [0.22, 1, 0.36, 1] as const;

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

const fadeSlideUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

const fadeSlideLeft = {
  hidden: { opacity: 0, x: -60 },
  show: { opacity: 1, x: 0, transition: { duration: 0.8, ease } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.88, y: 30 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.9, ease } },
};

const robotReveal: Variants = {
  hidden: { opacity: 0, scale: 0.85, y: 60 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.4 },
  },
};

/* ─── component ─── */
export function Hero() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement | null>(null);
  const [splineLoaded, setSplineLoaded] = useState(false);

  // mouse-parallax values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 80, damping: 22, mass: 0.6 });
  const smoothY = useSpring(mouseY, { stiffness: 80, damping: 22, mass: 0.6 });

  // glow parallax (inverted, stronger)
  const glowX = useTransform(smoothX, [-1, 1], ['40px', '-40px']);
  const glowY = useTransform(smoothY, [-1, 1], ['30px', '-30px']);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleHeroMouseMove = useCallback(
    (event: ReactMouseEvent<HTMLElement>) => {
      if (reduceMotion || !heroRef.current) return;
      const bounds = heroRef.current.getBoundingClientRect();
      const normalizedX = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      const normalizedY = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
      mouseX.set(normalizedX);
      mouseY.set(normalizedY);
    },
    [reduceMotion, mouseX, mouseY],
  );

  const resetHeroMotion = useCallback(() => {
    if (reduceMotion) return;
    mouseX.set(0);
    mouseY.set(0);
  }, [reduceMotion, mouseX, mouseY]);

  const handleSplineIframeLoad = useCallback(() => {
    setSplineLoaded(true);
  }, []);

  return (
    <section
      id="home"
      ref={heroRef}
      onMouseMove={handleHeroMouseMove}
      onMouseLeave={resetHeroMotion}
      className="relative flex min-h-screen items-center overflow-hidden bg-light-bg dark:bg-dark-bg"
    >
      {/* ─── ambient gradient overlay ─── */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(56,189,248,0.18),transparent_34%),radial-gradient(circle_at_80%_10%,rgba(45,212,191,0.15),transparent_34%),radial-gradient(circle_at_70%_90%,rgba(99,102,241,0.12),transparent_32%)]"
        aria-hidden
      />

      {/* ─── animated glow orbs ─── */}
      <motion.div
        className="pointer-events-none absolute -top-32 -left-32 h-[520px] w-[520px] rounded-full opacity-30 dark:opacity-40 blur-[100px]"
        style={{
          background: 'radial-gradient(circle, rgba(99,102,241,0.6) 0%, transparent 70%)',
          x: glowX,
          y: glowY,
        }}
        animate={
          reduceMotion
            ? undefined
            : { scale: [1, 1.15, 1], opacity: [0.3, 0.4, 0.3] }
        }
        transition={
          reduceMotion
            ? undefined
            : { duration: 8, repeat: Infinity, ease: 'easeInOut' }
        }
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute -bottom-40 -right-40 h-[480px] w-[480px] rounded-full opacity-20 dark:opacity-30 blur-[100px]"
        style={{
          background: 'radial-gradient(circle, rgba(45,212,191,0.5) 0%, transparent 70%)',
        }}
        animate={
          reduceMotion
            ? undefined
            : { scale: [1, 1.2, 1], opacity: [0.2, 0.35, 0.2] }
        }
        transition={
          reduceMotion
            ? undefined
            : { duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }
        }
        aria-hidden
      />

      {/* ─── NEXBOT 3D Robot — centered background (desktop/tablet only) ─── */}
      <motion.div
        className="hidden md:flex absolute inset-0 items-center justify-center z-[5]"
        variants={reduceMotion ? undefined : robotReveal}
        initial="hidden"
        animate="show"
        style={{
          opacity: splineLoaded ? 0.55 : 0,
          transition: 'opacity 1s ease',
        }}
        aria-hidden
      >
        {/* glow behind robot */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-[500px] rounded-full bg-primary-500/15 blur-[120px]" />
        </div>
        {/* iframe with edge-fading mask to hide "Built with Spline" badge */}
        <div
          className="relative w-[480px] h-[580px] lg:w-[560px] lg:h-[660px] xl:w-[640px] xl:h-[740px]"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 58%, transparent 88%), linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
            maskComposite: 'intersect',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 58%, transparent 88%), linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
            WebkitMaskComposite: 'source-in',
          }}
        >
          <iframe
            src={SPLINE_VIEWER_URL}
            frameBorder="0"
            width="100%"
            height="100%"
            title="Interactive 3D Robot — NEXBOT"
            loading="lazy"
            onLoad={handleSplineIframeLoad}
            style={{ background: 'transparent' }}
            allow="autoplay"
          />
        </div>
      </motion.div>

      {/* ─── main content ─── */}
      <Container>
        <motion.div
          className="relative z-10 grid items-center gap-6 py-10 md:grid-cols-2 md:py-14 lg:gap-10 lg:py-16 pointer-events-none"
          variants={reduceMotion ? undefined : stagger}
          initial="hidden"
          animate="show"
        >
          {/* ─── Right column: Photo ─── */}
          <motion.div
            className="relative order-first md:order-last"
            variants={reduceMotion ? undefined : scaleIn}
          >
            {/* floating glow behind photo */}
            <motion.div
              className="absolute -inset-8 rounded-[2.25rem] bg-[radial-gradient(circle_at_20%_16%,rgba(99,102,241,0.2),transparent_44%),radial-gradient(circle_at_82%_22%,rgba(59,130,246,0.16),transparent_46%),linear-gradient(155deg,rgba(255,255,255,0.85),rgba(238,242,255,0.46))] opacity-70 blur-3xl dark:bg-[radial-gradient(circle_at_20%_16%,rgba(99,102,241,0.24),transparent_44%),radial-gradient(circle_at_82%_22%,rgba(59,130,246,0.2),transparent_46%),linear-gradient(155deg,rgba(10,10,15,0.55),rgba(26,26,36,0.2))]"
              animate={
                reduceMotion
                  ? undefined
                  : { scale: [1, 1.08, 1], opacity: [0.18, 0.28, 0.18] }
              }
              transition={
                reduceMotion
                  ? undefined
                  : { duration: 5, repeat: Infinity, ease: 'easeInOut' }
              }
            />

            <div className="relative z-10">
              <div className="hero-photo-glow relative mx-auto w-full max-w-xs sm:max-w-sm md:max-w-md">
                <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_34%_18%,rgba(255,255,255,0.46),transparent_58%),linear-gradient(160deg,rgba(99,102,241,0.18),rgba(59,130,246,0.1)_55%,rgba(255,255,255,0.12))] opacity-80 blur-xl dark:bg-[radial-gradient(circle_at_34%_18%,rgba(255,255,255,0.12),transparent_56%),linear-gradient(160deg,rgba(99,102,241,0.22),rgba(59,130,246,0.14)_55%,rgba(10,10,15,0.06))] md:rounded-3xl" />
                <div
                  className="relative overflow-hidden rounded-2xl border border-white/45 bg-white/16 shadow-[0_18px_42px_rgba(15,23,42,0.18)] backdrop-blur-xl backdrop-saturate-150 dark:border-white/12 dark:bg-slate-900/30 dark:shadow-[0_22px_56px_rgba(2,6,23,0.5)] md:rounded-3xl"
                >
                  <div className="relative overflow-hidden rounded-xl md:rounded-2xl">
                    <div className="absolute inset-0 pointer-events-none rounded-xl bg-[linear-gradient(145deg,rgba(255,255,255,0.34),rgba(255,255,255,0.12)_42%,rgba(255,255,255,0.04)_70%)] dark:bg-[linear-gradient(145deg,rgba(255,255,255,0.14),rgba(30,41,59,0.22)_45%,rgba(2,6,23,0.18)_74%)] md:rounded-2xl" />
                    <img
                      src="/norman_sf.webp"
                      alt="Norman Martínez - Full Stack Developer"
                      loading="eager"
                      fetchPriority="high"
                      className="h-auto w-full"
                    />
                    {/* subtle inner gradient overlay */}
                    <div
                      className="absolute inset-0 pointer-events-none rounded-xl bg-[linear-gradient(to_top,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.06)_32%,transparent_62%),radial-gradient(circle_at_50%_6%,rgba(255,255,255,0.3),transparent_42%)] dark:bg-[linear-gradient(to_top,rgba(2,6,23,0.28)_0%,rgba(2,6,23,0.12)_34%,transparent_66%),radial-gradient(circle_at_50%_6%,rgba(255,255,255,0.12),transparent_42%)] md:rounded-2xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ─── Left column: Text content ─── */}
          <motion.div
            className="order-last space-y-5 md:order-first md:space-y-6"
            variants={reduceMotion ? undefined : fadeSlideLeft}
          >
            {/* tag + name */}
            <motion.div className="space-y-2" variants={reduceMotion ? undefined : fadeSlideUp}>
              <p
                className={`${typography.tag} text-primary-600 dark:text-primary-400 mb-4`}
              >
                {t('hero.tag')}
              </p>
              <h1
                className={`${typography.sectionTitle} text-light-text dark:text-dark-text mb-6`}
              >
                Norman Martínez
              </h1>
            </motion.div>

            {/* description */}
            <motion.p
              className={`${typography.body} max-w-2xl leading-relaxed text-light-textSecondary dark:text-dark-textSecondary`}
              variants={reduceMotion ? undefined : fadeSlideUp}
            >
              {t('hero.description')}
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2 md:pt-4 pointer-events-auto"
              variants={reduceMotion ? undefined : fadeSlideUp}
            >
              <Button
                variant="primary"
                size="md"
                onClick={() => scrollToSection('projects')}
                className="w-full sm:w-auto text-sm md:text-base"
              >
                {t('hero.cta.projects')}
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => scrollToSection('contact')}
                className="w-full sm:w-auto text-sm md:text-base"
              >
                {t('hero.cta.contact')}
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </Container>

    </section>
  );
}
