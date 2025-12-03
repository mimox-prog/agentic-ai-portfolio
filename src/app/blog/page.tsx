export default function BlogPage() {
  return (
    <section className="mx-auto max-w-4xl px-6">
      <h2 className="text-4xl font-extrabold tracking-tight">Insights & Articles</h2>
      <p className="mt-6 text-neutral-300">
        Technical deep-dives on agentic AI, orchestration, and human-AI governance.
      </p>

      <div className="mt-10 space-y-6">
        <article className="glass rounded-lg p-6 card-hover">
          <h3 className="text-2xl font-bold">Agentic UI Is The Next Frontier</h3>
          <p className="mt-3 text-sm text-neutral-300">
            Autonomy with control, transparency with speed — the new interface paradigm for complex systems.
          </p>
        </article>

        <article className="glass rounded-lg p-6 card-hover">
          <h3 className="text-2xl font-bold">Designing For Autonomy: Human-AI Partnership</h3>
          <p className="mt-3 text-sm text-neutral-300">
            Approval layers, explainability, and decision affordances for safe, effective agent UX.
          </p>
        </article>

        <article className="glass rounded-lg p-6 card-hover">
          <h3 className="text-2xl font-bold">From Chatbots To Agents: The UX Evolution</h3>
          <p className="mt-3 text-sm text-neutral-300">
            Beyond chat — goal-driven systems with state, memory, and orchestration.
          </p>
        </article>
      </div>
    </section>
  );
}
