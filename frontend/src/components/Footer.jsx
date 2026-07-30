import { FileStack, Twitter, Github, Linkedin } from "lucide-react";

const COLUMNS = [
  {
    title: "Product",
    links: ["Features", "Pricing", "Pipeline", "Changelog"],
  },
  {
    title: "Company",
    links: ["About", "Careers", "Blog", "Contact"],
  },
  {
    title: "Resources",
    links: ["Documentation", "API reference", "Status", "Security"],
  },
  {
    title: "Legal",
    links: ["Privacy policy", "Terms of service", "Data processing"],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-6">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal-500/15 text-signal-400">
                <FileStack size={16} />
              </span>
              <span className="font-display text-lg font-medium text-mist-100">
                Marginalia
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-mist-700">
              Turn dense PDFs into conversations you can actually trust —
              cited, page by page.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href="#"
                aria-label="Twitter"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] text-mist-500 transition-colors hover:border-white/20 hover:text-mist-100"
              >
                <Twitter size={14} />
              </a>
              <a
                href="#"
                aria-label="GitHub"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] text-mist-500 transition-colors hover:border-white/20 hover:text-mist-100"
              >
                <Github size={14} />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] text-mist-500 transition-colors hover:border-white/20 hover:text-mist-100"
              >
                <Linkedin size={14} />
              </a>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-mist-700">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-mist-500 transition-colors hover:text-mist-100"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 sm:flex-row">
          <p className="text-xs text-mist-700">
            © {new Date().getFullYear()} Marginalia, Inc. All rights reserved.
          </p>
          <p className="text-xs text-mist-700">
            Built for people who read for a living.
          </p>
        </div>
      </div>
    </footer>
  );
}
