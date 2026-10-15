export type MapaPiece = { text: string; key: boolean }

export type MapaData = {
  skill: string
  outcome: string
  why: string
  hours: string
  project: string
  firstStep: string
  weak: string
  drill: string
  recall: string
  feedback: string
  reviewDay: string
  pieces: MapaPiece[]
}

export type PlanCopy = {
  heading: string
  skill: string
  goal: string
  why: string
  time: string
  mapHeading: string
  keyMissing: string
  later: string
  applyHeading: string
  today: string
  practiceHeading: string
  weak: string
  drill: string
  recall: string
  adjustHeading: string
  feedback: string
  weeksHeading: string
  week1: string
  week2: string
  week3: string
  week4: string
  fallbackPieces: string[]
  missing: Record<'skill' | 'outcome' | 'project' | 'firstStep' | 'weak' | 'drill' | 'feedback', string>
  mapPrompt: string
  tutorPrompt: string
  tutorTopicsFallback: string
}

export function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, name: string) => (name in vars ? vars[name] : match))
}

function or(value: string, fallback: string) {
  return value.trim() || fallback
}

function keyPieces(data: MapaData) {
  return data.pieces.filter(p => p.key && p.text.trim()).map(p => p.text.trim())
}

function otherPieces(data: MapaData) {
  return data.pieces.filter(p => !p.key && p.text.trim()).map(p => p.text.trim())
}

export function buildPlan(data: MapaData, copy: PlanCopy): string {
  const keys = keyPieces(data)
  const others = otherPieces(data)
  const recall = data.recall.split('\n').map(s => s.trim()).filter(Boolean)
  const lines: string[] = []

  lines.push(copy.heading)
  lines.push(`${copy.skill}: ${or(data.skill, copy.missing.skill)}`)
  lines.push(`${copy.goal}: ${or(data.outcome, copy.missing.outcome)}`)
  if (data.why.trim()) lines.push(`${copy.why}: ${data.why.trim()}`)
  lines.push(fill(copy.time, { hours: data.hours, day: data.reviewDay.toLowerCase() }))
  lines.push('')
  lines.push(copy.mapHeading)
  if (keys.length) keys.forEach(k => lines.push(`  ★ ${k}`))
  else lines.push(`  ★ ${copy.keyMissing}`)
  if (others.length) lines.push(`  ${copy.later}: ${others.join(', ')}`)
  lines.push('')
  lines.push(copy.applyHeading)
  lines.push(`  ${or(data.project, copy.missing.project)}`)
  lines.push(`  ${copy.today}: ${or(data.firstStep, copy.missing.firstStep)}`)
  lines.push('')
  lines.push(copy.practiceHeading)
  lines.push(`  ${copy.weak}: ${or(data.weak, copy.missing.weak)}`)
  lines.push(`  ${copy.drill}: ${or(data.drill, copy.missing.drill)}`)
  if (recall.length) {
    lines.push(`  ${copy.recall}:`)
    recall.forEach(q => lines.push(`    · ${q}`))
  }
  lines.push('')
  lines.push(copy.adjustHeading)
  lines.push(`  ${copy.feedback}: ${or(data.feedback, copy.missing.feedback)}`)
  lines.push('')
  const k = keys.length ? keys : copy.fallbackPieces
  lines.push(copy.weeksHeading)
  lines.push(`  1 · ${fill(copy.week1, { piece: k[0] })}`)
  lines.push(`  2 · ${fill(copy.week2, { piece: k[1] ?? k[k.length - 1] })}`)
  lines.push(`  3 · ${fill(copy.week3, { piece: k[2] ?? k[k.length - 1] })}`)
  lines.push(`  4 · ${copy.week4}`)
  return lines.join('\n')
}

export function buildMapPrompt(data: MapaData, copy: PlanCopy): string {
  return fill(copy.mapPrompt, {
    skill: or(data.skill, copy.missing.skill),
    outcome: or(data.outcome, copy.missing.outcome),
    hours: data.hours
  })
}

export function buildTutorPrompt(data: MapaData, copy: PlanCopy): string {
  const keys = keyPieces(data)
  return fill(copy.tutorPrompt, {
    skill: or(data.skill, copy.missing.skill),
    outcome: or(data.outcome, copy.missing.outcome),
    topics: keys.length ? keys.join(', ') : copy.tutorTopicsFallback
  })
}
