import { useCallback, useRef } from 'react';
import { flushSync } from 'react-dom';
import { useTheme } from '../../hooks';
import { SunIcon, MoonIcon } from '../atoms/icons';
import { cn } from '../../utils/helpers';

interface AnimatedThemeTogglerProps extends React.ComponentPropsWithoutRef<'button'> {
  /** Duration of the theme transition animation in milliseconds */
  duration?: number;
  /** Size of the icon */
  iconSize?: number;
}

/**
 * Animated theme toggler with circular reveal transition.
 * Uses the View Transitions API for smooth theme switching.
 */
export function AnimatedThemeToggler({
  className,
  duration = 400,
  iconSize = 20,
  ...props
}: AnimatedThemeTogglerProps) {
  const { theme, toggleTheme } = useTheme();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isDark = theme === 'dark';

  const handleToggle = useCallback(async () => {
    if (!buttonRef.current) {
      toggleTheme();
      return;
    }

    // Check if View Transitions API is supported
    if (!document.startViewTransition) {
      toggleTheme();
      return;
    }

    await document.startViewTransition(() => {
      flushSync(() => {
        toggleTheme();
      });
    }).ready;

    const { top, left, width, height } = buttonRef.current.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const maxRadius = Math.hypot(
      Math.max(left, window.innerWidth - left),
      Math.max(top, window.innerHeight - top)
    );

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration,
        easing: 'ease-in-out',
        pseudoElement: '::view-transition-new(root)',
      }
    );
  }, [toggleTheme, duration]);

  return (
    <button
      ref={buttonRef}
      onClick={handleToggle}
      className={cn(className)}
      aria-label="Toggle theme"
      {...props}
    >
      {isDark ? (
        <SunIcon size={iconSize} className="text-light-text dark:text-white" />
      ) : (
        <MoonIcon size={iconSize} className="text-light-text dark:text-white" />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
