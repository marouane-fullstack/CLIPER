
export default function Header() {
  return (
    <header className="flex justify-between items-center p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-indigo-600">CLIPER</h1>
      <nav className="space-x-6 text-lg">
        <a href="#features" className="hover:text-indigo-500">Features</a>
        <a href="#contact" className="hover:text-indigo-500">Contact</a>
      </nav>
    </header>
  );
}