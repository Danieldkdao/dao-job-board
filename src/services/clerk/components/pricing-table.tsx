import { PricingTable as ClerkPricingTable } from "@clerk/nextjs";

export const PricingTable = () => {
  return (
    <ClerkPricingTable
      for="organization"
      newSubscriptionRedirectUrl="/employer/pricing"
    />
  );
};
