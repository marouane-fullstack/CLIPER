'use client'

import { useEffect } from 'react'
import type { DashboardBootstrapData } from '@/lib/dashboard/types'
import { useDashboardStore } from '@/lib/store/dashboard-store'

export default function DashboardStoreHydrator({ data }: Readonly<{ data: DashboardBootstrapData }>) {
  const hydrateDashboard = useDashboardStore((state) => state.hydrateDashboard)

  useEffect(() => {
    hydrateDashboard(data)
  }, [data, hydrateDashboard])

  return null
}
