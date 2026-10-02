import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { ProjectImage } from './ProjectImage';

afterEach(cleanup);

describe('ProjectImage', () => {
  it('apunta a las rutas por proyecto con AVIF y WebP en cuatro anchos', () => {
    const { container } = render(<ProjectImage projectId="ecopulse" alt="EcoPulse" sizes="100vw" />);
    const source = container.querySelector('source');
    const image = screen.getByRole('img', { name: 'EcoPulse' });

    expect(source?.getAttribute('type')).toBe('image/avif');
    expect(source?.getAttribute('srcset')).toBe(
      [480, 960, 1440, 1920].map((width) => `/projects/ecopulse/desktop-${width}.avif ${width}w`).join(', '),
    );
    expect(image.getAttribute('srcset')).toBe(
      [480, 960, 1440, 1920].map((width) => `/projects/ecopulse/desktop-${width}.webp ${width}w`).join(', '),
    );
    expect(image.getAttribute('src')).toBe('/projects/ecopulse/desktop-960.webp');
  });

  it('reserva el tamano intrinseco 1920x1200 (16:10) para no mover la pagina', () => {
    render(<ProjectImage projectId="turno" alt="Turno" sizes="440px" />);
    const image = screen.getByRole('img', { name: 'Turno' });

    expect(image.getAttribute('width')).toBe('1920');
    expect(image.getAttribute('height')).toBe('1200');
    expect(image.getAttribute('sizes')).toBe('440px');
  });

  it('ya no ofrece capturas moviles', () => {
    const { container } = render(<ProjectImage projectId="iuris" alt="Iuris" sizes="100vw" />);
    expect(container.innerHTML).not.toContain('mobile');
  });

  it('carga diferida por defecto y prioritaria cuando se pide', () => {
    const { rerender } = render(<ProjectImage projectId="iuris" alt="Iuris" sizes="100vw" />);
    expect(screen.getByRole('img').getAttribute('loading')).toBe('lazy');

    rerender(<ProjectImage projectId="iuris" alt="Iuris" sizes="100vw" priority />);
    expect(screen.getByRole('img').getAttribute('loading')).toBe('eager');
    expect(screen.getByRole('img').getAttribute('fetchpriority')).toBe('high');
  });
});
