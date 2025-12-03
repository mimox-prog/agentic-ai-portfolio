export default function ServicesPage() {
  return (
    <section className="mx-auto max-w-5xl px-6">
      <h2 className="text-4xl font-extrabold tracking-tight">Services</h2>
      <p className="mt-6 text-neutral-300">
        Productized offerings designed to deliver agentic AI value fast — with onboarding, templates, and robust integrations.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <div className="glass rounded-lg p-6 card-hover">
          <div className="text-xl font-semibold text-neutral-100">Compliance Automation</div>
          <p className="mt-3 text-neutral-300 text-sm">
            RAG agents for regulatory review, risk extraction, and reporting — governance-first.
          </p>
        </div>
        <div className="glass rounded-lg p-6 card-hover">
          <div className="text-xl font-semibold text-neutral-100">Multi-Agent Orchestration</div>
          <p className="mt-3 text-neutral-300 text-sm">
            LangGraph-based platforms coordinating specialized agents — self-healing workflows.
          </p>
        </div>
        <div className="glass rounded-lg p-6 card-hover">
          <div className="text-xl font-semibold text-neutral-100">Autonomous API Integration</div>
          <p className="mt-3 text-neutral-300 text-sm">
            Agents that discover, map, and maintain SaaS integrations — reduce manual maintenance.
          </p>
        </div>
      </div>
    </section>
  );
}
