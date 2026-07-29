#!/usr/bin/env node

/**
 * Seleciona o executável nativo instalado pelo npm e preserva o build
 * JavaScript como fallback para desenvolvimento e plataformas sem binário.
 */

const { existsSync } = require("node:fs");
const { join, resolve } = require("node:path");
const { spawnSync } = require("node:child_process");

const raiz = resolve(__dirname, "..");
const alvos = {
  "darwin-arm64": join(raiz, "vendor", "darwin-arm64", "clickupfy"),
  "darwin-x64": join(raiz, "vendor", "darwin-x64", "clickupfy"),
  "linux-x64": join(raiz, "vendor", "linux-x64", "clickupfy"),
};
const alvo = `${process.platform}-${process.arch}`;
const executavelNativo = alvos[alvo];
const exigirNativo = process.env.CLICKUPFY_REQUIRE_NATIVE === "1";
const forcarJavaScript = process.env.CLICKUPFY_FORCE_JAVASCRIPT === "1";

if (!forcarJavaScript && executavelNativo && existsSync(executavelNativo)) {
  executar(executavelNativo, process.argv.slice(2));
} else if (exigirNativo) {
  falhar(
    `O pacote não contém o executável nativo para ${process.platform}/${process.arch}.`,
  );
} else {
  const fallback = join(raiz, "dist", "cli.js");
  if (!existsSync(fallback)) {
    falhar(
      `Não há executável nativo nem fallback JavaScript para ${process.platform}/${process.arch}.`,
    );
  }
  executar(process.execPath, [fallback, ...process.argv.slice(2)]);
}

/** Executa o CLI com stdio herdado e devolve seu status ao processo do npm. */
function executar(comando, argumentos) {
  const resultado = spawnSync(comando, argumentos, { stdio: "inherit" });
  if (resultado.error) {
    falhar(`Não foi possível iniciar o ClickUpfy: ${resultado.error.message}`);
  }
  if (resultado.signal) {
    process.kill(process.pid, resultado.signal);
  }
  process.exit(resultado.status ?? 1);
}

/** Encerra o launcher com uma mensagem curta e acionável. */
function falhar(mensagem) {
  process.stderr.write(`Erro: ${mensagem}\n`);
  process.exit(1);
}
