import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { ProjectImage } from './ProjectImage';

afterEach(cleanup);

describe('ProjectImage', () => {
  it('apunta a las rutas por proyecto y tipo con AVIF y WebP', () => {
    const { container } = render(
      <ProjectImage projectId="ecopulse" kind="desktop" alt="EcoPulse" sizes="100vw" />,
    );
    const source = container.querySelector('source');
    const image = screen.getByRole('img', { name: 'EcoPulse' });

    expect(source?.getAttribute('type')).toBe('image/avif');
    expect(source?.getAttribute('srcset')).toContain('/projects/ecopulse/desktop-1600.avif 1600w');
    expect(image.getAttribute('srcset')).toContain('/projects/ecopulse/desktop-480.webp 480w');
    expect(image.getAttribute('src')).toBe('/projects/ecopulse/desktop-800.webp');
  });

  it('reserva el tamano intrinseco de cada tipo', () => {
    render(<ProjectImage projectId="turno" kind="mobile" alt="Turno movil" sizes="240px" />);
    const image = screen.getByRole('img', { name: 'Turno movil' });

    expect(image.getAttribute('width')).toBe('720');
    expect(image.getAttribute('height')).toBe('1558');
  });

  it('carga diferida por defecto y prioritaria cuando se pide', () => {
    const { rerender } = render(<ProjectImage projectId="iuris" kind="desktop" alt="Iuris" sizes="100vw" />);
    expect(screen.getByRole('img').getAttribute('loading')).toBe('lazy');

    rerender(<ProjectImage projectId="iuris" kind="desktop" alt="Iuris" sizes="100vw" priority />);
    expect(screen.getByRole('img').getAttribute('loading')).toBe('eager');
    expect(screen.getByRole('img').getAttribute('fetchpriority')).toBe('high');
  });
});
