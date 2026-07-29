"use server";

import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { revalidatePath, revalidateTag } from "next/cache";
import { checkRecurringPayment } from "@/utils/recurring-payment";
import { eq, and, ne } from "drizzle-orm";
import { plans } from "@/constants/constants";

interface Product {
  id: string | number;
  name: string;
}

export interface PaymentDetails {
  recurring_payment_reference?: string | null;
  transaction_id: string;
  products: Product[];
  custom?: {
    userid?: string;
  };
  price_paid?: {
    amount?: number;
    currency?: string;
  };
}

function resolvePlanName(products: Product[]): string {
  const product = products[0];
  if (!product) return "default";

  const packageId = String(product.id);
  const matchedPlan = plans.find((plan) => plan.tebexId === packageId);
  if (matchedPlan) return matchedPlan.name;

  return product.name || "default";
}

function resolveBillingCycle(planName: string): string | null {
  const matchedPlan = plans.find(
    (plan) => plan.name.toLowerCase() === planName.toLowerCase()
  );
  return matchedPlan?.durationTime ?? null;
}

export async function processPayment(paymentDetails: PaymentDetails) {
  try {
    const transactionId = paymentDetails.transaction_id;
    const products = paymentDetails.products ?? [];
    const userId = paymentDetails.custom?.userid;
    const recurringPayment = paymentDetails.recurring_payment_reference ?? null;

    if (!transactionId) {
      return { success: false, message: "Transaction ID is required" };
    }

    if (!userId) {
      return {
        success: false,
        message: "User ID is required (custom.userid missing from payment)",
      };
    }

    const planName = resolvePlanName(products);
    const billingCycle = resolveBillingCycle(planName);
    const amount =
      paymentDetails.price_paid?.amount != null
        ? String(paymentDetails.price_paid.amount)
        : null;

    const existing = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.id, transactionId))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(subscriptions)
        .set({
          userId,
          plan: planName,
          isActive: "true",
          status: "active",
          recurringPayment,
          amount,
          billingCycle,
          updatedAt: new Date(),
          pendingCancellation: "false",
          failedPaymentCount: "0",
        })
        .where(eq(subscriptions.id, transactionId));
    } else {
      await db.insert(subscriptions).values({
        id: transactionId,
        userId,
        plan: planName,
        isActive: "true",
        status: "active",
        recurringPayment,
        amount,
        billingCycle,
        createdAt: new Date(),
        updatedAt: new Date(),
        pendingCancellation: "false",
        failedPaymentCount: "0",
      });
    }

    // Keep only the latest purchase active for this user
    await db
      .update(subscriptions)
      .set({
        isActive: "false",
        status: "cancelled",
        updatedAt: new Date(),
        cancellationReason: "Replaced by newer purchase",
      })
      .where(
        and(eq(subscriptions.userId, userId), ne(subscriptions.id, transactionId))
      );

    if (recurringPayment) {
      try {
        await checkRecurringPayment(recurringPayment);
      } catch (recurringError) {
        console.error("Error checking recurring payment:", recurringError);
      }
    }

    revalidatePath("/games");
    revalidatePath("/subscription");
    revalidatePath("/pages/pricing");
    revalidateTag("subscription-data");

    console.log(
      `processPayment: subscription activated for user=${userId} txn=${transactionId} plan=${planName}`
    );

    return { success: true, message: "Payment processed successfully" };
  } catch (error) {
    console.error("Error processing payment:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to process payment",
    };
  }
}
