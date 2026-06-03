import { createAuthenticatedClient } from "@interledger/open-payments"

export async function getOpenPaymentsClient() {
  if (!process.env.PRIVATE_KEY || !process.env.KEY_ID || !process.env.WALLET_ADDRESS) {
    console.warn("Open Payments credentials not fully configured.")
    // Return a mock or null if env vars aren't set yet during development
    return null
  }

  return await createAuthenticatedClient({
    walletAddressUrl: process.env.WALLET_ADDRESS,
    privateKey: process.env.PRIVATE_KEY,
    keyId: process.env.KEY_ID,
  })
}

// Helper to format the payment pointer for GNAP
export function formatWalletPointer(pointer: string) {
  if (pointer.startsWith('$')) {
    return `https://${pointer.slice(1)}`
  }
  return pointer
}
