'use client'

import { useAppConfigSelector } from '~/providers/root/aggregation-data-provider'

const isVercelEnv = !!process.env.NEXT_PUBLIC_VERCEL_ENV
export const VercelPoweredBy = () => {
  const isSettingToDisplay = useAppConfigSelector(
    (s) => s.poweredBy?.vercel || false,
  )

  const shouldDisplay = isVercelEnv && isSettingToDisplay

  if (!shouldDisplay) {
    return null
  }
  return (
    <img
      src="https://www.sctes.com/assets/logo.svg"
      className="h-10 cursor-pointer object-contain"
      alt="本站由无畏云提供CDN加速服务"
      tabIndex={0}
      onClick={() => {
        window.open('https://www.sctes.com/')
      }}
    />
  )
}
