import * as THREE from 'three';
import { SimulationState } from '../../../types';
import { getInfectionSeverityRgb } from '../SimTelemetryEngine';
import { NetworkDeviceRefs } from './NetworkDevicesBuilder';
import { NeighborhoodGponRefs } from './NeighborhoodGponBuilder';

type ParticleLane =
  | 'lan-tv-to-pc'
  | 'lan-pc-to-tv'
  | 'lan-tv-to-phone'
  | 'lan-phone-to-tv'
  | 'hero-drop'
  | 'neighbor-drop'
  | 'trunk';

interface FlowParticle {
  mesh: THREE.Mesh;
  mat: THREE.MeshStandardMaterial;
  progress: number;
  speed: number;
  lane: ParticleLane;
  houseIdx?: number;
  lateralOffset?: THREE.Vector3;
}

export interface TrafficParticlesController {
  update: (dt: number, state: SimulationState, wanCongested: boolean) => void;
}

export function createTrafficParticlesSystem(
  scene: THREE.Scene,
  devRefs: NetworkDeviceRefs,
  gponRefs: NeighborhoodGponRefs
): TrafficParticlesController {
  const particles: FlowParticle[] = [];
  const smallSphereGeo = new THREE.SphereGeometry(0.095, 10, 10);
  const dropSphereGeo = new THREE.SphereGeometry(0.085, 8, 8);
  const trunkSphereGeo = new THREE.SphereGeometry(0.155, 12, 12);

  // Bidirectional LAN Curves between TV Box and PC Monitor
  const tvToPcCurve = new THREE.CatmullRomCurve3([
    devRefs.tvBoxPos.clone(),
    new THREE.Vector3(3.65, 1.58, 0.9),
    devRefs.pcPos.clone()
  ]);
  const pcToTvCurve = new THREE.CatmullRomCurve3([
    devRefs.pcPos.clone(),
    new THREE.Vector3(3.45, 1.24, 1.05),
    devRefs.tvBoxPos.clone()
  ]);

  // Bidirectional LAN Curves between TV Box and Smartphone
  const tvToPhoneCurve = new THREE.CatmullRomCurve3([
    devRefs.tvBoxPos.clone(),
    new THREE.Vector3(4.15, 1.44, 0.92),
    devRefs.phonePos.clone()
  ]);
  const phoneToTvCurve = new THREE.CatmullRomCurve3([
    devRefs.phonePos.clone(),
    new THREE.Vector3(3.92, 1.14, 1.08),
    devRefs.tvBoxPos.clone()
  ]);

  const addParticle = (
    geo: THREE.BufferGeometry,
    lane: ParticleLane,
    speed: number,
    houseIdx?: number,
    lateralOffset?: THREE.Vector3
  ) => {
    const mat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x38bdf8,
      emissiveIntensity: 1.45
    });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);
    particles.push({
      mesh,
      mat,
      progress: Math.random(),
      speed,
      lane,
      houseIdx,
      lateralOffset
    });
  };

  // 1. Bidirectional LAN Spying Particles (TV Box <-> PC and TV Box <-> Smartphone)
  for (let i = 0; i < 8; i++) {
    addParticle(smallSphereGeo, 'lan-tv-to-pc', 0.45 + Math.random() * 0.25);
    addParticle(smallSphereGeo, 'lan-pc-to-tv', 0.45 + Math.random() * 0.25);
    addParticle(smallSphereGeo, 'lan-tv-to-phone', 0.48 + Math.random() * 0.25);
    addParticle(smallSphereGeo, 'lan-phone-to-tv', 0.48 + Math.random() * 0.25);
  }

  // 2. Hero House Drop Fiber Particles (Hero ONU -> ODB)
  for (let i = 0; i < 18; i++) {
    addParticle(smallSphereGeo, 'hero-drop', 0.42 + Math.random() * 0.35);
  }

  // 3. All Neighbor Houses Drop Fiber Particles (Every Active House -> ODB)
  for (let h = 0; h < 127; h++) {
    addParticle(dropSphereGeo, 'neighbor-drop', 0.36 + (h % 5) * 0.08, h);
    if (h < 64) {
      // Second wave particle on the first 64 houses for continuous visual flow
      addParticle(dropSphereGeo, 'neighbor-drop', 0.44 + (h % 4) * 0.07, h);
    }
  }

  // 4. Cumulative Trunk Stream Particles (ODB -> OLT GPON)
  for (let i = 0; i < 48; i++) {
    const angle = (i / 48) * Math.PI * 2;
    const radius = (i % 3) * 0.075;
    const offset = new THREE.Vector3(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius,
      Math.sin(angle) * radius * 0.5
    );
    addParticle(trunkSphereGeo, 'trunk', 0.45 + Math.random() * 0.4, undefined, offset);
  }

  return {
    update(dt: number, state: SimulationState, wanCongested: boolean) {
      const isLocalInfected =
        state.infectedCount > 0 && !state.tvBoxReplaced && !(state.hardResetCountdown > 0);
      const isBlocked = state.lanPortDisabled || state.macBlacklistActive;
      const isBlockedOrReplaced =
        isBlocked || state.tvBoxReplaced || state.hardResetCountdown > 0;
      const activeExtraInfected = isBlockedOrReplaced ? 0 : Math.max(0, state.infectedCount - 1);
      const infColor = getInfectionSeverityRgb(state.infectedCount);

      particles.forEach((p) => {
        // Bidirectional LAN Traffic: TV Box <-> PC and TV Box <-> Smartphone
        if (
          p.lane === 'lan-tv-to-pc' ||
          p.lane === 'lan-pc-to-tv' ||
          p.lane === 'lan-tv-to-phone' ||
          p.lane === 'lan-phone-to-tv'
        ) {
          const canSpy = isLocalInfected && !state.guestVlanActive && !isBlocked;
          p.mesh.visible = canSpy;
          if (!canSpy) return;

          p.progress = (p.progress + dt * p.speed * 1.35) % 1;

          if (p.lane === 'lan-tv-to-pc') {
            p.mesh.position.copy(tvToPcCurve.getPointAt(p.progress));
            p.mat.color.setHex(infColor.hex);
            p.mat.emissive.setHex(infColor.hex);
          } else if (p.lane === 'lan-pc-to-tv') {
            p.mesh.position.copy(pcToTvCurve.getPointAt(p.progress));
            p.mat.color.setHex(0x38bdf8);
            p.mat.emissive.setHex(0x38bdf8);
          } else if (p.lane === 'lan-tv-to-phone') {
            p.mesh.position.copy(tvToPhoneCurve.getPointAt(p.progress));
            p.mat.color.setHex(infColor.hex);
            p.mat.emissive.setHex(infColor.hex);
          } else {
            p.mesh.position.copy(phoneToTvCurve.getPointAt(p.progress));
            p.mat.color.setHex(0x38bdf8);
            p.mat.emissive.setHex(0x38bdf8);
          }
          return;
        }

        // Hero House Drop Cable -> ODB
        if (p.lane === 'hero-drop') {
          p.mesh.visible = !isBlocked;
          if (isBlocked) return;

          const spd = wanCongested ? p.speed * 2.15 : p.speed * 0.8;
          p.progress = (p.progress + dt * spd) % 1;
          p.mesh.position.copy(gponRefs.heroDropCurve.getPointAt(p.progress));
          const col = wanCongested ? infColor.hex : 0x38bdf8;
          p.mat.color.setHex(col);
          p.mat.emissive.setHex(col);
          return;
        }

        // Neighbor Houses Drop Cables -> ODB (all active houses up to ponDensity - 1)
        if (p.lane === 'neighbor-drop') {
          const hIdx = p.houseIdx ?? 0;
          const isHouseActive = hIdx < state.ponDensity - 1;
          p.mesh.visible = isHouseActive;
          if (!isHouseActive) return;

          const slot = gponRefs.neighborSlots[hIdx];
          const isHouseInfected = hIdx < activeExtraInfected;
          const spd = isHouseInfected ? p.speed * 2.1 : p.speed * 0.78;
          p.progress = (p.progress + dt * spd) % 1;
          p.mesh.position.copy(slot.fiberCurveToSplitter.getPointAt(p.progress));

          const col = isHouseInfected ? infColor.hex : 0x38bdf8;
          p.mat.color.setHex(col);
          p.mat.emissive.setHex(col);
          return;
        }

        // Cumulative Trunk Stream: ODB -> OLT
        p.mesh.visible = true;
        const densityBoost = 0.8 + (state.ponDensity / 128) * 0.6;
        const spd = (wanCongested ? p.speed * 2.35 : p.speed * 0.9) * densityBoost;
        p.progress = (p.progress + dt * spd) % 1;
        const pt = gponRefs.trunkCurve.getPointAt(p.progress);
        if (p.lateralOffset) {
          pt.add(p.lateralOffset);
        }
        p.mesh.position.copy(pt);
        const col = wanCongested ? infColor.hex : 0x38bdf8;
        p.mat.color.setHex(col);
        p.mat.emissive.setHex(col);
      });
    }
  };
}
