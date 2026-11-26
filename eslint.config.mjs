import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Copia generada del núcleo de DiarIA (DI-084): no se edita aquí.
    "src/lib/diaria/*.ts",
    "src/lib/diaria/tablero/**",
  ]),
]);

export default eslintConfig;
