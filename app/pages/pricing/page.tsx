"use client";

import { Check } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { plans, PricingTier } from "@/constants/constants";
import { useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import MaxWidthWrapper from "@/components/MaxWidth";
import { createTebexBasket } from "@/lib/tebex";
import Image from "next/image";
import { fetchSubscription, updateSubscriptionAfterPayment } from "@/lib/server-utils";
import { useSocialSignIn } from "@/hooks/useSocialSignIn";
import { useProcessing } from "@/contexts/ProcessingProvider";

export default function PricingSection() {
  const { data: session } = useSession();
  const router = useRouter();
  const { isProcessing, setIsProcessing } = useProcessing();

  const [processingStates, setProcessingStates] = useState<Record<string, boolean>>({});
  const [subscription, setSubscription] = useState<{ plan: string } | null>(null);
  const [Tebex, setTebex] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { handleSocialSignIn } = useSocialSignIn();

  useEffect(() => {
    import("@tebexio/tebex.js")
      .then((module) => setTebex(module.default))
      .catch((err) => console.error("Error loading Tebex:", err));
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      const fetchUserSubscription = async () => {
        try {
          if (!session.user.id) throw new Error("User ID is required");
          const result = await fetchSubscription(session.user.id);
          if (result?.subscriptions && result.subscriptions.length > 0) {
            // Use the latest subscription (first in the sorted array)
            setSubscription({ plan: result.subscriptions[0].plan });
          } else {
            setSubscription(null);
          }
        } catch (error) {
          console.error("Error fetching subscription:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchUserSubscription();
    } else {
      setLoading(false);
    }
  }, [session]);

  const handleGetStarted = async (plan: PricingTier) => {
    if (!session) {
      toast.error("Please sign in to continue");
      router.push("/sign-in");
      return;
    }
    if (!session.user.discordId) {
      toast.success("Please connect your Discord account first");
      await handleSocialSignIn("discord");
      return;
    }
    if (!plan.tebexId || !Tebex) {
      toast.error("Payment system is not ready. Please try again.");
      return;
    }

    try {
      setProcessingStates((prev) => ({ ...prev, [plan.name]: true }));
      setIsProcessing(true); // Start global spinner

      const basketIdent = await createTebexBasket(
        [plan.tebexId.toString()],
        session.user?.name ?? "",
        session.user?.id ?? "",
        session.user?.discordId ?? ""
      );

      const config = {
        ident: basketIdent,
        theme: "dark",
        colors: [
          { name: "primary", color: "#FFD12E" },
          { name: "secondary", color: "#000000" },
        ],
        endpoint: "https://pay.tebex.io",
      };

      Tebex.checkout.init(config);

      Tebex.checkout.on("payment:complete", async (data: any) => {
        console.log("Checkout modal closed after payment:", data);
        
        // Add this block to revalidate subscription data before navigation
        if (session?.user?.id) {
          try {
            await updateSubscriptionAfterPayment(session.user.id);
            console.log("Subscription data revalidated");
          } catch (error) {
            console.error("Error revalidating subscription data:", error);
          }
        }
        
        router.push("/games");
      });

      Tebex.checkout.on("payment:error", () => {
        toast.error("Payment failed. Please try again.");
      });

      Tebex.checkout.launch();
      setIsProcessing(false); 

    } catch (error) {
      console.error("Error in payment process:", error);
      toast.error("Failed to initiate payment. Please try again.");
      setIsProcessing(false);
    } finally {
      setProcessingStates((prev) => ({ ...prev, [plan.name]: false }));
    }
  };

  return (
    <MaxWidthWrapper maxWidth="full">
      <div className="p-8 mx-auto space-y-8 mt-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white">Pricing Plans</h2>
          <p className="text-gray-400">Choose the perfect plan for your needs</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-6 2xl:grid-cols-5 gap-8">
          {plans.map((plan, index) => {
            const isPlanActive = subscription?.plan?.toLowerCase() === plan.name.toLowerCase();
            const isProcessing = processingStates[plan.name];
            const layoutClasses = ['2xl:col-span-1', '2xl:col-start-auto']; 
            if (index < 3) {
              layoutClasses.push('md:col-span-2');
            } else if (index === 3) {
              layoutClasses.push('md:col-start-2 md:col-span-2');
            } else {
              layoutClasses.push('md:col-span-2');
            }

            return (
              <Card 
                key={plan.name} 
                className={`bg-black border border-gray-800 relative flex flex-col h-full ${layoutClasses.join(' ')}`}
              >
                <CardHeader>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                      {plan.popular && <Badge className="bg-[#FFD12E] text-black font-medium">Most Popular</Badge>}
                    </div>
                    <p className="text-sm text-gray-400">{plan.description}</p>
                  </div>
                </CardHeader>
                {plan.imageUrl && (
                  <div className="px-6">
                    <Image
                      src={plan.imageUrl}
                      alt={plan.name}
                      width={1200}
                      height={1200}
                      className="w-full rounded-lg"
                    />
                  </div>
                )}
                <CardContent className="space-y-6 flex-grow">
                  <div className="space-y-1">
                    <div className="text-4xl font-bold text-white">€{plan.price.EUR.toFixed(2)}</div>
                    <div className="text-sm text-gray-400">{plan.duration}</div>
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-gray-300">
                        <Check className="h-5 w-5 flex-shrink-0 text-[#FFD12E]" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="mt-auto pt-6">
                  <Button
                    className="w-full bg-[#FFD12E] hover:bg-[#E5BC29] text-black font-semibold"
                    onClick={() => handleGetStarted(plan)}
                    disabled={isProcessing || isPlanActive || loading}
                  >
                    {loading
                      ? "Loading..."
                      : isPlanActive
                      ? "Current Plan"
                      : isProcessing
                      ? "Processing..."
                      : "Subscribe"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </MaxWidthWrapper>
  );
}