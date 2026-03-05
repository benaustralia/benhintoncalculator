import { parseISO, format, getDay } from "date-fns";

export type Lang = "en" | "zh";

export type Translations = {
  heading: string;
  loyalty: string;
  newClient: string;
  levels: Record<string, string>;
  creditPlaceholder: string;
  debitPlaceholder: string;
  tabCalculator: string;
  tabQuote: string;
  days: string[];
  dayDisplay: (day: string) => string;
  durLabels: Record<string, string>;
  startPlaceholder: string;
  endPlaceholder: string;
  slotLabel: (n: number, isHols: boolean, isGR: boolean) => string;
  cardLabel: (n: string, isHols: boolean, isGR: boolean, year: number) => string;
  tapeTerm: (n: string, isHols: boolean) => string;
  tapeGRLabel: (tapeLabel: string, year: number) => string;
  tapeClassLabel: (tapeLabel: string, year: number) => string;
  sessions: (n: number, dur: string) => string;
  subtotal: (amt: string) => string;
  annualDiscount: string;
  multiTermDiscount: string;
  payable: (amt: string) => string;
  creditLine: (amt: string) => string;
  debitLine: (amt: string) => string;
  discountLine: (label: string, amt: string) => string;
  various: string;
  sundays: string;
  excludes: (names: string) => string;
  dayLine: (day: string) => string;
  loyaltyLabel: (levelLabel: string, loyal: boolean) => string;
  daysJoined: (days: string[]) => string;
  formatChipDate: (d: string) => string;
  formatDateRange: (a: string, b: string) => string;
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const ZH_DAY_MAP: Record<string, string> = {
  Monday: "周一", Tuesday: "周二", Wednesday: "周三", Thursday: "周四",
  Friday: "周五", Saturday: "周六", Sunday: "周日",
};
const ZH_DAY_EACH: Record<string, string> = {
  Monday: "每周一", Tuesday: "每周二", Wednesday: "每周三", Thursday: "每周四",
  Friday: "每周五", Saturday: "每周六", Sunday: "每周日",
};
const ZH_WEEKDAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
const ZH_NUM: Record<number, string> = { 1: "一", 2: "二", 3: "三", 4: "四" };

export const EN: Translations = {
  heading: "Fee Calculator",
  loyalty: "LOYALTY",
  newClient: "NEW CLIENT",
  levels: { prep_6: "GRADE P-6", grade_7_10: "GRADE 7-10", vce: "VCE", adult: "ADULT" },
  creditPlaceholder: "CREDIT ($)",
  debitPlaceholder: "DEBIT ($)",
  tabCalculator: "CALCULATOR",
  tabQuote: "QUOTE",
  days: DAYS,
  dayDisplay: (day) => day.toUpperCase(),
  durLabels: { "45m": "45 MIN", "1h": "1 HR", "1.5h": "1.5 HR", "2h": "2 HR" },
  startPlaceholder: "Start",
  endPlaceholder: "End",
  slotLabel: (n, isHols, isGR) =>
    isGR ? (isHols ? `T${n} HOLS READ` : `T${n} READ`) : (isHols ? `T${n} HOLS CLASS` : `T${n} CLASS`),
  cardLabel: (n, isHols, isGR, year) => {
    const tl = isHols ? `T${n} HOLS` : `TERM ${n}`;
    return isGR ? `GROUP READING - ${tl} - ${year}` : `${tl} - ${year}`;
  },
  tapeTerm: (n, isHols) => isHols ? `T${n} HOLS` : `TERM ${n}`,
  tapeGRLabel: (tl, year) => `GROUP READING - ${tl} - ${year}`,
  tapeClassLabel: (tl, year) => `${tl} - ${year}`,
  sessions: (n, dur) => `${n} SESSIONS / ${dur}`,
  subtotal: (amt) => `SUBTOTAL $${amt}`,
  annualDiscount: "ANNUAL DISCOUNT",
  multiTermDiscount: "MULTI-TERM DISCOUNT",
  payable: (amt) => `PAYABLE $${amt}`,
  creditLine: (amt) => `CREDIT -$${amt}`,
  debitLine: (amt) => `DEBIT +$${amt}`,
  discountLine: (label, amt) => `${label} -$${amt}`,
  various: "VARIOUS",
  sundays: "SUNDAYS",
  excludes: (names) => `EXCLUDES: ${names}`,
  dayLine: (day) => `${day.toUpperCase()}S`,
  loyaltyLabel: (label, loyal) => `${label}${loyal ? " LOYALTY" : ""}`,
  daysJoined: (days) => days.map(d => `${d.toUpperCase()}S`).join(" & "),
  formatChipDate: (d) => format(parseISO(d), "EEE d MMM").toUpperCase(),
  formatDateRange: (a, b) =>
    `${format(parseISO(a), "d MMM").toUpperCase()} — ${format(parseISO(b), "d MMM").toUpperCase()}`,
};

export const ZH: Translations = {
  heading: "学费计算器",
  loyalty: "老客户",
  newClient: "新客户",
  levels: { prep_6: "P-6年级", grade_7_10: "7-10年级", vce: "VCE", adult: "成人" },
  creditPlaceholder: "抵扣金额 ($)",
  debitPlaceholder: "额外费用 ($)",
  tabCalculator: "计算器",
  tabQuote: "报价",
  days: DAYS,
  dayDisplay: (day) => ZH_DAY_MAP[day] || day,
  durLabels: { "45m": "45分钟", "1h": "1小时", "1.5h": "1.5小时", "2h": "2小时" },
  startPlaceholder: "开始日期",
  endPlaceholder: "结束日期",
  slotLabel: (n, isHols, isGR) => {
    const ord = ZH_NUM[n] ?? n;
    return isGR
      ? (isHols ? `第${ord}学期假期 阅读班` : `第${ord}学期 阅读班`)
      : (isHols ? `第${ord}学期假期 课程班` : `第${ord}学期 课程班`);
  },
  cardLabel: (n, isHols, isGR, year) => {
    const ord = ZH_NUM[Number(n)] ?? n;
    const tl = isHols ? `第${ord}学期假期` : `第${ord}学期`;
    return isGR ? `小组阅读 - ${tl} - ${year}` : `${tl} - ${year}`;
  },
  tapeTerm: (n, isHols) => { const ord = ZH_NUM[Number(n)] ?? n; return isHols ? `第${ord}学期假期` : `第${ord}学期`; },
  tapeGRLabel: (tl, year) => `小组阅读 - ${tl} - ${year}`,
  tapeClassLabel: (tl, year) => `${tl} - ${year}`,
  sessions: (n, dur) => `${n}节课 / ${dur}`,
  subtotal: (amt) => `小计 $${amt}`,
  annualDiscount: "全年折扣",
  multiTermDiscount: "多学期折扣",
  payable: (amt) => `应付金额 $${amt}`,
  creditLine: (amt) => `抵扣 -$${amt}`,
  debitLine: (amt) => `额外费用 +$${amt}`,
  discountLine: (label, amt) => `${label} -$${amt}`,
  various: "各日期",
  sundays: "每周日",
  excludes: (names) => `不含: ${names}`,
  dayLine: (day) => ZH_DAY_EACH[day] || day,
  loyaltyLabel: (label, loyal) => `${label}${loyal ? " 老客户" : ""}`,
  daysJoined: (days) => days.map(d => ZH_DAY_EACH[d] || d).join(" & "),
  formatChipDate: (d) => {
    const date = parseISO(d);
    return `${ZH_WEEKDAYS[getDay(date)]} ${format(date, "M月d日")}`;
  },
  formatDateRange: (a, b) =>
    `${format(parseISO(a), "M月d日")} — ${format(parseISO(b), "M月d日")}`,
};

export const TRANSLATIONS: Record<Lang, Translations> = { en: EN, zh: ZH };
