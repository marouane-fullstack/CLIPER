import Card from "./Card";

export default function Features() {
  return (
    <section id="features" className="py-16 max-w-5xl mx-auto">
      <h3 className="text-3xl font-bold text-center mb-8">
        What CLIPER Offers
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card title="Easy Setup" desc="Quick onboarding and simple tools to start fast." />
        <Card title="Powerful Dashboard" desc="All data in one place, easy to analyze." />
        <Card title="Smart Insights" desc="Get automated smart recommendations." />
      </div>
    </section>
  );
}