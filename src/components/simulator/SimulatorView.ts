import * as THREE from 'three';
import { GUIDED_SIM_STEPS } from '../../data/simulationData';
import { CameraPreset, SimulationState } from '../../types';
import { computeSimTelemetry } from './SimTelemetryEngine';
import { updateSimEventBanner } from './SimEventBanner';
import { renderSimControlDock } from './SimControlDock';
import { createSimsGroundTexture } from './world3d/ProceduralTextures';
import { buildSimsCutawayHouse } from './world3d/SimsHouseBuilder';
import {
  buildNetworkDevicesInHouse,
  updateNetworkDevicesVisuals
} from './world3d/NetworkDevicesBuilder';
import {
  buildNeighborhoodGpon,
  updateNeighborhoodVisuals
} from './world3d/NeighborhoodGponBuilder';
import { createTrafficParticlesSystem } from './world3d/TrafficParticlesSystem';
import { createCameraDirector } from './world3d/CameraDirector';

export interface Simulation3DController {
  nextGuidedStepOrExit: () => boolean;
  prevGuidedStepOrExit: () => boolean;
  destroy: () => void;
}

export function mountSimulation3D(container: HTMLElement): Simulation3DController {
  const initialStep = GUIDED_SIM_STEPS[0];
  const startCollapsed = window.innerHeight < 700 || window.innerWidth < 360;
  const state: SimulationState = {
    ponDensity: initialStep.ponDensity,
    infectedCount: initialStep.infectedCount,
    guestVlanActive: initialStep.guestVlanActive,
    lanPortDisabled: initialStep.lanPortDisabled,
    macBlacklistActive: initialStep.macBlacklistActive,
    tvBoxReplaced: initialStep.tvBoxReplaced,
    hardResetCountdown: 0,
    tvBoxSwapAnim: 0,
    bannerCollapsed: startCollapsed,
    guidedStepIdx: 0,
    cameraPreset: initialStep.camera,
    eventBanner: {
      stepBadge: initialStep.stepBadge,
      headline: initialStep.headline,
      subtext: initialStep.subtext,
      bannerTone: initialStep.bannerTone
    }
  };

  let scheduledCamTimer: number | null = null;
  const clearScheduledCamera = () => {
    if (scheduledCamTimer !== null) {
      window.clearTimeout(scheduledCamTimer);
      scheduledCamTimer = null;
    }
  };

  // Build Clean UI Layout (90% unobstructed 3D world)
  const stage = document.createElement('div');
  stage.className = 'sims-stage';
  container.innerHTML = '';
  container.appendChild(stage);

  const canvasHost = document.createElement('div');
  canvasHost.className = 'sims-canvas-host';
  stage.appendChild(canvasHost);

  const bannerEl = document.createElement('div');
  bannerEl.className = 'sims-event-banner';
  stage.appendChild(bannerEl);

  const metersEl = document.createElement('div');
  metersEl.className = 'sims-mini-meters';
  stage.appendChild(metersEl);

  const dockEl = document.createElement('div');
  dockEl.className = 'sims-bottom-dock';
  stage.appendChild(dockEl);

  const disclaimerEl = document.createElement('div');
  disclaimerEl.className = 'sims-disclaimer';
  disclaimerEl.textContent = 'Datos y cifras ilustrativas';
  stage.appendChild(disclaimerEl);

  // Three.js Scene & Renderer Setup (Natural Green Grass & Daylight Shadows)
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x4d8c2c);
  scene.fog = new THREE.FogExp2(0x4d8c2c, 0.0085);

  const camera = new THREE.PerspectiveCamera(40, 16 / 9, 0.1, 220);
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  canvasHost.appendChild(renderer.domElement);

  // Natural Daylight Ambient + Sun Directional Light casting crisp diagonal shadows
  const hemiLight = new THREE.HemisphereLight(0xfefce8, 0x3b7a23, 0.92);
  scene.add(hemiLight);

  const sunLight = new THREE.DirectionalLight(0xfffbeb, 1.85);
  sunLight.position.set(-14, 24, 14);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 2;
  sunLight.shadow.camera.far = 75;
  const d = 22;
  sunLight.shadow.camera.left = -d;
  sunLight.shadow.camera.right = d;
  sunLight.shadow.camera.top = d;
  sunLight.shadow.camera.bottom = -d;
  sunLight.shadow.bias = -0.0005;
  scene.add(sunLight);

  // Interior Warm Room Lights (Bathroom Sconce & Studio Pendant)
  const bathLight = new THREE.PointLight(0xfef08a, 1.1, 7);
  bathLight.position.set(-3.3, 2.7, -3.5);
  scene.add(bathLight);

  const studioLight = new THREE.PointLight(0xffedd5, 1.2, 9);
  studioLight.position.set(1.8, 2.8, 0.5);
  scene.add(studioLight);

  // Lush Green Grass Ground Plane
  const groundTex = createSimsGroundTexture();
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshStandardMaterial({ map: groundTex, roughness: 0.9 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Build Modular 3D World Subcomponents
  const houseRefs = buildSimsCutawayHouse(scene);
  const devRefs = buildNetworkDevicesInHouse(houseRefs.houseGroup);
  const gponRefs = buildNeighborhoodGpon(scene, devRefs.onuPos);
  const particlesCtrl = createTrafficParticlesSystem(scene, devRefs, gponRefs);
  const camDirector = createCameraDirector(camera, renderer.domElement);

  function scheduleCameraTransition(targetPreset: CameraPreset, delaySec: number) {
    clearScheduledCamera();
    scheduledCamTimer = window.setTimeout(() => {
      scheduledCamTimer = null;
      state.cameraPreset = targetPreset;
      camDirector.setPreset(targetPreset, true);
      syncUi(false);
    }, delaySec * 1000);
  }

  function syncUi(animateBanner = true) {
    const telemetry = computeSimTelemetry(state);
    const handleToggleBannerCollapse = () => {
      state.bannerCollapsed = !state.bannerCollapsed;
      syncUi(false);
    };
    updateSimEventBanner(
      bannerEl,
      metersEl,
      state.eventBanner,
      telemetry,
      animateBanner,
      state.bannerCollapsed,
      handleToggleBannerCollapse
    );
    renderSimControlDock(dockEl, state, {
      onPrevStep: () => applyGuidedStep(Math.max(0, state.guidedStepIdx - 1)),
      onNextStep: () => applyGuidedStep((state.guidedStepIdx + 1) % GUIDED_SIM_STEPS.length),
      onSelectCamera: (cam: CameraPreset) => {
        clearScheduledCamera();
        state.cameraPreset = cam;
        camDirector.setPreset(cam, false);
        syncUi(false);
      },
      onToggleInfect: () => {
        clearScheduledCamera();
        state.tvBoxReplaced = false;
        state.tvBoxSwapAnim = 0;
        state.lanPortDisabled = false;
        state.macBlacklistActive = false;
        if (state.infectedCount > 0) {
          state.infectedCount = 0;
          state.eventBanner = {
            stepBadge: 'MODO LIBRE • RED SANA',
            headline: 'Hogar del cliente — Todo funciona normal',
            subtext: 'La casa navega con baja latencia y comparte la fibra sin problemas con sus vecinos.',
            bannerTone: 'normal'
          };
        } else {
          state.infectedCount = 1;
          state.cameraPreset = 'sims-room';
          camDirector.setPreset('sims-room');
          state.eventBanner = {
            stepBadge: 'ALERTA • VIRUS ACTIVO',
            headline: '¡El TV Box genérico satura la subida y espía la casa!',
            subtext: 'Envía y recibe paquetes de datos con la PC y el celular mientras inyecta tráfico hacia la ODB.',
            bannerTone: 'danger'
          };
        }
        syncUi(true);
      },
      onTriggerHardReset: () => {
        clearScheduledCamera();
        state.infectedCount = Math.max(1, state.infectedCount);
        state.tvBoxReplaced = false;
        state.tvBoxSwapAnim = 0;
        state.hardResetCountdown = 2.6;
        state.cameraPreset = 'devices-closeup';
        camDirector.setPreset('devices-closeup');
        state.eventBanner = {
          stepBadge: 'PRUEBA • RESET DE FÁBRICA',
          headline: 'Reiniciando el TV Box a valores de fábrica...',
          subtext: 'El equipo se apaga unos segundos, pero el malware sigue grabado en la partición /system.',
          bannerTone: 'warning'
        };
        syncUi(true);
      },
      onToggleGuestWifi: () => {
        clearScheduledCamera();
        state.guestVlanActive = !state.guestVlanActive;
        state.cameraPreset = 'devices-closeup';
        camDirector.setPreset('devices-closeup');
        state.eventBanner = state.guestVlanActive
          ? {
              stepBadge: 'RED DE INVITADOS ACTIVADA',
              headline: 'Escudo local activo: Protege la PC y el celular, pero NO la fibra',
              subtext: 'El aislamiento L2 frena el robo de datos en casa, pero el TV Box sigue saturando la ODB y la OLT.',
              bannerTone: 'warning'
            }
          : {
              stepBadge: 'RED DE INVITADOS DESACTIVADA',
              headline: 'Red de invitados apagada',
              subtext: 'La PC y el celular vuelven a compartir la misma LAN que el TV Box.',
              bannerTone: state.infectedCount > 0 ? 'danger' : 'normal'
            };
        syncUi(true);
      },
      onTogglePortBlock: () => {
        clearScheduledCamera();
        const nextBlock = !(state.lanPortDisabled || state.macBlacklistActive);
        state.lanPortDisabled = nextBlock;
        state.macBlacklistActive = nextBlock;
        state.cameraPreset = 'onu-closeup';
        camDirector.setPreset('onu-closeup');
        if (nextBlock) {
          scheduleCameraTransition('neighborhood', 1.8);
        }
        state.eventBanner = nextBlock
          ? {
              stepBadge: 'MITIGACIÓN • BLOQUEO DE PUERTO/MAC',
              headline: '¡Operaciones de red bloquea el puerto en la ONU y libera al barrio!',
              subtext: 'El tráfico malicioso se corta en la ONU y todas las casas del barrio recuperan su velocidad.',
              bannerTone: 'success'
            }
          : {
              stepBadge: 'DESBLOQUEO DE PUERTO',
              headline: 'Puerto LAN / MAC desbloqueado',
              subtext: 'Si el TV Box sigue enchufado, vuelve a inyectar tráfico en la red.',
              bannerTone: state.infectedCount > 0 ? 'danger' : 'normal'
            };
        syncUi(true);
      },
      onToggleCertifiedBox: () => {
        clearScheduledCamera();
        state.tvBoxReplaced = !state.tvBoxReplaced;
        if (state.tvBoxReplaced) {
          state.infectedCount = 0;
          state.lanPortDisabled = false;
          state.macBlacklistActive = false;
          state.guestVlanActive = false;
          state.tvBoxSwapAnim = 1.0;
          state.cameraPreset = 'devices-closeup';
          camDirector.setPreset('devices-closeup');
          scheduleCameraTransition('overview', 2.6);
          state.eventBanner = {
            stepBadge: 'SOLUCIÓN DEFINITIVA • EQUIPO CERTIFICADO',
            headline: '¡TV Box malicioso reemplazado por un equipo certificado!',
            subtext: 'Se retira el equipo infectado, se instala un equipo con certificación oficial y toda la red GPON vuelve a la normalidad.',
            bannerTone: 'success'
          };
        } else {
          state.tvBoxSwapAnim = 0;
          state.infectedCount = 1;
          state.eventBanner = {
            stepBadge: 'EQUIPO GENÉRICO CONECTADO',
            headline: 'Se volvió a conectar el TV Box sin certificar',
            subtext: 'El virus preinstalado retoma la actividad en la red.',
            bannerTone: 'danger'
          };
        }
        syncUi(true);
      },
      onChangePonDensity: (val: number) => {
        state.ponDensity = val;
        const tel = computeSimTelemetry(state);
        updateSimEventBanner(
          bannerEl,
          metersEl,
          state.eventBanner,
          tel,
          false,
          state.bannerCollapsed,
          handleToggleBannerCollapse
        );
      },
      onChangeInfectedCount: (val: number) => {
        state.infectedCount = val;
        if (val > 0) {
          state.tvBoxReplaced = false;
          state.tvBoxSwapAnim = 0;
        }
        const tel = computeSimTelemetry(state);
        updateSimEventBanner(
          bannerEl,
          metersEl,
          state.eventBanner,
          tel,
          false,
          state.bannerCollapsed,
          handleToggleBannerCollapse
        );
      }
    });
  }

  function applyGuidedStep(idx: number) {
    const s = GUIDED_SIM_STEPS[idx];
    if (!s) return;
    clearScheduledCamera();

    state.guidedStepIdx = idx;
    state.ponDensity = s.ponDensity;
    state.infectedCount = s.infectedCount;
    state.guestVlanActive = s.guestVlanActive;
    state.lanPortDisabled = s.lanPortDisabled;
    state.macBlacklistActive = s.macBlacklistActive;
    state.tvBoxReplaced = s.tvBoxReplaced;
    state.hardResetCountdown = s.triggerResetOnEnter ? 2.6 : 0;
    state.tvBoxSwapAnim = s.triggerSwapOnEnter ? 1.0 : 0;
    state.cameraPreset = s.camera;
    state.eventBanner = {
      stepBadge: s.stepBadge,
      headline: s.headline,
      subtext: s.subtext,
      bannerTone: s.bannerTone
    };
    camDirector.setPreset(s.camera, false);

    if (s.endCamera) {
      scheduleCameraTransition(s.endCamera, s.endCameraDelaySec ?? 2.0);
    }

    syncUi(true);
  }

  // Handle Resize
  const onResize = () => {
    const w = canvasHost.clientWidth || window.innerWidth;
    const h = canvasHost.clientHeight || window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    camDirector.setAspect(camera.aspect);

    // En horizontal con poca altura, el cartel plegado deja ver mejor la escena.
    if (h < 500 && !state.bannerCollapsed) {
      state.bannerCollapsed = true;
      syncUi(false);
    }
  };
  const resizeObserver = new ResizeObserver(onResize);
  resizeObserver.observe(canvasHost);
  window.addEventListener('resize', onResize);
  setTimeout(onResize, 0);

  // Main Animation Loop
  let animId: number | null = null;
  const clock = new THREE.Clock();

  function animate() {
    animId = requestAnimationFrame(animate);
    const dt = Math.min(0.05, clock.getDelta());
    const elapsed = clock.getElapsedTime();

    if (state.hardResetCountdown > 0) {
      state.hardResetCountdown = Math.max(0, state.hardResetCountdown - dt);
      if (state.hardResetCountdown === 0) {
        state.eventBanner = {
          stepBadge: 'ESCENA 5/7 • PERSISTENCIA EN EL SISTEMA',
          headline: '¡El virus sigue ahí! El reset de fábrica NO lo borra',
          subtext: 'Al estar grabado en la memoria del sistema, el malware vuelve a atacar apenas reinicia el equipo.',
          bannerTone: 'danger'
        };
        syncUi(true);
      }
    }

    if (state.tvBoxSwapAnim > 0) {
      state.tvBoxSwapAnim = Math.max(0, state.tvBoxSwapAnim - dt * 0.44);
    }

    const telemetry = computeSimTelemetry(state);

    updateNetworkDevicesVisuals(devRefs, state, elapsed);
    updateNeighborhoodVisuals(gponRefs, state, telemetry.wanCongested);
    particlesCtrl.update(dt, state, telemetry.wanCongested);
    camDirector.update(dt);

    renderer.render(scene, camera);
  }

  syncUi(false);
  animate();

  return {
    nextGuidedStepOrExit() {
      if (state.guidedStepIdx < GUIDED_SIM_STEPS.length - 1) {
        applyGuidedStep(state.guidedStepIdx + 1);
        return true;
      }
      return false;
    },
    prevGuidedStepOrExit() {
      if (state.guidedStepIdx > 0) {
        applyGuidedStep(state.guidedStepIdx - 1);
        return true;
      }
      return false;
    },
    destroy() {
      clearScheduledCamera();
      if (animId !== null) cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', onResize);
      camDirector.dispose();
      renderer.dispose();
    }
  };
}
