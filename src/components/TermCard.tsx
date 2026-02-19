import { Input } from "@/components/ui/input";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DUR_LABELS: Record<string, string> = { "45m": "45 MIN", "1h": "1 HR", "1.5h": "1.5 HR", "2h": "2 HR" };
const S = "w-full px-3 py-2 bg-black border border-zinc-800 text-white text-sm";

export type CardConfig = { day: string; dur: string; start: string; end: string; credit: string };

type Props = {
  label: string;
  config: CardConfig;
  minDate: string;
  maxDate: string;
  onChange: (update: Partial<CardConfig>) => void;
};

export function TermCard({ label, config, minDate, maxDate, onChange }: Props) {
  return (
    <div className="border border-zinc-800 p-3 space-y-2">
      <div className="text-sm font-medium">{label}</div>
      <select
        value={config.day}
        onChange={e => onChange({ day: e.target.value })}
        className={S}
      >
        {DAYS.map(d => <option key={d} value={d}>{d.toUpperCase()}</option>)}
      </select>
      <select
        value={config.dur}
        onChange={e => onChange({ dur: e.target.value })}
        className={S}
      >
        {Object.entries(DUR_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </select>
      <div className="flex gap-2">
        <input
          type="date"
          value={config.start}
          min={minDate}
          max={maxDate}
          onChange={e => onChange({ start: e.target.value })}
          className={`${S} flex-1`}
        />
        <input
          type="date"
          value={config.end}
          min={minDate}
          max={maxDate}
          onChange={e => onChange({ end: e.target.value })}
          className={`${S} flex-1`}
        />
      </div>
      <Input
        value={config.credit}
        onChange={e => onChange({ credit: e.target.value })}
        placeholder="CREDIT ($)"
        className="bg-black border-zinc-800 text-white placeholder:text-zinc-500"
      />
    </div>
  );
}
