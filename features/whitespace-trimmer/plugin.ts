/**
 * Whitespace Trimming Plugin
 *
 * Automatically trims trailing whitespace and ensures files end with a single newline
 * when OpenCode edits or writes files.
 *
 * Note: Skips TypeScript/JavaScript files as deno fmt handles whitespace for them.
 */

import type { Plugin } from '@opencode-ai/plugin'

export const WhitespaceTrimmer: Plugin = async ({ project, client, $, directory, worktree }) => {
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

      // Skip TypeScript/JavaScript files - deno fmt handles them
      if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
        return
      }

      try {
        // Read the file
        const content = await Bun.file(filePath).text()

        // Trim trailing whitespace from each line
        let trimmed = content.split('\n').map((line) => line.trimEnd()).join('\n')

        // Ensure single trailing newline
        trimmed = trimmed.replace(/\n*$/, '\n')

        // Only write if content changed
        if (trimmed !== content) {
          await Bun.write(filePath, trimmed)
          await client.tui.showToast({
            body: {
              message: `Cleaned whitespace in ${filePath.split('/').pop()}`,
              variant: 'success',
            },
          })
        }
      } catch (error) {
        const err = error as Error
        await client.tui.showToast({
          body: {
            message: `Error trimming whitespace: ${err.message}`,
            variant: 'error',
          },
        })
      }
    },
  }
}
