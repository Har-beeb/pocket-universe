# 🌌 Pocket Universe

> An interactive, photorealistic 3D cosmic memory vault created as a timeless, bespoke gift for Phathyeehah.

[![Live on Vercel](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel)](https://github.com/Har-beeb/pocket-universe)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-black?logo=three.js)](https://threejs.org)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite)](https://vitejs.dev)

---

## 🌟 Overview

**Pocket Universe** reimagines the traditional photo album as an immersive celestial experience. Visitors journey through deep space, orbiting procedural fractal-noise planets that represent chapters of life:
- **The Journey (2019–2025):** The foundational years represented by an intense, rugged terrestrial planet.
- **The Present (2026):** A lush ocean planet with polar ice caps and dynamic cloud systems.
- **The Future (2027 & Beyond):** A mysterious, locked gas giant with golden rings.

Each planet hosts orbiting 3D photo frames that open into high-resolution slideshows featuring smooth swipe physics, ambient space soundtracks, custom memory audio, and a hidden love letter unlocked after exploring the universe.

---

## 📚 Complete Project Documentation

For in-depth technical documentation, AI agent handover instructions, and production guardrails, see:

- 📖 **[WORKING.md](./WORKING.md)** — Comprehensive technical architecture, WebGL shaders, camera controls, Raycasting, Firestore schema, and media upload pipelines.
- 🤖 **[AGENT.md](./AGENT.md)** — Operational manual for AI agents continuing work on this project (rules of engagement, mobile touch rules, Three.js hitboxes, troubleshooting).
- 🛡️ **[PRODUCTION_RULES.md](./PRODUCTION_RULES.md)** — Mandatory pre-push checklists, secret hygiene standards, and Vercel deployment guardrails.

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js (v20+ recommended)
- npm or pnpm

### 2. Setup
```bash
# Clone repository
git clone https://github.com/Har-beeb/pocket-universe.git
cd pocket-universe

# Install dependencies
npm install

# Copy environment variables template
cp .env.example .env
```

### 3. Configure `.env`
Edit `.env` and fill in your Firebase and Cloudinary credentials. Refer to [`.env.example`](./.env.example) for descriptions.

### 4. Run Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 5. Build for Production
```bash
npm run build
```

---

## 🛠️ Tech Stack

- **Graphics & 3D:** React Three Fiber, Three.js, Drei, Postprocessing (Bloom)
- **Animation & Transitions:** Framer Motion (slideshow swipes), GSAP (camera flights)
- **Database & Backend:** Firebase Firestore (real-time snapshot streaming)
- **Media Engine:** Cloudinary CDN, `browser-image-compression` (WebWorker crunching)
- **Styling:** Tailwind CSS v4, Custom CSS

---

## 🔒 Security Note

The `.env` file containing private API keys is strictly ignored by `.gitignore` and must **never** be committed to source control. For production deployments, all variables must be configured in your Vercel project dashboard.
