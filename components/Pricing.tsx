import Link from "next/link";
import PricingCard from "./PricingCard";

export default function Pricing() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 text-center">

        {/* Section Title */}
        <h2 className="text-4xl font-bold mb-4">
          Simple & Transparent Pricing
        </h2>
        <p className="text-gray-600 mb-16">
          Choose the perfect plan for your transcription needs.
        </p>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* FREE */}
          <PricingCard
            title="Free"
            price="$0"
            features={[
              "10 minutes/month",
              "Basic transcription",
              "TXT export",
              "Community support"
            ]}
          />

          {/* STARTER */}
          <PricingCard
            title="Starter"
            price="$9"
            features={[
              "3 hours/month",
              "High accuracy AI",
              "TXT & PDF export",
              "Email support"
            ]}
          />

          {/* PRO (Highlighted) */}
          <PricingCard
            title="Pro"
            price="$19"
            highlight
            features={[
              "10 hours/month",
              "Multi-language support",
              "All export formats",
              "Speaker detection",
              "Priority support"
            ]}
          />

          {/* BUSINESS */}
          <PricingCard
            title="Business"
            price="$49"
            features={[
              "Unlimited hours",
              "Team access",
              "Advanced analytics",
              "API access",
              "Dedicated support"
            ]}
          />

        </div>
      </div>
    </section>
  );
}

