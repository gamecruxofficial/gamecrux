import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { subscriptions } from '@/db/schema'
import { eq } from 'drizzle-orm'

const TEBEX_PROJECT_ID = process.env.TEBEX_PROJECT_ID
const TEBEX_PRIVATE_KEY = process.env.TEBEX_PRIVATE_KEY
const HEADLESS_API_ENDPOINT = process.env.HEADLESS_API_ENDPOINT
const SYNC_API_KEY = process.env.SYNC_API_KEY

async function fetchTebexRecurringPayment(reference: string) {
  if (!TEBEX_PROJECT_ID || !TEBEX_PRIVATE_KEY) {
    throw new Error('Tebex API credentials not configured')
  }

  const response = await fetch(
    `${HEADLESS_API_ENDPOINT}/api/recurring-payments/${reference}`,
    {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${TEBEX_PROJECT_ID}:${TEBEX_PRIVATE_KEY}`
        ).toString('base64')}`,
        'Content-Type': 'application/json'
      }
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch recurring payment: ${response.status}`)
  }

  return response.json()
}

export async function POST(request: NextRequest) {
  try {
    // This endpoint should be protected with authentication
    const authHeader = request.headers.get('authorization')
    const expectedAuth = `Bearer ${SYNC_API_KEY || 'test-key'}`

    if (!authHeader || authHeader !== expectedAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all active subscriptions with recurring payments
    const activeSubscriptions = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.isActive, "true"))

    let syncedCount = 0
    let errorCount = 0

    for (const subscription of activeSubscriptions) {
      try {
        if (!subscription.recurringPayment) {
          continue
        }

        // Fetch current status from Tebex
        const tebexData = await fetchTebexRecurringPayment(subscription.recurringPayment)

        const shouldUpdate =
          tebexData.status.id === 5 || // Cancelled
          tebexData.status.id === 4 || // Expired
          tebexData.status.id === 3    // Overdue

        if (shouldUpdate) {
          await db
            .update(subscriptions)
            .set({
              isActive: "false",
              status: tebexData.status.id === 5 ? 'cancelled' :
                     tebexData.status.id === 4 ? 'expired' : 'overdue',
              cancelledAt: tebexData.cancelled_at ? new Date(tebexData.cancelled_at) : null,
              cancellationReason: tebexData.cancel_reason || null,
              nextPaymentDate: tebexData.next_payment_at ? new Date(tebexData.next_payment_at) : null,
              updatedAt: new Date()
            })
            .where(eq(subscriptions.id, subscription.id))

          syncedCount++
        } else if (tebexData.status.id === 2) {
          // Active - update next payment date
          await db
            .update(subscriptions)
            .set({
              nextPaymentDate: tebexData.next_payment_at ? new Date(tebexData.next_payment_at) : null,
              updatedAt: new Date()
            })
            .where(eq(subscriptions.id, subscription.id))

          syncedCount++
        }

      } catch (error) {
        console.error(`Error syncing subscription ${subscription.id}:`, error)
        errorCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sync completed: ${syncedCount} updated, ${errorCount} errors`,
      syncedCount,
      errorCount
    })

  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json(
      { error: 'Sync failed', details: error.message },
      { status: 500 }
    )
  }
}
