import { createClient } from '@blinkdotnew/sdk'

export const blink = createClient({
  projectId: import.meta.env.VITE_BLINK_PROJECT_ID || 'inventory-vision-lane-csk1q61s',
  publishableKey: import.meta.env.VITE_BLINK_PUBLISHABLE_KEY || 'blnk_pk_AxY9b4nIBtV-sWkC8eerp0Bn-wCs0ZF3',
  authRequired: false,
  auth: { mode: 'managed' },
})
