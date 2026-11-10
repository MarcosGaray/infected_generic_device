import * as THREE from 'three';
import { SimulationState } from '../../../types';
import { getInfectionSeverityRgb } from '../SimTelemetryEngine';

export interface NetworkDeviceRefs {
  tvScreenMat: THREE.MeshStandardMaterial;
  maliciousBoxGroup: THREE.Group;
  certifiedBoxGroup: THREE.Group;
  tvBoxBodyMat: THREE.MeshStandardMaterial;
  tvBoxChipMat: THREE.MeshStandardMaterial;
  tvBoxGlowLight: THREE.PointLight;
  onuLedPonMat: THREE.MeshStandardMaterial;
  onuLedLan4Mat: THREE.MeshStandardMaterial;
  utpCableMat: THREE.MeshStandardMaterial;
  portLockBadge: THREE.Group;
  guestShieldDome: THREE.Mesh;
  pcScreenMat: THREE.MeshStandardMaterial;
  tvBoxPos: THREE.Vector3;
  onuPos: THREE.Vector3;
  pcPos: THREE.Vector3;
  phonePos: THREE.Vector3;
}

export function buildNetworkDevicesInHouse(houseGroup: THREE.Group): NetworkDeviceRefs {
  // Media & ONU Console along the right wall of the Studio (x = 5.1, z = -0.2)
  const mediaCabinet = new THREE.Mesh(
    new THREE.BoxGeometry(1.1, 0.72, 2.8),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.45 })
  );
  mediaCabinet.position.set(5.1, 0.65, -0.2);
  mediaCabinet.castShadow = true;
  mediaCabinet.receiveShadow = true;
  houseGroup.add(mediaCabinet);

  // 55" Smart TV mounted above console
  const tvFrame = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 1.25, 2.15),
    new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.3 })
  );
  tvFrame.position.set(5.55, 1.95, -0.2);
  tvFrame.castShadow = true;
  houseGroup.add(tvFrame);

  const tvScreenMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    emissive: 0x0284c7,
    emissiveIntensity: 0.55,
    roughness: 0.2
  });
  const tvScreen = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.12, 2.02), tvScreenMat);
  tvScreen.position.set(5.48, 1.95, -0.2);
  houseGroup.add(tvScreen);

  const tvBoxPos = new THREE.Vector3(4.95, 1.12, -0.95);

  // 1A. Malicious Generic AOSP TV Box Group
  const maliciousBoxGroup = new THREE.Group();
  maliciousBoxGroup.position.copy(tvBoxPos);
  houseGroup.add(maliciousBoxGroup);

  const tvBoxBodyMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.35,
    metalness: 0.3
  });
  const tvBoxMesh = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.14, 0.52), tvBoxBodyMat);
  tvBoxMesh.castShadow = true;
  maliciousBoxGroup.add(tvBoxMesh);

  const tvBoxChipMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xfbbf24,
    emissiveIntensity: 1.2
  });
  const tvBoxChip = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.06, 0.24), tvBoxChipMat);
  tvBoxChip.position.set(0, 0.09, 0);
  maliciousBoxGroup.add(tvBoxChip);

  // 1B. Certified equipo certificado TV Box Group (White/Emerald)
  const certifiedBoxGroup = new THREE.Group();
  certifiedBoxGroup.position.copy(tvBoxPos);
  certifiedBoxGroup.visible = false;
  houseGroup.add(certifiedBoxGroup);

  const certBody = new THREE.Mesh(
    new THREE. CylinderGeometry(0.32, 0.34, 0.13, 24),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.22, metalness: 0.15 })
  );
  certBody.castShadow = true;
  certifiedBoxGroup.add(certBody);

  const certBadge = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.18, 0.04, 20),
    new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x10b981,
      emissiveIntensity: 1.1
    })
  );
  certBadge.position.set(0, 0.075, 0);
  certifiedBoxGroup.add(certBadge);

  const tvBoxGlowLight = new THREE.PointLight(0xfbbf24, 1.5, 4.5);
  tvBoxGlowLight.position.set(tvBoxPos.x, tvBoxPos.y + 0.4, tvBoxPos.z);
  houseGroup.add(tvBoxGlowLight);

  // 2. ONU/ONT genérica White ONU with 4 Antennas on right side of media cabinet
  const onuPos = new THREE.Vector3(4.95, 1.14, 0.65);
  const onuWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25 });
  const onuBody = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.16, 0.78), onuWhiteMat);
  onuBody.position.copy(onuPos);
  onuBody.castShadow = true;
  houseGroup.add(onuBody);

  [-0.28, -0.1, 0.1, 0.28].forEach((dz) => {
    const ant = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.024, 0.52, 10),
      onuWhiteMat
    );
    ant.position.set(onuPos.x + 0.22, onuPos.y + 0.28, onuPos.z + dz);
    ant.rotation.z = -0.15;
    ant.castShadow = true;
    houseGroup.add(ant);
  });

  // ONU Status LEDs (PON LED & LAN4 LED)
  const onuLedPonMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    emissive: 0x10b981,
    emissiveIntensity: 1.4
  });
  const ledPon = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 10), onuLedPonMat);
  ledPon.position.set(onuPos.x - 0.18, onuPos.y + 0.09, onuPos.z - 0.16);
  houseGroup.add(ledPon);

  const onuLedLan4Mat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    emissive: 0x10b981,
    emissiveIntensity: 1.4
  });
  const ledLan4 = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 10), onuLedLan4Mat);
  ledLan4.position.set(onuPos.x - 0.18, onuPos.y + 0.09, onuPos.z + 0.16);
  houseGroup.add(ledLan4);

  // Yellow UTP Patch Cord from TV Box to ONU LAN4 Port
  const utpCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(tvBoxPos.x, tvBoxPos.y, tvBoxPos.z + 0.24),
    new THREE.Vector3(tvBoxPos.x - 0.28, tvBoxPos.y - 0.04, (tvBoxPos.z + onuPos.z) / 2),
    new THREE.Vector3(onuPos.x, onuPos.y, onuPos.z - 0.35)
  ]);
  const utpCableMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xfbbf24,
    emissiveIntensity: 0.35,
    roughness: 0.4
  });
  const utpCable = new THREE.Mesh(new THREE.TubeGeometry(utpCurve, 20, 0.025, 8, false), utpCableMat);
  houseGroup.add(utpCable);

  // Port-lock ring badge above the ONU when blocked
  const portLockBadge = new THREE.Group();
  portLockBadge.position.set(onuPos.x, onuPos.y + 0.58, onuPos.z);
  portLockBadge.visible = false;
  const lockRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.18, 0.045, 12, 24),
    new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x10b981,
      emissiveIntensity: 1.1
    })
  );
  lockRing.rotation.y = Math.PI / 2;
  portLockBadge.add(lockRing);
  houseGroup.add(portLockBadge);

  // 3. PC Monitor on the White Corner Desk (x: 2.35, y: 1.38, z: 2.85)
  const pcPos = new THREE.Vector3(2.35, 1.38, 2.85);
  const pcMonitorFrame = new THREE.Mesh(
    new THREE.BoxGeometry(0.88, 0.54, 0.06),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 })
  );
  pcMonitorFrame.position.copy(pcPos);
  pcMonitorFrame.castShadow = true;
  houseGroup.add(pcMonitorFrame);

  const pcScreenMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.7
  });
  const pcScreen = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.46, 0.07), pcScreenMat);
  pcScreen.position.copy(pcPos);
  houseGroup.add(pcScreen);

  // 4. Smartphone on the Desk beside the Monitor (x: 3.05, y: 1.1, z: 2.75)
  const phonePos = new THREE.Vector3(3.05, 1.1, 2.75);
  const phoneBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.035, 0.4),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 })
  );
  phoneBody.position.copy(phonePos);
  phoneBody.castShadow = true;
  houseGroup.add(phoneBody);

  const phoneScreen = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.04, 0.34),
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.75
    })
  );
  phoneScreen.position.copy(phonePos);
  houseGroup.add(phoneScreen);

  // 5. Guest Wi-Fi L2 Protection Shield Dome over the Desk (PC + Smartphone)
  const guestShieldDome = new THREE.Mesh(
    new THREE.SphereGeometry(1.55, 28, 20, 0, Math.PI * 2, 0, Math.PI * 0.55),
    new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.32,
      roughness: 0.1,
      wireframe: false,
      side: THREE.DoubleSide
    })
  );
  guestShieldDome.position.set(2.55, 0.3, 2.75);
  guestShieldDome.visible = false;
  houseGroup.add(guestShieldDome);

  return {
    tvScreenMat,
    maliciousBoxGroup,
    certifiedBoxGroup,
    tvBoxBodyMat,
    tvBoxChipMat,
    tvBoxGlowLight,
    onuLedPonMat,
    onuLedLan4Mat,
    utpCableMat,
    portLockBadge,
    guestShieldDome,
    pcScreenMat,
    tvBoxPos,
    onuPos,
    pcPos,
    phonePos
  };
}

export function updateNetworkDevicesVisuals(
  refs: NetworkDeviceRefs,
  state: SimulationState,
  clockTime: number
): void {
  const isLocalInfected =
    state.infectedCount > 0 && !state.tvBoxReplaced && !(state.hardResetCountdown > 0);
  const isBlocked = state.lanPortDisabled || state.macBlacklistActive;
  const infColor = getInfectionSeverityRgb(state.infectedCount);

  refs.guestShieldDome.visible = state.guestVlanActive;
  refs.portLockBadge.visible = isBlocked;
  if (isBlocked) {
    refs.portLockBadge.rotation.y = clockTime * 2.0;
  }

  // Handle 3D Physical Swap Animation between Malicious TV Box and Certified TV Box
  if (state.tvBoxReplaced) {
    const anim = state.tvBoxSwapAnim; // 1.0 -> 0.0 during swap
    const p = 1.0 - anim; // 0.0 -> 1.0

    if (p < 0.58) {
      // Malicious box lifts up, tilts, and slides away to the front-left
      const tOut = Math.min(1, p / 0.55);
      refs.maliciousBoxGroup.visible = true;
      refs.maliciousBoxGroup.position.set(
        refs.tvBoxPos.x - tOut * 1.15,
        refs.tvBoxPos.y + Math.sin(tOut * Math.PI * 0.7) * 0.85 + tOut * 0.35,
        refs.tvBoxPos.z - tOut * 0.75
      );
      refs.maliciousBoxGroup.rotation.set(tOut * 0.35, tOut * 0.8, tOut * 0.45);
      refs.maliciousBoxGroup.scale.setScalar(Math.max(0.01, 1 - tOut * 0.65));
    } else {
      refs.maliciousBoxGroup.visible = false;
    }

    if (p > 0.32) {
      // Certified white/emerald box descends smoothly into place on the media cabinet
      const tIn = Math.min(1, (p - 0.32) / 0.68);
      const easeOut = 1 - Math.pow(1 - tIn, 3);
      refs.certifiedBoxGroup.visible = true;
      refs.certifiedBoxGroup.position.set(
        refs.tvBoxPos.x,
        refs.tvBoxPos.y + (1 - easeOut) * 1.25,
        refs.tvBoxPos.z
      );
      refs.certifiedBoxGroup.rotation.set(0, (1 - easeOut) * Math.PI, 0);
      refs.certifiedBoxGroup.scale.setScalar(0.3 + easeOut * 0.7);
    } else {
      refs.certifiedBoxGroup.visible = false;
    }

    refs.tvBoxGlowLight.color.setHex(0x10b981);
    refs.tvScreenMat.color.setHex(0x10b981);
    refs.tvScreenMat.emissive.setHex(0x059669);
  } else {
    // Normal / Infected state with the generic AOSP TV Box sitting at tvBoxPos
    refs.maliciousBoxGroup.visible = true;
    refs.maliciousBoxGroup.position.copy(refs.tvBoxPos);
    refs.maliciousBoxGroup.rotation.set(0, 0, 0);
    refs.maliciousBoxGroup.scale.setScalar(1);
    refs.certifiedBoxGroup.visible = false;

    if (state.hardResetCountdown > 0) {
      // Factory Reset rebooting flicker
      const blink = Math.sin(clockTime * 18) > 0 ? 0xfbbf24 : 0x1f2937;
      refs.tvBoxBodyMat.color.setHex(0x1f2937);
      refs.tvBoxChipMat.color.setHex(blink);
      refs.tvBoxChipMat.emissive.setHex(blink);
      refs.tvBoxGlowLight.color.setHex(0xfbbf24);
      refs.tvScreenMat.color.setHex(0x0f172a);
      refs.tvScreenMat.emissive.setHex(0x1e293b);
    } else if (isLocalInfected) {
      const pulse = 0.6 + Math.sin(clockTime * 9) * 0.4;
      refs.tvBoxBodyMat.color.setHex(0x111827);
      refs.tvBoxChipMat.color.setHex(infColor.hex);
      refs.tvBoxChipMat.emissive.setHex(infColor.hex);
      refs.tvBoxChipMat.emissiveIntensity = 0.8 + pulse;
      refs.tvBoxGlowLight.color.setHex(infColor.hex);
      refs.tvScreenMat.color.setHex(infColor.hex);
      refs.tvScreenMat.emissive.setHex(infColor.hex);
    } else {
      refs.tvBoxBodyMat.color.setHex(0x1e293b);
      refs.tvBoxChipMat.color.setHex(0x38bdf8);
      refs.tvBoxChipMat.emissive.setHex(0x38bdf8);
      refs.tvBoxGlowLight.color.setHex(0x38bdf8);
      refs.tvScreenMat.color.setHex(0x0284c7);
      refs.tvScreenMat.emissive.setHex(0x0284c7);
    }
  }

  // LAN4 LED & UTP Cable colored by dynamic infection severity
  if (isBlocked) {
    refs.onuLedLan4Mat.color.setHex(0x334155);
    refs.onuLedLan4Mat.emissiveIntensity = 0;
    refs.utpCableMat.color.setHex(0x475569);
    refs.utpCableMat.emissiveIntensity = 0;
  } else if (isLocalInfected) {
    refs.onuLedLan4Mat.color.setHex(infColor.hex);
    refs.onuLedLan4Mat.emissive.setHex(infColor.hex);
    refs.onuLedLan4Mat.emissiveIntensity = 1.5;
    refs.utpCableMat.color.setHex(infColor.hex);
    refs.utpCableMat.emissive.setHex(infColor.hex);
    refs.utpCableMat.emissiveIntensity = 0.75;
  } else {
    refs.onuLedLan4Mat.color.setHex(0x10b981);
    refs.onuLedLan4Mat.emissive.setHex(0x10b981);
    refs.onuLedLan4Mat.emissiveIntensity = 1.0;
    refs.utpCableMat.color.setHex(0xfbbf24);
    refs.utpCableMat.emissive.setHex(0xfbbf24);
    refs.utpCableMat.emissiveIntensity = 0.25;
  }
}
