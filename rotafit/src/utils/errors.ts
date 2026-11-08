// Traduz mensagens comuns do Supabase e da rede para português.
export function friendlyError(error: unknown): string {
  if (error == null) return 'Não foi possível concluir a operação.';
  const message =
    typeof error === 'object' && error !== null && 'message' in error
      ? String((error as { message: unknown }).message)
      : String(error);

  if (/network request failed|failed to fetch/i.test(message)) {
    return 'Sem conexão com a internet.';
  }
  if (/rate limit/i.test(message)) {
    return 'Muitas tentativas. Aguarde um instante e tente de novo.';
  }
  return message;
}
