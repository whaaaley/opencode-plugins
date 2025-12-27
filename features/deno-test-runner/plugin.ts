/**
 * Deno Test Runner Plugin
 *
 * Automatically runs deno tests when files with @test JSDoc annotation are edited or written.
 */

import type { Plugin } from '@opencode-ai/plugin'
import { queueToast } from '../toast-queue/queue.ts'

export const DenoTestRunner: Plugin = async ({ project, client, $, directory, worktree }) => {
  return {
    'tool.execute.after': async (input, output) => {
      // Only process edit and write operations
      if (input.tool !== 'edit' && input.tool !== 'write') {
        return
      }

      const filePath = output.metadata?.filediff?.file

      if (!filePath) {
        return // No file to process
      }

      // Only process TypeScript files
      if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) {
        return
      }

      try {
        // Read the file to check for @test annotation
        const content = await Bun.file(filePath).text()

        // Check if file has @test annotation in JSDoc comment
        if (!content.includes('@test')) {
          return // No @test annotation, skip
        }

        // Run deno test on the file
        const proc = Bun.spawn(['deno', 'test', '--allow-all', filePath], {
          cwd: directory,
          stdout: 'pipe',
          stderr: 'pipe',
        })

        const exitCode = await proc.exited

        if (exitCode !== 0) {
          const stderr = await new Response(proc.stderr).text()
          await queueToast(client, {
            body: {
              message: `Test failed: ${filePath.split('/').pop()}`,
              variant: 'error',
            },
          })
        } else {
          await queueToast(client, {
            body: {
              message: `Tests passed: ${filePath.split('/').pop()}`,
              variant: 'success',
            },
          })
        }
      } catch (error) {
        const err = error as Error
        await queueToast(client, {
          body: {
            message: `Error running tests: ${err.message}`,
            variant: 'error',
          },
        })
      }
    },
  }
}
