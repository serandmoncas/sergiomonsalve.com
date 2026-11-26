// copiado de DiarIA@3803d65e772c — no editar; actualizar con pnpm copiar-nucleo
export const NOMBRE = "DiarIA";

export type { VaultFS } from "./vault-fs";
export { extraerEnlaces, type Enlace } from "./enlaces";
export { crearIndice, esVisible, type Indice } from "./indice";
export {
  crearResolutor,
  type Regla,
  type Resolucion,
  type Resolutor,
} from "./resolucion";
export {
  calcularBacklinks,
  fechaDeNota,
  type Backlinks,
  type Mencion,
} from "./backlinks";
export { crearDiario, hoy, type Apertura, type Diario } from "./diario";
export {
  buscarSeccion,
  CodigoSinCerrar,
  insertarSeccion,
  seccionesFechadas,
  type Seccion,
} from "./secciones";
export {
  abrirNota,
  codificar,
  decodificar,
  guardarNota,
  NoEsUtf8,
  TextoRoto,
  type NotaAbierta,
} from "./nota";
export {
  alternarTarea,
  TareaRecurrente,
  tareas,
  type Tarea,
} from "./tareas";
export {
  formatearFecha,
  MarcadorDesconocido,
  rellenarPlantilla,
} from "./plantilla";
export { diasEntre, sumarDias } from "./tablero/dias";
export { clave, cuerpo, horaDe, type Hora } from "./tablero/pendientes";
export {
  crearHistorial,
  ritmoDe,
  rutasDiarias,
  type Diarias,
  type Historia,
  type Historial,
  type NotaDiaria,
  type Ritmo,
} from "./tablero/historial";
export {
  cambiarFrecuencia,
  fijarHora,
  leerRegla,
  pausarRutina,
  proponerRutinas,
  reglaDe,
  rutinasDelArchivo,
  sumarRegla,
  terminarRutina,
  type ReglaRutina,
  type Rutina,
} from "./tablero/rutinas";
export {
  mes,
  UMBRAL,
  VENTANA,
  vistaDia,
  vistaHoy,
  type VistaDia,
  type VistaHoy,
} from "./tablero/vistas";
export {
  agregarContacto,
  COLUMNAS,
  leerObjetivo,
  moverTarjeta,
  vistaObjetivo,
  type Columna,
  type Objetivo,
  type VistaObjetivo,
} from "./tablero/objetivo";
