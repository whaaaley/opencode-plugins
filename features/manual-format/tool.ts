/**
 * Manual Format Tool
 *
 * Manually run formatters (deno fmt and whitespace trimmer) on files matching a glob pattern.
 *
 * For TypeScript/JavaScript files: runs deno fmt (which handles formatting and whitespace)
 * For other files: only trims trailing whitespace and ensures single trailing newline
 */

import { tool } from '@opencode-ai/plugin'
import { Glob } from 'bun'

export default tool({
  description: 'Manually run formatters (deno fmt and whitespace trimmer) on files matching a glob pattern',
  args: {
    pattern: tool.schema.string().describe('Glob pattern for files to format (e.g., "scripts/**/*.sh", "**/*.ts")'),
  },
  async execute(args, context) {
    try {
      // Find all files matching the pattern using Bun's Glob API
      const glob = new Glob(args.pattern)
      const files = []

      for await (const file of glob.scan({ cwd: process.cwd(), absolute: true, onlyFiles: true })) {
        files.push(file)
      }

      if (files.length === 0) {
        return `No files found matching pattern: ${args.pattern}`
      }

      let formattedCount = 0
      let trimmedCount = 0
      const formattedFiles = []
      const trimmedFiles = []
      const errors = []

      for (const filePath of files) {
        // Step 1: Run deno fmt on TypeScript files
        if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
          try {
            const proc = Bun.spawn(['deno', 'fmt', filePath], {
              cwd: process.cwd(),
              stdout: 'pipe',
              stderr: 'pipe',
            })

            const exitCode = await proc.exited

            if (exitCode === 0) {
              formattedCount++
              formattedFiles.push(filePath.replace(process.cwd() + '/', ''))
            } else {
              const stderr = await new Response(proc.stderr).text()
              errors.push(`Deno fmt error on ${filePath}: ${stderr}`)
            }
          } catch (error) {
            errors.push(`Error running deno fmt on ${filePath}: ${error.message}`)
          }
          // Skip whitespace trimming for TS/JS files - deno fmt handles it
          continue
        }

        // Step 2: Trim whitespace on non-TS/JS files
        try {
          const content = await Bun.file(filePath).text()

          // Trim trailing whitespace from each line
          let trimmed = content.split('\n').map((line) => line.trimEnd()).join('\n')

          // Ensure single trailing newline
          trimmed = trimmed.replace(/\n*$/, '\n')

          // Only write if content changed
          if (trimmed !== content) {
            await Bun.write(filePath, trimmed)
            trimmedCount++
            trimmedFiles.push(filePath.replace(process.cwd() + '/', ''))
          }
        } catch (error) {
          errors.push(`Error trimming whitespace on ${filePath}: ${error.message}`)
        }
      }

      // Build detailed summary
      let output = `Processed ${files.length} file(s)\n`

      if (formattedCount > 0) {
        output += `\nFormatted ${formattedCount} TypeScript file(s):\n`
        formattedFiles.forEach((file) => {
          output += `  - ${file}\n`
        })
      }

      if (trimmedCount > 0) {
        output += `\nTrimmed whitespace in ${trimmedCount} file(s):\n`
        trimmedFiles.forEach((file) => {
          output += `  - ${file}\n`
        })
      }

      if (errors.length > 0) {
        output += `\nErrors (${errors.length}):\n`
        errors.forEach((err) => {
          output += `  - ${err}\n`
        })
      }

      return output.trim()
    } catch (error) {
      throw new Error(`Error in manual_format: ${error.message}`)
    }
  },
})
