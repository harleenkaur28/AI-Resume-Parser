import posthog from 'posthog-js'

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: "/ph",
  ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  defaults: '2025-05-24'
});