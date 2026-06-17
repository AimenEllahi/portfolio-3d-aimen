# Aimen Qaiser — 3D Portfolio

Personal portfolio and interactive demo site for **Aimen Qaiser**, a Frontend Engineer focused on **React, TypeScript, Three.js**, and immersive web experiences.

**Live site:** [aimen-qaiser.vercel.app](https://aimen-qaiser.vercel.app)

---

## About

This repository is the source for my portfolio — not just a static résumé page, but a working showcase of the kind of frontends I build: scroll-driven 3D scenes, real-time configurators, shader work, and polished UI motion.

I'm currently pursuing an **MSc in Media Informatics** at Saarland University and working as a **3D Software Engineering Intern at Think3DDD**, where I build medical 3D visualization tools with Three.js and FastAPI. Previously I worked on enterprise test automation at **SAP** and shipped the frontend for **DNDAI**, a live platform used by **10,000+ users**.

---

## What you'll find on the site

| Section | What it demonstrates |
|--------|---------------------|
| **Hero** | Scroll-synced SVG stencil mask + fixed WebGL scene (React Three Fiber, GSAP ScrollTrigger) |
| **Projects** | Selected work with live demos — DNDAI, 3D showcases, configurators |
| **Car configurator** | In-browser McLaren F1 demo — part picking, live color updates, orbit controls |
| **Shader lab** | Custom GLSL / generative visuals |
| **About** | Experience timeline, skills, and background |
| **Contact** | Direct ways to reach me |

**Additional routes:**
- [`/configurator`](https://aimen-qaiser.vercel.app/configurator) — full-screen car configurator
- [`/web3`](https://aimen-qaiser.vercel.app/web3) — Web3 / Solidity demo page

---

## Tech stack

| Category | Tools |
|----------|--------|
| **Framework** | Next.js 14 (App Router), React 18, TypeScript |
| **3D** | Three.js, React Three Fiber, Drei |
| **Animation** | GSAP + ScrollTrigger, Framer Motion |
| **Scroll** | Lenis (smooth scroll) |
| **State** | Zustand |
| **Styling** | Tailwind CSS |

---

## Highlights (for reviewers)

- **Performance-aware 3D** — WebGL canvas is client-only (`dynamic` import), DPR-capped, and layered behind DOM content with `pointer-events: none` where appropriate.
- **Scroll choreography** — Hero text zoom and camera dolly stay in sync via shared GSAP ScrollTrigger targets.
- **Real configurator logic** — GLTF mesh parts mapped to a Zustand store; colors update materials in real time.
- **Responsive UX** — Mobile-specific layouts for the configurator, nav, and project deck.
- **Production deployment** — Hosted on Vercel with optimized fonts, metadata, and Open Graph tags.

---

## Project structure

```
src/
├── app/                    # Next.js routes (home, configurator, web3)
├── components/
│   ├── scene/              # Hero WebGL (model, camera rig, particles)
│   ├── ui/                 # Page sections (projects, about, contact, …)
│   ├── HeroSection.tsx     # Scroll-driven name stencil
│   └── CarModel.tsx        # McLaren F1 GLB + part-based coloring
├── store/                  # Zustand (configurator state)
└── hooks/                  # Shared UI hooks
public/
├── models/                 # hero.glb, car.glb
└── cv.pdf                  # Downloadable CV
```

---

## Run locally

**Requirements:** Node.js 18+

```bash
git clone https://github.com/AimenEllahi/portfolio-3d-aimen.git
cd portfolio-3d-aimen
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | Run ESLint |

---

## Featured work (live demos)

| Project | Link |
|---------|------|
| DNDAI Platform | [dndai.app](https://dndai.app/) |
| Xiaomi 3D Showcase | [o16u.vercel.app](https://o16u.vercel.app/) |
| Landau Boat Configurator | [landau-alure-232.vercel.app](https://landau-alure-232.vercel.app/Island) |
| Sticker Configurator | [graphics-producer-sticker-configurator.vercel.app](https://graphics-producer-sticker-configurator.vercel.app/) |

More projects and code samples on [GitHub](https://github.com/AimenEllahi).

---

## Contact

| | |
|---|---|
| **Email** | [aimenqaiser2000@gmail.com](mailto:aimenqaiser2000@gmail.com) |
| **LinkedIn** | [linkedin.com/in/aimen-qaiser-24798321a](https://www.linkedin.com/in/aimen-qaiser-24798321a/) |
| **GitHub** | [github.com/AimenEllahi](https://github.com/AimenEllahi) |
| **Location** | Saarbrücken, Germany |

Open to internships, working student roles, freelance, and full-time frontend / 3D web positions.

---

## License

This project is for portfolio and demonstration purposes. 3D assets may be subject to their respective licenses (see model credits in source files).
