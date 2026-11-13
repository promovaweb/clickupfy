/** Execução de comandos com resolução de PATH/PATHEXT e escape de argumentos no Windows. */
import spawn from "cross-spawn";
import type { SpawnOptions } from "node:child_process";

/** Usa CreateProcess para executáveis e o tratamento de lançadores do cross-spawn para .cmd/.bat. */
export const executarProcessoSync = spawn.sync;

/** Captura UTF-8 sem shell genérico; encerra o processo se a saída exceder o limite. */
export function executarProcesso(
  comando: string,
  args: string[],
  options: SpawnOptions & { maxBuffer?: number } = {},
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const { maxBuffer = 4 * 1024 * 1024, ...spawnOptions } = options;
    const processo = spawn(comando, args, {
      ...spawnOptions,
      stdio: ["ignore", "pipe", "pipe"],
    });
    const saida: Buffer[] = [];
    const erros: Buffer[] = [];
    let tamanho = 0;
    let excedeu = false;
    const receber = (destino: Buffer[], parte: Buffer) => {
      tamanho += parte.length;
      if (tamanho > maxBuffer) {
        excedeu = true;
        processo.kill();
        return;
      }
      destino.push(parte);
    };
    processo.stdout?.on("data", (parte: Buffer) => receber(saida, parte));
    processo.stderr?.on("data", (parte: Buffer) => receber(erros, parte));
    processo.on("error", reject);
    processo.on("close", (code, signal) => {
      if (excedeu)
        return reject(
          new Error("A saída do comando excedeu o limite permitido."),
        );
      if (code !== 0 || signal)
        return reject(
          Object.assign(
            new Error(`O comando terminou com ${signal ?? code}.`),
            { code },
          ),
        );
      resolve({
        stdout: Buffer.concat(saida).toString("utf8"),
        stderr: Buffer.concat(erros).toString("utf8"),
      });
    });
  });
}
