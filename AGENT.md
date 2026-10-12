# AGENT.md — Operational Manual for AI Agents

> **Audience:** Any AI Assistant / Autonomous Coding Agent (Antigravity, Gemini, Claude, GPT, Cursor, Windsurf, Roo, etc.) tasked with maintaining, debugging, or enhancing **Pocket Universe**.  
> **Status:** Active Operational Contract  
> **Repository:** `https://github.com/Har-beeb/pocket-universe`

---

## 1. Prime Directive & Purpose

You are working on **Pocket Universe** (`pocket-universe`), an interactive, high-fidelity 3D cosmic memory vault built as a personalized gift for the user's partner (Phathyeehah).

Your mission is to maintain the highest standard of visual beauty, emotional resonance, bulletproof stability, and security.

### Core Values to Uphold:
1. **Never Compromise Visual Fidelity for Trivial Optimizations:**  
   The user explicitly requested high-polygon planets, 11,000+ stars, high DPR, and rich bloom. Do not downgrade procedural resolution, remove stars, or downgrade shaders unless specifically instructed.
2. **Never Break Mobile Responsiveness:**  
   The primary audience accesses this application on mobile smartphones (iOS & Android). All interactions must be tested with touch events in mind.
3. **Absolute Secrets & Git Hygiene:**  
   Never commit `.env` or any sensitive credentials to git.

---

## 2. Technical Stack at a Glance

- **Frontend Core:** React 19, Vite 8, Tailwind CSS v4
- **3D Graphics & Canvas:** React Three Fiber (R3F) v9, Three.js 0.186, Drei 10, Postprocessing
- **Motion & Transitions:** Framer Motion 13 (slideshow swipes), GSAP 3 (camera flights & frame scaling)
- **Audio Engine:** HTML5 Audio / Howler 2.2 with `AudioContext.jsx` cross-fader
- **Database:** Firebase Firestore v12 (Real-time snapshot streaming)
- **Media CDN:** Cloudinary REST API (`browser-image-compression` for files > 8MB)

---

## 3. Mandatory Rules of Engagement for AI Agents

### 3.1. Three.js & R3F Interaction Rules (CRITICAL)

#### Rule 1: Always use `onPointerDown` instead of `onClick` inside the 3D Canvas
- **Why:** On mobile touchscreens, dragging a finger by even 2 pixels causes the browser to categorize the event as a touch-drag instead of a click, cancelling `onClick`.
- **Action:** For all 3D interactables (`Planet.jsx`, `GalleryFrame.jsx`), bind `onPointerDown={(e) => { e.stopPropagation(); handleClick(); }}`.

#### Rule 2: Always use 3D Hitboxes (`boxGeometry`) for Orbiting Objects
- **Why:** Single-sided 2D planes (`planeGeometry`) fail Three.js raycasting when their backfaces are turned toward the camera during orbital revolution.
- **Action:** Wrap orbiting frames in an invisible 3D box hitbox:
  ```jsx
  <mesh position={[0, 0, 0]}>
    <boxGeometry args={[1.5, 1.8, 0.4]} />
    <meshBasicMaterial transparent opacity={0} depthWrite={false} />
  </mesh>
  ```

#### Rule 3: Drei `<Html>` Z-Depth Positioning
- **Why:** When `<Html occlude>` sits behind or intersecting a transparent mesh, Drei's raycaster falsely classifies the mesh as an opaque obstruction and fades the HTML element to `opacity: 0`.
- **Action:** Always position `<Html>` elements slightly in front on the Z-axis (e.g., `position={[0, 0, 0.22]}`).

#### Rule 4: Procedural Scenes & Loader Fallbacks
- **Why:** Drei's `useProgress()` stays at 0% in generative scenes without external 3D model/texture fetches.
- **Action:** Never rely on `useProgress()` for critical gating logic without a procedural fallback or interval timer.

---

### 3.2. Firebase Firestore Data Model Rules

#### Rule 1: Live Memories Reside in Root Collection `"memories"`
- The live production app listens to:
  ```javascript
  const q = query(collection(db, "memories"), orderBy("createdAt", "asc"));
  ```
- Each memory document stores its destination planet in the `chapterId` property (`"the_past"` | `"the_present"` | `"the_future"`).
- **Never** write live records to nested subcollections like `chapters/the_past/memories` unless you refactor `App.jsx` and `UploadModal.jsx` in unison.

#### Rule 2: Document Schema Requirements
When creating or editing memories in Firestore, ensure the document has:
```javascript
{
  title: string,              // Required
  caption: string,            // Required
  photos: string[],           // Required array of HTTPS image URLs
  audioUrl: string | null,    // Optional HTTPS audio URL
  chapterId: string,          // "the_past" | "the_present" | "the_future"
  date: string,               // e.g. "2019-2025" or "2026"
  createdAt: serverTimestamp()// Required for ascending chronological order
}
```

---

### 3.3. Media Upload & Cloudinary Pipeline Rules

#### Rule 1: Always Compress Client-Side Before Sending to Cloudinary
- Cloudinary free-tier hard-rejects uploads over 10MB with `400 Bad Request`.
- Modern smartphone photos are frequently 12MB–16MB.
- **Mandatory Flow:** Any new upload modal or photo editing feature must run files through `browser-image-compression`:
  ```javascript
  const options = {
    maxSizeMB: 8,
    maxWidthOrHeight: 2560,
    useWebWorker: true,
  };
  const compressed = await imageCompression(file, options);
  ```

#### Rule 2: Audio Uses the `/video/upload` Cloudinary Endpoint
- Cloudinary does not have an `/audio/` upload route; all audio files (MP3, WAV, M4A) MUST be posted to:
  ```
  https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload
  ```

---

### 3.4. Slideshow & Motion Rules

#### Rule 1: Directional Swipes with Framer Motion
- In `MemoryCard.jsx`, the photo slideshow uses `<AnimatePresence mode="wait">` and `<motion.img>`.
- Maintain the `slideDirection` state (`"right"` vs `"left"`).
- Entering slides must animate along the X axis based on `slideDirection`:
  ```jsx
  initial={{ opacity: 0, x: slideDirection === "right" ? 50 : -50, filter: "blur(5px)" }}
  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
  exit={{ opacity: 0, x: slideDirection === "right" ? -50 : 50, filter: "blur(5px)" }}
  ```

---

### 3.5. Security & Admin Authentication Rules

#### Rule 1: Use `PinModal.jsx` for All Destructive / Admin Actions
- Do not use generic browser `prompt()` or `confirm()`.
- Use the promise-based modal helper:
  ```javascript
  import("./components/PinModal").then(({ promptForPin }) => {
    promptForPin().then((authenticated) => {
      if (authenticated) {
        // Proceed with edit / delete / upload
      }
    });
  });
  ```
- Never display placeholder text that hints at PIN length (e.g., do NOT say "Enter 4-digit PIN").

---

## 4. Pre-Push Production Checklist (MANDATORY)

Before committing code or pushing to GitHub:

```bash
# 1. Run static lint check
npm run lint

# 2. Run production build — MUST EXIT WITH CODE 0
npm run build

# 3. Verify .env is NOT staged in git
git status
# Confirm .env is NOT in the list of staged or modified files
```

If `npm run build` fails with any Rollup or JSX error, **do not commit**. Fix the error first.

---

## 5. Troubleshooting Playbook for Incoming Agents

| Symptom | Root Cause | Solution |
| :--- | :--- | :--- |
| **Intro button stuck at 0%** | Drei `useProgress` waiting for non-existent GLTF assets | Ensure `IntroScreen.jsx` uses the internal interval percentage counter. |
| **Cards not clickable on phone** | `onClick` cancelled by touch-drag detection | Switch to `onPointerDown` with `e.stopPropagation()`. |
| **Cloudinary 400 Bad Request** | File size exceeds 10MB limit | Ensure `browser-image-compression` runs before `fetch` in `UploadModal.jsx` and `MemoryCard.jsx`. |
| **Newly added memory not showing** | Written to `chapters/${id}/memories` subcollection | Write to root `memories` collection with `{ chapterId }`. |
| **Slideshow doesn't animate on photo change** | Missing `<AnimatePresence>` or missing `key={photoIndex}` | Ensure `<motion.img key={photoIndex}>` is wrapped in `<AnimatePresence mode="wait">`. |
| **Wrong year beside back arrow in slideshow** | Hardcoded date string | Ensure `MemoryCard.jsx` derives year from `memory.chapterId`. |
| **Audio stops when switching memories** | `currentTrack` not updated | Use `setCurrentTrack(memory.audioUrl)` in `App.jsx` smart audio hook. |

---

## 6. How to Run & Verify Locally

```bash
# Start local dev server
npm run dev

# Run Firestore seed test (if needed)
node --env-file=.env read.js

# Compile production bundle
npm run build
```
