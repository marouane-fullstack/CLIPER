
export default function CTA() {
   return (
    <section
      id="contact"
      className="py-24 bg-white scroll-mt-32"
    >
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold mb-6">
          Contact Us
        </h2>

        <p className="text-gray-600 mb-10">
          Have questions? We’d love to hear from you.
        </p>

        <form className="space-y-6 max-w-md mx-auto">
          <input
            type="text"
            placeholder="Your Name"
            className="w-full border p-3 rounded-lg"
          />
          <input
            type="email"
            placeholder="Your Email"
            className="w-full border p-3 rounded-lg"
          />
          <textarea
            placeholder="Your Message"
            className="w-full border p-3 rounded-lg"
            rows = {4}

          />
          <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition">
            Send Message
          </button>
        </form>
      </div>
    </section>
  );
}