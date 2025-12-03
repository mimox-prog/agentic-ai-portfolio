export default function AboutPage() {
  return (
    <section className="mx-auto max-w-4xl px-6">
      <h2 className="text-4xl font-extrabold tracking-tight">About Marouan</h2>
      <p className="mt-6 text-neutral-300 text-lg">
        I architect agentic AI systems and automation flows for enterprises. My focus: reliability, governance, and UI that inspires trust — productized into turnkey solutions.
      </p>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="glass rounded-lg p-6">
          <div className="font-semibold text-neutral-100">Principles</div>
          <ul className="mt-3 space-y-2 text-neutral-300 text-sm">
            <li>Modular, reproducible, TypeScript-first</li>
            <li>Human-in-loop governance and auditability</li>
            <li>Agent loops: perception → reasoning → action → learning</li>
          </ul>
        </div>
        <div className="glass rounded-lg p-6">
          <div className="font-semibold text-neutral-100">Stack</div>
          <ul className="mt-3 space-y-2 text-neutral-300 text-sm">
            <li>Next.js 16, Tailwind</li>
            <li>RAG + orchestration (LangGraph, LlamaIndex)</li>
            <li>Make.com automation for onboarding</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
