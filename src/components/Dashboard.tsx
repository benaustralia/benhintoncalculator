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
  const [studentLevel, setStudentLevel] = useState<keyof typeof DATA.levels>("junior_secondary");
  const [selectedTerms, setSelectedTerms] = useState<TermKey[]>(["term_1"]);
  const [termConfigs, setTermConfigs] = useState<TermConfigs>({
    term_1: { dayOfWeek: "Monday", duration: "1_hour" }
  });

  const logistics = calculateTermLogistics(selectedTerms, termConfigs);

  // Calculate price using the 3-step process:
  // 1. Base Cost = hourly rate × total sessions
  // 2. Apply flat discount based on number of terms
  // 3. Apply duration multiplier
  const getAdjustedPrice = () => {
    if (selectedTerms.length === 0) return 0;

    const level = DATA.levels[studentLevel];
    const hourlyRate = clientType === "loyalty" ? level.rates.loyalty : level.rates.new;
    const numTerms = selectedTerms.length;

    // Step 1: Calculate base cost per term with duration multiplier, then sum
    let baseCost = 0;
    for (const term of selectedTerms) {
      const config = termConfigs[term];
      if (!config) continue;

      const termDetail = logistics.termDetails.find(td => td.term === term);
      if (!termDetail) continue;

      // Base cost for this term = hourly rate × actual lessons × duration multiplier
      const durationMultiplier = DATA.durations[config.duration];
      const termBaseCost = hourlyRate * termDetail.lessons * durationMultiplier;
      baseCost += termBaseCost;
    }

    // Step 2: Apply flat discount based on number of terms
    let discount = 0;
    if (numTerms === 2) {
      discount = DATA.terms["2"].discount; // $100
    } else if (numTerms === 4) {
      discount = DATA.terms["4"].discount; // $300
    }
    // For 1 term or 3 terms, discount is 0

    const discountedCost = baseCost - discount;

    // Step 3: Duration multiplier is already applied per-term in Step 1
    // So we just return the discounted cost
    return Math.round(Math.max(0, discountedCost));
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
  const updateTermConfig = (term: TermKey, updates: Partial<{ dayOfWeek: DayOfWeek; duration: DurationKey; startDate?: string; endDate?: string }>) => {
    const currentConfig = termConfigs[term];
    if (!currentConfig) return;
    
    // Create new config, removing properties set to undefined
    const newConfig: typeof currentConfig = { ...currentConfig };
    Object.keys(updates).forEach(key => {
      const typedKey = key as keyof typeof updates;
      if (updates[typedKey] === undefined) {
        delete (newConfig as any)[typedKey];
      } else {
        (newConfig as any)[typedKey] = updates[typedKey];
      }
    });
    
    setTermConfigs({
      ...termConfigs,
      [term]: newConfig
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
          studentLevel={studentLevel}
          setStudentLevel={setStudentLevel}
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
              studentLevel={studentLevel}
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
