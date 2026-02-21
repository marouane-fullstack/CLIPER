'use client'

import { useEffect, useMemo, useState } from 'react'
import { Bell, Check, X } from 'lucide-react'
import { useClerk, useUser } from '@clerk/nextjs'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDashboardStore, useDashboardUserSummary } from '@/lib/store/dashboard-store'

const PLAN_OPTIONS = [
  { id: 'free', title: 'Starter', price: '$0 /mo', description: 'Perfect for trying the product', clipLimit: 6, videoLimit: 2 },
  { id: 'pro', title: 'Pro', price: '$11.5 /mo', description: 'Best for active creators', clipLimit: 120, videoLimit: 20 },
  { id: 'enterprise', title: 'Business', price: "Let's talk", description: 'For teams and larger workflows', clipLimit: 1000, videoLimit: 100 },
] as const

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
]

function OverlayCard({
  title,
  onClose,
  children,
}: Readonly<{ title: string; onClose: () => void; children: React.ReactNode }>) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl rounded-xl border border-border/40 bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border/40 p-4">
          <h3 className="text-xl font-semibold">{title}</h3>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}

export default function DashboardFloatingPanels() {
  const userSummary = useDashboardUserSummary()
  const setUserSummary = useDashboardStore((state) => state.setUserSummary)
  const isAccountOpen = useDashboardStore((state) => state.isAccountOpen)
  const isBillingOpen = useDashboardStore((state) => state.isBillingOpen)
  const isNotificationsOpen = useDashboardStore((state) => state.isNotificationsOpen)
  const setAccountOpen = useDashboardStore((state) => state.setAccountOpen)
  const setBillingOpen = useDashboardStore((state) => state.setBillingOpen)
  const setNotificationsOpen = useDashboardStore((state) => state.setNotificationsOpen)

  const { user } = useUser()
  const { signOut } = useClerk()

  const [firstName, setFirstName] = useState(user?.firstName ?? '')
  const [lastName, setLastName] = useState(user?.lastName ?? '')
  const [saving, setSaving] = useState(false)

  const currentPlan = useMemo(() => userSummary?.plan ?? 'free', [userSummary?.plan])

  useEffect(() => {
    if (!userSummary) return
    setFirstName(userSummary.firstName)
    setLastName(userSummary.lastName)
  }, [userSummary])

  if (!userSummary) {
    return null
  }

  const handleSaveProfile = async () => {
    if (!user) return

    try {
      setSaving(true)
      await user.update({ firstName: firstName.trim(), lastName: lastName.trim() })
      await user.reload()

      setUserSummary({
        ...userSummary,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        fullName: [firstName.trim(), lastName.trim()].filter(Boolean).join(' ') || userSummary.fullName,
      })

      toast.success('Account updated')
      setAccountOpen(false)
    } catch (error) {
      console.error(error)
      toast.error('Failed to update account')
    } finally {
      setSaving(false)
    }
  }

  const handlePlanChange = async (plan: 'free' | 'pro' | 'enterprise') => {
    try {
      const res = await fetch('/api/user/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const json = (await res.json()) as {
        error?: string
        user?: {
          plan: 'free' | 'pro' | 'enterprise'
          videoLimit: number
          clipLimit: number
          monthlyVideosUsed: number
          monthlyClipsUsed: number
        }
      }

      if (!res.ok || !json.user) {
        throw new Error(json.error || 'Plan update failed')
      }

      setUserSummary({
        ...userSummary,
        plan: json.user.plan,
        videoLimit: json.user.videoLimit,
        clipLimit: json.user.clipLimit,
        monthlyVideosUsed: json.user.monthlyVideosUsed,
        monthlyClipsUsed: json.user.monthlyClipsUsed,
      })

      toast.success('Plan updated')
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'Failed to update plan')
    }
  }

  return (
    <>
      {isAccountOpen && (
        <OverlayCard title="Account settings" onClose={() => setAccountOpen(false)}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="account-first-name" className="text-sm text-muted-foreground">First name</label>
              <Input id="account-first-name" value={firstName} onChange={(event) => setFirstName(event.target.value)} />
            </div>
            <div>
              <label htmlFor="account-last-name" className="text-sm text-muted-foreground">Last name</label>
              <Input id="account-last-name" value={lastName} onChange={(event) => setLastName(event.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="account-email" className="text-sm text-muted-foreground">Email</label>
              <Input id="account-email" value={userSummary.email} disabled />
            </div>
          </div>
          <div className="mt-5 flex items-center justify-between">
            <Button variant="outline" onClick={() => signOut({ redirectUrl: '/sign-in' })}>Log out</Button>
            <Button onClick={handleSaveProfile} disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</Button>
          </div>
        </OverlayCard>
      )}

      {isBillingOpen && (
        <OverlayCard title="Upgrade your plan" onClose={() => setBillingOpen(false)}>
          <div className="grid gap-4 md:grid-cols-3">
            {PLAN_OPTIONS.map((plan) => {
              const isCurrent = currentPlan === plan.id
              return (
                <div key={plan.id} className={`rounded-xl border p-4 ${isCurrent ? 'border-primary' : 'border-border/50'}`}>
                  <h4 className="text-xl font-semibold">{plan.title}</h4>
                  <p className="text-emerald-400 text-2xl font-bold mt-1">{plan.price}</p>
                  <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                    <li className="flex gap-2"><Check className="size-4" /> {plan.videoLimit} videos / month</li>
                    <li className="flex gap-2"><Check className="size-4" /> {plan.clipLimit} clips / month</li>
                  </ul>
                  <Button className="mt-5 w-full" variant={isCurrent ? 'outline' : 'default'} onClick={() => handlePlanChange(plan.id)}>
                    {isCurrent ? 'Current plan' : `Get ${plan.title}`}
                  </Button>
                </div>
              )
            })}
          </div>
        </OverlayCard>
      )}

      {isNotificationsOpen && (
        <OverlayCard title="News" onClose={() => setNotificationsOpen(false)}>
          <div className="max-h-[60vh] overflow-y-auto space-y-5 pr-1">
            {NEWS_ITEMS.map((item) => (
              <article key={item.title} className="border-b border-border/30 pb-4 last:border-b-0">
                <h4 className="font-semibold flex items-center gap-2"><Bell className="size-4" /> {item.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
              </article>
            ))}
          </div>
        </OverlayCard>
      )}
    </>
  )
}
