"use client"

import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import type { TermKey, DayOfWeek } from "@/hooks/useTermLogistics";
import type { TermConfigs, DurationKey } from "@/types/termConfig";
import { DATA } from "@/constants";
import { cn } from "@/lib/utils";

interface ControlsProps {
  clientType: "loyalty" | "new_client";
  setClientType: (val: "loyalty" | "new_client") => void;
  selectedTerms: TermKey[];
  setSelectedTerms: (term: TermKey) => void;
  termConfigs: TermConfigs;
  updateTermConfig: (term: TermKey, updates: Partial<{ dayOfWeek: DayOfWeek; duration: DurationKey }>) => void;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const TERMS = [
  { value: "term_1" as TermKey, label: "Term 1" },
  { value: "term_2" as TermKey, label: "Term 2" },
  { value: "term_3" as TermKey, label: "Term 3" },
  { value: "term_4" as TermKey, label: "Term 4" },
];

const DURATIONS: { value: DurationKey; label: string }[] = [
  { value: "1_hour", label: "1 Hour" },
  { value: "1.5_hours", label: "1.5 Hours" },
  { value: "2_hours", label: "2 Hours" },
];

export function Controls({
  clientType, setClientType,
  selectedTerms, setSelectedTerms,
  termConfigs, updateTermConfig
}: ControlsProps) {
  const toggleTerm = (term: TermKey) => {
    setSelectedTerms(term);
  };

  const termLabels: Record<TermKey, string> = {
    term_1: "Term 1",
    term_2: "Term 2",
    term_3: "Term 3",
    term_4: "Term 4",
  };

  return (
    <Card className="md:col-span-1 h-fit">
      <CardContent>
        <div className="flex flex-col gap-4 pt-4">
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">Client Type</h3>
            <ButtonGroup>
              <Button
                variant={clientType === "loyalty" ? "default" : "outline"}
                onClick={() => setClientType("loyalty")}
              >
                Loyalty
              </Button>
              <Button
                variant={clientType === "new_client" ? "default" : "outline"}
                onClick={() => setClientType("new_client")}
              >
                New Client
              </Button>
            </ButtonGroup>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">Select Terms</h3>
            <div className="grid grid-cols-2 gap-2">
              {TERMS.map(({ value, label }) => (
                <Button
                  key={value}
                  variant={selectedTerms.includes(value) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleTerm(value)}
                  className="w-full"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {selectedTerms.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">Term Settings</h3>
              <Accordion type="multiple">
                {selectedTerms.map((term) => {
                  const config = termConfigs[term];
                  if (!config) return null;

                  return (
                    <AccordionItem key={term} value={term}>
                      <AccordionTrigger>
                        {termLabels[term]}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-col gap-2">
                            <Label>Day of Week</Label>
                            <Select 
                              value={config.dayOfWeek} 
                              onValueChange={(v) => updateTermConfig(term, { dayOfWeek: v as DayOfWeek })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {DAYS.map(day => (
                                  <SelectItem key={day} value={day}>{day}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Label>Duration</Label>
                            <Select 
                              value={config.duration} 
                              onValueChange={(v) => updateTermConfig(term, { duration: v as DurationKey })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {DURATIONS.map(d => (
                                  <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
