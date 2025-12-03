type Props = {
  label: string;
  value: string;
};

export default function HeroStat({ label, value }: Props) {
  return (
    <div className="text-left">
      <div className="text-xs uppercase tracking-wide text-neutral-400">{label}</div>
      <div className="text-lg font-semibold text-neutral-100">{value}</div>
    </div>
  );
}
