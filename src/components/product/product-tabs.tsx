import {
  Award,
  Battery,
  Camera,
  CirclePlay,
  Shield,
  Wind,
  Zap,
} from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import type { Product, ProductFeature } from "@/types";

const FEATURE_ICONS: Record<ProductFeature["icon"], typeof Wind> = {
  wind: Wind,
  camera: Camera,
  play: CirclePlay,
  shield: Shield,
  zap: Zap,
  battery: Battery,
};

export function ProductTabs({ product }: { product: Product }) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="specs">Specs</TabsTrigger>
      </TabsList>

      {/* ------------------------------ Overview ------------------------- */}
      <TabsContent value="overview" className="mt-8">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <h2 className="font-heading text-2xl font-extrabold">
              Engineered for Excellence
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {product.features.map((feature) => {
                const Icon = FEATURE_ICONS[feature.icon];
                return (
                  <div key={feature.title}>
                    <span className="grid size-9 place-items-center rounded-lg bg-brand-50">
                      <Icon className="size-4.5 text-brand-700" aria-hidden />
                    </span>
                    <h3 className="mt-3 font-heading text-base font-bold">
                      {feature.title}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                      {feature.body}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <Card className="gap-3 border-brand-200 bg-gradient-to-br from-brand-50 to-white p-5">
              <div className="flex items-center gap-2">
                <Award className="size-4 text-brand-700" aria-hidden />
                <h3 className="font-heading text-base font-bold">
                  Award Winning Design
                </h3>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Recognised with the Best Fans Manufacturing Company Award 2024 by
                the President of Pakistan.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="grid size-10 place-items-center rounded-full border-2 border-cta-400 bg-white text-[0.55rem] font-extrabold text-brand-700">
                  2024
                </span>
                <span className="grid size-10 place-items-center rounded-full border-2 border-brand-400 bg-white text-[0.5rem] font-extrabold text-brand-700">
                  NEECA
                </span>
              </div>
            </Card>

            <div>
              <h3 className="font-heading text-base font-bold">In the Box</h3>
              <ul className="mt-3 space-y-2">
                {product.inTheBox.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm text-muted-foreground"
                  >
                    <span
                      className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-500"
                      aria-hidden
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </TabsContent>

      {/* -------------------------------- Specs -------------------------- */}
      <TabsContent value="specs" className="mt-8">
        <Card className="gap-0 border-brand-200 bg-brand-50/60 p-6 sm:p-8">
          <h2 className="font-heading text-xl font-extrabold">
            Technical Specifications
          </h2>

          <h3 className="mt-6 text-sm font-semibold text-brand-700">
            Performance
          </h3>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[22rem] text-sm">
              <thead>
                <tr className="border-b border-brand-200 text-left">
                  <th className="py-2 pr-4 font-semibold">Speed</th>
                  <th className="py-2 pr-4 text-right font-semibold">Watts</th>
                  <th className="py-2 text-right font-semibold">RPM</th>
                </tr>
              </thead>
              <tbody>
                {product.specs.map((row) => (
                  <tr
                    key={row.speed}
                    className="border-b border-brand-200/60 last:border-0"
                  >
                    <td className="py-2 pr-4 tabular-nums">{row.speed}</td>
                    <td className="py-2 pr-4 text-right tabular-nums">
                      {row.watts} W
                    </td>
                    <td className="py-2 text-right tabular-nums">{row.rpm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <dl className="mt-8 grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {[
              ["Available sizes", product.sizes.join(", ")],
              ["Colourways", product.colors.map((c) => c.name).join(", ")],
              ["Warranty", "1-Year Repair Warranty"],
              ["Operating voltage", "140V – 260V AC"],
            ].map(([term, value]) => (
              <div
                key={term}
                className="flex justify-between gap-4 border-b border-brand-200/60 pb-2"
              >
                <dt className="text-muted-foreground">{term}</dt>
                <dd className="text-right font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
