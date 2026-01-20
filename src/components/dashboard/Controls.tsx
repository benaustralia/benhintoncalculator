import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import type { TermKey, DayOfWeek } from "@/hooks/useTermLogistics";
import type { TermConfigs, DurationKey } from "@/types/termConfig";
import { DATA } from "@/constants";

interface ControlsProps {
  clientType: "loyalty" | "new_client";
  setClientType: (val: "loyalty" | "new_client") => void;
  studentLevel: keyof typeof DATA.pricing_tiers;
  setStudentLevel: (val: keyof typeof DATA.pricing_tiers) => void;
  selectedTerms: TermKey[];
  setSelectedTerms: (term: TermKey) => void;
  termConfigs: TermConfigs;
  updateTermConfig: (term: TermKey, updates: Partial<{ dayOfWeek: DayOfWeek; duration: DurationKey }>) => void;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const TERM_LABELS: Record<TermKey, string> = {
  term_1: "Term 1",
  term_2: "Term 2",
  term_3: "Term 3",
  term_4: "Term 4",
};

export function Controls({
  clientType,
  setClientType,
  studentLevel,
  setStudentLevel,
  selectedTerms,
  setSelectedTerms,
  termConfigs,
  updateTermConfig,
}: ControlsProps) {
  return (
    <Card className="md:col-span-1 h-fit">
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 md:space-y-6">
        <div className="pt-4 space-y-2">
          <Label>Client Type</Label>
          <Tabs value={clientType} onValueChange={(v) => setClientType(v as "loyalty" | "new_client")} className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="loyalty" className="flex-1">Loyalty</TabsTrigger>
              <TabsTrigger value="new_client" className="flex-1">New Client</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="space-y-2">
          <Label>Student Level</Label>
          <Select value={studentLevel} onValueChange={(v) => setStudentLevel(v as keyof typeof DATA.pricing_tiers)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="primary">{DATA.pricing_tiers.primary.label}</SelectItem>
              <SelectItem value="junior_secondary">{DATA.pricing_tiers.junior_secondary.label}</SelectItem>
              <SelectItem value="senior_secondary">{DATA.pricing_tiers.senior_secondary.label}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Select Terms</Label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(TERM_LABELS) as TermKey[]).map((term) => (
              <Button
                key={term}
                variant={selectedTerms.includes(term) ? "default" : "outline"}
                onClick={() => setSelectedTerms(term)}
                className="w-full"
              >
                {TERM_LABELS[term]}
              </Button>
            ))}
          </div>
        </div>

        {selectedTerms.length > 0 && (
          <div className="space-y-2">
            <Label>Term Settings</Label>
            <Accordion type="single" collapsible className="w-full">
              {selectedTerms.map((term) => {
                const config = termConfigs[term];
                if (!config) return null;

                return (
                  <AccordionItem key={term} value={term}>
                    <AccordionTrigger>{TERM_LABELS[term]}</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Day of Week</Label>
                        <Select
                          value={config.dayOfWeek}
                          onValueChange={(v) => updateTermConfig(term, { dayOfWeek: v as DayOfWeek })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Day" />
                          </SelectTrigger>
                          <SelectContent>
                            {DAYS.map((day) => (
                              <SelectItem key={day} value={day}>
                                {day}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Duration</Label>
                        <Select
                          value={config.duration}
                          onValueChange={(v) => updateTermConfig(term, { duration: v as DurationKey })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Duration" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="45_min">45 Mins</SelectItem>
                            <SelectItem value="1_hour">1 Hour</SelectItem>
                            <SelectItem value="1.5_hours">1.5 Hours</SelectItem>
                            <SelectItem value="2_hours">2 Hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
