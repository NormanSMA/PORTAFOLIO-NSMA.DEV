import { describe, it, expect } from 'vitest';
import { createEmptyFields, hasErrors, validateContact, type ContactFields } from './validation';

function fieldsWith(patch: Partial<ContactFields>): ContactFields {
  return { ...createEmptyFields(), fullName: 'Ana', email: 'ana@correo.com', message: 'Hola', ...patch };
}

describe('validateContact', () => {
  it('no devuelve errores con datos validos', () => {
    expect(validateContact(fieldsWith({}))).toEqual({});
  });

  it('marca los tres campos vacios con su propio codigo', () => {
    expect(validateContact(createEmptyFields())).toEqual({
      fullName: 'nameRequired',
      email: 'emailRequired',
      message: 'messageRequired',
    });
  });

  it('trata un campo de solo espacios como vacio', () => {
    const errors = validateContact(fieldsWith({ fullName: '   ', email: '  ', message: '\n ' }));
    expect(errors).toEqual({
      fullName: 'nameRequired',
      email: 'emailRequired',
      message: 'messageRequired',
    });
  });

  it.each(['ana', 'ana@', 'ana@correo', '@correo.com', 'a na@correo.com', 'ana@@correo.com'])(
    'rechaza el correo invalido "%s"',
    (email) => {
      expect(validateContact(fieldsWith({ email }))).toEqual({ email: 'emailInvalid' });
    },
  );

  it('acepta correos con subdominio y signo mas', () => {
    expect(validateContact(fieldsWith({ email: 'ana+web@mail.uam.edu.ni' }))).toEqual({});
  });

  it('no exige ningun motivo', () => {
    expect(validateContact(fieldsWith({}))).toEqual({});
  });
});

describe('hasErrors', () => {
  it('es falso sin errores o con errores limpiados', () => {
    expect(hasErrors({})).toBe(false);
    expect(hasErrors({ email: undefined })).toBe(false);
  });

  it('es verdadero con al menos un error', () => {
    expect(hasErrors({ message: 'messageRequired' })).toBe(true);
  });
});
