# Anexo: discurso público sobre IA, escritura, coautoría y código

Investigación del 2026-10-15 hecha por un subagente con WebSearch/WebFetch. Las URLs las verificó el subagente al abrirlas. Esta es la fuente de `scripts/ia-autorretrato/contexto.json` y de `MapaDiscurso`. **Antes de publicar se vuelven a comprobar.**

## Tesis principales

- **El volumen ya es mayoritario en los gigantes, aunque cada uno lo mide a su manera:** Google pasó de >25 % (oct 2024) a 75 % (abr 2026); Microsoft habla de 20–30 % (abr 2025); Anthropic dice "90 %" en muchos equipos, pero un análisis externo lo estima en ~50 % de las líneas fusionadas. Son cifras autodeclaradas y no auditadas.
- **El trailer `Co-Authored-By` se volvió la métrica:** SemiAnalysis estima ~4 % de los commits públicos de GitHub con firma de Claude Code (feb 2026). Como el trailer se puede desactivar, la cifra es un piso.
- **Productividad en disputa:** METR midió devs 19 % más lentos que se creían 20 % más rápidos (2025). En 2026 abandonó ese diseño porque los devs ya no aceptan trabajar sin IA.
- **Uso alto, confianza baja:** según Stack Overflow 2025, 84 % la usa, 46 % desconfía y 66 % sufre respuestas "casi correctas". En 2026, 93 % exige atribución.
- **Calidad y aprendizaje:** GitClear mide 8 veces más duplicación y −39,9 % de código movido. Un RCT de Anthropic mide −17 puntos de comprensión. DORA describe la IA como "amplificador".
- **Escritura:** la IA no puede ser autora (ICMJE: no puede responder por el trabajo). Sin humano no hay copyright en EE. UU. (Thaler, cert. denegado en mar 2026). ~50 % de los artículos web nuevos son "principalmente IA", y ≥13,5 % de los abstracts de PubMed de 2024 pasaron por un LLM.
- **Voz propia:** Cornell (CHI 2025) muestra que las sugerencias de IA homogenizan la escritura hacia estilos occidentales.
- **La atribución se institucionaliza:** el kernel de Linux usa `Assisted-by` y prohíbe que la IA firme `Signed-off-by`. Ghostty exige declarar el uso de IA. NetBSD y Gentoo la prohíben.

## Datos clave

| Cifra | Qué mide | Fuente | Fecha | URL |
|---|---|---|---|---|
| 75% | Código nuevo de Google generado por IA y revisado por humanos | Pichai vía The Decoder | abr 2026 | https://the-decoder.com/google-says-75-percent-of-its-new-code-is-now-written-by-ai/ |
| 20–30% | Código en repos de Microsoft "escrito por software" | Nadella vía Cyber Daily | 30 abr 2025 | https://www.cyberdaily.au/digital-transformation/12028-microsoft-says-20-30-of-its-code-is-written-by-ai |
| ~50% (no 90%) | Estimación de líneas fusionadas escritas por IA en Anthropic | Ryan Greenblatt, Redwood Research | 22 oct 2025 | https://blog.redwoodresearch.org/p/is-90-of-code-at-anthropic-being |
| ~4% | Commits públicos diarios en GitHub con firma de Claude Code | SemiAnalysis vía Xataka | 6 feb 2026 | https://www.xataka.com/robotica-e-ia/claude-code-esta-siendo-gran-favorito-programadores-que-firma-4-todo-que-se-sube-a-github |
| ~80% / >1M | Devs nuevos que usan Copilot en su primera semana / PRs del agente Copilot | GitHub Octoverse | 28 oct 2025 | https://github.blog/news-insights/octoverse/octoverse-a-new-developer-joins-github-every-second-as-ai-leads-typescript-to-1/ |
| 84% / 46% / 66% / 72% | Usa o planea usar IA / desconfía / respuestas "casi correctas" / dice que el vibe coding no es parte de su trabajo | Stack Overflow Survey 2025 | jul 2025 | https://survey.stackoverflow.co/2025/ai |
| 66% / 93% | Usuarios de agentes con Claude Code / exigen atribución para confiar | Stack Overflow Survey 2026 | 6 oct 2026 | https://stackoverflow.blog/2026/10/06/the-results-of-the-2026-developer-survey-are-here/ |
| +19% tiempo (percibido −20%) | Efecto de la IA en devs OSS experimentados (RCT, n=16) | METR | 10 jul 2025 | https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/ |
| datos "no confiables" | Devs que se niegan a trabajar sin IA rompen el grupo de control | METR | 24 feb 2026 | https://metr.org/blog/2026-02-24-uplift-update/ |
| ~90%; "amplificador" | Adopción entre ~5.000 profesionales | DORA 2025 vía InfoQ | 29 sep 2025 | https://www.infoq.com/news/2025/09/dora-state-of-ai-in-dev-2025 |
| 8x / −39,9% | Duplicación / líneas movidas (211M de líneas, 2020–2024) | GitClear vía DevClass | 20 feb 2025 | https://devclass.com/2025/02/20/ai-is-eroding-code-quality-states-new-in-depth-report/ |
| 50% vs 67% | Quiz de comprensión con IA frente a sin IA (n=52) | Anthropic (RCT) | 29 ene 2026 | https://www.anthropic.com/research/AI-assistance-coding-skills |
| −19% | Empleo de 22–25 años en ocupaciones expuestas a IA, frente a lo esperado | Brynjolfsson et al., Stanford | rev. ago 2026 | https://digitaleconomy.stanford.edu/publications/canaries-in-the-coal-mine/ |
| ~50% | Artículos web nuevos "principalmente IA" | Graphite + GPTZero | 19 may 2026 | https://gptzero.me/news/ai-written-web/ |
| ≥13,5% | Abstracts de PubMed de 2024 procesados con LLM | Kobak et al., Science Advances | 2 jul 2025 | https://arxiv.org/abs/2406.07016v5 |
| 25% vs 19% | Sugerencias aceptadas por indios frente a estadounidenses; homogeneización hacia lo occidental | Cornell, CHI 2025 | 28 abr 2025 | https://news.cornell.edu/index%2Ephp/node/330798 |
| — | arXiv CS deja de aceptar surveys y position papers sin revisión por pares | 404 Media | 31 oct 2025 | https://www.404media.co/arxiv-changes-rules-after-getting-spammed-with-ai-generated-research-papers/ |
| — | La Corte Suprema niega certiorari en Thaler: se mantiene la autoría humana | Mayer Brown | 2 mar 2026 | https://www.mayerbrown.com/en/insights/publications/2026/03/supreme-court-denies-review-in-ai-authorship-case |

## Mapa de posturas

1. **Entusiastas pragmáticos:** Thomas Ptacek, "My AI Skeptic Friends Are All Nuts" (jun 2025) — https://fly.io/blog/youre-all-nuts/
2. **Escépticos de la evidencia:** Ludicity — https://ludic.mataroa.blog/blog/contra-ptaceks-terrible-article-on-ai/ ; Greenblatt (arriba).
3. **Ingeniería agéntica responsable, con dudas:** Simon Willison, "But I'm not reviewing that code" (may 2026) — https://simonwillison.net/2026/May/6/vibe-coding-and-agentic-engineering/ ; Addy Osmani, "el problema del 70%" — https://addyo.substack.com/p/the-70-problem-hard-truths-about
4. **Mantenedores defensivos:** Ghostty — https://github.com/ghostty-org/ghostty/blob/main/AI_POLICY.md ; NetBSD — https://linuxiac.com/netbsd-new-policy-prohibits-usage-of-ai-code/
5. **Juniors y desgaste de habilidades:** Stanford "Canaries"; RCT de Anthropic.
6. **Escritura y autoría:** ICMJE — https://www.icmje.org/recommendations/browse/artificial-intelligence/ai-use-by-authors.html ; Cornell.

## Conceptos y relaciones (para `MapaDiscurso`)

- vibe coding ↔ agentic engineering: el mismo acto con distinto grado de revisión.
- Co-Authored-By ↔ Assisted-by: coautoría frente a asistencia.
- Signed-off-by ↔ responsabilidad: solo un humano certifica.
- trailer ↔ medición: los conteos públicos son un piso.
- trailer ↔ datos de entrenamiento: "Tell HN: Do not include co-authored-by Claude" — https://news.ycombinator.com/item?id=47840791
- divulgación ↔ confianza: Ghostty y el 93 % de SO 2026.
- "almost right" ↔ deuda técnica.
- deuda técnica ↔ duplicación: GitClear.
- comprehension debt ↔ desgaste de habilidades (término de origen no verificado).
- desgaste de habilidades ↔ juniors.
- brecha de percepción ↔ productividad: METR.
- amplificador ↔ cultura del equipo: DORA.
- slop ↔ prevalencia: Graphite, arXiv.
- autoría humana ↔ copyright: Thaler.
- autoría ↔ accountability: ICMJE.
- homogeneización ↔ voz propia: Cornell.
- excess vocabulary ("delve") ↔ detección: Kobak.
- detectores ↔ falsos positivos.
- agentes ↔ volumen de commits.
- métricas autodeclaradas ↔ directivos: las cifras de Google, Microsoft y Anthropic no son comparables entre sí.

## Descartado o dudoso

- "80 % del código de Anthropic" (Medium, sin fuente primaria).
- Rebote de METR "+18 % más rápido": el propio METR lo declara no confiable.
- "40 % recibió workslop" (HBR/Stanford): cifra no verificada.
- Políticas de COPE, Science y Nature: no se pudieron abrir (403 o login). No se citan textualmente.
- SO 2026 "78,7 %" (IT Brief): contradice el blog oficial; se usa el oficial.
- Controversia sobre la coautoría de Claude Opus 5 en un manifiesto (Emergent.sh): fechas inconsistentes.
- Conteos de commits de Amplifying.ai: metodología variable.
- Latinoamérica: no se encontraron encuestas verificables de la región. En español solo hay Xataka (midudev, que es español) y ENTER.CO (Colombia, sin voces locales).
- QEMU: reportes contradictorios.
- Hilos de r/ExperiencedDevs: ninguno verificable.
