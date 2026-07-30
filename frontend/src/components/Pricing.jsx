import { motion } from "framer-motion";
import { Check } from "lucide-react";
import SectionHeading from "./ui/SectionHeading.jsx";
import MagneticButton from "./ui/MagneticButton.jsx";

const PLANS = [
  {
    name: "Reader",
    price: "$0",
    period: "forever",
    description: "For quick, occasional lookups.",
    features: [
      "5 documents per month",
      "50 pages per document",
      "Chat with citations",
      "7-day conversation history",
    ],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$24",
    period: "per month",
    description: "For individuals working in documents daily.",
    features: [
      "Unlimited documents",
      "500 pages per document",
      "Multi-document chat",
      "Semantic search & quizzes",
      "Unlimited conversation history",
      "Priority processing",
    ],
    cta: "Start 14-day trial",
    highlight: true,
  },
  {
    name: "Team",
    price: "$89",
    period: "per user / month",
    description: "For teams that need shared context and control.",
    features: [
      "Everything in Pro",
      "Shared workspaces",
      "Admin & access controls",
      "SOC 2 Type II report",
      "SSO / SAML",
      "Dedicated support",
    ],
    cta: "Talk to sales",
    highlight: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeading
          eyebrow="Pricing"
          title="Simple plans that scale with how much you read"
          description="Every plan includes citations on every answer — that's never a paid add-on."
        />

        <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative flex flex-col rounded-3xl p-7 ${
                plan.highlight
                  ? "border border-signal-500/40 bg-signal-500/[0.06] shadow-glow"
                  : "border border-white/[0.06] bg-white/[0.02]"
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-7 rounded-full bg-signal-500 px-3 py-1 text-[11px] font-semibold text-ink-950">
                  Most popular
                </span>
              )}
              <h3 className="font-display text-xl font-medium text-mist-100">
                {plan.name}
              </h3>
              <p className="mt-1.5 text-sm text-mist-500">{plan.description}</p>
              <div className="mt-6 flex items-baseline gap-1.5">
                <span className="font-display text-4xl font-medium text-mist-100">
                  {plan.price}
                </span>
                <span className="text-sm text-mist-700">/ {plan.period}</span>
              </div>

              <ul className="mt-7 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-mist-300">
                    <Check size={16} className="mt-0.5 flex-shrink-0 text-vector-400" />
                    {f}
                  </li>
                ))}
              </ul>

              <MagneticButton
                as="a"
                href="#upload"
                className={`mt-8 w-full text-center ${
                  plan.highlight ? "btn-primary" : "btn-secondary"
                }`}
              >
                {plan.cta}
              </MagneticButton>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
