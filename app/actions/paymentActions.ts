"use server";

import { db } from "@/db"; // Import your Drizzle instance
import { subscriptions } from "@/db/schema"; // Import your Drizzle schema
import { revalidatePath } from "next/cache";
import { checkRecurringPayment } from "@/utils/recurring-payment";

interface Product {
  id: string;
  name: string;
}

interface PaymentDetails {
  recurring_payment_reference: string;
  transaction_id: string;
  products: Product[];
  custom?: {
    userid: string;
  };
}

export async function processPayment(paymentDetails: PaymentDetails) {
  try {
    // Extract required data from paymentDetails
    const transaction_id = paymentDetails.transaction_id;
    const products = paymentDetails.products.map(({ id, name }: Product) => ({ id, name }));
    const userId = paymentDetails.custom?.userid;
    const recurring_payment = paymentDetails.recurring_payment_reference;

    if (!userId) {
      throw new Error('User ID is required');
    }

    // Save to database using Drizzle ORM
    await db.insert(subscriptions).values({
      id: transaction_id,
      userId: userId,
      plan: products[0]?.name ?? 'default',
      createdAt: new Date(),
      recurringPayment: recurring_payment
    });

    // Check recurring payment status if reference exists
    if (recurring_payment) {
      try {
        await checkRecurringPayment(recurring_payment);
      } catch (recurringError) {
        console.error("Error checking recurring payment:", recurringError);
        // Continue execution even if recurring payment check fails
      }
    }

    // Optionally revalidate any relevant paths if needed
    revalidatePath("/games");

    return { success: true, message: "Payment processed successfully" };
  } catch (error) {
    console.error("Error processing payment:", error);
    return { success: false, message: "Failed to process payment" };
  }
}