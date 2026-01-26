import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, parseISO } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import type { TermKey, DayOfWeek } from "@/hooks/useTermLogistics";
import type { TermConfigs, DurationKey } from "@/types/termConfig";
import { DATA } from "@/constants";
import { RevealText } from "@/components/gsap/reveal-text";
import { useRef, useState as ReactUseState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import * as React from "react";

interface ControlsProps {
  clientType: "loyalty" | "new_client";
  setClientType: (val: "loyalty" | "new_client") => void;
  studentLevel: keyof typeof DATA.levels;
  setStudentLevel: (val: keyof typeof DATA.levels) => void;
  selectedTerms: TermKey[];
  setSelectedTerms: (term: TermKey) => void;
  termConfigs: TermConfigs;
  updateTermConfig: (term: TermKey, updates: Partial<{ dayOfWeek: DayOfWeek; duration: DurationKey; startDate?: string; endDate?: string }>) => void;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const TERM_LABELS: Record<TermKey, string> = {
  term_1: "Term 1",
  term_2: "Term 2",
  term_3: "Term 3",
  term_4: "Term 4",
};

// Accordion item with border animation and text reveal
function AnimatedAccordionItem({
  term,
  label,
  children,
}: {
  term: TermKey;
  label: string;
  children: React.ReactNode;
}) {
  const itemRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = React.useState(false);

  // Animate border when accordion opens/closes
  useGSAP(
    () => {
      const item = itemRef.current;
      if (!item) return;

      // Watch for data-state changes
      const observer = new MutationObserver(() => {
        const open = item.getAttribute("data-state") === "open";
        setIsOpen(open);
        
        if (open) {
          // Animate border transition when opening
          gsap.fromTo(
            item,
            { borderWidth: 1, borderColor: "transparent" },
            {
              borderWidth: 2,
              borderColor: "var(--border)",
              duration: 0.6,
              ease: "power2.out",
            }
          );
        } else {
          // Reset border when closing
          gsap.to(item, {
            borderWidth: 1,
            borderColor: "var(--border)",
            duration: 0.3,
            ease: "power2.in",
          });
        }
      });

      // Initial check
      setIsOpen(item.getAttribute("data-state") === "open");
      
      observer.observe(item, {
        attributes: true,
        attributeFilter: ["data-state"],
      });

      return () => observer.disconnect();
    },
    { scope: itemRef }
  );

  return (
    <AccordionItem
      ref={itemRef}
      value={term}
      className="border-b-0 border rounded-lg mb-2"
    >
      <AccordionTrigger className="px-4">
        {isOpen ? (
          <RevealText 
            type="chars" 
            scrollTrigger={false}
            className="text-left"
            key={`${term}-open`}
          >
            {label}
          </RevealText>
        ) : (
          <span>{label}</span>
        )}
      </AccordionTrigger>
      {children}
    </AccordionItem>
  );
}

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
          <Select value={studentLevel} onValueChange={(v) => setStudentLevel(v as keyof typeof DATA.levels)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="primary">{DATA.levels.primary.label}</SelectItem>
              <SelectItem value="junior_secondary">{DATA.levels.junior_secondary.label}</SelectItem>
              <SelectItem value="senior_secondary">{DATA.levels.senior_secondary.label}</SelectItem>
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
            <Accordion type="single" collapsible className="w-full space-y-2">
              {[...selectedTerms].sort((a, b) => a.localeCompare(b)).map((term) => {
                const config = termConfigs[term];
                if (!config) return null;

                return (
                  <AnimatedAccordionItem key={term} term={term} label={TERM_LABELS[term]}>
                    <AccordionContent className="space-y-4 px-4">
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

                      <div className="space-y-2">
                        <Label>Start date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {config.startDate ? (
                                format(parseISO(config.startDate), "PPP")
                              ) : (
                                <span className="text-muted-foreground">Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={config.startDate ? parseISO(config.startDate) : undefined}
                              onSelect={(date) => {
                                if (date) {
                                  updateTermConfig(term, { startDate: format(date, "yyyy-MM-dd") });
                                } else {
                                  const { startDate, ...rest } = config;
                                  updateTermConfig(term, rest);
                                }
                              }}
                              disabled={(date) => {
                                const termData = DATA.term_dates[term];
                                const termStart = parseISO(termData.start);
                                const termEnd = parseISO(termData.end);
                                return date < termStart || date > termEnd;
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <Label>End date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {config.endDate ? (
                                format(parseISO(config.endDate), "PPP")
                              ) : (
                                <span className="text-muted-foreground">Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={config.endDate ? parseISO(config.endDate) : undefined}
                              onSelect={(date) => {
                                if (date) {
                                  updateTermConfig(term, { endDate: format(date, "yyyy-MM-dd") });
                                } else {
                                  const { endDate, ...rest } = config;
                                  updateTermConfig(term, rest);
                                }
                              }}
                              disabled={(date) => {
                                const termData = DATA.term_dates[term];
                                const termStart = parseISO(termData.start);
                                const termEnd = parseISO(termData.end);
                                return date < termStart || date > termEnd;
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </AccordionContent>
                  </AnimatedAccordionItem>
                );
              })}
            </Accordion>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
