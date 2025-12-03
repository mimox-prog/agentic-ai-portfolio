type Props = {
  title: string;
  domain: string;
  description: string;
  impact: string;
  status: "human-in-loop" | "autonomous" | "assistive";
  confidence: number; // 0–1
};

const statusStyles: Record<Props["status"], string> = {
  "human-in-loop": "bg-amber-500/20 text-amber-300 border-amber-500/30",
  autonomous: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  assistive: "bg-blue-500/20 text-blue-300 border-blue-500/30",
};

export default function AgentCard({
  title,
  domain,
  description,
  impact,
  status,
  confidence,
}: Props) {
  return (
    <div className="group glass rounded-lg p-6 border border-white/10 hover:border-white/20 transition">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-neutral-100">{title}</h3>
        <span className={`px-3 py-1 rounded-full text-xs border ${statusStyles[status]}`}>
          {status.replace("-", " ")}
        </span>
      </div>
      <div className="mt-2 text-xs text-neutral-400">{domain}</div>
      <p className="mt-4 text-sm text-neutral-300">{description}</p>
      <p className="mt-3 text-xs text-neutral-400">Impact: {impact}</p>
      <div className="mt-5 h-2 w-full bg-white/10 rounded">
        <div
          className="h-2 rounded bg-gradient-to-r from-cyan-500 to-blue-600 transition-all"
          style={{ width: `${Math.round(confidence * 100)}%` }}
          aria-label={`confidence ${Math.round(confidence * 100)}%`}
        />
      </div>
      <div className="mt-2 text-xs text-neutral-400">
        Confidence: {Math.round(confidence * 100)}%
      </div>
    </div>
  );
}
