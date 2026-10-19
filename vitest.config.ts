/** Limite para inicialização dos processos MCP nos runners de Windows e macOS. */
import { defineConfig } from "vitest/config";
export default defineConfig({
  test: { testTimeout: 20000, hookTimeout: 20000 },
});
