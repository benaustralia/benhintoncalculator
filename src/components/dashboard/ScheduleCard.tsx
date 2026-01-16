import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { format, parseISO } from 'date-fns';
import type { TermKey, DayOfWeek } from "@/hooks/useTermLogistics";

interface ScheduleCardProps {
  term: TermKey;
  dayOfWeek: DayOfWeek;
  dates: string[];
  holidays: { date: string; name: string }[];
}

export function ScheduleCard({ term, dayOfWeek, dates, holidays }: ScheduleCardProps) {
  const termLabels: Record<string, string> = {
    "term_1": "Term 1",
    "term_2": "Term 2",
    "term_3": "Term 3",
    "term_4": "Term 4",
    "full_year": "Full Year"
  };

  return (
    <Card>
       <CardHeader>
          <CardTitle>Schedule</CardTitle>
          <CardDescription>
            Dates for {dayOfWeek}s in {termLabels[term]}
          </CardDescription>
        </CardHeader>
        <CardContent>
           <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="dates">
                <AccordionTrigger>
                  View {dates.length} Lesson Dates
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                    {dates.map(date => (
                      <div key={date} className="text-sm bg-secondary p-2 rounded text-center">
                        {format(parseISO(date), "d MMM")}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {holidays.length > 0 && (
                 <AccordionItem value="holidays">
                  <AccordionTrigger className="text-red-500 hover:text-red-600">
                     Excludes {holidays.length} Public Holiday{holidays.length !== 1 ? 's' : ''}
                  </AccordionTrigger>
                  <AccordionContent>
                     <ul className="space-y-2">
                        {holidays.map(h => (
                          <li key={h.date} className="text-sm flex justify-between bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-100 dark:border-red-900/30">
                             <span>{h.name}</span>
                             <span className="text-muted-foreground">{format(parseISO(h.date), "d MMM")}</span>
                          </li>
                        ))}
                     </ul>
                  </AccordionContent>
                 </AccordionItem>
              )}
           </Accordion>
        </CardContent>
    </Card>
  );
}
