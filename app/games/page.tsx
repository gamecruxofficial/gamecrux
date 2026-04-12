import { auth } from '@/auth';
import React from 'react';
import SubscribedGamePage from './SubscribedGamePage';
import FreeGamePage from './FreeGamePage';
import { fetchSubscription } from '@/lib/server-utils';
import { unstable_cache } from 'next/cache';

// Cache the subscription fetch but with tags for revalidation
const getCachedSubscription = unstable_cache(
  async (userId: string) => {
    try {
      return await fetchSubscription(userId);
    } catch (error) {
      console.error("Error fetching subscription:", error);
      return null;
    }
  },
  ['user-subscription'],
  { tags: ['subscription-data'], revalidate: false } // Changed from 0 to false
);

export default async function Page() {
    const session = await auth(); // Get the session
    let subscription = null;

    // Fetch user subscription if logged in
    if (session?.user?.id) {
      subscription = await getCachedSubscription(session.user.id);
    }

    // Check for active subscription using the array
    const hasActiveSubscription = subscription?.subscriptions?.some(sub => sub.isActive === "true" && sub.status === "active");

    return (
        <div>
        {hasActiveSubscription
        ? <SubscribedGamePage subscription={subscription} />
        : <FreeGamePage />}
        </div>
    );
}
