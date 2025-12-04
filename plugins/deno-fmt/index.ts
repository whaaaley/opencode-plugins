/**
 * Deno Formatter Plugin
 *
 * Automatically runs deno fmt on TypeScript files when OpenCode edits or writes them.
 */

import type { Plugin } from '@opencode-ai/plugin'

export const DenoFormatter: Plugin = async ({ project, client, $, directory, worktree }) => {
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

      // Only format TypeScript files
      if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) {
        return
      }

      try {
        // Run deno fmt on the file
        const proc = Bun.spawn(['deno', 'fmt', filePath], {
          cwd: directory,
          stdout: 'pipe',
          stderr: 'pipe',
        })

        const exitCode = await proc.exited

        if (exitCode !== 0) {
          const stderr = await new Response(proc.stderr).text()
          await client.tui.showToast({
            body: {
              message: `Deno fmt error: ${stderr}`,
              variant: 'error',
            },
          })
        } else {
          await client.tui.showToast({
            body: {
              message: `Formatted ${filePath.split('/').pop()}`,
              variant: 'success',
            },
          })
        }
      } catch (error) {
        const err = error as Error
        await client.tui.showToast({
          body: {
            message: `Error running deno fmt: ${err.message}`,
            variant: 'error',
          },
        })
      }
    },
  }
}
