export default function ContactPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 text-center">
      <h2 className="text-4xl font-extrabold tracking-tight">Let’s Collaborate</h2>
      <p className="mt-6 text-neutral-300">
        Interested in automation, agentic AI, or launching your own system? Reach out and let’s build something powerful.
      </p>

      <div className="mt-10">
        <a
          href="mailto:hello@yourdomain.com"
          className="inline-block px-8 py-4 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold shadow-lg transition-transform hover:scale-105"
        >
          Book a consultation
        </a>
      </div>

      <p className="mt-6 text-xs text-neutral-500">
        Include your goals and timeline — I’ll reply within 24 hours.
      </p>
    </section>
  );
}
