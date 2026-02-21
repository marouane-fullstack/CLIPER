import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from './_components/AppSidebar'
import { Separator } from '@/components/ui/separator'
import BreadcrumbCurrentPath from './_components/breadcrumbCurrentPath'
import DashboardHeaderActions from './_components/DashboardHeaderActions'
import DashboardFloatingPanels from './_components/DashboardFloatingPanels'
import DashboardUserHydrator from './_components/DashboardUserHydrator'
import prisma from '@/lib/prisma'
import type { DashboardUserSummary } from '@/lib/dashboard/types'

async function getUserSummary(userId: string): Promise<DashboardUserSummary> {
  const [clerkUser, dbUser] = await Promise.all([
    currentUser(),
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        monthlyVideosUsed: true,
        monthlyClipsUsed: true,
        videoLimit: true,
        clipLimit: true,
      },
    }),
  ])

  const firstName = clerkUser?.firstName ?? ''
  const lastName = clerkUser?.lastName ?? ''
  const fullName = clerkUser?.fullName ?? ([firstName, lastName].filter(Boolean).join(' ') || dbUser?.name || 'User')

  return {
    id: userId,
    email: clerkUser?.emailAddresses?.[0]?.emailAddress ?? dbUser?.email ?? 'unknown@example.com',
    firstName,
    lastName,
    fullName,
    imageUrl: clerkUser?.imageUrl ?? null,
    plan: dbUser?.plan ?? 'free',
    monthlyVideosUsed: dbUser?.monthlyVideosUsed ?? 0,
    monthlyClipsUsed: dbUser?.monthlyClipsUsed ?? 0,
    videoLimit: dbUser?.videoLimit ?? 2,
    clipLimit: dbUser?.clipLimit ?? 6,
  }
}

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { userId } = await auth()
  if (!userId) {
    redirect('/sign-in')
  }

  const userSummary = await getUserSummary(userId)

  return (
    <SidebarProvider>
      <DashboardUserHydrator userSummary={userSummary} />
      <AppSidebar />
      <SidebarInset className="flex flex-col h-screen overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <BreadcrumbCurrentPath />
          </div>
          <DashboardHeaderActions />
        </header>
        <div className="flex-1 overflow-hidden pt-0">
          <div className="h-full p-4 overflow-y-auto scroll-area">{children}</div>
        </div>
      </SidebarInset>
      <DashboardFloatingPanels />
    </SidebarProvider>
  )
}
