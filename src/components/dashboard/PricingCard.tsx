import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface PricingCardProps {
  price: number;
}

export function PricingCard({ price }: PricingCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Total Price</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold">
          ${price.toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
}
