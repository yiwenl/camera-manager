# CLAUDE.md

## Project purpose

This repository contains a small, browser-only TypeScript library that turns
`navigator.mediaDevices.getUserMedia()` into an event-driven camera feed. It is
primarily intended to provide video frames to real-time ML libraries such as
MediaPipe without making every consumer manage camera lifecycle details.

Keep the library small and framework-agnostic. Do not add a runtime dependency
or a UI framework unless the user explicitly asks for one.

## Important files

- `src/CameraManager.ts` — the complete public API and implementation.
- `README.md` — consumer-facing API documentation and usage example.
- `dev/index.html` and `dev/test.ts` — browser-based manual test harness.
- `rollup.config.js` — ESM and UMD library builds.
- `tsconfig.json` — shared TypeScript settings.
- `tsconfig.build.json` — library-only declaration build.

Generated files under `dist/` are ignored. Do not edit them directly.

## Public API

The package exports the named `CameraManager` class and its TypeScript
interfaces from `src/CameraManager.ts`.

```ts
import { CameraManager } from 'camera-manager';

const camera = new CameraManager({
  width: 1280,
  height: 720,
  facingMode: 'user',
  fps: 30,
});

camera.addEventListener('frame', (event) => {
  const { video, timestamp, width, height } =
    (event as CustomEvent<FrameEventDetails>).detail;

  // Pass `video` to MediaPipe or another frame consumer.
});

await camera.start();

// Later:
camera.stop();
camera.dispose();
```

Methods:

- `start()` requests a video-only `MediaStream`, starts playback, emits
  `ready`, and begins the frame loop.
- `stop()` stops media tracks, detaches the stream, and stops frame emission.
- `pause()` pauses only `frame` event emission; it does not stop the camera.
- `resume()` resumes `frame` event emission while the stream is running.
- `getSnapshot(format?)` returns a data URL for the current frame, or `''` when
  no drawable frame is available.
- `dispose()` stops the camera and removes the global `devicechange` listener.
  Consumers should not reuse an instance after disposing it.

Events and their detail types:

- `ready` → `ReadyEventDetails`
- `frame` → `FrameEventDetails`
- `device:change` → `DeviceChangeEventDetails`
- `error` → `ErrorEventDetails`

## Behavioral constraints

- This library requires a browser DOM and `navigator.mediaDevices`; it is not
  safe to instantiate during SSR or in Node.js.
- Use the documented ESM named import. The current CommonJS `require` entry
  resolves to the UMD build but does not expose `CameraManager` to Node.
- Camera access normally requires HTTPS or localhost and explicit user
  permission.
- The internal `<video>` is detached from the DOM. Consumers may append
  `camera.video` when they need a preview.
- `fps` is an ideal `getUserMedia` constraint. It does not throttle the emitted
  `frame` events independently of the camera.
- Prefer `requestVideoFrameCallback`; retain the `requestAnimationFrame`
  fallback for browsers that do not support it.
- Preserve the current event names and detail shapes unless making an explicit
  breaking release.
- A call to `stop()` must continue to stop every media track so the camera
  hardware is released.

## Development workflow

CI currently targets Node.js 20.

Install dependencies and run the browser test page:

```bash
npm ci
npm run dev
```

Build the package and declarations:

```bash
npm run build
```

Type-check without generating files:

```bash
npx tsc --noEmit
```

There is currently no automated test suite: `npm test` intentionally fails.
For behavior changes, use the Vite test page and manually verify:

1. Start requests permission and emits `ready`.
2. `frame` events contain a live video and non-zero dimensions.
3. Pause/resume affects event emission without turning off the camera.
4. Stop turns off the camera and allows a later restart.
5. Snapshot returns a valid data URL after the video is ready.
6. Dispose releases the camera and removes long-lived listeners.

## Change guidelines

- Make focused changes; the current single-file implementation is intentional.
- Keep public types explicit and avoid `any` in new API surface.
- Update `README.md` and this file when public behavior changes.
- Run `npm run build` and `npx tsc --noEmit` before considering a change
  complete.
- Do not commit `dist/`, `node_modules/`, local environment files, or generated
  camera captures.
