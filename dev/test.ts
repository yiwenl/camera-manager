

import { CameraManager, ReadyEventDetails } from '../src/CameraManager';

console.log('Test script loaded');

// We need to wait for DOM to be ready if we are running this in head, 
// but usually it's at end of body or deferred. 
// Let's assume it runs after DOM is ready or wait for it.

async function main() {
    const container = document.getElementById('container');
    const statusEl = document.getElementById('status');

    if (!container || !statusEl) {
        console.error('Container or status element not found');
        return;
    }

    const camera = new CameraManager({
        width: 640,
        height: 480,
        fps: 30
    });

    camera.addEventListener('ready', (e: Event) => {
        const detail = (e as CustomEvent<ReadyEventDetails>).detail;
        console.log('[Test] Camera Ready:', detail.capabilities);
        
        // Attach video to DOM
        container.appendChild(detail.video);
        statusEl.textContent = 'Status: Ready (Stream active)';
    });

    camera.addEventListener('frame', (e: Event) => {
        // const detail = (e as CustomEvent<FrameEventDetails>).detail;
        // console.log('[Test] Frame:', detail.timestamp);
    });

    camera.addEventListener('error', (e: Event) => {
        const detail = (e as CustomEvent<any>).detail;
        console.error('[Test] Error Details:', detail);
        statusEl.textContent = `Status: Error - ${detail.message}`;
    });

    // Automatically start for testing convenience? 
    // Or wire up buttons here too?
    // The user asked to "attach the camera on to the html once retrieved", 
    // implying the 'ready' event logic handles attachment, which we did.
    // Let's also wire up the start button so it actually retrieves it.
    
    const startBtn = document.getElementById('btn-start');
    if (startBtn) {
        startBtn.onclick = async () => {
             statusEl.textContent = 'Status: Starting...';
             try {
                 await camera.start();
             } catch (e) {
                 console.error(e);
             }
        };
    }

    // Wire up other buttons for completeness since we are replacing the inline script logic
    const stopBtn = document.getElementById('btn-stop');
    if (stopBtn) stopBtn.onclick = () => { camera.stop(); statusEl.textContent = 'Status: Stopped'; container.innerHTML = ''; };

    const pauseBtn = document.getElementById('btn-pause');
    if (pauseBtn) pauseBtn.onclick = () => { camera.pause(); statusEl.textContent = 'Status: Paused'; };

    const resumeBtn = document.getElementById('btn-resume');
    if (resumeBtn) resumeBtn.onclick = () => { camera.resume(); statusEl.textContent = 'Status: Resumed'; };
}

// Run main
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
} else {
    main();
}
