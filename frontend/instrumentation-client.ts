import posthog from 'posthog-js'

if (typeof window !== 'undefined') {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const apiHost = '/ph'
  const uiHost = "https://eu.posthog.com"

  posthog.init(key as string, {
    api_host: apiHost,
    ui_host: uiHost,
  })
}