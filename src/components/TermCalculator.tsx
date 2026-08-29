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

const DESKTOP_QUERY = "(min-width: 768px)";

// SSR/first-hydration render always assumes mobile (matches server output, avoids a
// hydration mismatch); this flips true post-hydration on desktop viewports so the
// two content panes stop claiming a `tabpanel` relationship to a hidden tablist there.
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    setIsDesktop(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return isDesktop;
}

export function TermCalculator() {
  const [year, setYear] = useState(getCurrentYear);
  const [loyal, setLoyal] = useState(true);
  const [level, setLevel] = useState<LevelKey>("grade_7_10");
  const [active, setActive] = useState<SlotKey[]>([]);
  const [configs, setConfigs] = useState<Partial<Record<SlotKey, CardConfig>>>({});
  const [globalCredit, setGlobalCredit] = useState("");
  const [globalDebit, setGlobalDebit] = useState("");
  const [lang, setLang] = useState<Lang>("en");
  const isDesktop = useIsDesktop();

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

  // Below md this behaves as a real single-panel-at-a-time tab widget (Radix owns
  // role="tabpanel"/aria-labelledby-to-trigger there). At md+ both panels sit side by
  // side and the tablist is hidden, so `isDesktop` swaps each panel to a plain labelled
  // region instead of a tabpanel with no operable tablist behind it.
  const calcRegionProps = isDesktop ? { role: "region" as const, "aria-labelledby": "calc-heading" } : {};
  const quoteRegionProps = isDesktop ? { role: "region" as const, "aria-labelledby": "quote-heading" } : {};

  return (
    <main data-prerendered="" className="h-[100dvh] bg-black text-white">
      <Tabs defaultValue="calculator" className="h-full flex flex-col md:flex-row md:max-w-5xl md:mx-auto">
        <TabsList className="w-full rounded-none border-b border-zinc-800 bg-black p-0 h-auto md:hidden">
          <TabsTrigger value="calculator" className={tabCls}>{tr.tabCalculator}</TabsTrigger>
          <TabsTrigger value="quote" className={tabCls}>{tr.tabQuote}</TabsTrigger>
        </TabsList>
        <TabsContent
          forceMount
          value="calculator"
          {...calcRegionProps}
          className="max-md:data-[state=inactive]:hidden flex-1 overflow-y-auto p-6 md:p-12 mt-0"
        >
          <h2 id="calc-heading" className="sr-only">{tr.tabCalculator}</h2>
          <InputPanel {...panelProps} />
        </TabsContent>
        <TabsContent
          forceMount
          value="quote"
          {...quoteRegionProps}
          className="max-md:data-[state=inactive]:hidden flex-1 overflow-y-auto p-6 md:p-12 mt-0"
        >
          <h2 id="quote-heading" className="sr-only">{tr.tabQuote}</h2>
          {quote}
        </TabsContent>
      </Tabs>
    </main>
  );
}
