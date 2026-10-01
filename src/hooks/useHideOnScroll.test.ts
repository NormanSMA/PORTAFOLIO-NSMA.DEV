import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useHideOnScroll } from './useHideOnScroll';

function scrollTo(y: number) {
  Object.defineProperty(window, 'scrollY', { value: y, configurable: true });
  act(() => {
    window.dispatchEvent(new Event('scroll'));
  });
}

beforeEach(() => scrollTo(0));

describe('useHideOnScroll', () => {
  it('no oculta cerca del inicio de la pagina', () => {
    const { result } = renderHook(() => useHideOnScroll(true));
    scrollTo(80);
    expect(result.current).toBe(false);
  });

  it('oculta al bajar y muestra al subir', () => {
    const { result } = renderHook(() => useHideOnScroll(true));
    scrollTo(300);
    expect(result.current).toBe(true);
    scrollTo(250);
    expect(result.current).toBe(false);
  });

  it('ignora movimientos menores a la tolerancia', () => {
    const { result } = renderHook(() => useHideOnScroll(true));
    scrollTo(300);
    scrollTo(296);
    expect(result.current).toBe(true);
  });

  it('muestra al volver a la zona superior', () => {
    const { result } = renderHook(() => useHideOnScroll(true));
    scrollTo(500);
    scrollTo(20);
    expect(result.current).toBe(false);
  });

  it('nunca oculta cuando esta desactivado', () => {
    const { result } = renderHook(() => useHideOnScroll(false));
    scrollTo(500);
    expect(result.current).toBe(false);
  });
});
