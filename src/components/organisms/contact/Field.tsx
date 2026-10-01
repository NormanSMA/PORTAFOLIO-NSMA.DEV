import { typography } from '../../../config/typography';
import { cn } from '../../../utils/helpers';

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: 'text' | 'email';
  autoComplete?: string;
  placeholder?: string;
  multiline?: boolean;
}

// The border uses line-control (3:1 or more on every surface); the focus ring comes from the global rule.
const controlStyles = cn(
  typography.body,
  'block min-h-target w-full rounded-control border bg-ink px-4 py-3 text-fg placeholder:text-fg-subtle',
);

export function Field({
  id,
  label,
  value,
  onChange,
  error,
  type = 'text',
  autoComplete,
  placeholder,
  multiline = false,
}: FieldProps) {
  const errorId = `${id}-error`;
  const className = cn(controlStyles, error ? 'border-danger' : 'border-line-control');

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className={cn(typography.bodySmall, 'font-medium text-fg')}>
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          rows={5}
          required
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(className, 'resize-none')}
        />
      ) : (
        <input
          id={id}
          type={type}
          required
          autoComplete={autoComplete}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={className}
        />
      )}
      {error && (
        <p id={errorId} className={cn(typography.bodySmall, 'text-danger')}>
          {error}
        </p>
      )}
    </div>
  );
}
