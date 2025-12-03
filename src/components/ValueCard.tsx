type Props = {
  title: string;
  desc: string;
};

export default function ValueCard({ title, desc }: Props) {
  return (
    <div className="group glass rounded-2xl p-6 border border-white/10 card-hover">
      <div className="flex items-center gap-3">
        <div className="h-2 w-2 rounded-full bg-cyan-400 pulse-soft" aria-hidden="true"></div>
        <h3 className="text-xl font-bold text-neutral-100">{title}</h3>
      </div>
      <p className="mt-3 text-sm text-neutral-300">{desc}</p>
      <div className="mt-6 h-px w-full bg-gradient-to-r from-cyan-500/30 via-transparent to-purple-500/30" aria-hidden="true"></div>
      <div className="mt-4 text-xs text-neutral-500">
        Designed for clarity, speed, and measurable impact.
      </div>
    </div>
  );
}
