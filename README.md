# Black Hole Simulation (WebGL)

A real-time black hole visualization built with React, Three.js, and GLSL.

This project renders gravitational lensing around a Schwarzschild black hole and a volumetric accretion disc in real time. The focus is educational + visual: physically motivated ray bending, controllable rendering parameters, and interactive exploration.

!['demo video'](docs/media/demo.gif)

## 🚀 Live Demo

Visit it here: [https://blackhole-simulation-webgl.vercel.app/](https://blackhole-simulation-webgl.vercel.app/)

## Implemented Features

- Schwarzschild geodesic bending using second-order ODE in `u(phi)` integrated with RK4.
- Adaptive geodesic step sizing for quality/performance control.
- Volumetric accretion disc in `bend-env` using Beer-Lambert emission + absorption.
- Span-aware segment clipping against finite annulus volume to avoid thin-volume skip artifacts.
- Composite substep integration for stable medium sampling (reduced banding vs single-point sampling).
- Pre-generated tileable 3D FBM noise texture for non-uniform disc structure.
- Differential disc motion via noise advection (inner regions move faster than outer regions).
- Relativistic-style disc appearance controls:
  - Doppler beaming / tint controls
  - Gravitational redshift controls
- Orbit and FPS control modes
- Postprocessing pipeline using `@react-three/postprocessing` (SMAA, bloom, vignette, tone mapping, noise).

## Quick Start

```bash
npm install
npm run dev
```

## Controls Summary

Controls and tweaks are exposed through Leva.

### Geodesics

- Core lensing parameters:
  - Schwarzschild radius (`uRs`)
  - max geodesic steps (`uMaxSteps`)
  - step adaptivity (`uStepAdapt`)
- Advanced tuning:
  - `uPhiBudget`, `uMinStepRatio`, `uRadialStepBoost`

### Accretion Disc

- Enable toggle (`uEnableDiscAccumulation`)
- Geometry: inner/outer radius, thickness (`uDiscHalfHeight`)
- Medium: density, radial density power, absorption, softness, vertical falloff
- Emission: strength, inner/outer colors, radial/color shaping
- Integration quality (`uDiscIntegrationQuality`)
- Noise: `uDiscNoiseScale`, `uDiscNoiseStrength`
- Motion/relativity: spin/advection controls, Doppler controls, gravitational redshift controls

## Rendering Pipeline Summary

1. Observer camera state is updated from camera controls each frame.
2. Main canvas renders a fullscreen triangle; fragment shader reconstructs per-pixel rays.
3. Geodesic integration in Schwarzschild space is advanced with RK4 + adaptive stepping.
4. In `bend-env`, each geodesic segment is clipped against accretion annulus spans.
5. Medium contribution is accumulated using Beer-Lambert emission/absorption over substeps.
6. Escape/capture logic resolves final ray result and environment/capture color.
7. Final image passes through postprocessing (SMAA, bloom, vignette, ACES tone mapping, noise).

## Tech Stack and Project Structure

### Stack

- `React 19` + `TypeScript` + `Vite`
- `@react-three/fiber` / `Three.js`
- GLSL shaders via `vite-plugin-glsl`
- `@react-three/drei` and `Leva` for interaction/tools
- `@react-three/postprocessing` for image effects

### Key project areas

- `src/rendering/camera/`: observer camera modes and synchronization
- `src/rendering/components/`: canvas composition and scene wiring
- `src/rendering/controls/`: Leva control schema and setting mapping
- `src/rendering/materials/`: shader materials + uniform defaults
- `src/shaders/fullscreen-pass-bend-env.frag.glsl`: primary bent environment pass
- `src/shaders/chunks/geodesics/`: geodesic integration and adaptive stepping
- `src/shaders/chunks/accretion/`: accretion geometry, density, motion, optics

## Known Limitations

- Schwarzschild-only model (no Kerr spin metric).
- No accretion self-shadowing in current volumetric pass.
- Calibration is artistic/heuristic in parts (disc color grading and effect tuning).
- Possible future improvements:
  - Kerr geodesics
  - temporal denoising
  - physically grounded disc temperature model
