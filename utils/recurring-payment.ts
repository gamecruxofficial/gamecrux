'use server'

import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { TebexRecurringPayment } from "@/types/tebex";
import { eq } from "drizzle-orm";

const username = process.env.TEBEX_PROJECT_ID;
const password = process.env.TEBEX_PRIVATE_KEY;


export async function checkRecurringPayment(reference: string) {
  try {
    const response = await fetch(`${process.env.HEADLESS_API_ENDPOINT}/api/recurring-payments/${reference}`, {
      method: 'GET',
      headers: {
        "Authorization": "Basic " + Buffer.from(username + ":" + password).toString("base64"),
        "Content-Type": "application/json"
      },
    });
    const data: TebexRecurringPayment = await response.json();

    await db.update(subscriptions)
      .set({
        isActive: data.status.description === 'Active' ? 'true' : 'false',
        nextPaymentDate: new Date(data.next_payment_date),
        lastCheckedAt: new Date(),
        interval: data.interval,
        amount: data.amount.toString(),
      })
      .where(eq(subscriptions.recurringPayment, reference));

    return data;
  } catch (error) {
    console.error('Error checking recurring payment:', error);
    throw error;
  }
}
