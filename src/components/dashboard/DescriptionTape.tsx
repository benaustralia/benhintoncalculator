import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Check } from "lucide-react";
import type { TermKey, TermDetails } from "@/hooks/useTermLogistics";
import { format, parseISO } from "date-fns";
import { DATA } from "@/constants";

interface DescriptionTapeProps {
  clientType: "loyalty" | "new_client";
  studentLevel: keyof typeof DATA.levels;
  selectedTerms: TermKey[];
  termDetails: TermDetails[];
  totalLessons: number;
  adjustedPrice: number;
  dates: string[];
  holidays: { date: string; name: string }[];
}

export function DescriptionTape({
  clientType,
  studentLevel,
  selectedTerms,
  termDetails,
  totalLessons,
  adjustedPrice,
  dates,
  holidays,
}: DescriptionTapeProps) {
  const [copied, setCopied] = useState(false);

  const termLabels: Record<TermKey, string> = {
    term_1: "Term 1",
    term_2: "Term 2",
    term_3: "Term 3",
    term_4: "Term 4",
  };

  const durationLabels: Record<string, string> = {
    "45_min": "45 mins",
    "1_hour": "1 hour",
    "1.5_hours": "1.5 hours",
    "2_hours": "2 hours",
  };

  // Build formatted description with line breaks
  const buildDescription = () => {
    const lines: string[] = [];

    // Add student level at the top
    const studentLevelLabel = DATA.levels[studentLevel].label;
    if (clientType === "loyalty") {
      lines.push(`Loyalty Rate: ${studentLevelLabel}`);
    } else {
      lines.push(studentLevelLabel);
    }
    lines.push(""); // Add blank line after student level

    // Sort term details by term key to ensure consistent ordering
    const sortedTermDetails = [...termDetails].sort((a, b) => a.term.localeCompare(b.term));

    sortedTermDetails.forEach((term, index) => {
      // Term header: "Term 1 (Mondays, 1 hour, 8 lessons)"
      lines.push(
        `${termLabels[term.term]} (${term.dayOfWeek}s, ${durationLabels[term.duration]}, ${term.lessons} lessons)`
      );

      // Lesson dates: "Lesson dates: 2 Feb, 9 Feb, ..."
      const formattedDates = term.dates.map(date => format(parseISO(date), "d MMM")).join(", ");
      lines.push(`Lesson dates: ${formattedDates}`);

      // Excludes (if any): "Excludes: Labor Day (9 Mar)"
      if (term.holidays.length > 0) {
        const holidayList = term.holidays
          .map(h => `${h.name} (${format(parseISO(h.date), "d MMM")})`)
          .join(", ");
        lines.push(`Excludes: ${holidayList}`);
      }

      // Add blank line between terms (except after last term)
      if (index < sortedTermDetails.length - 1) {
        lines.push("");
      }
    });

    // Total line
    lines.push(`Total: $${adjustedPrice.toLocaleString()} (${totalLessons} lessons)`);

    return lines.join("\n");
  };

  const description = buildDescription();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(description);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start gap-3">
          <pre className="flex-1 text-sm font-mono bg-muted px-4 py-3 rounded-md border whitespace-pre-wrap break-words">
            {description}
          </pre>
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopy}
            className="shrink-0"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
