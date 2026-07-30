# Marginalia — Chat with PDF landing page

A premium, production-ready landing page for an AI "Chat with PDF" product,
built with React + Vite, Tailwind CSS, Framer Motion, GSAP/ScrollTrigger,
Lenis smooth scroll, and a lightweight Three.js particle background.

## Getting started

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build -> dist/
npm run preview   # preview the production build
```

## Structure

```
src/
  App.jsx                  # page composition + GSAP parallax setup
  index.css                # Tailwind layers + design-system utilities
  lib/useLenis.js           # smooth-scroll hook (respects prefers-reduced-motion)
  components/
    Nav.jsx                 # sticky glass nav, mobile menu
    Hero.jsx                 # live upload -> pipeline -> streamed answer demo
    ParticleField.jsx        # lazy-loaded Three.js ambient background
    TrustedBy.jsx
    Features.jsx
    HowItWorks.jsx
    RagPipeline.jsx          # 8-stage interactive RAG visualizer (play/pause/step)
    LiveDemo.jsx              # tabbed Chat / Semantic Search / Quiz mockups
    Pricing.jsx
    FAQ.jsx
    CTA.jsx
    Footer.jsx
    ui/
      SectionHeading.jsx
      MagneticButton.jsx
```

## Design system

- **Colors:** near-black base (`ink`), signal-blue for AI/interactive elements,
  amber (`citation`) reserved exclusively for citation/page-reference UI,
  teal (`vector`) for embedding/vector-DB moments.
- **Type:** Fraunces (display/serif) for large headline moments, Inter for UI
  and body text, IBM Plex Mono for citation chips and pipeline labels.
- **Motion:** Framer Motion handles component-level micro-interactions and
  `whileInView` reveals; GSAP + ScrollTrigger owns scroll-linked parallax;
  Lenis provides the smooth-scroll feel. All motion respects
  `prefers-reduced-motion`.

## Notes on the demos

- The hero upload/pipeline/answer sequence auto-plays on a loop so the page
  never looks static, but also responds immediately to a real drag-and-drop
  (it reads the dropped file's name and reruns the same simulated pipeline —
  there is no backend wired up here, this is a marketing surface).
- The RAG Pipeline section is fully interactive: click any of the 8 stage
  icons to jump directly to it, or use Play/Pause/Restart to watch it run
  end-to-end.
- Replace the copy in `DEMO_FILES`, `ANSWER`, and the `LiveDemo.jsx` panels
  with your own product's real example documents/answers when you wire this
  up to actual product screenshots or a live sandboxed backend.

## Performance

- Three.js is code-split into its own chunk and lazy-loaded — it never
  blocks the critical hero content.
- `framer-motion`, `gsap`, and `lenis` are grouped into a shared vendor
  chunk for caching.
- Production build verified: `npm run build` completes cleanly with no
  chunk-size warnings after the manual chunking config in `vite.config.js`.
