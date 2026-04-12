"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import PricingSectionUpgrade from "@/components/pricing-upgrade"
import { plans } from "@/constants/constants"
import { CurrencyProvider } from "@/contexts/CurrencyProvider"

type Subscription = {
  id: string;
  createdAt: Date | null;
  userId: string;
  plan: string;
  amount: string | null; // Changed from number to string to match schema
  isActive: string; // Changed from boolean to string to match schema
  status?: string; // Added status field
  cancelledAt?: Date | null;
  nextPaymentDate?: Date | null;
  pendingCancellation?: string; // Added as string
  cancellationReason?: string | null; // Added cancellation reason
  billingCycle?: string | null; // Added billing cycle
}

export default function SubscriptionPage({initialSubscriptions}: {initialSubscriptions: Subscription[]}) {
  if (!initialSubscriptions || initialSubscriptions.length === 0) {
    return <div>No subscriptions found</div>;
  }

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'Not available';

    // Use consistent formatting to prevent hydration issues
    return new Date(date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC' // Add timezone to ensure consistency
    });
  };

  const currentSubscription = initialSubscriptions[0]; // Latest is first
  const previousSubscriptions = initialSubscriptions.slice(1);

  const currentPlanIndex = plans.findIndex((plan) => plan.name.toLowerCase() === currentSubscription.plan.toLowerCase());
  const isActive = currentSubscription.isActive === "true"; // Convert string to boolean
  const isPendingCancellation = currentSubscription.pendingCancellation === "true";

  return (
    <div className="mx-auto p-4 mt-12">
      {/* Current Plan Section */}
      <div className="flex flex-row items-center max-w-screen-xl mx-auto space-x-4 mb-8">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <strong>Plan Name:</strong> {currentSubscription.plan}
            </div>
            <div className="flex items-center gap-2">
              <strong>Amount:</strong> € {plans[currentPlanIndex]?.price.EUR.toFixed(2) || 'N/A'}
            </div>
            <div className="flex items-center gap-2">
              <strong>Status:</strong>{" "}
              <Badge variant={isActive ? "default" : "destructive"}>
                {isActive ? "Active" : "Inactive"}
              </Badge>
              {isPendingCancellation && (
                <Badge variant="secondary">Pending Cancellation</Badge>
              )}
            </div>
            {currentSubscription.billingCycle && (
              <div className="flex items-center gap-2">
                <strong>Billing Cycle:</strong> {currentSubscription.billingCycle}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Billing Details</CardTitle>
            <CardDescription>Subscription information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <strong>Started:</strong> {formatDate(currentSubscription.createdAt)}
            </div>

            {currentSubscription.cancelledAt && (
              <div className="flex items-center gap-2">
                <strong>Cancelled:</strong> {formatDate(currentSubscription.cancelledAt)}
              </div>
            )}

            {currentSubscription.cancellationReason && (
              <div className="flex items-center gap-2">
                <strong>Cancellation Reason:</strong> {currentSubscription.cancellationReason}
              </div>
            )}

            <div className="flex items-center gap-2">
              <strong>Next Billing Date:</strong> {
                currentSubscription.cancelledAt
                  ? 'Cancelled'
                  : isPendingCancellation
                    ? 'Pending Cancellation'
                    : currentSubscription.nextPaymentDate
                      ? formatDate(currentSubscription.nextPaymentDate)
                      : 'Not scheduled'
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Previous Plans Section */}
      {previousSubscriptions.length > 0 && (
        <div className="max-w-screen-xl mx-auto mb-8">
          <Card className="border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl">Previous Plans</CardTitle>
              <CardDescription>All your previous subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {previousSubscriptions.map((subscription) => {
                  const planIndex = plans.findIndex((plan) => plan.name.toLowerCase() === subscription.plan.toLowerCase());

                  return (
                    <div key={subscription.id} className="flex items-center gap-4 p-4 border border-gray-600 rounded-lg">
                      <div className="flex items-center gap-2">
                        <strong>Plan Name:</strong> {subscription.plan}
                      </div>
                      <div className="flex items-center gap-2">
                        <strong>Amount:</strong> € {plans[planIndex]?.price.EUR.toFixed(2) || 'N/A'}
                      </div>
                      <div className="flex items-center gap-2">
                        <strong>Started:</strong> {formatDate(subscription.createdAt)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {isPendingCancellation && (
        <div className="max-w-screen-xl mx-auto mb-8">
          <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950">
            <CardContent className="pt-6">
              <p className="text-orange-800 dark:text-orange-200">
                Your current subscription is scheduled for cancellation at the end of your current billing period.
                You will continue to have access until {formatDate(currentSubscription.nextPaymentDate)}.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {currentPlanIndex === plans.length - 1 && (
        <p className="mt-4 text-center text-muted-foreground">
          You are currently on our highest tier plan. Thank you for your support!
        </p>
      )}
      <div>
          <CurrencyProvider>
            <PricingSectionUpgrade />
          </CurrencyProvider>
      </div>
    </div>
  );
}
