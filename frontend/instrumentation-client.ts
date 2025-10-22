import posthog from 'posthog-js'

if (typeof window !== 'undefined') {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const apiHost = '/ph'
  const uiHost = "https://eu.posthog.com"

  console.log('[PH] init', { hasKey: !!key, apiHost, uiHost })

  posthog.init(key as string, {
    api_host: apiHost,
    ui_host: uiHost,
  })
}