/**
 * Toast Queue Module
 *
 * Shared toast queue that plugins can import and use to prevent toast collisions.
 * Usage:
 *   import { queueToast } from '../toast-queue/queue.ts'
 *   await queueToast(client, { body: { message: 'Hello', variant: 'success' } })
 */

interface ToastPayload {
  body: {
    message: string
    variant: 'success' | 'error' | 'info' | 'warning'
  }
}

interface QueuedToast {
  client: any
  payload: ToastPayload
  timestamp: number
}

// Global queue shared across all imports
const toastQueue: QueuedToast[] = []
let isProcessing = false

async function processQueue() {
  if (isProcessing || toastQueue.length === 0) {
    return
  }

  isProcessing = true

  while (toastQueue.length > 0) {
    const toast = toastQueue.shift()
    if (!toast) break

    await toast.client.tui.showToast(toast.payload)

    // Wait for toast to be visible before showing next one
    // Toasts typically stay visible for 3-4 seconds
    await new Promise((resolve) => setTimeout(resolve, 3500))
  }

  isProcessing = false
}

/**
 * Queue a toast to be shown sequentially
 * Accepts the same payload as client.tui.showToast()
 */
export async function queueToast(
  client: any,
  payload: ToastPayload,
): Promise<void> {
  const toast: QueuedToast = {
    client,
    payload,
    timestamp: Date.now(),
  }

  toastQueue.push(toast)

  // Start processing queue if not already processing
  if (!isProcessing) {
    processQueue()
  }
}
