import * as THREE from 'three';
import { CameraPreset } from '../../../types';

export interface CameraDirectorController {
  setPreset: (preset: CameraPreset, cinematicSlow?: boolean) => void;
  setAspect: (aspect: number) => void;
  update: (dt: number) => void;
  dispose: () => void;
}

interface PresetPoints {
  pos: [number, number, number];
  look: [number, number, number];
}

const PRESETS: Record<CameraPreset, PresetPoints> = {
  'sims-room': {
    // Isometric cutaway angle looking into the house (Kitchen, Bathroom & Studio)
    pos: [-10.2, 13.4, 11.8],
    look: [-0.2, 0.9, 0.2]
  },
  'devices-closeup': {
    // Wider room view framing PC, Smartphone, TV Box & ONU
    pos: [-4.2, 7.8, 8.2],
    look: [3.4, 1.1, 0.8]
  },
  'onu-closeup': {
    // Close-up on the media console: Smart TV, TV Box & ONU
    pos: [1.2, 3.2, 2.8],
    look: [4.95, 1.25, -0.1]
  },
  neighborhood: {
    // Elevated view of the neighborhood houses & ODB
    pos: [-4.0, 18.5, 14.0],
    look: [4.5, 1.0, -7.5]
  },
  overview: {
    // Full GPON network overview (House + Neighborhood + ODB + OLT)
    pos: [6.5, 21.5, 20.0],
    look: [11.5, 1.5, -4.5]
  }
};

export function createCameraDirector(
  camera: THREE.PerspectiveCamera,
  domElement: HTMLElement
): CameraDirectorController {
  const targetPos = new THREE.Vector3();
  const targetLookAt = new THREE.Vector3();
  const currentLookAt = new THREE.Vector3();
  let lerpSpeed = 5.2;
  let viewportAspect = 16 / 9;
  let currentPreset: CameraPreset = 'sims-room';

  domElement.style.touchAction = 'none';

  /**
   * En pantallas verticales el encuadre horizontal se reduce mucho.
   * Alejamos la cámara del objetivo para que la escena siga entrando completa.
   */
  function aspectDistanceFactor() {
    if (viewportAspect >= 1.05) return 1;
    const t = Math.min(1, Math.max(0, (1.05 - viewportAspect) / 0.6));
    return 1 + t * 0.5;
  }

  function applyPreset(preset: CameraPreset, immediate: boolean) {
    const base = PRESETS[preset];
    currentPreset = preset;
    targetLookAt.set(base.look[0], base.look[1], base.look[2]);
    targetPos.set(base.pos[0], base.pos[1], base.pos[2]);
    const offset = targetPos.clone().sub(targetLookAt).multiplyScalar(aspectDistanceFactor());
    targetPos.copy(targetLookAt).add(offset);

    if (immediate) {
      camera.position.copy(targetPos);
      currentLookAt.copy(targetLookAt);
      camera.lookAt(currentLookAt);
    }
  }

  applyPreset('sims-room', true);

  function setPreset(preset: CameraPreset, cinematicSlow = false) {
    lerpSpeed = cinematicSlow ? 2.1 : 5.2;
    applyPreset(preset, false);
  }

  function setAspect(aspect: number) {
    const next = Math.max(0.3, Math.min(3, aspect));
    if (Math.abs(next - viewportAspect) < 0.04) return;
    viewportAspect = next;
    applyPreset(currentPreset, false);
  }

  let dragMode: 'none' | 'pan' | 'orbit' = 'none';
  let prevX = 0;
  let prevY = 0;
  const activePointers = new Map<number, { x: number; y: number }>();
  let twoFingerPrevCenterX = 0;
  let twoFingerPrevCenterY = 0;
  let twoFingerStartDistance = 0;
  let twoFingerStartLength = 0;

  function pointerDistance() {
    const points = Array.from(activePointers.values());
    if (points.length < 2) return 0;
    return Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
  }

  function pointerCenter() {
    const points = Array.from(activePointers.values());
    if (points.length < 2) return { x: 0, y: 0 };
    return {
      x: (points[0].x + points[1].x) * 0.5,
      y: (points[0].y + points[1].y) * 0.5
    };
  }

  /** Rota la cámara alrededor del objetivo enfocado (mismo efecto que el botón central). */
  function orbitBy(dx: number, dy: number) {
    const offset = targetPos.clone().sub(targetLookAt);
    const spherical = new THREE.Spherical().setFromVector3(offset);
    spherical.theta -= dx * 0.0055;
    spherical.phi = Math.max(0.22, Math.min(Math.PI * 0.46, spherical.phi - dy * 0.0055));
    offset.setFromSpherical(spherical);
    targetPos.copy(targetLookAt).add(offset);
  }

  function beginTwoFingerGesture() {
    const center = pointerCenter();
    dragMode = 'none';
    twoFingerPrevCenterX = center.x;
    twoFingerPrevCenterY = center.y;
    twoFingerStartDistance = pointerDistance();
    twoFingerStartLength = targetPos.distanceTo(targetLookAt);
    lerpSpeed = 8.0;
  }

  const onPointerDown = (e: PointerEvent) => {
    activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointers.size === 2) {
      // Dos dedos: el desplazamiento del centro rota (como el botón central)
      // y la variación de distancia entre dedos mantiene el zoom por pellizco.
      beginTwoFingerGesture();
      return;
    }

    if (activePointers.size > 2) {
      // Más de dos dedos: cancelar el gesto para evitar saltos.
      dragMode = 'none';
      twoFingerStartDistance = 0;
      twoFingerStartLength = 0;
      return;
    }

    if (e.button === 1) {
      // Middle mouse button (wheel click): orbit around focused axis
      e.preventDefault();
      dragMode = 'orbit';
      lerpSpeed = 8.0;
    } else if (e.button === 0) {
      // Left mouse button or one finger: pan parallel to the ground
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
    const tracked = activePointers.get(e.pointerId);
    if (!tracked) return;

    tracked.x = e.clientX;
    tracked.y = e.clientY;

    if (activePointers.size === 2) {
      // Arrastre con dos dedos: el centro rota y la separación hace zoom.
      const center = pointerCenter();
      const centerDx = center.x - twoFingerPrevCenterX;
      const centerDy = center.y - twoFingerPrevCenterY;
      twoFingerPrevCenterX = center.x;
      twoFingerPrevCenterY = center.y;

      if (centerDx !== 0 || centerDy !== 0) {
        orbitBy(centerDx, centerDy);
      }

      const distance = pointerDistance();
      if (twoFingerStartDistance > 0 && distance > 0) {
        const nextLength = Math.max(
          3.5,
          Math.min(46, twoFingerStartLength * (twoFingerStartDistance / distance))
        );
        const direction = targetPos.clone().sub(targetLookAt).normalize().multiplyScalar(nextLength);
        targetPos.copy(targetLookAt).add(direction);
      }
      return;
    }

    if (activePointers.size > 2) return;

    if (dragMode === 'none') return;
    const dx = e.clientX - prevX;
    const dy = e.clientY - prevY;
    prevX = e.clientX;
    prevY = e.clientY;

    if (dragMode === 'orbit') {
      orbitBy(dx, dy);
    } else if (dragMode === 'pan') {
      // Pan camera and focused axis parallel to the ground surface (X/Z plane)
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

  const onPointerUp = (e: PointerEvent) => {
    if (!activePointers.has(e.pointerId)) return;
    activePointers.delete(e.pointerId);

    if (activePointers.size === 2) {
      // Si queda un tercer dedo tras levantar uno, reiniciar la línea base.
      beginTwoFingerGesture();
      return;
    }

    // Al quedar uno o ningún dedo, el gesto de dos dedos termina.
    // El dedo restante debe volver a tocar para iniciar otro gesto (evita saltos).
    twoFingerStartDistance = 0;
    twoFingerStartLength = 0;
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
  window.addEventListener('pointercancel', onPointerUp);
  domElement.addEventListener('wheel', onWheel, { passive: false });

  return {
    setPreset,
    setAspect,
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
      window.removeEventListener('pointercancel', onPointerUp);
      domElement.removeEventListener('wheel', onWheel);
    }
  };
}
