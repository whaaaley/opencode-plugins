import { assertEquals } from '@std/assert'
import { copy } from '@std/fs'
import { join } from '@std/path'
import { beforeEach, describe, it } from '@std/testing/bdd'

const FIXTURES_RAW = join(import.meta.dirname!, '../fixtures/raw')
const FIXTURES_TEMP = join(import.meta.dirname!, '../fixtures/temp')

/**
 * Reset fixtures by copying from raw to temp
 */
async function resetFixtures() {
  // Clean temp directory
  try {
    await Deno.remove(FIXTURES_TEMP, { recursive: true })
  } catch {
    // Directory might not exist
  }

  // Copy raw fixtures to temp
  await copy(FIXTURES_RAW, FIXTURES_TEMP, { overwrite: true })
}

/**
 * Trim trailing whitespace from each line and ensure single trailing newline
 */
function trimWhitespace(content: string): string {
  let trimmed = content.split('\n').map((line) => line.trimEnd()).join('\n')
  trimmed = trimmed.replace(/\n*$/, '\n')
  return trimmed
}

describe('trimWhitespace', () => {
  beforeEach(async () => {
    await resetFixtures()
  })

  it('should remove trailing whitespace from lines', async () => {
    const filePath = join(FIXTURES_TEMP, 'trailing-whitespace.ts')
    const content = await Deno.readTextFile(filePath)
    const trimmed = trimWhitespace(content)

    // Should not have trailing spaces on lines
    const lines = trimmed.split('\n')
    for (const line of lines) {
      assertEquals(line, line.trimEnd(), 'Line should not have trailing whitespace')
    }

    // Should end with single newline
    assertEquals(trimmed.endsWith('\n'), true)
    assertEquals(trimmed.endsWith('\n\n'), false)
  })

  it('should handle already clean files', async () => {
    const filePath = join(FIXTURES_TEMP, 'already-clean.ts')
    const content = await Deno.readTextFile(filePath)
    const trimmed = trimWhitespace(content)

    // Should be unchanged
    assertEquals(trimmed, content)
  })

  it('should remove whitespace from empty lines', async () => {
    const filePath = join(FIXTURES_TEMP, 'empty-line-whitespace.ts')
    const content = await Deno.readTextFile(filePath)
    const trimmed = trimWhitespace(content)

    // Empty lines should have no whitespace
    const lines = trimmed.split('\n')
    for (const line of lines) {
      if (line.length === 0) continue // Empty is fine
      assertEquals(line, line.trimEnd())
    }

    // Should end with single newline
    assertEquals(trimmed.endsWith('\n'), true)
    assertEquals(trimmed.endsWith('\n\n'), false)
  })
})

describe('resetFixtures', () => {
  it('should restore original state', async () => {
    await resetFixtures()
    const filePath = join(FIXTURES_TEMP, 'trailing-whitespace.ts')

    // Modify the file
    await Deno.writeTextFile(filePath, 'modified content')
    let content = await Deno.readTextFile(filePath)
    assertEquals(content, 'modified content')

    // Reset should restore original
    await resetFixtures()
    content = await Deno.readTextFile(filePath)
    assertEquals(content.includes('modified content'), false)
    assertEquals(content.includes('function _test()'), true)
  })
})
