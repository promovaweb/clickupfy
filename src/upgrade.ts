/**
 * Atualiza a instalação global do ClickUpfy pelo registry npm.
 *
 * O comando usa o próprio npm para substituir a versão instalada e relê o
 * launcher global depois da instalação. Assim, a confirmação considera o
 * executável que será chamado na próxima execução, não apenas o pacote que
 * iniciou o processo atual.
 */

import { execFileSync, spawnSync } from "node:child_process";
import { join } from "node:path";
import { CliError } from "./errors.js";

const PACKAGE_NAME = "@promovaweb/clickupfy";
const VERSION_PATTERN =
  /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?$/;
const TARGET_PATTERN = /^(?:latest|next|v?(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?)$/;

/** Dependências substituíveis usadas para testar o fluxo sem tocar no npm real. */
export interface UpgradeDependencies {
  npmCommand?: string;
  environment?: NodeJS.ProcessEnv;
}

/** Resultado confirmado depois que o launcher global foi relido. */
export interface UpgradeResult {
  target: string;
  version: string;
}

/**
 * Instala a versão escolhida no npm global e confirma a versão efetiva.
 *
 * @param target Canal ou versão SemVer. `latest` é usado quando omitido.
 * @param dependencies Comandos e ambiente opcionais para testes isolados.
 */
export function executarUpgrade(
  target = "latest",
  dependencies: UpgradeDependencies = {},
): UpgradeResult {
  const alvo = normalizarAlvo(target);
  const npmCommand = dependencies.npmCommand ?? nomeDoNpm();
  const environment = { ...process.env, ...dependencies.environment };
  const packageSpecifier = `${PACKAGE_NAME}@${alvo}`;
  const instalacao = spawnSync(
    npmCommand,
    ["install", "--global", packageSpecifier, "--no-fund", "--no-audit"],
    { env: environment, stdio: "inherit" },
  );

  if (instalacao.error) {
    throw new CliError(
      `Não foi possível iniciar o npm para atualizar o ClickUpfy: ${instalacao.error.message}`,
    );
  }
  if (instalacao.signal || instalacao.status !== 0) {
    throw new CliError(
      `O npm não conseguiu instalar ${packageSpecifier}. Código: ${instalacao.status ?? "sinal"}.`,
    );
  }

  const prefixo = execFileSync(npmCommand, ["prefix", "--global"], {
    encoding: "utf8",
    env: environment,
  }).trim();
  const launcher = caminhoLauncherGlobal(prefixo);
  const leitura = spawnSync(launcher, ["--version"], {
    encoding: "utf8",
    env: environment,
    shell: process.platform === "win32",
    stdio: ["ignore", "pipe", "pipe"],
  });

  if (leitura.error) {
    throw new CliError(
      `A instalação terminou, mas o launcher global não pôde ser lido: ${leitura.error.message}`,
    );
  }
  if (leitura.signal || leitura.status !== 0) {
    throw new CliError(
      "A instalação terminou, mas não foi possível confirmar a versão do ClickUpfy.",
    );
  }

  const version = String(leitura.stdout ?? "").trim().split(/\s+/u).at(-1) ?? "";
  if (!VERSION_PATTERN.test(version)) {
    throw new CliError(
      `A instalação terminou, mas o launcher retornou uma versão inválida: ${version || "vazia"}.`,
    );
  }

  return { target: alvo, version };
}

/** Normaliza o alvo aceito pelo comando antes de enviá-lo ao npm. */
export function normalizarAlvo(target: string): string {
  const alvo = target.trim();
  if (!TARGET_PATTERN.test(alvo)) {
    throw new CliError(
      `Alvo de upgrade inválido: ${target}. Use latest, next ou uma versão SemVer.`,
    );
  }
  return alvo.startsWith("v") ? alvo.slice(1) : alvo;
}

/** Resolve o nome do executável npm em cada sistema operacional. */
function nomeDoNpm(): string {
  return process.platform === "win32" ? "npm.cmd" : "npm";
}

/** Resolve o launcher criado pelo npm no prefixo global informado. */
function caminhoLauncherGlobal(prefixo: string): string {
  return process.platform === "win32"
    ? join(prefixo, "clickupfy.cmd")
    : join(prefixo, "bin", "clickupfy");
}
