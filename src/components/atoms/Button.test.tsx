import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Button } from './Button';

afterEach(cleanup);

describe('Button', () => {
  it('renderiza el contenido', () => {
    render(<Button>Ver Proyectos</Button>);
    expect(screen.getByRole('button').textContent).toBe('Ver Proyectos');
  });

  it('ejecuta onClick al hacer click', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('no ejecuta onClick cuando está deshabilitado', () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Click
      </Button>
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('usa type="button" por defecto para no enviar formularios', () => {
    render(<Button>Click</Button>);
    expect(screen.getByRole('button').getAttribute('type')).toBe('button');
  });

  it('acepta type y atributos nativos', () => {
    render(
      <Button type="submit" aria-label="Enviar mensaje">
        Enviar
      </Button>
    );
    const button = screen.getByRole('button');
    expect(button.getAttribute('type')).toBe('submit');
    expect(button.getAttribute('aria-label')).toBe('Enviar mensaje');
  });

  it('el primario rellena con el escalón 600 y brilla solo al pasar el puntero', () => {
    render(<Button>Primario</Button>);
    const { className } = screen.getByRole('button');
    expect(className).toContain('bg-primary-600');
    expect(className).not.toMatch(/(^|\s)shadow-glow/);
    expect(className).toContain('enabled:pointer-fine:hover:shadow-glow');
  });

  it.each(['secondary', 'outline', 'ghost'] as const)('la variante %s no lleva resplandor', (variant) => {
    render(<Button variant={variant}>Click</Button>);
    expect(screen.getByRole('button').className).not.toContain('shadow-glow');
  });

  it.each(['primary', 'secondary', 'outline', 'ghost'] as const)('la variante %s mide 44 px mínimos', (variant) => {
    render(<Button variant={variant}>Click</Button>);
    expect(screen.getByRole('button').className).toContain('min-h-target');
  });

  it.each(['sm', 'md', 'lg'] as const)('el tamaño %s mantiene el alto táctil mínimo', (size) => {
    render(<Button size={size}>Click</Button>);
    expect(screen.getByRole('button').className).toContain('min-h-target');
  });

  it('la clase del consumidor reemplaza al estilo base en conflicto', () => {
    render(<Button className="text-sm w-full">Click</Button>);
    const { className } = screen.getByRole('button');
    expect(className).toContain('w-full');
    expect(className).toContain('text-sm');
    expect(className).not.toContain('text-base');
  });
});
