/**
 * Toast Queue Plugin
 *
 * Manages a global queue of toasts to prevent them from overlapping.
 * Other plugins can use this by listening to the 'tui.toast.show' event
 * and queuing toasts instead of showing them directly.
 */

import type { Plugin } from '@opencode-ai/plugin'

interface QueuedToast {
  message: string
  variant: 'success' | 'error' | 'info' | 'warning'
  timestamp: number
}

// Global queue shared across all plugin instances
const toastQueue: QueuedToast[] = []
let isProcessing = false

async function processQueue(client: any) {
  if (isProcessing || toastQueue.length === 0) {
    return
  }

  isProcessing = true

  while (toastQueue.length > 0) {
    const toast = toastQueue.shift()
    if (!toast) break

    await client.tui.showToast({
      body: {
        message: toast.message,
        variant: toast.variant,
      },
    })

    // Wait for toast to be visible before showing next one
    // Toasts typically stay visible for 3-4 seconds
    await new Promise((resolve) => setTimeout(resolve, 3500))
  }

  isProcessing = false
}

export const ToastQueue: Plugin = async ({ client }) => {
  return {
    'tui.toast.show': async (input) => {
      // Intercept toast requests and queue them
      const toast: QueuedToast = {
        message: input.message,
        variant: input.variant || 'info',
        timestamp: Date.now(),
      }

      toastQueue.push(toast)

      // Start processing queue
      processQueue(client)
    },
  }
}
