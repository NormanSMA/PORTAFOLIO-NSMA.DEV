import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { Card } from './Card';

afterEach(cleanup);

describe('Card', () => {
  it('renderiza el contenido en un div con la variante info por defecto', () => {
    render(<Card data-testid="card">Contenido</Card>);
    const card = screen.getByTestId('card');
    expect(card.tagName).toBe('DIV');
    expect(card.textContent).toBe('Contenido');
    expect(card.getAttribute('data-variant')).toBe('info');
  });

  it('renderiza como article cuando as="article"', () => {
    render(
      <Card as="article" aria-label="Proyecto EcoPulse">
        EcoPulse
      </Card>,
    );
    expect(screen.getByRole('article', { name: 'Proyecto EcoPulse' }).tagName).toBe('ARTICLE');
  });

  it('renderiza como li dentro de una lista cuando as="li"', () => {
    render(
      <ul>
        <Card as="li">Hotel El Pantano</Card>
      </ul>,
    );
    expect(screen.getByRole('listitem').tagName).toBe('LI');
  });

  it.each([
    ['project', 'gap-6'],
    ['info', 'gap-4'],
    ['stat', 'gap-2'],
    ['timeline', 'md:grid'],
  ] as const)('aplica la disposicion de la variante %s', (variant, expectedClass) => {
    render(
      <Card variant={variant} data-testid="card">
        Contenido
      </Card>,
    );
    const card = screen.getByTestId('card');
    expect(card.getAttribute('data-variant')).toBe(variant);
    expect(card.className.split(' ')).toContain(expectedClass);
    expect(card.className).toContain('p-card');
    expect(card.className).toContain('rounded-card');
  });

  it('usa el borde degradado solo cuando es featured', () => {
    const { rerender } = render(<Card data-testid="card">A</Card>);
    expect(screen.getByTestId('card').className).toContain('[background:var(--card-fill)]');

    rerender(
      <Card featured data-testid="card">
        A
      </Card>,
    );
    const className = screen.getByTestId('card').className;
    expect(className).toContain('[background:var(--card-fill-featured)]');
    expect(className).toContain('border-transparent');
  });

  it('agrega la elevacion solo cuando es interactive', () => {
    const { rerender } = render(<Card data-testid="card">A</Card>);
    expect(screen.getByTestId('card').className).not.toContain('pointer-fine:hover');

    rerender(
      <Card interactive data-testid="card">
        A
      </Card>,
    );
    const className = screen.getByTestId('card').className;
    expect(className).toContain('motion-safe:pointer-fine:hover:-translate-y-1');
    expect(className).toContain('pointer-fine:hover:after:opacity-100');
  });

  it('combina className sin perder las clases base', () => {
    render(
      <Card className="text-fg-muted" data-testid="card">
        A
      </Card>,
    );
    const className = screen.getByTestId('card').className.split(' ');
    expect(className).toContain('text-fg-muted');
    expect(className).not.toContain('text-fg');
    expect(className).toContain('border-line');
  });

  it('renderiza los slots Header, Body y Footer', () => {
    render(
      <Card variant="project">
        <Card.Header>2026</Card.Header>
        <Card.Body>Turno</Card.Body>
        <Card.Footer>Ver demo</Card.Footer>
      </Card>,
    );
    expect(screen.getByText('2026')).toBeTruthy();
    expect(screen.getByText('Turno').className).toContain('flex-1');
    expect(screen.getByText('Ver demo').className).toContain('border-t');
  });
});
