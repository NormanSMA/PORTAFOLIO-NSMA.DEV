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
});
