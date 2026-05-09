import { describe, it, expect } from 'vitest'
import { getAllProjects, getProject, getProjectSlugs } from '../portfolio'

describe('getAllProjects', () => {
  it('returns empty array for non-existent locale directory', () => {
    expect(getAllProjects('xx')).toEqual([])
  })
})

describe('getProject', () => {
  it('returns null for a non-existent slug', () => {
    expect(getProject('does-not-exist', 'es')).toBeNull()
  })
})

describe('getProjectSlugs', () => {
  it('returns empty array for non-existent locale directory', () => {
    expect(getProjectSlugs('xx')).toEqual([])
  })
})
