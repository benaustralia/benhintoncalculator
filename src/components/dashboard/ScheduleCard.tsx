import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { format, parseISO } from 'date-fns';
import type { TermDetails } from "@/hooks/useTermLogistics";

interface ScheduleCardProps {
  termDetails: TermDetails[];
}

export function ScheduleCard({ termDetails }: ScheduleCardProps) {
  const termLabels: Record<string, string> = {
    "term_1": "Term 1",
    "term_2": "Term 2",
    "term_3": "Term 3",
    "term_4": "Term 4",
  };

  const durationLabels: Record<string, string> = {
    "1_hour": "1 hour",
    "1.5_hours": "1.5 hours",
    "2_hours": "2 hours",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" defaultValue="schedule" collapsible className="w-full">
          <AccordionItem value="schedule" className="border-none">
            <AccordionTrigger className="py-0">
              <div className="flex items-center gap-2">
                <span>View Schedule</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="space-y-4">
                {termDetails.map((term) => (
                  <div key={term.term} className="border rounded-md p-4 space-y-3">
                    <div className="text-sm font-medium">
                      {termLabels[term.term]} • {term.dayOfWeek}s • {durationLabels[term.duration]} • {term.lessons} lessons
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Lesson Dates
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {term.dates.map(date => (
                          <div key={date} className="text-sm bg-secondary p-2 rounded text-center">
                            {format(parseISO(date), "d MMM")}
                          </div>
                        ))}
                      </div>
                    </div>

                    {term.holidays.length > 0 && (
                      <div className="space-y-2 pt-2 border-t">
                        <div className="text-xs font-medium text-destructive uppercase tracking-wide">
                          Excludes {term.holidays.length} Public Holiday{term.holidays.length > 1 ? 's' : ''}
                        </div>
                        {term.holidays.map(h => (
                          <div key={h.date} className="text-sm text-muted-foreground">
                            {h.name} ({format(parseISO(h.date), "d MMM")})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
