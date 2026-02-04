# Camera Manager Module API

A lightweight, event-driven JavaScript wrapper for `getUserMedia` designed for real-time ML experiments (Face Mesh, Skeleton Detection, etc.).

## Overview

The `CameraManager` module handles the complexities of hardware permissions, stream lifecycle, and provides a synchronized "game loop" for processing video frames.

---

## Installation

```bash
npm install git+https://github.com/yiwenl/camera-manager.git
```

## Constructor

```javascript
const camera = new CameraManager(options);
```

### Options

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `width` | `number` | `1280` | Requested video width. |
| `height` | `number` | `720` | Requested video height. |
| `facingMode` | `string` | `'user'` | `'user'` (front) or `'environment'` (back). |
| `fps` | `number` | `30` | Target frame rate for the frame event loop. |

## Properties

| Property | Type | Description |
| :--- | :--- | :--- |
| `video` | `HTMLVideoElement` | The internal video element. Useful for passing to ML libraries (e.g., TensorFlow.js). |

## Methods

### `async start()`

Initializes the camera hardware and begins the internal loop.

- **Returns**: `Promise<MediaStream>`
- **Throws**:
  - `PermissionDeniedError`: User rejected camera access.
  - `NotFoundError`: No camera matching constraints found.

### `stop()`

Stops all active media tracks and cancels the animation frame loop. This turns off the camera hardware LED.

### `dispose()`

Permanently cleans up the camera manager instance. Stops the camera, removes event listeners, and clears cached resources. Call this when the module is no longer needed.

### `pause()`

Suspends the emission of frame events. The camera remains active (LED stays on), but the processing loop is frozen.

### `resume()`

Restarts the frame event loop after a pause.

### `getSnapshot(format = 'image/jpeg')`

Captures the current frame as a Data URL.

- **Returns**: `string` (Base64)

## Events

`CameraManager` inherits from `EventTarget`. Use `addEventListener` to subscribe to lifecycle changes.

| Event Name | `e.detail` Properties | Trigger Timing |
| :--- | :--- | :--- |
| `ready` | `stream`, `video`, `capabilities` | When video metadata is loaded and dimensions are locked. |
| `frame` | `video`, `timestamp`, `width`, `height` | **Main Loop**: Every time the browser is ready for a new ML process. |
| `device:change` | `devices` | When a USB camera is plugged in or removed. |
| `error` | `message`, `errorObject` | When hardware fails or permissions are revoked. |

## Usage Example

### Experimental Setup

This module allows multiple independent observers to listen to the same camera feed.

```javascript
import { CameraManager } from 'camera-manager';

const camera = new CameraManager({ width: 640, height: 480 });

// 1. Face Mesh Observer
camera.addEventListener('frame', ({ detail }) => {
  faceMeshModule.detect(detail.video);
});

// 2. Skeleton Observer (running in parallel)
camera.addEventListener('frame', ({ detail }) => {
  skeletonModule.estimate(detail.video);
});

// 3. Error Handling
camera.addEventListener('error', (e) => {
  console.error("Camera System Error:", e.detail.message);
});

// Start the hardware
await camera.start();
```

## Implementation Notes

- **Zero DOM Footprint**: Creates an internal, detached `<video>` element. You do not need to add a video tag to your HTML unless you want to preview the feed.
- **Optimized Loop**: Uses `requestVideoFrameCallback` where supported to ensure your ML logic only runs when a new frame is actually delivered by the camera hardware.

## Development

```bash
# Start the dev server (Vite)
npm run dev

# Build the library (Rollup)
npm run build
```