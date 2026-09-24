import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/shared/reveal";
import { SAVINGS } from "@/lib/constants";

const STATS = [
  {
    label: "Regular AC Fan",
    value: SAVINGS.regularWatts,
    unit: "Watts",
    note: "per hour",
    muted: true,
  },
  {
    label: "Metro Inverter Fan",
    value: SAVINGS.inverterWatts,
    unit: "Watts",
    note: "per hour Â±10%",
  },
  {
    label: "Savings",
    value: SAVINGS.savingsPercent,
    unit: "%",
    note: "Assuming one fan runs 24 hours daily",
  },
  {
    label: "Up To",
    value: SAVINGS.monthlySavingPkr.toLocaleString("en-PK"),
    unit: "PKR",
    note: "Saved per month",
  },
];

export function ValueProposition() {
  return (
    <section className="bg-ink-900 py-16 text-white sm:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="text-center font-heading text-3xl font-extrabold sm:text-4xl">
            Why Should You Choose Us?
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.08}>
              <Card className="h-full gap-2 border-white/15 bg-white/10 p-6 text-center">
                <p className="text-sm font-semibold text-ink-200">
                  {stat.label}
                </p>
                <p className="font-heading text-4xl font-extrabold leading-none text-cta-300 sm:text-5xl">
                  {stat.value}
                  <span className="ml-1 text-base font-bold text-white/85">
                    {stat.unit}
                  </span>
                </p>
                <p className="text-xs leading-relaxed text-ink-200/80">
                  {stat.note}
                </p>
              </Card>
            </Reveal>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-ink-200/70">
          Assuming variable usage and costs month round. Per-unit costs may vary.*
        </p>
      </div>
    </section>
  );
}
