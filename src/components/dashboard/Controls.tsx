import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TermKey, DayOfWeek } from "@/hooks/useTermLogistics";
import { DATA } from "@/constants";

interface ControlsProps {
  clientType: "loyalty" | "new_client";
  setClientType: (val: "loyalty" | "new_client") => void;
  duration: keyof typeof DATA.pricing.multipliers;
  setDuration: (val: keyof typeof DATA.pricing.multipliers) => void;
  dayOfWeek: DayOfWeek;
  setDayOfWeek: (val: DayOfWeek) => void;
  term: TermKey;
  setTerm: (val: TermKey) => void;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function Controls({
  clientType, setClientType, duration, setDuration,
  dayOfWeek, setDayOfWeek, term, setTerm
}: ControlsProps) {
  return (
    <Card className="md:col-span-1 h-fit">
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>Configure package details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Client Type</label>
          <Tabs value={clientType} onValueChange={(v) => setClientType(v as "loyalty" | "new_client")} className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="loyalty" className="flex-1">Loyalty</TabsTrigger>
              <TabsTrigger value="new_client" className="flex-1">New Client</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Duration</label>
          <Select value={duration} onValueChange={(v) => setDuration(v as keyof typeof DATA.pricing.multipliers)}>
            <SelectTrigger><SelectValue placeholder="Select Duration" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1_hour">1 Hour</SelectItem>
              <SelectItem value="1.5_hours">1.5 Hours</SelectItem>
              <SelectItem value="2_hours">2 Hours</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Day of Week</label>
          <Select value={dayOfWeek} onValueChange={(v) => setDayOfWeek(v as DayOfWeek)}>
            <SelectTrigger><SelectValue placeholder="Select Day" /></SelectTrigger>
            <SelectContent>
              {DAYS.map(day => <SelectItem key={day} value={day}>{day}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Term Package</label>
          <Select value={term} onValueChange={(v) => setTerm(v as TermKey)}>
            <SelectTrigger><SelectValue placeholder="Select Term" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="term_1">Term 1</SelectItem>
              <SelectItem value="term_2">Term 2</SelectItem>
              <SelectItem value="term_3">Term 3</SelectItem>
              <SelectItem value="term_4">Term 4</SelectItem>
              <SelectItem value="full_year">Full Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
