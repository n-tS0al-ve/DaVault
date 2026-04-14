"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { CheckIcon } from "@heroicons/react/20/solid";

const tiers = [
  {
    name: "Free",
    id: "tier-free",
    priceId: "",
    price: "$0",
    description: "Basic access. Good for trying out the platform.",
    features: ["1 Game Server", "Basic Support", "Shared Resources"],
    cta: "Current Plan",
    tierName: "FREE",
  },
  {
    name: "Pro",
    id: "tier-pro",
    priceId: "price_XXXXXXXXXXXXXX", // Replace with real price ID later
    price: "$15",
    description: "Dedicated resources for serious gamers.",
    features: ["Up to 5 Game Servers", "Priority Support", "Dedicated Resources", "Custom Domains"],
    cta: "Subscribe to Pro",
    tierName: "PRO",
  },
];

export default function PricingPage() {
  const { data: session } = useSession();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string, tierName: string) => {
    if (!session) {
      alert("Please sign in first.");
      return;
    }
    if (!priceId) return;

    setLoadingId(priceId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, tier: tierName }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.assign(data.url);
      } else {
        alert("Failed to create checkout session.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    }
    setLoadingId(null);
  };

  return (
    <div className="bg-gray-900 py-24 sm:py-32 min-h-screen text-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-400">Pricing</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Pricing plans for game server hosting
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-300">
          Choose an affordable plan that&apos;s packed with the best features for engaging your audience, creating customer loyalty, and driving sales.
        </p>
        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:gap-x-8 lg:gap-y-0">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className="rounded-3xl p-8 ring-1 ring-gray-200 xl:p-10 bg-gray-800"
            >
              <h3 id={tier.id} className="text-lg font-semibold leading-8 text-white">
                {tier.name}
              </h3>
              <p className="mt-4 text-sm leading-6 text-gray-300">{tier.description}</p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-bold tracking-tight text-white">{tier.price}</span>
                <span className="text-sm font-semibold leading-6 text-gray-300">/month</span>
              </p>
              <button
                onClick={() => handleSubscribe(tier.priceId, tier.tierName)}
                disabled={loadingId === tier.priceId || !tier.priceId}
                className={`mt-6 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  tier.priceId
                    ? "bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600"
                    : "bg-gray-700 text-gray-300 cursor-not-allowed"
                } w-full`}
              >
                {loadingId === tier.priceId ? "Processing..." : tier.cta}
              </button>
              <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-300">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <CheckIcon className="h-6 w-5 flex-none text-indigo-400" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
