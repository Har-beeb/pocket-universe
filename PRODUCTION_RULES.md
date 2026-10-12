# PRODUCTION_RULES.md — Pre-Push & Deployment Guardrails

> **Target Repository:** `https://github.com/Har-beeb/pocket-universe`  
> **Production Host:** Vercel  
> **Rule Level:** Strict / Zero-Tolerance

---

## 1. The Zero-Leakage Secrets Policy

### Rule 1.1: `.env` Must NEVER Be Committed
- `.env` must remain in `.gitignore` at all times.
- Before running `git commit`, always verify tracked files:
  ```bash
  git status
  ```
  If `.env` ever appears in the staged list, immediately execute:
  ```bash
  git rm --cached .env
  ```
- If secrets are accidentally pushed to GitHub:
  1. Immediately rotate the leaked API keys in the Firebase and Cloudinary consoles.
  2. Untrack the file and push the updated branch.

### Rule 1.2: All Production Keys Must Be Configured in Vercel
When deploying to Vercel, ensure the following environment variables are set in **Project Settings → Environment Variables**:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_CLOUDINARY_CLOUD_NAME`
- `VITE_CLOUDINARY_UPLOAD_PRESET`
- `VITE_SECRET_PIN`
- `VITE_PARTNER_NAME`

---

## 2. Mandatory Pre-Push Verification Protocol

Never push code directly to `main` without running this 4-step sequence:

### Step 1: Static Code Inspection
```bash
npm run lint
```
Resolve any syntax or import errors.

### Step 2: Full Production Build Verification
```bash
npm run build
```
- **Requirement:** The build must exit with **Code 0**.
- If Vite/Rollup throws any error (missing imports, CSS syntax, React 19 JSX errors), **DO NOT COMMIT**. Fix the issue and re-run.

### Step 3: Bundle Size Sanity Check
- Verify that no unnecessary large static files (such as uncompressed 50MB videos or audio dumps) were placed in `/public` or `/src/assets`.
- The current build outputs:
  - `dist/index.html` (~0.5 kB)
  - `dist/assets/index-*.css` (~22 kB)
  - `dist/assets/PinModal-*.js` (~5 kB)
  - `dist/assets/index-*.js` (~2.0 MB minified with Three.js engine and R3F)

### Step 4: Staged File Review
```bash
git diff --staged --name-only
```
Review the list of staged files and confirm:
- No `.env` files.
- No temporary scratch scripts (`clean.js`, `test.js`) are being unintentionally staged.
- Only intended feature and bug-fix changes are staged.

---

## 3. WebGL & Mobile Performance Guardrails

1. **Retain Visual Quality:** High star count (11,000+), high-resolution procedural noise textures, and DPR limits (`dpr={[1, 2]}`) are intentional requirements.
2. **Pointer Event Standard:** Inside React Three Fiber, all clickable elements (`Planet.jsx`, `GalleryFrame.jsx`) must use `onPointerDown={(e) => { e.stopPropagation(); ... }}`. Never use plain `onClick` inside the 3D scene.
3. **Hitbox Volume Standard:** All orbiting frames must maintain 3D box hitboxes (`boxGeometry`) so raycasting succeeds regardless of camera angle or object spin.
4. **Cloudinary Upload Safety:** All photo uploads must pass through `browser-image-compression` to stay under Cloudinary's 10MB limit. Audio files must target `/video/upload`.

---

## 4. Post-Deployment Smoke Test (5-Minute Checklist)

After Vercel completes deployment:
1. **Intro Screen:** Open the site on mobile and desktop. Verify that the loading counter reaches 100% and "Enter Your Universe" appears centered.
2. **Audio Check:** Tap the sound toggle in the top-right corner. Confirm ambient space audio plays.
3. **Galaxy Navigation:** Click on *The Past* and *The Present*. Confirm smooth camera zoom into planetary orbit.
4. **Card Swiping:** Open a memory album. Click arrows to confirm smooth directional swipe animations.
5. **Upload & Edit Check:** Click the "+" frame, enter the PIN, and confirm the upload modal opens.
