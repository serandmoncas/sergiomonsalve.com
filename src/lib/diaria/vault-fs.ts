// copiado de DiarIA@3803d65e772c — no editar; actualizar con pnpm copiar-nucleo
/**
 * Acceso a la bóveda. El núcleo nunca toca el sistema de archivos directamente:
 * cada plataforma (Node, Tauri, navegador) aporta su implementación.
 *
 * - Las rutas son relativas a la raíz de la bóveda y usan `/`.
 * - El contenido viaja en bytes, no en texto, para garantizar que un archivo
 *   no editado se vuelva a escribir idéntico byte a byte.
 */
export interface VaultFS {
  list(): Promise<string[]>;
  read(path: string): Promise<Uint8Array>;
  write(path: string, data: Uint8Array): Promise<void>;
  stat(path: string): Promise<{ mtimeMs: number; size: number } | null>;
}
