<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Nuturn Studio: Project Context

A cinematic scroll-driven experience built with **Next.js 16**, **GSAP**, and **Lenis**.

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Runtime**: Bun
- **Styling**: Tailwind CSS 4
- **Animation**: GSAP 3 (ScrollToPlugin synchronization)
- **Smooth Scroll**: Lenis (integrated via `LenisProvider`, lerp: 0.1)
- **Engine**: HTML5 `<canvas>` rendering 180 frames (from `/public/frames`)

## Project Structure & Key Paths
- **Core Logic**: `src/components/ScrolltellingCanvas.tsx` (Canvas engine, GSAP choreography, Frame-based listeners)
- **Smooth Scroll**: `src/components/LenisProvider.tsx` (Lenis initialization and global wrapper)
- **Asset Storage**:
  - **Image Frames**: `public/frames/` (240 .webp sequence, 0–180 used for primary zoom)
  - **Local Fonts**: `src/app/fonts/` (Source font files)
- **Global Config**:
  - `src/app/layout.tsx`: Local font registration (`next/font/local`) and root provider wrapping.
  - `src/app/globals.css`: Tailwind 4 theme configuration and CSS variables for typography.
  - `package.json`: Core dependencies for GSAP and Lenis.

## Animation Choreography (Frame 0–180)
- **Frame 0–90**: Lateral "breakaway" movement for side text blocks (Creative/Solutions/SaaS).
- **Frame 90–104**: **Side Text Exit**. Linear fade-out (opacity 1 → 0) for all lateral text.
- **Frame 104–157**: **Branding Glide**. The center "Nuturn Studio" label glides vertically up to the navbar level (`-42.5vh`) using **Quad Out easing**.
- **Frame 128–139**: **Rising Curtain**. A solid black background (`z-17`) snaps up from the bottom (using **Quintic Out "Snap" easing**) to cover the image frames and blur.
- **Frame 128+**: **Cleanup**. Opacity of all lateral text and footer elements is forced to **0** to ensure a clean black background transition.
- **Frame 139+**: **End State**. Final view is solid black with current branding in the header.

## Visual Design System
- **Fonts**: 
  - `SpecialGothic-Medium` (CSS class: `font-special`) 
  - `SpecialGothicExpanded-Bold` (CSS class: `font-expanded`)
- **Key Layers**:
  - `z-0`: Background Canvas
  - `z-10`: Static Vignette Overlay
  - `z-15`: Peripheral Edge Blur (active from Frame 139, but covered by z-17 background)
  - `z-17`: Snapping Black Solid Background (Visible from Frame 128 onward)
  - `z-20`: Text Overlays (Branding, Navbar, Footer)

## Debugging Workflow
- `handleScroll` in `ScrolltellingCanvas.tsx` logs the exact `currentFrameIndex` to the console. Adjust frame-based conditions there to tune timing.


## 🚨 Critical Safety Rules

### 1. Git Safety
- NEVER run destructive commands:
  - `git reset --hard`
  - `git clean -fd`
  - Any command that rewrites or deletes history

- ALWAYS create commits:
  - Commit BEFORE making changes
  - Commit AFTER completing a task

- Commit messages must be meaningful and describe the changes made.

---

### 2. File System Safety
- NEVER execute destructive commands such as:
  - `rm -rf *`
  - Recursive deletion of project files

- Do NOT delete files unless explicitly instructed and necessary.

---

## 📚 Documentation & Accuracy

- ALWAYS follow the **latest official documentation** of any framework, library, or tool used.
- Do NOT rely on outdated knowledge or assumptions.
- If unsure, prioritize correctness over speed.

---

## 🎨 UI / Design System Rules

### Component Library
- ALWAYS prefer **shadcn/ui** for building UI components.

### Icons
- NEVER use **lucide icons**
- ALWAYS use:
  - **Phosphor Icons**
  - OR an approved animated UI icon library

### Design Consistency
- STRICTLY follow the project's:
  - Color palette
  - Typography
  - Spacing system

- Do NOT introduce random styles or inconsistent design patterns.

---

## ⚙️ Development Behavior

- Make incremental, safe changes (avoid large unreviewable diffs)
- Preserve existing functionality unless explicitly modifying it
- Write clean, readable, and maintainable code

---

## ✅ Task Execution Workflow

For EVERY task:

1. Commit current state  
2. Execute requested changes  
3. Verify functionality (basic sanity checks)  
4. Commit final state  

---

## 🚫 Prohibited Actions

- Using unapproved UI libraries
- Ignoring design system constraints
- Overwriting large parts of the codebase without reason
- Making assumptions without validation
- Strictly for antigravity agent - do not use the browser-subagent tool

---

## 🧠 Guiding Principles

- Safety > Speed  
- Consistency > Creativity  
- Accuracy > Assumptions  

---

Agents that fail to follow these rules are considered unsafe.