/**
 * Erros de domínio usados pelo CLI, pelo cliente HTTP e pelo servidor MCP.
 */

/**
 * Representa uma falha conhecida e associa um código de saída estável ao erro.
 */
export class CliError extends Error {
  public constructor(
    message: string,
    public readonly exitCode = 1,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "CliError";
  }
}

/**
 * Converte status HTTP do ClickUp nos códigos de saída documentados pelo CLI.
 */
export function exitCodeForStatus(status: number): number {
  if (status === 401 || status === 403) return 2;
  if (status === 404) return 3;
  if (status === 429) return 4;
  if (status >= 500) return 5;
  return 1;
}

