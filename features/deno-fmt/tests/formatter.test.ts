import { beforeEach, describe, it } from '@std/testing/bdd'
import { assertExists } from '@std/assert'
import { copy, ensureDir } from '@std/fs'
import { join } from '@std/path'

const FIXTURES_RAW = join(import.meta.dirname!, '../fixtures/raw')
const FIXTURES_TEMP = join(import.meta.dirname!, '../fixtures/temp')

describe('Deno Formatter Plugin', () => {
  beforeEach(async () => {
    // Clean and recreate temp directory
    await Deno.remove(FIXTURES_TEMP, { recursive: true }).catch(() => {})
    await ensureDir(FIXTURES_TEMP)

    // Copy fixtures from raw to temp
    await copy(FIXTURES_RAW, FIXTURES_TEMP, { overwrite: true })
  })

  it('should format unformatted TypeScript files', async () => {
    const testFile = join(FIXTURES_TEMP, 'unformatted.ts')

    // Read original content
    const beforeContent = await Deno.readTextFile(testFile)
    assertExists(beforeContent)

    // Run deno fmt
    const command = new Deno.Command('deno', {
      args: ['fmt', testFile],
      stdout: 'piped',
      stderr: 'piped',
    })
    const { code } = await command.output()

    // Should succeed
    if (code !== 0) {
      throw new Error(`deno fmt failed with exit code ${code}`)
    }

    // Read formatted content
    const afterContent = await Deno.readTextFile(testFile)

    // Should be formatted (no semicolons, single quotes)
    if (afterContent.includes(';')) {
      throw new Error('Formatted content should not have semicolons')
    }
  })

  it('should not modify already formatted files', async () => {
    const testFile = join(FIXTURES_TEMP, 'already-formatted.ts')

    // Read original content
    const beforeContent = await Deno.readTextFile(testFile)

    // Run deno fmt
    const command = new Deno.Command('deno', {
      args: ['fmt', testFile],
      stdout: 'piped',
      stderr: 'piped',
    })
    await command.output()

    // Read after content
    const afterContent = await Deno.readTextFile(testFile)

    // Should be identical
    if (beforeContent !== afterContent) {
      throw new Error('Already formatted file should not change')
    }
  })
})
