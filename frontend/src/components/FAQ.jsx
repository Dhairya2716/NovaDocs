import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import SectionHeading from "./ui/SectionHeading.jsx";

const FAQS = [
  {
    q: "How accurate are the page citations?",
    a: "Every citation points to the exact page and, where possible, the specific paragraph the answer was drawn from. If Marginalia can't find a passage that supports a claim confidently, it says so instead of guessing.",
  },
  {
    q: "What file types and sizes are supported?",
    a: "PDF is fully supported today, including scanned documents processed through OCR. Files up to 500 pages are supported on the Pro and Team plans; the free plan supports up to 50 pages per document.",
  },
  {
    q: "Can I chat across multiple documents at once?",
    a: "Yes — on Pro and Team plans you can group documents into a single conversation. Marginalia will reason across all of them and label which document each part of the answer came from.",
  },
  {
    q: "Is my data used to train your models?",
    a: "No. Your documents and conversations are never used for model training. Files are encrypted at rest, processed in isolated workspaces, and can be permanently deleted — including their vectors — at any time.",
  },
  {
    q: "Do you offer a plan for teams or enterprises?",
    a: "The Team plan includes shared workspaces, SSO/SAML, and admin controls. If you need a custom deployment or higher volume, our sales team can put together a tailored agreement.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-6">
        <SectionHeading eyebrow="FAQ" title="Questions, answered" />

        <div className="mt-14 divide-y divide-white/[0.06] rounded-2xl border border-white/[0.06] bg-white/[0.015]">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} className="px-6">
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-[15px] font-medium text-mist-100">
                    {item.q}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white/[0.05] text-mist-300"
                  >
                    <Plus size={14} />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="pb-5 text-sm leading-relaxed text-mist-500">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
