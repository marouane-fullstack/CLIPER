'use client'

import { Bell, ExternalLink, Sparkles, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useDashboardStore, useDashboardUserSummary } from '@/lib/store/dashboard-store'

const NEWS_ITEMS = [
  {
    title: 'Storytelling Just Changed Forever - Meet Agent Opus Story Mode',
    description: '$10,000 Story Mode Challenge is now live, learn more here.',
  },
  {
    title: 'OpusClip iOS App is here',
    description: 'You can now create new projects and view your clip results from anywhere.',
  },
  {
    title: 'Automate with Zapier',
    description: 'Build custom workflows and save hours with powerful automations.',
  },
  {
    title: '5 New Languages Supported',
    description: 'Now supports more subtitle and translation languages.',
  },
] as const

export default function DashboardHeaderActions() {
  const userSummary = useDashboardUserSummary()
  const setBillingOpen = useDashboardStore((state) => state.setBillingOpen)
  const setNotificationsOpen = useDashboardStore((state) => state.setNotificationsOpen)

  if (!userSummary) {
    return null
  }

  const clipCreditsLeft = Math.max(0, userSummary.clipLimit - userSummary.monthlyClipsUsed)
  const videoCreditsLeft = Math.max(0, userSummary.videoLimit - userSummary.monthlyVideosUsed)

  return (
    <div className="ml-auto flex items-center gap-2 px-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <Bell className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[420px] rounded-xl p-0">
          <DropdownMenuLabel className="px-4 py-3 text-3xl font-semibold">News</DropdownMenuLabel>
          <DropdownMenuSeparator className="my-0" />
          <div className="max-h-[420px] overflow-y-auto p-3 space-y-3">
            {NEWS_ITEMS.map((item) => (
              <article key={item.title} className="rounded-lg border border-border/40 p-3">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="font-semibold leading-snug text-base">{item.title}</h4>
                  <ExternalLink className="size-4 mt-1 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
              </article>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <Zap className="size-4 text-yellow-400" /> {clipCreditsLeft}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 rounded-xl p-3">
          <DropdownMenuLabel className="p-0 text-base font-semibold flex items-center justify-between">
            <span className="capitalize">{userSummary.plan} Plan</span>
            <span className="text-emerald-400 text-xs">Active</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="space-y-3 py-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Video credits left</span>
              <span className="font-semibold inline-flex items-center gap-1"><Zap className="size-3 text-yellow-400" />{videoCreditsLeft}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Clip credits left</span>
              <span className="font-semibold inline-flex items-center gap-1"><Zap className="size-3 text-yellow-400" />{clipCreditsLeft}</span>
            </div>
            <p className="text-xs text-muted-foreground">Credits reset monthly based on your plan limits.</p>
            <Button className="w-full" onClick={() => setBillingOpen(true)}>Add more credits</Button>
            <Button variant="outline" className="w-full" onClick={() => setNotificationsOpen(true)}>
              <Sparkles className="size-4" /> Learn how credits work
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
