import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, type RenderHookResult } from '@testing-library/react';
import type { FormEvent } from 'react';
import emailjs from '@emailjs/browser';
import { COOLDOWN_MS, MIN_FILL_MS, RATE_LIMIT_KEY } from './antiSpam';
import { stubLocalStorage } from './storageStub';
import { useContactForm } from './useContactForm';

vi.mock('@emailjs/browser', () => ({ default: { init: vi.fn(), send: vi.fn() } }));

const labels = {
  proposal: 'Propuesta de trabajo',
  collaboration: 'Colaboración',
  advisory: 'Asesoría',
  others: 'Otro',
};

let storage: Storage;
const send = vi.mocked(emailjs.send);
const init = vi.mocked(emailjs.init);
const fakeEvent = { preventDefault: vi.fn() } as unknown as FormEvent<HTMLFormElement>;

type Hook = RenderHookResult<ReturnType<typeof useContactForm>, unknown>;

function setup(): Hook {
  return renderHook(() => useContactForm(labels));
}

function fillValid(hook: Hook) {
  act(() => {
    hook.result.current.setField('fullName', 'Ana Lopez');
    hook.result.current.setField('email', 'ana@correo.com');
    hook.result.current.setField('message', 'Hola, tengo una propuesta.');
  });
}

async function submit(hook: Hook) {
  await act(async () => {
    await hook.result.current.handleSubmit(fakeEvent);
  });
}

function pass(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  storage = stubLocalStorage();
  vi.stubEnv('VITE_EMAILJS_SERVICE_ID', 'service_test');
  vi.stubEnv('VITE_EMAILJS_TEMPLATE_ID', 'template_test');
  vi.stubEnv('VITE_EMAILJS_PUBLIC_KEY', 'public_test');
  send.mockResolvedValue({ status: 200, text: 'OK' });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

describe('useContactForm: validacion', () => {
  it('muestra un codigo de error por campo y no envia', async () => {
    const hook = setup();
    pass(MIN_FILL_MS);

    await submit(hook);

    expect(hook.result.current.errors).toEqual({
      fullName: 'nameRequired',
      email: 'emailRequired',
      message: 'messageRequired',
    });
    expect(send).not.toHaveBeenCalled();
    expect(hook.result.current.status).toBe('idle');
  });

  it('distingue correo vacio de correo invalido', async () => {
    const hook = setup();
    pass(MIN_FILL_MS);
    fillValid(hook);
    act(() => hook.result.current.setField('email', 'ana@correo'));

    await submit(hook);

    expect(hook.result.current.errors).toEqual({ email: 'emailInvalid' });
  });

  it('limpia el error de un campo al escribir en el', async () => {
    const hook = setup();
    pass(MIN_FILL_MS);
    await submit(hook);

    act(() => hook.result.current.setField('fullName', 'Ana'));

    expect(hook.result.current.errors.fullName).toBeUndefined();
    expect(hook.result.current.errors.email).toBe('emailRequired');
  });
});

describe('useContactForm: anti-spam', () => {
  it('el honeypot lleno bloquea el envio sin mostrar estado', async () => {
    const hook = setup();
    pass(MIN_FILL_MS);
    fillValid(hook);
    act(() => hook.result.current.setHoneypot('https://spam.example'));

    await submit(hook);

    expect(send).not.toHaveBeenCalled();
    expect(hook.result.current.status).toBe('idle');
    expect(hook.result.current.errors).toEqual({});
  });

  it('la trampa de tiempo bloquea antes de 3 s y libera despues', async () => {
    const hook = setup();
    fillValid(hook);

    pass(MIN_FILL_MS - 1);
    await submit(hook);
    expect(send).not.toHaveBeenCalled();
    expect(hook.result.current.status).toBe('idle');

    pass(1);
    await submit(hook);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it('el enfriamiento de 60 s bloquea un segundo envio y se libera despues', async () => {
    const hook = setup();
    pass(MIN_FILL_MS);
    fillValid(hook);
    await submit(hook);
    expect(send).toHaveBeenCalledTimes(1);
    expect(storage.getItem(RATE_LIMIT_KEY)).not.toBeNull();

    fillValid(hook);
    await submit(hook);
    expect(send).toHaveBeenCalledTimes(1);
    expect(hook.result.current.status).toBe('throttled');

    pass(COOLDOWN_MS);
    await submit(hook);
    expect(send).toHaveBeenCalledTimes(2);
  });

  it('el enfriamiento sobrevive a un nuevo montaje porque vive en localStorage', async () => {
    storage.setItem(RATE_LIMIT_KEY, String(Date.now()));
    const hook = setup();
    pass(MIN_FILL_MS);
    fillValid(hook);

    await submit(hook);

    expect(send).not.toHaveBeenCalled();
    expect(hook.result.current.status).toBe('throttled');
  });
});

describe('useContactForm: envio', () => {
  it('envia a EmailJS solo los campos de la plantilla y limpia el formulario', async () => {
    const hook = setup();
    pass(MIN_FILL_MS);
    fillValid(hook);
    act(() => {
      hook.result.current.toggleReason('proposal');
      hook.result.current.toggleReason('advisory');
    });

    await submit(hook);

    expect(init).toHaveBeenCalledWith('public_test');
    expect(send).toHaveBeenCalledTimes(1);
    const [serviceId, templateId, params] = send.mock.calls[0];
    expect(serviceId).toBe('service_test');
    expect(templateId).toBe('template_test');
    expect(Object.keys(params as object).sort()).toEqual([
      'from_email',
      'from_name',
      'message',
      'owner_email',
      'reasons',
      'received_at',
    ]);
    expect(params).toMatchObject({
      from_name: 'Ana Lopez',
      from_email: 'ana@correo.com',
      message: 'Hola, tengo una propuesta.',
      owner_email: 'norman.martinez003@gmail.com',
    });
    const reasons = (params as { reasons: string }).reasons;
    expect(reasons).toContain('>Propuesta de trabajo</span>');
    expect(reasons).toContain('>Asesoría</span>');
    expect(reasons).not.toContain('Colaboración');

    expect(hook.result.current.status).toBe('success');
    expect(hook.result.current.fields.fullName).toBe('');
    expect(hook.result.current.fields.contactReasons.proposal).toBe(false);
  });

  it('conserva el HTML exacto de cada motivo para la plantilla del correo', async () => {
    const hook = setup();
    pass(MIN_FILL_MS);
    fillValid(hook);
    act(() => hook.result.current.toggleReason('others'));

    await submit(hook);

    const { reasons } = send.mock.calls[0][2] as { reasons: string };
    expect(reasons).toBe(
      `<span style="display: inline-block; background-color: rgba(59, 130, 246, 0.08); border: 1px solid rgba(59, 130, 246, 0.35); padding: 6px 12px; margin-right: 8px; margin-bottom: 8px; font-family: 'DM Sans', sans-serif; font-weight: bold; font-size: 13px; color: #93C5FD;">Otro</span>`,
    );
  });

  it('envia "No especificado" cuando no hay motivos', async () => {
    const hook = setup();
    pass(MIN_FILL_MS);
    fillValid(hook);

    await submit(hook);

    expect(send.mock.calls[0][2]).toMatchObject({ reasons: 'No especificado' });
  });

  it('el mensaje de exito se oculta a los 5 s', async () => {
    const hook = setup();
    pass(MIN_FILL_MS);
    fillValid(hook);
    await submit(hook);
    expect(hook.result.current.status).toBe('success');

    pass(4_999);
    expect(hook.result.current.status).toBe('success');
    pass(1);
    expect(hook.result.current.status).toBe('idle');
  });

  it('un fallo de EmailJS muestra error, conserva los datos y no activa el enfriamiento', async () => {
    send.mockRejectedValueOnce(new Error('network'));
    const hook = setup();
    pass(MIN_FILL_MS);
    fillValid(hook);

    await submit(hook);

    expect(hook.result.current.status).toBe('error');
    expect(hook.result.current.fields.fullName).toBe('Ana Lopez');
    expect(storage.getItem(RATE_LIMIT_KEY)).toBeNull();

    await submit(hook);
    expect(send).toHaveBeenCalledTimes(2);
    expect(hook.result.current.status).toBe('success');
  });

  it('sin variables de EmailJS no envia, muestra exito y no activa el enfriamiento', async () => {
    vi.stubEnv('VITE_EMAILJS_SERVICE_ID', '');
    const hook = setup();
    pass(MIN_FILL_MS);
    fillValid(hook);

    await submit(hook);

    expect(send).not.toHaveBeenCalled();
    expect(hook.result.current.status).toBe('success');
    expect(storage.getItem(RATE_LIMIT_KEY)).toBeNull();
  });

  it('un fallo en init no impide el envio', async () => {
    init.mockImplementationOnce(() => {
      throw new Error('init failed');
    });
    const hook = setup();
    pass(MIN_FILL_MS);
    fillValid(hook);

    await submit(hook);

    expect(send).toHaveBeenCalledTimes(1);
    expect(hook.result.current.status).toBe('success');
  });

  it('alterna cada motivo de forma independiente', () => {
    const hook = setup();

    act(() => hook.result.current.toggleReason('collaboration'));
    expect(hook.result.current.fields.contactReasons).toEqual({ proposal: false, collaboration: true, advisory: false, others: false });

    act(() => hook.result.current.toggleReason('collaboration'));
    expect(hook.result.current.fields.contactReasons.collaboration).toBe(false);
  });
});
