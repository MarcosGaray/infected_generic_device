import * as THREE from 'three';
import { CameraPreset } from '../../../types';

export interface CameraDirectorController {
  setPreset: (preset: CameraPreset, cinematicSlow?: boolean) => void;
  update: (dt: number) => void;
  dispose: () => void;
}

export function createCameraDirector(
  camera: THREE.PerspectiveCamera,
  domElement: HTMLElement
): CameraDirectorController {
  const targetPos = new THREE.Vector3(-10.2, 13.4, 11.8);
  const targetLookAt = new THREE.Vector3(-0.2, 0.9, 0.2);
  const currentLookAt = targetLookAt.clone();
  let lerpSpeed = 5.2;

  camera.position.copy(targetPos);
  camera.lookAt(currentLookAt);

  function setPreset(preset: CameraPreset, cinematicSlow = false) {
    lerpSpeed = cinematicSlow ? 2.1 : 5.2;

    if (preset === 'sims-room') {
      // Isometric cutaway angle looking into the house (Kitchen, Bathroom & Studio)
      targetPos.set(-10.2, 13.4, 11.8);
      targetLookAt.set(-0.2, 0.9, 0.2);
    } else if (preset === 'devices-closeup') {
      // 5th Preset: Wider room view framing PC, Smartphone, TV Box & ONU with comfortable distance
      targetPos.set(-4.2, 7.8, 8.2);
      targetLookAt.set(3.4, 1.1, 0.8);
    } else if (preset === 'onu-closeup') {
      // Close-up on the Media Console: Smart TV, TV Box & ONU
      targetPos.set(1.2, 3.2, 2.8);
      targetLookAt.set(4.95, 1.25, -0.1);
    } else if (preset === 'neighborhood') {
      // Elevated view of the neighborhood houses & ODB (ODB-01)
      targetPos.set(-4.0, 18.5, 14.0);
      targetLookAt.set(4.5, 1.0, -7.5);
    } else {
      // Full GPON network overview (House + Neighborhood + ODB + OLT GPON)
      targetPos.set(6.5, 21.5, 20.0);
      targetLookAt.set(11.5, 1.5, -4.5);
    }
  }

  let dragMode: 'none' | 'pan' | 'orbit' = 'none';
  let prevX = 0;
  let prevY = 0;

  const onPointerDown = (e: PointerEvent) => {
    if (e.button === 1) {
      // Middle mouse button (wheel click): Orbit around focused axis
      e.preventDefault();
      dragMode = 'orbit';
      lerpSpeed = 8.0;
    } else if (e.button === 0) {
      // Left mouse button: Pan parallel to the horizontal ground surface
      dragMode = 'pan';
      lerpSpeed = 8.0;
    } else {
      return;
    }
    prevX = e.clientX;
    prevY = e.clientY;
  };

  const onAuxClick = (e: MouseEvent) => {
    if (e.button === 1) {
      e.preventDefault();
    }
  };

  const onPointerMove = (e: PointerEvent) => {
    if (dragMode === 'none') return;
    const dx = e.clientX - prevX;
    const dy = e.clientY - prevY;
    prevX = e.clientX;
    prevY = e.clientY;

    if (dragMode === 'orbit') {
      // Rotate camera around the current focused targetLookAt axis
      const offset = targetPos.clone().sub(targetLookAt);
      const spherical = new THREE.Spherical().setFromVector3(offset);
      spherical.theta -= dx * 0.0055;
      spherical.phi = Math.max(0.22, Math.min(Math.PI * 0.46, spherical.phi - dy * 0.0055));
      offset.setFromSpherical(spherical);
      targetPos.copy(targetLookAt).add(offset);
    } else if (dragMode === 'pan') {
      // Pan camera and focused axis (targetLookAt) parallel to the ground surface (X/Z plane)
      const forward = targetLookAt.clone().sub(targetPos);
      forward.y = 0;
      if (forward.lengthSq() < 0.0001) {
        forward.set(0, 0, -1);
      } else {
        forward.normalize();
      }
      const up = new THREE.Vector3(0, 1, 0);
      const right = new THREE.Vector3().crossVectors(forward, up).normalize();

      const dist = Math.max(3.5, targetPos.distanceTo(targetLookAt));
      const panScale = dist * 0.00145;

      const panDelta = new THREE.Vector3()
        .addScaledVector(right, -dx * panScale)
        .addScaledVector(forward, dy * panScale);

      targetPos.add(panDelta);
      targetLookAt.add(panDelta);
    }
  };

  const onPointerUp = () => {
    dragMode = 'none';
  };

  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    lerpSpeed = 6.5;
    const dir = targetPos.clone().sub(targetLookAt);
    const len = dir.length();
    const nextLen = Math.max(3.5, Math.min(46, len + e.deltaY * 0.014));
    dir.normalize().multiplyScalar(nextLen);
    targetPos.copy(targetLookAt).add(dir);
  };

  domElement.addEventListener('pointerdown', onPointerDown);
  domElement.addEventListener('auxclick', onAuxClick);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  domElement.addEventListener('wheel', onWheel, { passive: false });

  return {
    setPreset,
    update(dt: number) {
      const smooth = 1 - Math.exp(-lerpSpeed * dt);
      camera.position.lerp(targetPos, smooth);
      currentLookAt.lerp(targetLookAt, smooth);
      camera.lookAt(currentLookAt);
    },
    dispose() {
      domElement.removeEventListener('pointerdown', onPointerDown);
      domElement.removeEventListener('auxclick', onAuxClick);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      domElement.removeEventListener('wheel', onWheel);
    }
  };
}
