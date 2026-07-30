import { motion } from "framer-motion";

const TEAMS = [
  "Northbeam Capital",
  "Ledger & Vale Law",
  "Anchorpoint Research",
  "Fielding Health",
  "Cascade Partners",
  "Overlook Analytics",
];

export default function TrustedBy() {
  return (
    <section className="border-y border-white/[0.06] bg-white/[0.015] py-10">
      <div className="mx-auto max-w-7xl px-6">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-7 text-center text-xs font-medium uppercase tracking-[0.14em] text-mist-700"
        >
          Trusted by research, legal, and finance teams reading dense
          documents daily
        </motion.p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-5">
          {TEAMS.map((name, i) => (
            <motion.span
              key={name}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="font-display text-lg italic text-mist-700/80 grayscale transition-all hover:text-mist-300 hover:grayscale-0"
            >
              {name}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}
