# WORKING.md — Pocket Universe Technical Architecture & Project Guide

> **Project Name:** Pocket Universe (`pocket-universe`)  
> **Repository:** `https://github.com/Har-beeb/pocket-universe`  
> **Status:** Production-Ready / Live on Vercel & GitHub  
> **Primary Technology Stack:** React 19, Vite 8, React Three Fiber (R3F) v9, Three.js, Drei, Tailwind CSS v4, Firebase Firestore, Cloudinary, Framer Motion, GSAP, Howler  
> **Last Updated:** October 2026

---

## 1. Project Overview & Vision

**Pocket Universe** is an interactive, photorealistic, 3D cosmic memory vault created as a timeless, bespoke gift for the creator's partner (Phathyeehah, birthday: September 30). 

Instead of a conventional flat photo album or 2D timeline, memories are manifested as celestial bodies in deep space:
- Visitors navigate through an interactive 3D universe featuring procedural planets, an orbital camera system, parallax stars, volumetric nebulae, and interactive photo frames that revolve around planetary bodies in real time.
- Users can click on celestial bodies to zoom in from galaxy space into planetary orbit, view orbiting memory capsules, flip through high-resolution photo slideshows with directional swipe physics, and listen to synchronized ambient and per-memory audio.
- An admin layer allows the creator to upload high-resolution photographs (with automated client-side WebWorker compression), attach bespoke soundtracks, and edit titles and captions in real-time, protected by a stealth PIN modal.

---

## 2. Architecture & Tech Stack

```
┌────────────────────────────────────────────────────────────────────────┐
│                              CLIENT BROWSER                            │
├───────────────────────────────────┬────────────────────────────────────┤
│         3D WebGL Scene            │           2D UI Overlays           │
│  (React Three Fiber / Three.js)   │       (React 19 / DOM / GSAP)      │
│  - GalaxyScene & Parallax         │  - IntroScreen with Fast Loader   │
│  - Procedural FBM Noise Planets   │  - NavDashboard & Planet HUD       │
│  - Orbiting 3D GalleryFrames      │  - MemoryCard Modal + Slideshow    │
│  - SpiralGalaxy, Stars, Nebula    │  - UploadModal (Drag & Drop)       │
│  - Warp Drive FOV acceleration    │  - PinModal (Stealth Auth)         │
│  - Postprocessing Bloom           │  - LoveLetter & Easter Eggs        │
├───────────────────────────────────┴────────────────────────────────────┤
│                       STATE & CONTEXT LAYER                            │
│  - App.jsx (Scene State Machine: INTRO -> GALAXY -> PLANET -> MEMORY)  │
│  - AudioContext.jsx (Cross-fading HTML5 / Howler Audio Engine)         │
│  - Firebase Snapshot Realtime Listener (collection: "memories")        │
├───────────────────────────────────┬────────────────────────────────────┤
│         BACKEND STORAGE           │          MEDIA PROCESSING          │
│  - Firebase Firestore (Metadata)  │  - browser-image-compression       │
│  - Cloudinary REST API            │  - Cloudinary CDN (/image, /video) │
└───────────────────────────────────┴────────────────────────────────────┘
```

### Core Dependencies & Roles

| Package | Version | Purpose |
| :--- | :--- | :--- |
| `react` & `react-dom` | `^19.2.8` | Declarative UI and component lifecycle management. |
| `vite` | `^8.2.2` | Next-generation dev server and Rollup production bundler. |
| `@react-three/fiber` | `^9.7.0` | React reconciler for Three.js scene graphs. |
| `three` | `^0.186.0` | Low-level 3D WebGL engine (geometries, shaders, lights). |
| `@react-three/drei` | `^10.7.8` | Helper primitives (`Html`, `Image`, `Stars`, `AdaptiveDpr`). |
| `@react-three/postprocessing` | `^3.1.1` | Unreal-style Bloom and scene post-processing effects. |
| `firebase` | `^12.19.0` | Real-time cloud database (Firestore snapshot streaming). |
| `framer-motion` | `^13.2.0` | Hardware-accelerated directional swipe animations for slides. |
| `gsap` | `^3.15.0` | Smooth spline-based 3D camera travel and object scale transitions. |
| `browser-image-compression` | `^2.0.2` | Client-side multithreaded compression for images > 8MB. |
| `canvas-confetti` | `^1.9.4` | Physics-based particle celebration on September 30. |
| `howler` | `^2.2.4` | Audio decoding and web audio fallback controls. |
| `tailwindcss` | `^4.3.3` | Utility styling for 2D interfaces and modal dialogs. |

---

## 3. Directory Structure & Key Files

```
our-universe/
├── .env.example             # Documented template for required environment keys
├── .gitignore               # Excludes node_modules, dist, and .env
├── index.html               # Entry HTML shell with title "Pocket Universe"
├── package.json             # Scripts and dependency registry
├── vite.config.js           # Vite config with React plugin and Tailwind v4
├── public/
│   ├── ambient.mp3          # Space ambient looping soundtrack
│   ├── favicon.svg          # Cosmic SVG browser tab icon
│   └── icons.svg            # UI icons sprite
├── src/
│   ├── main.jsx             # React entry point, mounts <AudioProvider><App />
│   ├── App.jsx              # Central scene state machine & Firebase listener
│   ├── App.css / index.css  # Global Tailwind styles and typography definitions
│   ├── firebase.js          # Initialized Firebase Firestore connection
│   ├── admin/
│   │   └── Admin.jsx        # Admin utilities
│   ├── assets/              # Static vector & brand assets
│   ├── context/
│   │   └── AudioContext.jsx # Global sound engine managing ambient and memory audio
│   ├── data/
│   │   └── chapters.js      # Celestial timeline definitions (The Past, Present, Future)
│   ├── utils/
│   │   └── auth.js          # Legacy PIN auth check helper (retained for safety)
│   └── components/
│       ├── Balloons.jsx         # 3D floating celebratory balloon particles
│       ├── BirthdayMessage.jsx  # Pop-up birthday card trigger
│       ├── GalaxyScene.jsx      # Core Three.js Canvas container & camera controller
│       ├── GalleryFrame.jsx     # 3D orbiting picture frame with 3D hitboxes
│       ├── IntroScreen.jsx      # Cinematic entry screen with progressive percentage loader
│       ├── LockedPlanet.jsx     # Visual shaders for future locked celestial bodies
│       ├── LoveLetter.jsx       # Final unlocked heartfelt personal letter
│       ├── MemoryCard.jsx       # Full-screen slideshow modal with swipe physics & audio
│       ├── NavDashboard.jsx     # HUD overlay for quick planet and scene navigation
│       ├── NebulaBackground.jsx # Volumetric multi-layered procedural space nebula
│       ├── PinModal.jsx         # Custom promise-based stealth PIN authentication modal
│       ├── Planet.jsx           # Procedural FBM noise spherical terrain generator
│       ├── ShootingStars.jsx    # Kinetic shooting stars with trails
│       ├── SoundToggle.jsx      # Global mute/unmute floating pill button
│       ├── SpiralGalaxy.jsx     # 11,000+ particle logarithmic spiral galaxy
│       └── UploadModal.jsx      # Drag-and-drop memory creator with WebWorker compression
└── scripts/
    ├── clean.js             # Utility to delete Firestore documents
    ├── read.js              # Utility to inspect Firestore records
    └── seed.js              # Initial database seeding script
```

---

## 4. Detailed System Architecture

### 4.1. Scene State Machine (`src/App.jsx`)

The entire user experience flows through a strict finite state machine defined by `SCENE`:

```
┌──────────────┐       User clicks "Enter Universe"        ┌──────────────┐
│ SCENE.INTRO  │ ────────────────────────────────────────> │ SCENE.GALAXY │
└──────────────┘                                           └──────────────┘
                                                               ▲      │
                                    User clicks "Back to Stars"│      │ User clicks
                                                               │      │ a planet
                                                               │      ▼
                                                           ┌──────────────┐
                                                           │ SCENE.PLANET │
                                                           └──────────────┘
                                                               ▲      │
                                    User closes memory modal   │      │ User clicks
                                                               │      │ a 3D frame
                                                               │      ▼
                                                           ┌──────────────┐
                                                           │ SCENE.MEMORY │
                                                           └──────────────┘
```

- **`SCENE.INTRO`**: Renders `IntroScreen.jsx`. Boots an artificial 0–100% telemetry counter (in 2.5s) to ensure all WebGL textures and procedural shaders compile smoothly before the user enters.
- **`SCENE.GALAXY`**: Shows the full galaxy overview at camera coordinate `[0, 0, 12]` (or `[0, 0, 22]` on mobile screens `< 768px`). All three timeline planets are visible.
- **`SCENE.PLANET`**: When a planet is selected, GSAP flies the Three.js camera into `[planet.x, planet.y, planet.z + 5.5]` with easing `power3.inOut`. Orbiting `GalleryFrame` cards smoothly scale in with a staggered GSAP elastic delay.
- **`SCENE.MEMORY`**: Opens `MemoryCard.jsx` on top of the canvas. The 3D scene pauses parallax rotation, and the full-screen photo slideshow opens.
- **`SCENE.LETTER`**: Unlocked automatically when the user views all memory cards in a planet. Displays a heartfelt secret letter.

---

### 4.2. 3D Celestial Engine & Raycasting Architecture

#### Procedural Planets (`src/components/Planet.jsx`)
Planets are not static texture images. They are dynamically synthesized on HTML5 canvases using multi-octave Fractal Brownian Motion (FBM) value noise, translated to Three.js `CanvasTexture` instances:
- **Terrestrial / Lava Planet** (`The Past` - 2019–2025): Rugged crimson and orange mountainous terrain (`landHue: 25`, `oceanHue: 350`) symbolizing the foundational years.
- **Ocean / Earth-like Planet** (`The Present` - 2026): Lush green continents with deep sapphire oceans, polar ice caps, and dynamic atmospheric cloud layers (`oceanHue: 210`, `landHue: 130`).
- **Gas Giant Planet** (`The Future` - 2027+): Jupiter/Saturn-styled striated gas bands with tilted icy rings (`#c19a6b` to `#e8d8c3`).

#### Critical Raycasting & Pointer Down Architecture (`GalleryFrame.jsx`)
- **Mobile Click Dropping Solved:** In React Three Fiber on mobile touchscreens, standard `onClick` events frequently fail because minute finger slips (even 1–2 pixels) cause the browser to trigger touch-drag instead of touch-click. All interactive 3D elements use **`onPointerDown`** with `e.stopPropagation()`.
- **3D Hitboxes vs 2D Planes:** A 2D `<planeGeometry>` with `opacity={0}` will fail Three.js raycasting if the user looks at its backface while it orbits. `GalleryFrame.jsx` uses an invisible **3D `<boxGeometry args={[1.5, 1.8, 0.4]}>`** with `depthWrite={false}`. This guarantees that raycasters intercept clicks from **any rotation angle**, whether the frame is facing forward or rotating away.
- **Drei `<Html>` Occlusion:** Drei's `<Html occlude>` component calculates depth occlusion by raycasting against scene meshes. If an `<Html>` tag sits inside or behind a hitbox mesh, Drei will mistake the hitbox for an obstruction and fade the HTML to `opacity: 0`. To prevent this, the `<Html>` component is translated forward on the Z-axis (`position={[0, 0, 0.22]}`).

---

### 4.3. Data Model & Firestore Architecture

#### Collection Schema: Root `memories`
Live memory documents are stored in the root **`memories`** Firestore collection:

```typescript
interface MemoryDocument {
  id: string;               // Auto-generated Firestore document ID
  title: string;            // e.g. "Unilag FYB", "Eid Mubarak"
  caption: string;          // Story / narrative description
  photos: string[];         // Array of Cloudinary secure HTTPS URLs
  photoUrl?: string;        // Backward-compatible fallback for single photos
  audioUrl?: string | null; // Cloudinary secure URL for bespoke memory soundtrack
  chapterId: string;        // "the_past" | "the_present" | "the_future"
  date?: string;            // Year string, e.g. "2019-2025", "2026"
  createdAt: Timestamp;     // Firestore server timestamp for ordering
}
```

> **CRITICAL ARCHITECTURAL DISTINCTION:**  
> All live components (`App.jsx`, `UploadModal.jsx`, `MemoryCard.jsx`) stream from `collection(db, "memories")` ordered by `createdAt: asc`, then group documents in memory by `chapterId`.  
> *Never* write live documents to nested subcollections like `chapters/the_past/memories` unless migrating the entire frontend query.

---

### 4.4. Media Pipeline & High-Resolution Upload Engine

#### Cloudinary Endpoint Logic (`UploadModal.jsx` & `MemoryCard.jsx`)
1. **Photographs:** Uploaded to Cloudinary's image endpoint:
   ```
   POST https://api.cloudinary.com/v1_1/${VITE_CLOUDINARY_CLOUD_NAME}/image/upload
   Body: FormData { file, upload_preset: VITE_CLOUDINARY_UPLOAD_PRESET }
   ```
2. **Audio Tracks:** Uploaded to Cloudinary's video/multimedia endpoint (Cloudinary processes audio through the video pipeline):
   ```
   POST https://api.cloudinary.com/v1_1/${VITE_CLOUDINARY_CLOUD_NAME}/video/upload
   Body: FormData { file, upload_preset: VITE_CLOUDINARY_UPLOAD_PRESET }
   ```

#### Client-Side Image Compression Pipeline (`browser-image-compression`)
Cloudinary's free tier rejects single image uploads greater than 10MB (10,485,760 bytes) with `400 Bad Request: File size too large`. Modern smartphone cameras frequently capture 12MB–16MB raw files.

To prevent upload failures, `UploadModal.jsx` passes every selected or dropped file through a non-blocking background WebWorker:
```javascript
const options = {
  maxSizeMB: 8,           // Safely below Cloudinary's 10MB hard limit
  maxWidthOrHeight: 2560, // Crystal-clear 2.5K resolution preserved
  useWebWorker: true      // Offloads canvas crunching from main UI thread
};
const compressedFile = await imageCompression(file, options);
```

#### Drag-and-Drop Pipeline
`UploadModal.jsx` implements HTML5 Drag and Drop events (`onDragOver`, `onDragLeave`, `onDrop`) with live visual glow indicators (`.um-dropzone-large.dragging`). Dropped files are filtered to ensure only `image/*` MIME types are queued.

---

### 4.5. Slideshow Engine with Framer Motion (`MemoryCard.jsx`)

- **Hardware-Accelerated Directional Swiping:** Uses Framer Motion's `<AnimatePresence mode="wait">` and `<motion.img>` to coordinate slide transitions.
- **Direction Tracking:** When the user taps the right arrow (or auto-play ticks), `slideDirection` is set to `"right"` (entering at `x: +50`, exiting at `x: -50`). When clicking the left arrow, `slideDirection` is set to `"left"` (entering at `x: -50`, exiting at `x: +50`).
- **Dynamic Timeline Year Display:** Derives display text from `memory.chapterId` (`"the_past"` → `"2019 — 2025"`, `"the_future"` → `"2027 & Beyond"`, otherwise `"2026"`), resolving previous hardcoded date bugs.
- **In-Modal Audio Hot-Swapping:** Creators can click "Edit Album", attach a new MP3/WAV file, and save. The component uploads the audio to Cloudinary, updates Firestore, and immediately hot-swaps the active soundtrack without page reloads.

---

### 4.6. Audio System Architecture (`src/context/AudioContext.jsx`)

- **Ambient Background Track:** Plays `/ambient.mp3` on an infinite loop with volume set to `0.4` and `crossOrigin = "anonymous"`.
- **Context Track Switching:** When entering a memory (`SCENE.MEMORY`) that possesses a custom `audioUrl`, `AudioContext` cross-fades from the ambient track into the memory's soundtrack.
- **Reversion:** Upon exiting back to `SCENE.PLANET`, `SCENE.GALAXY`, or `SCENE.LETTER`, `currentTrack` resets to `null`, instantly and seamlessly restoring the ambient space soundtrack.
- **Floating Pill Toggle:** `SoundToggle.jsx` stays visible across all non-intro scenes, rendering animated equalizer bars when sound is active.

---

### 4.7. Stealth Authentication Modal (`src/components/PinModal.jsx`)

- **Security Requirements:** Public viewers should only view memories; adding, editing, or deleting requires verifying identity.
- **Promise-Based Imperative API:** `promptForPin(message)` creates and renders a React DOM portal dynamically:
  ```javascript
  import("./components/PinModal").then(({ promptForPin }) => {
    promptForPin().then(success => {
      if (success) openEditor();
    });
  });
  ```
- **Stealth Protection:** The PIN input accepts arbitrary text lengths with no hints (no "4-digit" labels) to prevent brute-forcing. 
- **Session Cache:** Once unlocked, `localStorage.setItem("universe_admin", "true")` grants access for the current session.

---

### 4.8. Easter Eggs & Celebrations

- **Birthday Detection (`App.jsx`):** Checks `new Date().getMonth() === 8 && new Date().getDate() === 30` (September 30).
- **Celebration Trigger:** When visiting `The Present` planet on her birthday, `canvas-confetti` cannons launch twin fireworks bursts across the screen, accompanied by 3D floating balloons (`Balloons.jsx`) and a celebratory pop-up card (`BirthdayMessage.jsx`).
- **Love Letter Unlock:** If all memories in the current chapter have been viewed, an illuminated prompt appears at the bottom of the screen: *"✦ There is one more thing..."*, leading to `LoveLetter.jsx`.

---

## 5. Environment Variables Reference

| Variable Key | Required | Purpose | Example |
| :--- | :--- | :--- | :--- |
| `VITE_FIREBASE_API_KEY` | Yes | Firebase project authentication key | `AIzaSyD...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Yes | Firebase Auth domain | `project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Yes | Firestore Database Project ID | `our-universe-12345` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Yes | Cloud Storage Bucket ID | `our-universe-12345.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID`| Yes | Firebase Cloud Messaging ID | `123456789012` |
| `VITE_FIREBASE_APP_ID` | Yes | Firebase Web Client Application ID | `1:123456789012:web:abcdef` |
| `VITE_CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary Cloud name for uploads | `yfvvfzhv` |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Yes | Cloudinary Unsigned Upload Preset | `universe_uploads` |
| `VITE_SECRET_PIN` | Yes | Stealth PIN for Admin actions | `••••` (Secret PIN) |
| `VITE_PARTNER_NAME` | No | Personalized display name (default: "My Love") | `Phathyeehah` |

---

## 6. Known Quirks, Resolved Bugs & Lessons Learned

1. **Drei `useProgress` in Procedural Scenes:**
   - *Problem:* `useProgress()` stayed permanently at 0% on the intro screen because all textures and shaders are generated procedurally via Canvas/FBM noise without standard GLTF fetches.
   - *Fix:* Replaced with an artificial progressive interval counter in `IntroScreen.jsx` that advances smoothly from 0% to 100% in 2.5 seconds.
2. **R3F Mobile Click Dropping:**
   - *Problem:* Mobile taps on orbiting planets and frames were frequently ignored due to touch-drag threshold cancellation.
   - *Fix:* Always bind `onPointerDown` with `e.stopPropagation()` rather than `onClick`.
3. **Rotating Frame Raycasting:**
   - *Problem:* Clicking on orbiting frames worked from the back but failed from the front.
   - *Fix:* Replaced 2D single-sided planes with a 3D `boxGeometry` hitbox to provide front and back surface normals from every angle.
4. **Cloudinary 10MB Free-Tier Rejections:**
   - *Problem:* Uploading 12MB photos from modern cameras failed with `400 Bad Request`.
   - *Fix:* Added `browser-image-compression` running in a WebWorker to guarantee files are scaled under 8MB before dispatch.
5. **Accidental `.env` Tracking:**
   - *Problem:* `.env` was committed in an early git snapshot.
   - *Fix:* Untracked immediately with `git rm --cached .env`, added to `.gitignore`, and committed.

---

## 7. Development & Production Operations

### Local Development
```bash
# Install dependencies
npm install

# Start Vite local development server
npm run dev

# Run Oxlint static analysis
npm run lint

# Compile production bundle
npm run build

# Preview production build locally
npm run preview
```

### Deploying to Vercel
1. Ensure `npm run build` exits with code 0 locally before pushing.
2. Push all commits to the `main` branch on GitHub:
   ```bash
   git push origin main
   ```
3. In the Vercel Project Dashboard under **Settings → Environment Variables**, ensure all 10 keys from `.env.example` are configured for Production and Preview environments.
