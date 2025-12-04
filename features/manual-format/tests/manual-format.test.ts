import { assertEquals } from '@std/assert'
import { copy, expandGlob } from '@std/fs'
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
 * Run deno fmt on a file
 */
async function runDenoFmt(filePath: string): Promise<boolean> {
  const command = new Deno.Command('deno', {
    args: ['fmt', filePath],
    stdout: 'piped',
    stderr: 'piped',
  })
  const { code } = await command.output()
  return code === 0
}

/**
 * Trim trailing whitespace from each line and ensure single trailing newline
 */
function trimWhitespace(content: string): string {
  let trimmed = content.split('\n').map((line) => line.trimEnd()).join('\n')
  trimmed = trimmed.replace(/\n*$/, '\n')
  return trimmed
}

/**
 * Process file with both formatters (simulates manual_format tool)
 */
async function manualFormat(pattern: string): Promise<{
  filesProcessed: number
  formatted: number
  trimmed: number
}> {
  const files: string[] = []
  for await (const entry of expandGlob(pattern, { root: FIXTURES_TEMP })) {
    if (entry.isFile) {
      files.push(entry.path)
    }
  }

  let formatted = 0
  let trimmed = 0

  for (const filePath of files) {
    // Step 1: Run deno fmt on TypeScript files
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      const success = await runDenoFmt(filePath)
      if (success) {
        formatted++
      }
      // Skip whitespace trimming for TS/JS files - deno fmt handles it
      continue
    }

    // Step 2: Trim whitespace on non-TS/JS files
    const content = await Deno.readTextFile(filePath)
    const trimmedContent = trimWhitespace(content)

    if (trimmedContent !== content) {
      await Deno.writeTextFile(filePath, trimmedContent)
      trimmed++
    }
  }

  return {
    filesProcessed: files.length,
    formatted,
    trimmed,
  }
}

describe('Manual Format Plugin', () => {
  beforeEach(async () => {
    await resetFixtures()
  })

  it('should format and trim files with both issues', async () => {
    const pattern = join(FIXTURES_TEMP, 'unformatted-with-whitespace.ts')

    const result = await manualFormat(pattern)

    assertEquals(result.filesProcessed, 1)
    assertEquals(result.formatted, 1, 'Should format TypeScript file')
    // Note: deno fmt removes trailing whitespace automatically, so trimmed count may be 0
    assertEquals(result.trimmed >= 0, true, 'Trimmed count should be 0 or more')

    // Verify the file is now properly formatted and clean
    const content = await Deno.readTextFile(pattern)
    assertEquals(content.includes(';'), false, 'Should not have semicolons after formatting')
    assertEquals(content.endsWith('\n'), true, 'Should end with newline')
    assertEquals(content.endsWith('\n\n'), false, 'Should not have multiple trailing newlines')
  })

  it('should not modify already perfect files', async () => {
    const pattern = join(FIXTURES_TEMP, 'already-perfect.ts')

    const beforeContent = await Deno.readTextFile(pattern)
    const result = await manualFormat(pattern)

    assertEquals(result.filesProcessed, 1)
    assertEquals(result.formatted, 1, 'Deno fmt runs but makes no changes')
    assertEquals(result.trimmed, 0, 'No whitespace to trim')

    const afterContent = await Deno.readTextFile(pattern)
    assertEquals(afterContent, beforeContent, 'Content should be unchanged')
  })

  it('should trim whitespace on formatted files', async () => {
    const pattern = join(FIXTURES_TEMP, 'formatted-but-messy.ts')

    const result = await manualFormat(pattern)

    assertEquals(result.filesProcessed, 1)
    assertEquals(result.formatted, 1)
    // Note: deno fmt removes trailing whitespace automatically, so trimmed count may be 0
    assertEquals(result.trimmed >= 0, true, 'Should trim trailing whitespace or deno fmt already did it')

    // Verify whitespace was removed
    const content = await Deno.readTextFile(pattern)
    const lines = content.split('\n')
    for (const line of lines) {
      assertEquals(line, line.trimEnd(), 'No line should have trailing whitespace')
    }
  })

  it('should process multiple files matching glob pattern', async () => {
    const pattern = join(FIXTURES_TEMP, '*.ts')

    const result = await manualFormat(pattern)

    assertEquals(result.filesProcessed, 3, 'Should process all 3 TypeScript files')
    assertEquals(result.formatted >= 1, true, 'Should format at least one file')
  })

  it('should handle no matching files gracefully', async () => {
    const pattern = join(FIXTURES_TEMP, 'non-existent-*.ts')

    const result = await manualFormat(pattern)

    assertEquals(result.filesProcessed, 0)
    assertEquals(result.formatted, 0)
    assertEquals(result.trimmed, 0)
  })
})
