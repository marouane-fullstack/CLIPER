'use client'

import { useEffect } from 'react'
import type { DashboardUserSummary } from '@/lib/dashboard/types'
import { useDashboardStore } from '@/lib/store/dashboard-store'

export default function DashboardUserHydrator({ userSummary }: Readonly<{ userSummary: DashboardUserSummary }>) {
  const hydrateUserSummary = useDashboardStore((state) => state.hydrateUserSummary)

  useEffect(() => {
    hydrateUserSummary(userSummary)
  }, [hydrateUserSummary, userSummary])

  return null
}
