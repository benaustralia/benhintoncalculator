import { useState, useMemo } from 'react';
import { parseISO, eachDayOfInterval, getDay, format } from "date-fns";
import { Copy, Check } from "lucide-react";

const CFG = {
  terms: { term_1: { s: "2026-01-28", e: "2026-04-02" }, term_2: { s: "2026-04-20", e: "2026-06-26" }, term_3: { s: "2026-07-13", e: "2026-09-18" }, term_4: { s: "2026-10-05", e: "2026-12-18" } },
  holidays: [{ n: "Labour Day", d: "2026-03-09" }, { n: "Anzac Day", d: "2026-04-25" }, { n: "King's Birthday", d: "2026-06-08" }, { n: "Melbourne Cup Day", d: "2026-11-03" }],
  levels: { prep_6: { l: "PREP-6", r: [75, 85] }, grade_7_10: { l: "GRADE 7-10", r: [82, 98] }, vce: { l: "VCE", r: [95, 120] }, adult: { l: "ADULT", r: [110, 140] } },
  discounts: [0, 100, 200, 300],
  durations: { "45m": 0.75, "1h": 1, "1.5h": 1.5, "2h": 2 }
};
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TERMS = ["term_1", "term_2", "term_3", "term_4"] as const;
const DAY_IDX: Record<string, number> = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
const DUR_LABELS: Record<string, string> = { "45m": "45 MIN", "1h": "1 HR", "1.5h": "1.5 HR", "2h": "2 HR" };
const S = { i: "w-full px-3 py-2 bg-black border border-zinc-800 text-white text-sm", on: "bg-white text-black", off: "border border-zinc-800 text-zinc-400" };

type TK = typeof TERMS[number];
type TC = { day: string; dur: string; s?: string; e?: string };

export function TermCalculator() {
  const [loyal, setLoyal] = useState(true);
  const [level, setLevel] = useState<keyof typeof CFG.levels>("grade_7_10");
  const [terms, setTerms] = useState<TK[]>([]);
  const [cfg, setCfg] = useState<Partial<Record<TK, TC>>>({});
  const [credit, setCredit] = useState(0);
  const [copied, setCopied] = useState(false);

  const calc = useMemo(() => {
    if (!terms.length) return { tape: "", total: 0 };
    const lv = CFG.levels[level], rate = lv.r[loyal ? 0 : 1], disc = CFG.discounts[terms.length - 1] || 0;
    const discLabel = terms.length === 4 ? "ANNUAL DISCOUNT" : terms.length >= 2 ? "MULTI-TERM DISCOUNT" : "";

    let cost = 0;
    const lines = terms.sort().map((t, i) => {
      const c = cfg[t]; if (!c) return "";
      const term = CFG.terms[t], ts = parseISO(term.s), te = parseISO(term.e);
      const cs = c.s ? parseISO(c.s) : ts, ce = c.e ? parseISO(c.e) : te;
      const dates: string[] = [], hols: string[] = [];

      eachDayOfInterval({ start: ts, end: te })
        .filter(d => getDay(d) === DAY_IDX[c.day])
        .filter(d => (!c.s || d >= cs) && (!c.e || d <= ce))
        .forEach(d => {
          const ds = format(d, "yyyy-MM-dd"), h = CFG.holidays.find(x => x.d === ds);
          h ? hols.push(h.n.toUpperCase()) : dates.push(ds);
        });

      cost += rate * dates.length * CFG.durations[c.dur];
      return [
        `TERM ${t.split("_")[1]}`,
        dates.length ? `${format(parseISO(dates[0]), "d MMM").toUpperCase()} — ${format(parseISO(dates[dates.length - 1]), "d MMM").toUpperCase()}` : "",
        `${dates.length} SESSIONS / ${DUR_LABELS[c.dur]}`,
        hols.length ? `EXCLUDES: ${hols.join(", ")}` : null,
        i < terms.length - 1 ? "---" : null
      ].filter(Boolean).join("\n");
    });

    const sub = Math.round(cost), total = Math.max(0, sub - disc - credit);
    const tape = [
      `${lv.l}${loyal ? " LOYALTY" : ""}`, "", ...lines, "",
      "---",
      `SUBTOTAL $${sub.toLocaleString()}`,
      disc > 0 ? `${discLabel} -$${disc.toLocaleString()}` : null,
      credit > 0 ? `CREDIT -$${credit.toLocaleString()}` : null,
      `PAYABLE $${total.toLocaleString()}`
    ].filter(Boolean).join("\n");
    return { tape, total };
  }, [terms, cfg, level, loyal, credit]);

  const toggle = (t: TK) => {
    if (terms.includes(t)) { setTerms(terms.filter(x => x !== t)); const { [t]: _, ...r } = cfg; setCfg(r); }
    else { setTerms([...terms, t]); setCfg({ ...cfg, [t]: terms[0] && cfg[terms[0]] ? cfg[terms[0]] : { day: "Monday", dur: "1h" } }); }
  };

  const copy = () => { navigator.clipboard.writeText(calc.tape); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <main className="h-[100dvh] bg-black text-white flex flex-col md:flex-row">
      <div className="flex-1 p-6 md:p-12 overflow-y-auto space-y-4 md:max-w-lg">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Term Calculator</h1>
        <div className="flex gap-2">
          {[true, false].map(v => <button key={String(v)} onClick={() => setLoyal(v)} className={`flex-1 px-3 py-2 text-sm font-medium ${loyal === v ? S.on : S.off}`}>{v ? "LOYALTY" : "NEW CLIENT"}</button>)}
        </div>
        <select value={level} onChange={e => setLevel(e.target.value as keyof typeof CFG.levels)} className={S.i}>
          {Object.entries(CFG.levels).map(([k, v]) => <option key={k} value={k}>{v.l}</option>)}
        </select>
        <div className="grid grid-cols-2 gap-2">
          {TERMS.map(t => <button key={t} onClick={() => toggle(t)} className={`px-3 py-2 text-sm font-medium ${terms.includes(t) ? S.on : S.off}`}>TERM {t.split("_")[1]}</button>)}
        </div>
        {terms.sort().map(t => {
          const c = cfg[t]; if (!c) return null;
          const term = CFG.terms[t], upd = (u: Partial<TC>) => setCfg({ ...cfg, [t]: { ...c, ...u } });
          return (
            <div key={t} className="border border-zinc-800 p-3 space-y-2">
              <div className="text-sm font-medium">TERM {t.split("_")[1]}</div>
              <select value={c.day} onChange={e => upd({ day: e.target.value })} className={S.i}>{DAYS.map(d => <option key={d} value={d}>{d.toUpperCase()}</option>)}</select>
              <select value={c.dur} onChange={e => upd({ dur: e.target.value })} className={S.i}>{Object.entries(DUR_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
              <div className="flex gap-2">
                <input type="date" value={c.s || ""} min={term.s} max={term.e} onChange={e => upd({ s: e.target.value || undefined })} className={`${S.i} flex-1`} />
                <input type="date" value={c.e || ""} min={term.s} max={term.e} onChange={e => upd({ e: e.target.value || undefined })} className={`${S.i} flex-1`} />
              </div>
            </div>
          );
        })}
        <input type="number" value={credit || ""} onChange={e => setCredit(parseFloat(e.target.value) || 0)} placeholder="CREDIT" className={`${S.i} placeholder:text-zinc-500`} />
        <div className="text-[10px] text-zinc-600">{(import.meta.env.VITE_COMMIT_REF || import.meta.env.VITE_GIT_COMMIT_SHA)?.substring(0, 7) || 'dev'}</div>
      </div>
      <div className="flex-1 p-6 md:p-12 md:flex md:items-center md:justify-center overflow-y-auto">
        {calc.tape ? (
          <div className="space-y-6 w-full max-w-md">
            <pre className="font-mono text-sm md:text-base whitespace-pre-wrap leading-relaxed">{calc.tape}</pre>
            <div className="flex items-center justify-between border-t border-zinc-800 pt-6">
              <div className="text-5xl md:text-6xl font-black">${calc.total.toLocaleString()}</div>
              <button onClick={copy} className="p-2 border border-zinc-800 hover:border-white">
                {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5 text-zinc-400" />}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-6xl md:text-8xl font-black text-zinc-900">$0</div>
        )}
      </div>
    </main>
  );
}
