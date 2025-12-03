export default function AgentGrid() {
  const items = [
    {
      title: "Agent orchestration",
      desc: "Node-based workflows, tool execution, and decision loops that scale.",
    },
    {
      title: "Human governance",
      desc: "Explainability, approvals, and audit trails — autonomy with control.",
    },
    {
      title: "Realtime telemetry",
      desc: "Status pulses, event streams, and agent logs for transparency.",
    },
    {
      title: "Productized delivery",
      desc: "Templates, onboarding kits, and reproducible systems for adoption.",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {items.map((i) => (
        <div key={i.title} className="glass rounded-lg p-6 border border-white/10 card-hover">
          <div className="text-xl font-bold text-neutral-100">{i.title}</div>
          <p className="mt-3 text-sm text-neutral-300">{i.desc}</p>
        </div>
      ))}
    </div>
  );
}
