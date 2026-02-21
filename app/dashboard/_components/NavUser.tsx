"use client"

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useClerk, useUser } from "@clerk/nextjs"
import { useDashboardStore, useDashboardUserSummary } from "@/lib/store/dashboard-store"

export function NavUser() {
  const { isMobile } = useSidebar()
  const { user } = useUser()
  const { signOut } = useClerk()
  const userSummary = useDashboardUserSummary()
  const setAccountOpen = useDashboardStore((state) => state.setAccountOpen)
  const setBillingOpen = useDashboardStore((state) => state.setBillingOpen)
  const setNotificationsOpen = useDashboardStore((state) => state.setNotificationsOpen)

  const fallbackName = user?.fullName || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'User'
  const fallbackEmail = user?.emailAddresses[0]?.emailAddress || 'unknown@example.com'
  const displayName = userSummary?.fullName || fallbackName
  const displayEmail = userSummary?.email || fallbackEmail
  let initials = 'CN'
  if (userSummary?.firstName && userSummary?.lastName) {
    initials = [userSummary.firstName[0].toUpperCase(), userSummary.lastName[0].toUpperCase()].join('')
  } else if (user?.firstName && user?.lastName) {
    initials = [user.firstName[0].toUpperCase(), user.lastName[0].toUpperCase()].join('')
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={userSummary?.imageUrl ?? user?.imageUrl} alt={"user profile"} />
                <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{displayName}</span>
                <span className="truncate text-xs">{displayEmail}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={userSummary?.imageUrl ?? user?.imageUrl} alt={"user profile"} />
                  <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{displayName}</span>
                  <span className="truncate text-xs">{displayEmail}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onSelect={() => setBillingOpen(true)}>
                <Sparkles />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onSelect={() => setAccountOpen(true)}>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setBillingOpen(true)}>
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setNotificationsOpen(true)}>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => signOut({ redirectUrl: '/sign-in' })}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
