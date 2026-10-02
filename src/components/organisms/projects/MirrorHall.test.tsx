import { describe, it, expect, afterEach, beforeEach, vi, type MockInstance } from 'vitest';

// gsap's ScrollTrigger and useMediaQuery call window.matchMedia, so the stub must exist before the imports run.
const media = vi.hoisted(() => {
  const state = { matching: [] as string[] };
  window.matchMedia = ((query: string) => ({
    matches: state.matching.includes(query),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
  })) as unknown as typeof window.matchMedia;
  return state;
});

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MirrorHall, type MirrorHallItem } from './MirrorHall';
import { computeLayout } from './mirrorHall/ringMath';

const REDUCED = '(prefers-reduced-motion: reduce)';
const STEP = 360 / 7;

const items: MirrorHallItem[] = Array.from({ length: 7 }, (_, index) => ({
  id: `item-${index}`,
  label: `Etiqueta ${index}`,
  title: `Proyecto ${index}`,
  caption: `Descripcion ${index}`,
  image: <img src={`/img-${index}.webp`} alt={`Captura ${index}`} />,
}));

function renderRing(onActiveChange = vi.fn(), extra: Partial<Parameters<typeof MirrorHall>[0]> = {}) {
  render(
    <MirrorHall
      items={items}
      ariaLabel="Mas proyectos"
      previousLabel="Anterior"
      nextLabel="Siguiente"
      onActiveChange={onActiveChange}
      {...extra}
    />,
  );
  return { onActiveChange };
}

const counter = () => screen.getByText(/^\d\d \/ \d\d$/).textContent;
const cards = () => screen.getAllByRole('listitem');
const ring = () => document.querySelector('.mh-ring') as HTMLElement;
const stage = () => document.querySelector('.mh-stage') as HTMLElement;
const angle = () => parseFloat(ring().style.transform.replace('rotateY(', ''));

beforeEach(() => {
  media.matching = [];
});
afterEach(cleanup);

describe('MirrorHall: estructura y accesibilidad', () => {
  it('expone un grupo carrusel enfocable con su nombre', () => {
    renderRing();
    const group = screen.getByRole('group', { name: 'Mas proyectos' });
    expect(group.getAttribute('aria-roledescription')).toBe('carousel');
    expect(group.tabIndex).toBe(0);
  });

  it('renderiza una lista con una tarjeta por item y su etiqueta "n de total: titulo"', () => {
    renderRing();
    expect(cards()).toHaveLength(7);
    expect(cards()[0].getAttribute('aria-label')).toBe('1 de 7: Proyecto 0');
    expect(cards()[6].getAttribute('aria-label')).toBe('7 de 7: Proyecto 6');
    expect(cards()[0].parentElement?.tagName).toBe('UL');
  });

  it('acepta un formateador de etiqueta para otros idiomas', () => {
    renderRing(vi.fn(), { getCardLabel: (position, total, title) => `${position} of ${total}: ${title}` });
    expect(cards()[2].getAttribute('aria-label')).toBe('3 of 7: Proyecto 2');
  });

  it('solo la tarjeta frontal es tabulable y ninguna esta oculta', () => {
    renderRing();
    expect(cards().map((card) => card.tabIndex)).toEqual([0, -1, -1, -1, -1, -1, -1]);
    expect(cards().every((card) => card.getAttribute('aria-hidden') === 'false')).toBe(true);
    expect(cards()[0].getAttribute('aria-current')).toBe('true');
    expect(cards()[1].getAttribute('aria-current')).toBeNull();
  });

  it('muestra cara, etiqueta, titulo y descripcion de cada tarjeta', () => {
    renderRing();
    expect(screen.getByText('Etiqueta 3')).toBeTruthy();
    expect(screen.getByText('Proyecto 3')).toBeTruthy();
    expect(screen.getByText('Descripcion 3')).toBeTruthy();
    expect(screen.getAllByRole('img', { name: 'Captura 3' })).toHaveLength(1);
  });

  it('el reflejo es aria-hidden, inert y no tiene elementos enfocables', () => {
    renderRing();
    const reflections = document.querySelectorAll('.mh-reflection');
    expect(reflections).toHaveLength(7);
    reflections.forEach((reflection) => {
      expect(reflection.getAttribute('aria-hidden')).toBe('true');
      expect(reflection.hasAttribute('inert')).toBe(true);
      expect(reflection.querySelectorAll('a, button, [tabindex]')).toHaveLength(0);
    });
  });

  it('el reflejo reutiliza la misma URL de imagen', () => {
    renderRing();
    const sources = Array.from(cards()[2].querySelectorAll('img')).map((img) => img.getAttribute('src'));
    expect(sources).toEqual(['/img-2.webp', '/img-2.webp']);
  });

  it('muestra el contador en texto plano y los botones con su texto', () => {
    renderRing();
    expect(counter()).toBe('01 / 07');
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeTruthy();
  });

  it('no renderiza nada sin items', () => {
    renderRing(vi.fn(), { items: [] });
    expect(document.querySelector('.mh-root')).toBeNull();
  });
});

describe('MirrorHall: botones y teclado con movimiento reducido (salto inmediato)', () => {
  beforeEach(() => {
    media.matching = [REDUCED];
  });

  it('no llama onActiveChange al montar', () => {
    const { onActiveChange } = renderRing();
    expect(onActiveChange).not.toHaveBeenCalled();
  });

  it('Siguiente avanza una tarjeta y gira el anillo -360/n grados', () => {
    const { onActiveChange } = renderRing();
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(counter()).toBe('02 / 07');
    expect(onActiveChange).toHaveBeenCalledTimes(1);
    expect(onActiveChange).toHaveBeenCalledWith(1);
    expect(angle()).toBeCloseTo(-STEP, 3);
    expect(cards()[1].tabIndex).toBe(0);
    expect(cards()[0].tabIndex).toBe(-1);
  });

  it('Anterior desde la primera envuelve a la ultima por el camino corto', () => {
    const { onActiveChange } = renderRing();
    fireEvent.click(screen.getByRole('button', { name: 'Anterior' }));
    expect(counter()).toBe('07 / 07');
    expect(onActiveChange).toHaveBeenCalledWith(6);
    expect(angle()).toBeCloseTo(STEP, 3);
  });

  it('las flechas del grupo rotan una tarjeta', () => {
    const { onActiveChange } = renderRing();
    const group = screen.getByRole('group');
    fireEvent.keyDown(group, { key: 'ArrowRight' });
    fireEvent.keyDown(group, { key: 'ArrowRight' });
    expect(counter()).toBe('03 / 07');
    fireEvent.keyDown(group, { key: 'ArrowLeft' });
    expect(counter()).toBe('02 / 07');
    expect(onActiveChange.mock.calls.map(([index]) => index)).toEqual([1, 2, 1]);
  });

  it('una flecha sobre una tarjeta mueve tambien el foco a la nueva frontal', () => {
    renderRing();
    cards()[0].focus();
    fireEvent.keyDown(cards()[0], { key: 'ArrowRight' });
    expect(document.activeElement).toBe(cards()[1]);
    expect(counter()).toBe('02 / 07');
  });

  it('las flechas no rotan cuando el foco esta en un boton ni con modificadores', () => {
    renderRing();
    fireEvent.keyDown(screen.getByRole('button', { name: 'Siguiente' }), { key: 'ArrowRight' });
    fireEvent.keyDown(screen.getByRole('group'), { key: 'ArrowRight', ctrlKey: true });
    expect(counter()).toBe('01 / 07');
  });

  it('el clic en una tarjeta no frontal la lleva al frente y llama una vez a onActiveChange', () => {
    const { onActiveChange } = renderRing();
    fireEvent.click(cards()[3]);
    expect(counter()).toBe('04 / 07');
    expect(onActiveChange).toHaveBeenCalledTimes(1);
    expect(onActiveChange).toHaveBeenCalledWith(3);
    expect(angle()).toBeCloseTo(-3 * STEP, 3);
  });

  it('repetir la misma accion no repite onActiveChange', () => {
    const { onActiveChange } = renderRing();
    fireEvent.click(cards()[2]);
    fireEvent.click(cards()[2]);
    expect(onActiveChange).toHaveBeenCalledTimes(1);
  });
});

describe('MirrorHall: rueda y arrastre', () => {
  beforeEach(() => {
    media.matching = [REDUCED];
  });

  it('la rueda vertical pasa a la pagina: no se cancela y no gira', () => {
    renderRing();
    const notCancelled = fireEvent.wheel(stage(), { deltaX: 0, deltaY: 120 });
    expect(notCancelled).toBe(true);
    expect(angle()).toBe(0);
  });

  it('el desplazamiento horizontal gira el anillo y se cancela', () => {
    renderRing();
    const { degreesPerPixel } = computeLayout(960, 7);
    const notCancelled = fireEvent.wheel(stage(), { deltaX: 100, deltaY: 4 });
    expect(notCancelled).toBe(false);
    expect(angle()).toBeCloseTo(-100 * degreesPerPixel, 3);
  });

  it('Shift con rueda vertical gira el anillo', () => {
    renderRing();
    const notCancelled = fireEvent.wheel(stage(), { deltaX: 0, deltaY: 100, shiftKey: true });
    expect(notCancelled).toBe(false);
    expect(angle()).toBeLessThan(0);
  });

  it('el arrastre sigue al puntero 1:1 y se detiene al soltar con movimiento reducido', () => {
    const { onActiveChange } = renderRing();
    const { degreesPerPixel } = computeLayout(960, 7);
    fireEvent.pointerDown(stage(), { pointerId: 1, clientX: 600, clientY: 100, button: 0 });
    fireEvent.pointerMove(stage(), { pointerId: 1, clientX: 500, clientY: 100 });
    fireEvent.pointerMove(stage(), { pointerId: 1, clientX: 300, clientY: 100 });
    expect(angle()).toBeCloseTo(-200 * degreesPerPixel, 3);
    fireEvent.pointerUp(stage(), { pointerId: 1, clientX: 300, clientY: 100 });
    expect(angle()).toBeCloseTo(-200 * degreesPerPixel, 3);
    const expectedIndex = Math.round((200 * degreesPerPixel) / STEP);
    expect(counter()).toBe(`0${expectedIndex + 1} / 07`);
    expect(onActiveChange).toHaveBeenCalledTimes(expectedIndex);
  });

  it('un movimiento menor que el umbral no cuenta como arrastre', () => {
    renderRing();
    fireEvent.pointerDown(stage(), { pointerId: 1, clientX: 600, clientY: 100, button: 0 });
    fireEvent.pointerMove(stage(), { pointerId: 1, clientX: 602, clientY: 100 });
    fireEvent.pointerUp(stage(), { pointerId: 1, clientX: 602, clientY: 100 });
    expect(angle()).toBe(0);
  });
});

describe('MirrorHall: la tarjeta frontal abre su enlace', () => {
  const OPEN_LABEL = '(abre en una pestaña nueva)';
  // Item 5 has no link on purpose: a card without href must stay inert.
  const linkedItems: MirrorHallItem[] = items.map((item, index) => ({
    ...item,
    href: index === 5 ? undefined : `https://example.com/${index}`,
    openLabel: OPEN_LABEL,
  }));
  const front = () => cards().find((card) => card.tabIndex === 0) as HTMLElement;
  let open: MockInstance<typeof window.open>;

  beforeEach(() => {
    media.matching = [REDUCED];
    open = vi.spyOn(window, 'open').mockImplementation(() => null);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('un clic sin arrastre abre el enlace en una pestana nueva y no gira el anillo', () => {
    const { onActiveChange } = renderRing(vi.fn(), { items: linkedItems });
    fireEvent.click(cards()[0]);
    expect(open).toHaveBeenCalledTimes(1);
    expect(open).toHaveBeenCalledWith('https://example.com/0', '_blank', 'noopener,noreferrer');
    expect(counter()).toBe('01 / 07');
    expect(onActiveChange).not.toHaveBeenCalled();
  });

  it('Enter sobre la tarjeta frontal abre el enlace; mantener la tecla no lo repite', () => {
    renderRing(vi.fn(), { items: linkedItems });
    fireEvent.keyDown(cards()[0], { key: 'Enter' });
    fireEvent.keyDown(cards()[0], { key: 'Enter', repeat: true });
    expect(open).toHaveBeenCalledTimes(1);
    expect(open).toHaveBeenCalledWith('https://example.com/0', '_blank', 'noopener,noreferrer');
  });

  it('una tarjeta no frontal se lleva al frente sin abrir; el segundo clic ya abre', () => {
    renderRing(vi.fn(), { items: linkedItems });
    fireEvent.click(cards()[3]);
    expect(open).not.toHaveBeenCalled();
    expect(counter()).toBe('04 / 07');
    fireEvent.click(cards()[3]);
    expect(open).toHaveBeenCalledTimes(1);
    expect(open).toHaveBeenCalledWith('https://example.com/3', '_blank', 'noopener,noreferrer');
  });

  it('arrastrar NO abre el enlace, aunque el soltar termine en un clic sobre la tarjeta', () => {
    renderRing(vi.fn(), { items: linkedItems });
    const frontCard = front();
    fireEvent.pointerDown(stage(), { pointerId: 1, clientX: 600, clientY: 100, button: 0 });
    fireEvent.pointerMove(stage(), { pointerId: 1, clientX: 560, clientY: 100 });
    fireEvent.pointerMove(stage(), { pointerId: 1, clientX: 520, clientY: 100 });
    fireEvent.pointerUp(stage(), { pointerId: 1, clientX: 520, clientY: 100 });
    fireEvent.click(frontCard);
    expect(open).not.toHaveBeenCalled();
  });

  it('un movimiento menor que el umbral sigue siendo un toque y abre el enlace', () => {
    renderRing(vi.fn(), { items: linkedItems });
    fireEvent.pointerDown(stage(), { pointerId: 1, clientX: 600, clientY: 100, button: 0 });
    fireEvent.pointerMove(stage(), { pointerId: 1, clientX: 602, clientY: 100 });
    fireEvent.pointerUp(stage(), { pointerId: 1, clientX: 602, clientY: 100 });
    fireEvent.click(front());
    expect(open).toHaveBeenCalledTimes(1);
  });

  it('un gesto nuevo despues de arrastrar vuelve a permitir abrir', () => {
    renderRing(vi.fn(), { items: linkedItems });
    fireEvent.pointerDown(stage(), { pointerId: 1, clientX: 600, clientY: 100, button: 0 });
    fireEvent.pointerMove(stage(), { pointerId: 1, clientX: 520, clientY: 100 });
    fireEvent.pointerUp(stage(), { pointerId: 1, clientX: 520, clientY: 100 });
    fireEvent.pointerDown(stage(), { pointerId: 2, clientX: 300, clientY: 100, button: 0 });
    fireEvent.pointerUp(stage(), { pointerId: 2, clientX: 300, clientY: 100 });
    fireEvent.click(front());
    expect(open).toHaveBeenCalledTimes(1);
  });

  it('una tarjeta frontal sin enlace no abre nada', () => {
    renderRing(vi.fn(), { items: linkedItems });
    fireEvent.click(cards()[5]);
    fireEvent.click(cards()[5]);
    fireEvent.keyDown(cards()[5], { key: 'Enter' });
    expect(counter()).toBe('06 / 07');
    expect(open).not.toHaveBeenCalled();
  });

  it('sin href en ningun item el comportamiento no cambia', () => {
    renderRing();
    fireEvent.click(cards()[0]);
    fireEvent.keyDown(cards()[0], { key: 'Enter' });
    expect(open).not.toHaveBeenCalled();
    expect(cards()[0].className).not.toContain('mh-card--link');
  });

  it('no abre mientras el anillo todavia gira hacia la tarjeta', () => {
    media.matching = [];
    renderRing(vi.fn(), { items: linkedItems });
    fireEvent.click(cards()[2]);
    fireEvent.click(cards()[2]);
    expect(open).not.toHaveBeenCalled();
  });

  it('el nombre accesible de la frontal avisa de la pestana nueva; el de las demas no', () => {
    renderRing(vi.fn(), { items: linkedItems });
    expect(cards()[0].getAttribute('aria-label')).toBe(`1 de 7: Proyecto 0 ${OPEN_LABEL}`);
    expect(cards()[1].getAttribute('aria-label')).toBe('2 de 7: Proyecto 1');
    expect(cards()[0].className).toContain('mh-card--link');
    expect(cards()[1].className).not.toContain('mh-card--link');
    fireEvent.click(cards()[1]);
    expect(cards()[1].getAttribute('aria-label')).toBe(`2 de 7: Proyecto 1 ${OPEN_LABEL}`);
    expect(cards()[0].getAttribute('aria-label')).toBe('1 de 7: Proyecto 0');
  });

  it('con href pero sin openLabel usa un texto por defecto', () => {
    const bare = items.map((item) => ({ ...item, href: 'https://example.com' }));
    renderRing(vi.fn(), { items: bare });
    expect(cards()[0].getAttribute('aria-label')).toContain('pestaña nueva');
  });

  it('el icono de enlace externo solo aparece en la tarjeta frontal y es decorativo', () => {
    renderRing(vi.fn(), { items: linkedItems });
    const icons = document.querySelectorAll('.mh-face svg');
    expect(icons).toHaveLength(1);
    expect(icons[0].closest('[aria-hidden="true"]')).not.toBeNull();
    expect(cards()[0].contains(icons[0])).toBe(true);
  });
});

describe('MirrorHall: con movimiento normal', () => {
  it('Siguiente notifica la tarjeta destino al instante y una sola vez durante la animacion', async () => {
    const { onActiveChange } = renderRing();
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(counter()).toBe('02 / 07');
    expect(onActiveChange).toHaveBeenCalledTimes(1);
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
    });
    expect(onActiveChange).toHaveBeenCalledTimes(1);
    expect(onActiveChange).toHaveBeenCalledWith(1);
  });

  it('se desmonta sin dejar la animacion corriendo', () => {
    renderRing();
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(() => cleanup()).not.toThrow();
  });
});
