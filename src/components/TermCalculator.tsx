import { useState, useMemo, useEffect } from "react";
import { parseISO, eachDayOfInterval, getDay, format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { YEAR_DATA, getCurrentYear } from "@/data/terms";
import { type CardConfig } from "@/components/TermCard";
import { Tape } from "@/components/Tape";
import { InputPanel } from "@/components/InputPanel";
import { TRANSLATIONS, type Lang } from "@/i18n/translations";
import { SLOTS, SLOT_ORDER, DAY_IDX, type SlotKey, type LevelKey, type Slot } from "@/lib/termConstants";
import { buildTape } from "@/lib/buildTape";

export function TermCalculator() {
  const [year, setYear] = useState(getCurrentYear);
  const [loyal, setLoyal] = useState(true);
  const [level, setLevel] = useState<LevelKey>("grade_7_10");
  const [active, setActive] = useState<SlotKey[]>([]);
  const [configs, setConfigs] = useState<Partial<Record<SlotKey, CardConfig>>>({});
  const [globalCredit, setGlobalCredit] = useState("");
  const [globalDebit, setGlobalDebit] = useState("");
  const [lang, setLang] = useState<Lang>("en");

  const data = YEAR_DATA[year];
  const tr = TRANSLATIONS[lang];

  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    document.title = tr.pageTitle;
  }, [lang, tr.pageTitle]);

  const getRange = (slot: Slot) => {
    if (slot.isHols) {
      const holKey = slot.termKey === "term_4" ? "summer" as const : slot.termKey;
      return data.holidays[holKey];
    }
    return data.terms[slot.termKey];
  };

  const toggle = (slot: Slot) => {
    const k = slot.key;
    if (active.includes(k)) {
      setActive(active.filter(x => x !== k));
      const { [k]: _, ...rest } = configs;
      setConfigs(rest);
    } else {
      const range = getRange(slot);
      const base = active.find(k => !SLOTS.find(s => s.key === k)?.isGR);
      const baseConfig = base && configs[base];
      let selectedDates: string[] = [];
      if (slot.isHols && slot.isGR) {
        selectedDates = eachDayOfInterval({ start: parseISO(range.start), end: parseISO(range.end) })
          .filter(d => getDay(d) === DAY_IDX.Sunday)
          .map(d => format(d, "yyyy-MM-dd"));
      }
      const defaults = slot.isGR
        ? { day: "Sunday", dur: "1.5h", groupReading: true }
        : { day: baseConfig?.day || "Monday", dur: baseConfig?.dur || "1h", groupReading: false };
      setActive([...active, k]);
      setConfigs({ ...configs, [k]: { ...defaults, start: range.start, end: range.end, selectedDates } });
    }
  };

  const calc = useMemo(() =>
    buildTape({ active, configs, level, loyal, year, data, globalCredit, globalDebit, tr }),
    [active, configs, level, loyal, year, data, globalCredit, globalDebit, lang]
  );

  const updateConfig = (k: SlotKey, u: Partial<CardConfig>) =>
    setConfigs({ ...configs, [k]: { ...configs[k]!, ...u } });

  const tabCls = "flex-1 rounded-none py-3 text-sm data-[state=active]:bg-zinc-900 data-[state=active]:text-white text-zinc-300";
  const panelProps = { lang, setLang, year, setYear, loyal, setLoyal, level, setLevel, active, toggle, globalCredit, setGlobalCredit, globalDebit, setGlobalDebit, configs, updateConfig, data };
  const quote = <div className="flex items-center justify-center h-full"><Tape tape={calc.tape} total={calc.total} lang={lang} /></div>;

  return (
    <main data-prerendered="" className="h-[100dvh] bg-black text-white">
      <div className="hidden md:flex h-full max-w-5xl mx-auto">
        <div className="flex-1 p-12 overflow-y-auto">
          <h2 className="sr-only">{tr.tabCalculator}</h2>
          <InputPanel {...panelProps} />
        </div>
        <div className="flex-1 p-12 overflow-y-auto">
          <h2 className="sr-only">{tr.tabQuote}</h2>
          {quote}
        </div>
      </div>
      <div className="md:hidden h-full flex flex-col">
        <Tabs defaultValue="calculator" className="flex flex-col h-full">
          <TabsList className="w-full rounded-none border-b border-zinc-800 bg-black p-0 h-auto">
            <TabsTrigger value="calculator" className={tabCls}>{tr.tabCalculator}</TabsTrigger>
            <TabsTrigger value="quote" className={tabCls}>{tr.tabQuote}</TabsTrigger>
          </TabsList>
          <TabsContent value="calculator" className="flex-1 overflow-y-auto p-6 mt-0"><InputPanel {...panelProps} /></TabsContent>
          <TabsContent value="quote" className="flex-1 overflow-y-auto p-6 mt-0">{quote}</TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
