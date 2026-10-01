import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import emailjs from '@emailjs/browser';
import { LanguageProvider } from '../../../contexts/LanguageContext';
import { translations } from '../../../i18n/translations';
import { COOLDOWN_MS, MIN_FILL_MS } from './antiSpam';
import { ContactForm } from './ContactForm';
import { stubLocalStorage } from './storageStub';

vi.mock('@emailjs/browser', () => ({ default: { init: vi.fn(), send: vi.fn() } }));

const es = translations.es.contact;
const send = vi.mocked(emailjs.send);

function renderForm() {
  return render(
    <LanguageProvider>
      <ContactForm />
    </LanguageProvider>,
  );
}

function type(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

function fillValid() {
  type(es.form.fullName, 'Ana Lopez');
  type(es.form.email, 'ana@correo.com');
  type(es.form.message, 'Hola, tengo una propuesta.');
}

async function submit() {
  await act(async () => {
    fireEvent.submit(document.querySelector('form') as HTMLFormElement);
  });
}

function pass(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  stubLocalStorage();
  vi.stubEnv('VITE_EMAILJS_SERVICE_ID', 'service_test');
  vi.stubEnv('VITE_EMAILJS_TEMPLATE_ID', 'template_test');
  vi.stubEnv('VITE_EMAILJS_PUBLIC_KEY', 'public_test');
  send.mockResolvedValue({ status: 200, text: 'OK' });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

describe('ContactForm: estructura y accesibilidad', () => {
  it('agrupa los motivos en un fieldset con legend y cuatro casillas reales', () => {
    renderForm();

    const group = screen.getByRole('group', { name: es.form.reason });
    expect(group.tagName).toBe('FIELDSET');
    expect(group.querySelector('legend')?.textContent).toBe(es.form.reason);

    const boxes = screen.getAllByRole('checkbox');
    expect(boxes).toHaveLength(4);
    expect(boxes.every((box) => box.closest('fieldset') === group)).toBe(true);
    expect(screen.queryByRole('button', { name: es.form.reasons.proposal.title })).toBeNull();
  });

  it('cada casilla se alterna con el clic y expone su estado', () => {
    renderForm();
    const proposal = screen.getByRole('checkbox', { name: new RegExp(es.form.reasons.proposal.title) });

    expect((proposal as HTMLInputElement).checked).toBe(false);
    fireEvent.click(proposal);
    expect((proposal as HTMLInputElement).checked).toBe(true);
    fireEvent.click(proposal);
    expect((proposal as HTMLInputElement).checked).toBe(false);
  });

  it('los campos tienen etiqueta visible y autocomplete', () => {
    renderForm();

    expect(screen.getByLabelText(es.form.fullName).getAttribute('autocomplete')).toBe('name');
    expect(screen.getByLabelText(es.form.email).getAttribute('autocomplete')).toBe('email');
    expect(screen.getByLabelText(es.form.message).tagName).toBe('TEXTAREA');
  });

  it('un campo invalido marca aria-invalid y apunta a su mensaje con aria-describedby', async () => {
    renderForm();
    pass(MIN_FILL_MS);

    await submit();

    const name = screen.getByLabelText(es.form.fullName);
    expect(name.getAttribute('aria-invalid')).toBe('true');
    const message = document.getElementById(name.getAttribute('aria-describedby') as string);
    expect(message?.textContent).toBe(es.form.errors.nameRequired);

    const email = screen.getByLabelText(es.form.email);
    expect(email.getAttribute('aria-invalid')).toBe('true');
    expect(document.getElementById(email.getAttribute('aria-describedby') as string)?.textContent).toBe(
      es.form.errors.emailRequired,
    );
    expect(screen.getByLabelText(es.form.message).getAttribute('aria-invalid')).toBe('true');
    expect(send).not.toHaveBeenCalled();
  });

  it('al escribir se quita aria-invalid y el mensaje del campo', async () => {
    renderForm();
    pass(MIN_FILL_MS);
    await submit();

    type(es.form.fullName, 'Ana');

    const name = screen.getByLabelText(es.form.fullName);
    expect(name.getAttribute('aria-invalid')).toBeNull();
    expect(name.getAttribute('aria-describedby')).toBeNull();
    expect(screen.queryByText(es.form.errors.nameRequired)).toBeNull();
    expect(screen.getByText(es.form.errors.emailRequired)).toBeTruthy();
  });

  it('muestra el mensaje de correo invalido', async () => {
    renderForm();
    pass(MIN_FILL_MS);
    fillValid();
    type(es.form.email, 'ana@correo');

    await submit();

    expect(screen.getByText(es.form.errors.emailInvalid)).toBeTruthy();
  });

  it('mantiene las regiones vivas status y alert montadas y vacias al inicio', () => {
    renderForm();

    expect(screen.getByRole('status').textContent).toBe('');
    expect(screen.getByRole('alert').textContent).toBe('');
  });
});

describe('ContactForm: anti-spam y envio', () => {
  it('el honeypot esta oculto para tecnologias de asistencia y bloquea el envio', async () => {
    renderForm();
    pass(MIN_FILL_MS);
    fillValid();
    const honeypot = document.getElementById('company-website') as HTMLInputElement;
    expect(honeypot.closest('[aria-hidden="true"]')).not.toBeNull();
    expect(honeypot.tabIndex).toBe(-1);

    fireEvent.change(honeypot, { target: { value: 'spam' } });
    await submit();

    expect(send).not.toHaveBeenCalled();
    expect(screen.getByRole('status').textContent).toBe('');
  });

  it('la trampa de 3 s ignora un envio inmediato', async () => {
    renderForm();
    fillValid();

    await submit();

    expect(send).not.toHaveBeenCalled();
    expect(screen.queryByText(es.form.errors.nameRequired)).toBeNull();
  });

  it('un envio correcto muestra el exito en la region status y limpia el formulario', async () => {
    renderForm();
    pass(MIN_FILL_MS);
    fillValid();
    fireEvent.click(screen.getByRole('checkbox', { name: new RegExp(es.form.reasons.advisory.title) }));

    await submit();

    expect(send).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('status').textContent).toBe(es.form.successMessage);
    expect((screen.getByLabelText(es.form.fullName) as HTMLInputElement).value).toBe('');
    expect(
      (screen.getByRole('checkbox', { name: new RegExp(es.form.reasons.advisory.title) }) as HTMLInputElement)
        .checked,
    ).toBe(false);

    pass(5_000);
    expect(screen.getByRole('status').textContent).toBe('');
  });

  it('el boton se deshabilita y cambia de texto mientras envia', async () => {
    let resolveSend: (value: { status: number; text: string }) => void = () => {};
    send.mockReturnValueOnce(new Promise((resolve) => (resolveSend = resolve)));
    renderForm();
    pass(MIN_FILL_MS);
    fillValid();

    await submit();

    const button = screen.getByRole('button', { name: es.form.sending }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);

    await act(async () => resolveSend({ status: 200, text: 'OK' }));
    expect((screen.getByRole('button', { name: es.form.submit }) as HTMLButtonElement).disabled).toBe(false);
  });

  it('un fallo de EmailJS muestra el error en la region alert', async () => {
    send.mockRejectedValueOnce(new Error('network'));
    renderForm();
    pass(MIN_FILL_MS);
    fillValid();

    await submit();

    expect(screen.getByRole('alert').textContent).toBe(es.form.errorMessage);
    expect((screen.getByLabelText(es.form.fullName) as HTMLInputElement).value).toBe('Ana Lopez');
  });

  it('un segundo envio dentro de 60 s muestra el aviso de limite en la region status', async () => {
    renderForm();
    pass(MIN_FILL_MS);
    fillValid();
    await submit();
    expect(send).toHaveBeenCalledTimes(1);

    fillValid();
    await submit();

    expect(send).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('status').textContent).toBe(es.form.throttledMessage);

    pass(COOLDOWN_MS);
    await submit();
    expect(send).toHaveBeenCalledTimes(2);
  });
});
