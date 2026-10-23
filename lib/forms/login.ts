import { emailValido, type FormErrors } from './validators';

export type LoginValues = {
  email: string;
  senha: string;
};

export const LOGIN_INICIAL: LoginValues = { email: '', senha: '' };

export function validarLogin(valores: LoginValues): FormErrors {
  const erros: FormErrors = {};
  if (!emailValido(valores.email)) erros.email = 'Informe um e-mail válido.';
  if (valores.senha.length < 6) erros.senha = 'A senha tem pelo menos 6 caracteres.';
  return erros;
}
