import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

const PLAN_LIMITS = {
  free: { videoLimit: 2, clipLimit: 6 },
  pro: { videoLimit: 20, clipLimit: 120 },
  enterprise: { videoLimit: 100, clipLimit: 1000 },
} as const

type Plan = keyof typeof PLAN_LIMITS

function isPlan(value: string): value is Plan {
  return value === 'free' || value === 'pro' || value === 'enterprise'
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await req.json()) as { plan?: string }
    const nextPlan = typeof body.plan === 'string' ? body.plan.toLowerCase() : ''

    if (!isPlan(nextPlan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const clerkUser = await currentUser()
    const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? `user-${userId}@unknown.local`
    const name = clerkUser?.fullName ?? ([clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ') || 'User')

    const updated = await prisma.user.upsert({
      where: { id: userId },
      update: {
        plan: nextPlan,
        videoLimit: PLAN_LIMITS[nextPlan].videoLimit,
        clipLimit: PLAN_LIMITS[nextPlan].clipLimit,
      },
      create: {
        id: userId,
        email,
        name,
        plan: nextPlan,
        videoLimit: PLAN_LIMITS[nextPlan].videoLimit,
        clipLimit: PLAN_LIMITS[nextPlan].clipLimit,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        plan: true,
        monthlyVideosUsed: true,
        monthlyClipsUsed: true,
        videoLimit: true,
        clipLimit: true,
      },
    })

    return NextResponse.json({ success: true, user: updated })
  } catch (error) {
    console.error('Plan update failed:', error)
    return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 })
  }
}
