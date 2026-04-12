import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { subscriptions } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function POST(request: NextRequest) {
  try {
    const { event, data } = await request.json()

    if (event === "payment.completed") {
      const { custom } = data
      const { userId, planName, planDurationTime } = custom

      if (!userId || !planName) {
        return NextResponse.json(
          { success: false, message: "Missing required data" },
          { status: 400 }
        )
      }

      // Update the subscription status with enhanced schema
      await db
        .update(subscriptions)
        .set({
          plan: planName,
          billingCycle: planDurationTime,
          isActive: true,
          status: "active",
          failedPaymentCount: 0,
          pendingCancellation: false,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.userId, userId))

      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { success: false, message: "Unhandled event type" },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Error processing payment verification:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
