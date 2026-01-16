import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import type { TermKey } from "@/hooks/useTermLogistics";

interface LogisticsCardProps {
  term: TermKey;
  totalLessons: number;
  gap: number;
}

export function LogisticsCard({ term, totalLessons, gap }: LogisticsCardProps) {
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
        <CardTitle>Logistics</CardTitle>
        <CardDescription>{termLabels[term]}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Lessons Included:</span>
          <span className="font-bold">{totalLessons}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Gap (Actual - Pkg):</span>
          <span className={`font-bold ${gap < 0 ? 'text-red-500' : 'text-green-500'}`}>
            {gap > 0 ? `+${gap}` : gap}
          </span>
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          {gap < 0
            ? `Owe ${Math.abs(gap)} make-up lesson(s)`
            : gap > 0
              ? "Bonus lesson(s) included"
              : "Perfect match"}
        </div>
      </CardContent>
    </Card>
  );
}
