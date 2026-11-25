export function friendlyError(error: unknown): string {
  const message =
    error && typeof error === 'object' && 'message' in error ? String(error.message) : '';
  if (/failed to fetch|network request failed|networkerror/i.test(message)) {
    return 'Sem conexão com a internet. Verifique a rede e tente novamente.';
  }
  if (/invalid login credentials/i.test(message)) return 'E-mail ou senha incorretos.';
  if (/email not confirmed/i.test(message)) return 'Confirme o e-mail antes de entrar.';
  if (/already registered/i.test(message)) return 'Já existe uma conta com esse e-mail.';
  if (/violates row-level security/i.test(message))
    return 'Você não tem acesso a esta operação.';
  return message || 'Ocorreu um erro. Tente novamente.';
}
