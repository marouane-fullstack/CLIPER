
export default function Header() {

    return (

    <header className="absolute top-0 left-0 w-full z-50">
      <div className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">
          CLIPER
        </h1>

        <nav className="space-x-8 text-white font-medium">
          <a href="#features" className="hover:text-indigo-300">
            Features
          </a>
          <a href="#pricing" className="hover:text-indigo-300">
            Pricing
          </a>
          <a href="#contact" className="hover:text-indigo-300">
            Contact
          </a>
        </nav>
      </div>
    </header>
    
  );

}