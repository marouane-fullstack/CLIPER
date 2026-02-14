
export default function Card({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="p-6 border shadow-lg rounded-lg text-center">
      <h4 className="text-xl font-semibold mb-3">{title}</h4>
      <p className="text-gray-600">{desc}</p>
    </div>
  );
}