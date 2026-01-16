import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { DATA } from "@/constants";

interface PricingCardProps {
  price: number;
  clientType: "loyalty" | "new_client";
  duration: keyof typeof DATA.pricing.multipliers;
  packageExpectation: number;
}

export function PricingCard({ price, clientType, duration, packageExpectation }: PricingCardProps) {
  const durationLabels: Record<string, string> = {
    "1_hour": "1 Hour",
    "1.5_hours": "1.5 Hours",
    "2_hours": "2 Hours"
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Total Price</CardTitle>
        <CardDescription>
          {clientType === "loyalty" ? "Loyalty Rate" : "New Client Rate"} • {durationLabels[duration]}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold">
          ${price.toLocaleString()}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          For {packageExpectation} lessons
        </p>
      </CardContent>
    </Card>
  );
}
