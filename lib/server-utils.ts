"use server";

import { db } from "@/db/index";
import { users } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { subscriptions } from "@/db/schema"
import { lte } from "drizzle-orm"
import { revalidatePath, revalidateTag } from 'next/cache';


export async function checkUsername(username: string): Promise<boolean> {
  if (username.length < 3) {
    return false;
  }

  const existingUser = await db.query.users.findFirst({
    where: eq(users.username, username),
  });

  return !existingUser;
}

export async function checkProvider(email: string): Promise<'google' | 'discord' | 'credentials' | null> {
  // Check if user exists with this email
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!existingUser) {
    return null;
  }

  // Only return if provider is one of the allowed values
  if (existingUser.provider === 'google' ||
      existingUser.provider === 'discord' ||
      existingUser.provider === 'credentials') {
    return existingUser.provider;
  }

  return null;
}

export async function getUserSubscription(userId: string) {
  const subscription = await db.query.subscriptions.findFirst({
    where: and(
      eq(subscriptions.userId, userId),
      eq(subscriptions.isActive, "true") // Updated to use text-based boolean
    )
  })

  return {
    success: !!subscription,
    subscription
  }
}

export async function updateSubscriptionStatus() {
  const currentDate = new Date()

  await db
    .update(subscriptions)
    .set({ isActive: "false" }) // Updated to use text-based boolean
    .where(lte(subscriptions.cancelledAt, currentDate))
}

export async function fetchSubscription(userId: string): Promise<{ success: boolean, subscriptions: typeof subscriptions.$inferSelect[] }> {
  try {
    // Query for all user's active subscriptions with proper filtering, sorted by latest first
    const userSubscriptions = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.isActive, "true"),
          eq(subscriptions.status, "active") // Use the new status field
        )
      )
      .orderBy(desc(subscriptions.createdAt)); // Sort by latest createdAt first

    // Return the array of subscriptions (latest first)
    return {
      success: userSubscriptions.length > 0,
      subscriptions: userSubscriptions
    };
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    throw new Error("Failed to fetch subscriptions");
  }
}

// Add a new function to update subscription and revalidate
export async function updateSubscriptionAfterPayment(userId: string) {
  try {
    // After payment processing and subscription update in your payment handler
    // Call this function to revalidate paths that display subscription data
    revalidatePath('/games');
    revalidateTag('subscription-data');
    
    return { success: true };
  } catch (error) {
    console.error("Error revalidating paths after payment:", error);
    return { success: false, error: "Failed to update subscription view" };
  }
}
