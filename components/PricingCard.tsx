
export default function PricingCard({ title, price, features, highlight = false }: { title: string; price: string; features: string[]; highlight?: boolean }) {
  return (
    <div className={`border rounded-lg p-6 text-center ${highlight ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-800 border-gray-300"}`}>
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <p className="text-4xl font-extrabold mb-6">  {price}                               
        <span className={`text-lg font-medium ${highlight ? "text-indigo-100" : "text-gray-500"}`}>
          /month
        </span>
      </p>
      <ul className="mb-6 space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2">
            <span>✓</span> {feature}
          </li>
        ))}
      </ul>
      <a  
        href="/signup"
        className={`block py-3 px-6 rounded-lg font-semibold transition ${
          highlight 
            ? "bg-white text-indigo-600 hover:bg-gray-200"  
            : "bg-indigo-600 text-white hover:bg-indigo-700"
        }`}
      >
        Get Started
      </a>
    </div>
  );
}

