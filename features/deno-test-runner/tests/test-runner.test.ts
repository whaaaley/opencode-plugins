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
  try {
    await Deno.remove(FIXTURES_TEMP, { recursive: true })
  } catch {
    // Directory might not exist
  }
  await copy(FIXTURES_RAW, FIXTURES_TEMP, { overwrite: true })
}

describe('Deno Test Runner Plugin', () => {
  beforeEach(async () => {
    await resetFixtures()
  })

  it('should detect @test annotation in file', async () => {
    const filePath = join(FIXTURES_TEMP, 'with-test-annotation.ts')
    const content = await Deno.readTextFile(filePath)

    assertEquals(content.includes('@test'), true, 'Should find @test annotation')
  })

  it('should not detect @test in files without annotation', async () => {
    const filePath = join(FIXTURES_TEMP, 'without-test-annotation.ts')
    const content = await Deno.readTextFile(filePath)

    assertEquals(content.includes('@test'), false, 'Should not find @test annotation')
  })

  it('should run tests on file with @test annotation', async () => {
    const filePath = join(FIXTURES_TEMP, 'with-test-annotation.ts')

    // Run deno test on the file
    const command = new Deno.Command('deno', {
      args: ['test', '--allow-all', filePath],
      stdout: 'piped',
      stderr: 'piped',
    })

    const { code } = await command.output()

    // Tests should pass
    assertEquals(code, 0, 'Tests should pass')
  })
})
