import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { TermKey, TermDetails } from "@/hooks/useTermLogistics";

interface LogisticsCardProps {
  selectedTerms: TermKey[];
  termDetails: TermDetails[];
}

export function LogisticsCard({ selectedTerms, termDetails }: LogisticsCardProps) {
  const termLabels: Record<TermKey, string> = {
    term_1: "Term 1",
    term_2: "Term 2",
    term_3: "Term 3",
    term_4: "Term 4",
  };

  const total = termDetails.reduce((sum, term) => sum + term.lessons, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle># Lessons</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {[...termDetails].sort((a, b) => a.term.localeCompare(b.term)).map((term) => (
          <div key={term.term} className="flex justify-between items-center">
            <span className={termDetails.length === 1 ? "text-sm font-medium" : "text-sm text-muted-foreground"}>
              {termLabels[term.term]}:
            </span>
            <span className="text-sm font-medium">{term.lessons}</span>
          </div>
        ))}
        {termDetails.length > 1 && (
          <>
            <div className="border-t border-border pt-2 mt-2" />
            <div className="flex justify-between text-sm font-medium">
              <span>Total:</span>
              <span>{total}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
