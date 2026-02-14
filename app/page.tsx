import CTA from "@/components/CTA";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <main className="bg-white text-gray-800 font-sans">
      <Header />
      <Hero />
      <Features />
      <CTA />
      <Footer />
    </main>
  );
}


