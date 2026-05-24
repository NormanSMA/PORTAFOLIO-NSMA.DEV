import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../hooks';
import { cn } from '../../utils/helpers';

interface AnimatedThemeTogglerProps extends React.ComponentPropsWithoutRef<'button'> {
  /** Duration of the theme transition animation in milliseconds */
  duration?: number;
  /** Size of the icon */
  iconSize?: number;
}

/**
 * Minimal theme toggler without transition effects.
 */
export function AnimatedThemeToggler({
  className,
  duration = 400,
  iconSize = 20,
  ...props
}: AnimatedThemeTogglerProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={cn(className)}
      aria-label="Toggle theme"
      {...props}
    >
      {isDark ? (
        <Sun size={iconSize} className="text-foreground" strokeWidth={2.2} />
      ) : (
        <Moon size={iconSize} className="text-foreground" strokeWidth={2.2} />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
