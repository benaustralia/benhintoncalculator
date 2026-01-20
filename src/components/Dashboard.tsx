import { useState, useMemo } from 'react';
import { calculateTermLogistics, type TermKey, type DayOfWeek } from "@/hooks/useTermLogistics";
import type { TermConfigs, DurationKey } from "@/types/termConfig";
import { DATA } from "@/constants";
import { Controls } from "./dashboard/Controls";
import { PricingCard } from "./dashboard/PricingCard";
import { LogisticsCard } from "./dashboard/LogisticsCard";
import { ScheduleCard } from "./dashboard/ScheduleCard";
import { DescriptionTape } from "./dashboard/DescriptionTape";
import { ModeToggle } from "./mode-toggle";

export function Dashboard() {
  const [clientType, setClientType] = useState<"loyalty" | "new_client">("loyalty");
  const [selectedTerms, setSelectedTerms] = useState<TermKey[]>(["term_1"]);
  const [termConfigs, setTermConfigs] = useState<TermConfigs>({
    term_1: { dayOfWeek: "Monday", duration: "1_hour" }
  });

  const logistics = calculateTermLogistics(selectedTerms, termConfigs);

  // Calculate adjusted price: sum of prices for each term based on its config
  const getAdjustedPrice = () => {
    if (selectedTerms.length === 0) return 0;

    let totalPrice = 0;

    for (const term of selectedTerms) {
      const config = termConfigs[term];
      if (!config) continue;

      // Get base price for 1 term
      const basePrice = DATA.pricing[clientType]["1_term_10_weeks"];
      const multiplier = DATA.pricing.multipliers[config.duration];
      
      // Find term details to get actual lessons
      const termDetail = logistics.termDetails.find(td => td.term === term);
      if (!termDetail) continue;

      const termBaseTotal = basePrice * multiplier;
      const pricePerLesson = termBaseTotal / 10; // 10 lessons expected per term
      
      // Adjust for actual lessons (if gap is negative, reduce price)
      const termPrice = termBaseTotal + ((termDetail.lessons - 10) * pricePerLesson);
      totalPrice += Math.round(termPrice);
    }

    return totalPrice;
  };

  const adjustedPrice = getAdjustedPrice();

  // Update config when term is selected/deselected
  const handleTermToggle = (term: TermKey) => {
    if (selectedTerms.includes(term)) {
      // Remove term
      setSelectedTerms(selectedTerms.filter(t => t !== term));
      const newConfigs = { ...termConfigs };
      delete newConfigs[term];
      setTermConfigs(newConfigs);
    } else {
      // Add term with default config (copy from first selected or use defaults)
      setSelectedTerms([...selectedTerms, term]);
      const defaultConfig = selectedTerms.length > 0 && termConfigs[selectedTerms[0]]
        ? termConfigs[selectedTerms[0]]
        : { dayOfWeek: "Monday" as DayOfWeek, duration: "1_hour" as DurationKey };
      
      setTermConfigs({
        ...termConfigs,
        [term]: defaultConfig
      });
    }
  };

  // Update config for a specific term
  const updateTermConfig = (term: TermKey, updates: Partial<{ dayOfWeek: DayOfWeek; duration: DurationKey }>) => {
    setTermConfigs({
      ...termConfigs,
      [term]: {
        ...termConfigs[term]!,
        ...updates
      }
    });
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl space-y-4 md:space-y-8 animate-in fade-in duration-500">
      <header className="mb-4 md:mb-8 text-center relative">
        <div className="absolute top-0 right-0">
          <ModeToggle />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          TutorTerm 2026 Calculator
        </h1>
      </header>

      <div className="grid gap-4 md:gap-6 md:grid-cols-3">
        <Controls
          clientType={clientType}
          setClientType={setClientType}
          selectedTerms={selectedTerms}
          setSelectedTerms={handleTermToggle}
          termConfigs={termConfigs}
          updateTermConfig={updateTermConfig}
        />

        <div className="md:col-span-2 space-y-4 md:space-y-6">
          <div className="grid gap-4 md:gap-6 md:grid-cols-2">
            <PricingCard
              price={adjustedPrice}
            />
            <LogisticsCard
              selectedTerms={selectedTerms}
              termDetails={logistics.termDetails}
            />
          </div>

          <ScheduleCard
            termDetails={logistics.termDetails}
          />

          {selectedTerms.length > 0 && (
            <DescriptionTape
              clientType={clientType}
              selectedTerms={selectedTerms}
              termDetails={logistics.termDetails}
              totalLessons={logistics.totalLessons}
              adjustedPrice={adjustedPrice}
              dates={logistics.dates}
              holidays={logistics.holidays}
            />
          )}
        </div>
      </div>
    </div>
  );
}
