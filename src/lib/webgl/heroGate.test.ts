import { describe, it, expect } from 'vitest';
import {
  getRenderDpr,
  getRenderProfile,
  isTouchDevice,
  readHeroEnvironment,
  shouldEnableWebGL,
  type HeroEnvironment,
} from './heroGate';

const capable: HeroEnvironment = {
  prefersReducedMotion: false,
  saveData: false,
  hasWebGL2: true,
  deviceMemory: 8,
};

function fakeWindow({
  reduced = false,
  coarse = false,
  saveData,
  deviceMemory,
  webgl2 = true,
}: {
  reduced?: boolean;
  coarse?: boolean;
  saveData?: boolean;
  deviceMemory?: number;
  webgl2?: boolean;
}): Window {
  const win: Record<string, unknown> = {
    matchMedia: (query: string) => ({
      matches: query.includes('reduce') ? reduced : coarse,
    }),
    navigator: { connection: saveData === undefined ? undefined : { saveData }, deviceMemory },
  };
  if (webgl2) win.WebGL2RenderingContext = class {};
  return win as unknown as Window;
}

describe('shouldEnableWebGL', () => {
  it('habilita WebGL en un equipo capaz', () => {
    expect(shouldEnableWebGL(capable)).toBe(true);
  });

  it('deshabilita con prefers-reduced-motion', () => {
    expect(shouldEnableWebGL({ ...capable, prefersReducedMotion: true })).toBe(false);
  });

  it('deshabilita con saveData', () => {
    expect(shouldEnableWebGL({ ...capable, saveData: true })).toBe(false);
  });

  it('deshabilita sin WebGL2', () => {
    expect(shouldEnableWebGL({ ...capable, hasWebGL2: false })).toBe(false);
  });

  it('deshabilita con menos de 4 GB de memoria', () => {
    expect(shouldEnableWebGL({ ...capable, deviceMemory: 2 })).toBe(false);
    expect(shouldEnableWebGL({ ...capable, deviceMemory: 0.5 })).toBe(false);
  });

  it('habilita con exactamente 4 GB', () => {
    expect(shouldEnableWebGL({ ...capable, deviceMemory: 4 })).toBe(true);
  });

  it('habilita cuando deviceMemory no existe', () => {
    expect(shouldEnableWebGL({ ...capable, deviceMemory: undefined })).toBe(true);
  });
});

describe('readHeroEnvironment', () => {
  it('lee las cuatro señales del navegador', () => {
    const env = readHeroEnvironment(
      fakeWindow({ reduced: true, saveData: true, deviceMemory: 2 }),
    );
    expect(env).toEqual({
      prefersReducedMotion: true,
      saveData: true,
      hasWebGL2: true,
      deviceMemory: 2,
    });
  });

  it('tolera la ausencia de connection y deviceMemory', () => {
    const env = readHeroEnvironment(fakeWindow({}));
    expect(env.saveData).toBe(false);
    expect(env.deviceMemory).toBeUndefined();
  });

  it('marca hasWebGL2 en falso sin el constructor', () => {
    expect(readHeroEnvironment(fakeWindow({ webgl2: false })).hasWebGL2).toBe(false);
  });
});

describe('perfil de render', () => {
  it('detecta puntero táctil', () => {
    expect(isTouchDevice(fakeWindow({ coarse: true }))).toBe(true);
    expect(isTouchDevice(fakeWindow({ coarse: false }))).toBe(false);
  });

  it('escritorio: DPR 2, escala 1 y sin tope de fps', () => {
    const profile = getRenderProfile(false);
    expect(profile.dprCap).toBe(2);
    expect(profile.scaleSteps[0]).toBe(1);
    expect(profile.maxFps).toBeNull();
  });

  it('táctil: DPR 1.5, escala 0.75 y 30 fps', () => {
    const profile = getRenderProfile(true);
    expect(profile.dprCap).toBe(1.5);
    expect(profile.scaleSteps[0]).toBe(0.75);
    expect(profile.maxFps).toBe(30);
  });

  it('aplica el tope de DPR y la escala', () => {
    expect(getRenderDpr(3, getRenderProfile(false), 0)).toBe(2);
    expect(getRenderDpr(3, getRenderProfile(true), 0)).toBeCloseTo(1.125);
    expect(getRenderDpr(1, getRenderProfile(false), 1)).toBeCloseTo(0.6);
  });
});
