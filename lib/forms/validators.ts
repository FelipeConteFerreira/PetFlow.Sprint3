/** Erros de um formulário: nome do campo → mensagem. Vazio quer dizer válido. */
export type FormErrors = Record<string, string>;

export function temErros(erros: FormErrors): boolean {
  return Object.keys(erros).length > 0;
}

export function emailValido(valor: string): boolean {
  return /^\S+@\S+\.\S+$/.test(valor.trim());
}

/** `aaaa-mm-dd`. Só o formato — a API confere se a data existe. */
export function dataISOValida(valor: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(valor.trim());
}

/** `hh:mm`. A API recusa `hh:mm:ss` com 422. */
export function horaValida(valor: string): boolean {
  return /^\d{2}:\d{2}$/.test(valor.trim());
}
