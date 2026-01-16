import { useState } from 'react';
import { calculateTermLogistics, type TermKey, type DayOfWeek } from "@/hooks/useTermLogistics";
import { DATA } from "@/constants";
import { Controls } from "./dashboard/Controls";
import { PricingCard } from "./dashboard/PricingCard";
import { LogisticsCard } from "./dashboard/LogisticsCard";
import { ScheduleCard } from "./dashboard/ScheduleCard";

export function Dashboard() {
  const [clientType, setClientType] = useState<"loyalty" | "new_client">("loyalty");
  const [duration, setDuration] = useState<keyof typeof DATA.pricing.multipliers>("1_hour");
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>("Monday");
  const [term, setTerm] = useState<TermKey>("term_1");

  const logistics = calculateTermLogistics(term, dayOfWeek);

  const getPrice = () => {
    const baseKey = term === "full_year" ? "4_terms_40_weeks" : "1_term_10_weeks";
    const basePrice = DATA.pricing[clientType][baseKey];
    const multiplier = DATA.pricing.multipliers[duration];
    return basePrice * multiplier;
  };

  const price = getPrice();

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl space-y-4 md:space-y-8 animate-in fade-in duration-500">
      <header className="mb-4 md:mb-8 text-center">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          TutorTerm 2026 Calculator
        </h1>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">
          Pricing & Logistics for Victoria, Australia
        </p>
      </header>

      <div className="grid gap-4 md:gap-6 md:grid-cols-3">
        <Controls
          clientType={clientType} setClientType={setClientType}
          duration={duration} setDuration={setDuration}
          dayOfWeek={dayOfWeek} setDayOfWeek={setDayOfWeek}
          term={term} setTerm={setTerm}
        />

        <div className="md:col-span-2 space-y-4 md:space-y-6">
          <div className="grid gap-4 md:gap-6 md:grid-cols-2">
            <PricingCard
              price={price}
              clientType={clientType}
              duration={duration}
              packageExpectation={logistics.packageExpectation}
            />
            <LogisticsCard
              term={term}
              totalLessons={logistics.totalLessons}
              gap={logistics.gap}
            />
          </div>

          <ScheduleCard
            term={term}
            dayOfWeek={dayOfWeek}
            dates={logistics.dates}
            holidays={logistics.holidays}
          />
        </div>
      </div>
    </div>
  );
}
