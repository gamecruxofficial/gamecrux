"use server"

import { auth } from '@/auth'
import { redirect } from "next/navigation"
import Subscription from './subscription'
import { fetchSubscription } from '@/lib/server-utils'


export default async function SubscriptionPage() {
  const session = await auth()

  // if (!session?.user?.id) {
  //   redirect("/login")
  // }

  const subscription = session?.user?.id ? await fetchSubscription(session.user.id) : null;

  return subscription?.success === true ? (
    <Subscription initialSubscriptions={subscription.subscriptions} />
  ) : (
    <div className="flex flex-col items-center justify-center min-h-screen -mt-24 text-center text-white">
      <h2 className="text-2xl font-bold mb-2">No Active Subscription</h2>
      <p className="mb-4">You do not have an active subscription. Please subscribe to access this feature.</p>
      {/* Optionally add a button to go to the subscription page */}
      {/* <Button onClick={() => redirect("/subscribe")}>Subscribe Now</Button> */}
    </div>
  )
}
