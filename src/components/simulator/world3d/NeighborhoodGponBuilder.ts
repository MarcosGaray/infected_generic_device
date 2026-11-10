import * as THREE from 'three';
import { SimulationState } from '../../../types';
import { getInfectionSeverityRgb } from '../SimTelemetryEngine';
import {
  createAsphaltRoadTexture,
  createOdbNapFrontTexture,
  createOltTopBezelTexture
} from './ProceduralTextures';
import { createLushTree } from './SimsHouseBuilder';

export interface NeighborHouseSlot {
  group: THREE.Group;
  roofMat: THREE.MeshStandardMaterial;
  fiberCurveToSplitter: THREE.CatmullRomCurve3;
  fiberMat: THREE.MeshStandardMaterial;
  fiberLine: THREE.Mesh;
}

export interface NeighborhoodGponRefs {
  splitterPos: THREE.Vector3;
  oltPos: THREE.Vector3;
  heroDropCurve: THREE.CatmullRomCurve3;
  heroDropMat: THREE.MeshStandardMaterial;
  trunkCurve: THREE.CatmullRomCurve3;
  trunkMat: THREE.MeshStandardMaterial;
  splitterCoreMat: THREE.MeshStandardMaterial;
  oltPortStripMat: THREE.MeshStandardMaterial;
  neighborSlots: NeighborHouseSlot[];
}

/**
 * Builds the detailed pole-mounted ODB / Caja NAP ("ODB") modeled after NAP.png
 */
function buildDetailedOdbNap(
  scene: THREE.Scene,
  splitterPos: THREE.Vector3
): THREE.MeshStandardMaterial {
  const odbGroup = new THREE.Group();
  odbGroup.position.set(splitterPos.x, 0, splitterPos.z);
  // Orient the front cover toward the viewer / camera
  odbGroup.rotation.y = -0.35;
  scene.add(odbGroup);

  // 1. Weathered wooden utility pole
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x78593f, roughness: 0.88 });
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.3, 5.4, 16), poleMat);
  pole.position.set(0, 2.7, -0.42);
  pole.castShadow = true;
  pole.receiveShadow = true;
  odbGroup.add(pole);

  // Galvanized steel crossarm & pole clamp bands
  const steelMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.65,
    roughness: 0.35
  });
  const crossArm = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.14, 0.16), steelMat);
  crossArm.position.set(0, 4.45, -0.22);
  crossArm.castShadow = true;
  odbGroup.add(crossArm);

  [2.2, 3.35, 4.45].forEach((py) => {
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.08, 16), steelMat);
    band.position.set(0, py, -0.42);
    odbGroup.add(band);
  });

  // 2. Coiled black fiber-optic reserve loop behind the NAP box (like NAP.png)
  const coilMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.45 });
  for (let c = 0; c < 3; c++) {
    const coil = new THREE.Mesh(
      new THREE.TorusGeometry(0.92 + c * 0.05, 0.04, 10, 32),
      coilMat
    );
    coil.position.set(0.08, 2.75, -0.22 + c * 0.03);
    coil.castShadow = true;
    odbGroup.add(coil);
  }

  // 3. Dark charcoal ODB NAP Enclosure
  const darkBoxMat = new THREE.MeshStandardMaterial({
    color: 0x23272c,
    roughness: 0.42,
    metalness: 0.15
  });
  const frontTex = createOdbNapFrontTexture();
  const frontCoverMat = new THREE.MeshStandardMaterial({
    map: frontTex,
    roughness: 0.38,
    metalness: 0.1
  });

  // Box materials: [+x, -x, +y, -y, +z (front), -z (back)]
  const napMaterials = [
    darkBoxMat,
    darkBoxMat,
    darkBoxMat,
    darkBoxMat,
    frontCoverMat,
    darkBoxMat
  ];
  const napBox = new THREE.Mesh(new THREE.BoxGeometry(1.35, 1.75, 0.56), napMaterials);
  napBox.position.set(0, splitterPos.y + 0.35, 0.05);
  napBox.castShadow = true;
  napBox.receiveShadow = true;
  odbGroup.add(napBox);

  // Left hinge knuckles & right security latches
  [-0.5, 0, 0.5].forEach((dy) => {
    const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.24, 10), darkBoxMat);
    hinge.position.set(-0.7, splitterPos.y + 0.35 + dy, 0.1);
    odbGroup.add(hinge);
  });
  [-0.35, 0.35].forEach((dy) => {
    const latch = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.28, 0.26), darkBoxMat);
    latch.position.set(0.7, splitterPos.y + 0.35 + dy, 0.12);
    odbGroup.add(latch);
  });

  // 4. Four black bottom drop-port glands + feeder glands (exactly like NAP.png)
  [-0.42, -0.14, 0.14, 0.42].forEach((dx) => {
    const gland = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.34, 12), coilMat);
    gland.position.set(dx, splitterPos.y - 0.66, 0.05);
    odbGroup.add(gland);
  });

  // Luminous optical status collar on top of the ODB so traffic/infection color is clear
  const splitterCoreMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.95,
    roughness: 0.2
  });
  const statusBar = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.14, 0.48), splitterCoreMat);
  statusBar.position.set(0, splitterPos.y + 1.3, 0.08);
  odbGroup.add(statusBar);

  return splitterCoreMat;
}

/**
 * Builds the detailed OLT GPON 19-inch OLT subrack modeled after olt.png
 */
function buildDetailedOlt(
  scene: THREE.Scene,
  oltPos: THREE.Vector3
): THREE.MeshStandardMaterial {
  const oltGroup = new THREE.Group();
  oltGroup.position.set(oltPos.x, 0, oltPos.z);
  oltGroup.rotation.y = -0.48;
  scene.add(oltGroup);

  // Concrete pad & dark telecom cabinet frame
  const pad = new THREE.Mesh(
    new THREE.BoxGeometry(6.2, 0.24, 3.6),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.85 })
  );
  pad.position.set(0, 0.12, 0);
  pad.receiveShadow = true;
  oltGroup.add(pad);

  const chassisMat = new THREE.MeshStandardMaterial({
    color: 0x1e2229,
    roughness: 0.4,
    metalness: 0.45
  });
  const earMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    roughness: 0.3,
    metalness: 0.7
  });

  // Main subrack housing (width: 5.2, height: 4.5, depth: 2.3)
  const chassisBody = new THREE.Mesh(new THREE.BoxGeometry(5.1, 4.5, 2.3), chassisMat);
  chassisBody.position.set(0, 2.5, 0);
  chassisBody.castShadow = true;
  chassisBody.receiveShadow = true;
  oltGroup.add(chassisBody);

  // Left and Right 19" Rack Mounting Ears with bolt slots (matching olt.png)
  [-2.72, 2.72].forEach((ex) => {
    const ear = new THREE.Mesh(new THREE.BoxGeometry(0.36, 4.45, 0.14), earMat);
    ear.position.set(ex, 2.5, 1.08);
    oltGroup.add(ear);

    // Dark mounting screw holes along rack ears
    for (let by = 0.65; by <= 4.35; by += 0.52) {
      const hole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.055, 0.16, 10),
        new THREE.MeshStandardMaterial({ color: 0x0f172a })
      );
      hole.rotation.x = Math.PI / 2;
      hole.position.set(ex, by, 1.09);
      oltGroup.add(hole);
    }
  });

  // Top Bezel with "OLT GPON", STATUS LED, and caution labels
  const topBezelTex = createOltTopBezelTexture();
  const topBezel = new THREE.Mesh(
    new THREE.BoxGeometry(5.05, 0.56, 0.12),
    new THREE.MeshStandardMaterial({ map: topBezelTex, roughness: 0.35 })
  );
  topBezel.position.set(0, 4.42, 1.14);
  oltGroup.add(topBezel);

  // Left Power Modules (P0 & P1) with blue NEG(-)/RTN(+) terminal blocks
  const pwrSlot = new THREE.Mesh(
    new THREE.BoxGeometry(0.46, 3.1, 0.12),
    new THREE.MeshStandardMaterial({ color: 0x2d333d, roughness: 0.45 })
  );
  pwrSlot.position.set(-2.22, 2.48, 1.14);
  oltGroup.add(pwrSlot);

  [1.75, 3.15].forEach((py) => {
    const blueTerm = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.42, 0.16),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 })
    );
    blueTerm.position.set(-2.22, py, 1.16);
    oltGroup.add(blueTerm);
  });

  // 18 Vertical GPON Service & Control Blades across the subrack
  const bladeFaceMat = new THREE.MeshStandardMaterial({
    color: 0x323842,
    roughness: 0.38,
    metalness: 0.35
  });
  const controlBladeMat = new THREE.MeshStandardMaterial({
    color: 0x262b33,
    roughness: 0.35,
    metalness: 0.4
  });
  const leverMat = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1,
    metalness: 0.8,
    roughness: 0.2
  });
  const sfpCageMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.75,
    roughness: 0.25
  });
  const oltPortStripMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    emissive: 0x10b981,
    emissiveIntensity: 1.1
  });

  for (let slot = 0; slot < 18; slot++) {
    const bx = -1.82 + slot * 0.24;
    const isControlBoard = slot === 8 || slot === 9;

    // Vertical blade faceplate
    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(0.205, 3.08, 0.1),
      isControlBoard ? controlBladeMat : bladeFaceMat
    );
    blade.position.set(bx, 2.48, 1.14);
    oltGroup.add(blade);

    // Top and bottom metallic silver ejector levers (matching olt.png!)
    const topLever = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.24, 0.16), leverMat);
    topLever.position.set(bx, 3.88, 1.18);
    oltGroup.add(topLever);

    const botLever = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.24, 0.16), leverMat);
    botLever.position.set(bx, 1.08, 1.18);
    oltGroup.add(botLever);

    // Vertical column of SFP GPON ports + active LED strip
    for (let p = 0; p < 8; p++) {
      const py = 1.42 + p * 0.28;
      const sfp = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.12), sfpCageMat);
      sfp.position.set(bx, py, 1.17);
      oltGroup.add(sfp);
    }

    const ledDot = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 8), oltPortStripMat);
    ledDot.position.set(bx, 3.62, 1.2);
    oltGroup.add(ledDot);
  }

  // Bottom yellow caution line + dark honeycomb airflow vent grille
  const yellowLine = new THREE.Mesh(
    new THREE.BoxGeometry(4.95, 0.06, 0.12),
    new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xfacc15, emissiveIntensity: 0.3 })
  );
  yellowLine.position.set(0, 0.86, 1.15);
  oltGroup.add(yellowLine);

  const ventGrille = new THREE.Mesh(
    new THREE.BoxGeometry(4.95, 0.45, 0.1),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 })
  );
  ventGrille.position.set(0, 0.56, 1.14);
  oltGroup.add(ventGrille);

  return oltPortStripMat;
}

export function buildNeighborhoodGpon(
  scene: THREE.Scene,
  heroOnuWorldPos: THREE.Vector3
): NeighborhoodGponRefs {
  const splitterPos = new THREE.Vector3(14.5, 2.2, -3.5);
  const oltPos = new THREE.Vector3(28.0, 2.5, -10.0);

  // 0. Neighborhood Streets & Nature (Trees) matching the green reference screenshot
  const roadTex = createAsphaltRoadTexture();
  const aveRoadMat = new THREE.MeshStandardMaterial({ map: roadTex, roughness: 0.85 });

  // Horizontal streets between neighborhood house rows
  [-8.6, -21.0].forEach((rz) => {
    const street = new THREE.Mesh(new THREE.PlaneGeometry(85, 3.2), aveRoadMat);
    street.rotation.x = -Math.PI / 2;
    street.position.set(8, 0.015, rz);
    street.receiveShadow = true;
    scene.add(street);
  });

  // Connecting road along the ODB & OLT corridor
  const connectorRoad = new THREE.Mesh(new THREE.PlaneGeometry(42, 3.6), aveRoadMat);
  connectorRoad.rotation.x = -Math.PI / 2;
  connectorRoad.rotation.z = Math.PI / 2;
  connectorRoad.position.set(16.0, 0.018, -11.0);
  connectorRoad.receiveShadow = true;
  scene.add(connectorRoad);

  // Lush deciduous trees distributed around the neighborhood & GPON corridor
  const neighborhoodTrees: Array<[number, number, number]> = [
    [-18.5, -12.0, 1.15],
    [-18.0, -22.5, 1.25],
    [13.0, 3.2, 1.12],
    [18.8, 3.5, 1.2],
    [22.5, -2.5, 1.18],
    [33.8, -6.5, 1.3],
    [33.5, -15.5, 1.22],
    [24.5, -17.5, 1.15],
    [12.0, -7.2, 0.95],
    [21.0, -11.5, 1.05]
  ];
  neighborhoodTrees.forEach(([tx, tz, sc]) => {
    scene.add(createLushTree(tx, tz, sc));
  });

  // 1. Detailed Pole-Mounted ODB / Caja NAP (ODB)
  const splitterCoreMat = buildDetailedOdbNap(scene, splitterPos);

  // 2. Detailed OLT GPON subrack
  const oltPortStripMat = buildDetailedOlt(scene, oltPos);

  // 3. Hero House Drop Fiber (ONU -> ODB bottom drop ports)
  const odbDropEntry = new THREE.Vector3(splitterPos.x - 0.15, splitterPos.y - 0.55, splitterPos.z + 0.05);
  const heroDropCurve = new THREE.CatmullRomCurve3([
    heroOnuWorldPos.clone(),
    new THREE.Vector3(8.5, 2.3, 0.2),
    new THREE.Vector3(11.8, 2.5, -1.6),
    odbDropEntry.clone()
  ]);
  const heroDropMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.75
  });
  const heroDropTube = new THREE.Mesh(
    new THREE.TubeGeometry(heroDropCurve, 32, 0.055, 8, false),
    heroDropMat
  );
  scene.add(heroDropTube);

  // 4. Shared GPON upstream trunk (ODB -> OLT GPON)
  const trunkCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(splitterPos.x + 0.2, splitterPos.y + 0.8, splitterPos.z - 0.15),
    new THREE.Vector3(19.5, 3.4, -5.8),
    new THREE.Vector3(24.0, 3.2, -8.2),
    new THREE.Vector3(oltPos.x - 0.6, oltPos.y + 0.2, oltPos.z + 0.8)
  ]);
  const trunkMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.9
  });
  const trunkTube = new THREE.Mesh(
    new THREE.TubeGeometry(trunkCurve, 44, 0.14, 12, false),
    trunkMat
  );
  scene.add(trunkTube);

  // 5. Neighboring Houses Grid (up to 127 additional houses = 128 total ONUs)
  // Requirement #1: NO diamonds/octahedrons above the neighborhood houses!
  // Requirement #4: Every active house has its fiber cable connected to the ODB.
  const neighborSlots: NeighborHouseSlot[] = [];
  const wallGeo = new THREE.BoxGeometry(1.68, 1.12, 1.48);
  const roofGeo = new THREE.ConeGeometry(1.42, 0.84, 4);

  for (let i = 0; i < 127; i++) {
    const col = i % 16;
    const row = Math.floor(i / 16);
    const hx = -14 + col * 2.85;
    const hz = -11.5 - row * 3.1;

    const hGroup = new THREE.Group();
    hGroup.position.set(hx, 0, hz);

    const wallMesh = new THREE.Mesh(
      wallGeo,
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 })
    );
    wallMesh.position.y = 0.56;
    wallMesh.castShadow = true;
    wallMesh.receiveShadow = true;
    hGroup.add(wallMesh);

    const roofMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.55 });
    const roofMesh = new THREE.Mesh(roofGeo, roofMat);
    roofMesh.position.y = 1.48;
    roofMesh.rotation.y = Math.PI / 4;
    roofMesh.castShadow = true;
    hGroup.add(roofMesh);

    scene.add(hGroup);

    const fiberCurveToSplitter = new THREE.CatmullRomCurve3([
      new THREE.Vector3(hx, 0.9, hz),
      new THREE.Vector3(
        hx * 0.45 + odbDropEntry.x * 0.55,
        1.75 + (row % 3) * 0.25,
        hz * 0.45 + odbDropEntry.z * 0.55
      ),
      odbDropEntry.clone()
    ]);

    const fiberMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.42
    });

    const fiberLine = new THREE.Mesh(
      new THREE.TubeGeometry(fiberCurveToSplitter, 12, 0.022, 5, false),
      fiberMat
    );
    scene.add(fiberLine);

    neighborSlots.push({
      group: hGroup,
      roofMat,
      fiberCurveToSplitter,
      fiberMat,
      fiberLine
    });
  }

  return {
    splitterPos,
    oltPos,
    heroDropCurve,
    heroDropMat,
    trunkCurve,
    trunkMat,
    splitterCoreMat,
    oltPortStripMat,
    neighborSlots
  };
}

export function updateNeighborhoodVisuals(
  refs: NeighborhoodGponRefs,
  state: SimulationState,
  wanCongested: boolean
): void {
  const isBlockedOrReplaced =
    state.lanPortDisabled ||
    state.macBlacklistActive ||
    state.tvBoxReplaced ||
    state.hardResetCountdown > 0;
  const activeExtraInfected = isBlockedOrReplaced ? 0 : Math.max(0, state.infectedCount - 1);
  const infColor = getInfectionSeverityRgb(state.infectedCount);

  if (wanCongested) {
    refs.heroDropMat.color.setHex(infColor.hex);
    refs.heroDropMat.emissive.setHex(infColor.hex);
    refs.trunkMat.color.setHex(infColor.hex);
    refs.trunkMat.emissive.setHex(infColor.hex);
    refs.splitterCoreMat.color.setHex(infColor.hex);
    refs.splitterCoreMat.emissive.setHex(infColor.hex);
    refs.oltPortStripMat.color.setHex(infColor.hex);
    refs.oltPortStripMat.emissive.setHex(infColor.hex);
  } else {
    refs.heroDropMat.color.setHex(0x38bdf8);
    refs.heroDropMat.emissive.setHex(0x0284c7);
    refs.trunkMat.color.setHex(0x38bdf8);
    refs.trunkMat.emissive.setHex(0x0284c7);
    refs.splitterCoreMat.color.setHex(0x38bdf8);
    refs.splitterCoreMat.emissive.setHex(0x0284c7);
    refs.oltPortStripMat.color.setHex(0x10b981);
    refs.oltPortStripMat.emissive.setHex(0x10b981);
  }

  refs.neighborSlots.forEach((slot, idx) => {
    const isVisible = idx < state.ponDensity - 1;
    slot.group.visible = isVisible;
    slot.fiberLine.visible = isVisible;
    if (!isVisible) return;

    const isHouseInfected = idx < activeExtraInfected;
    if (isHouseInfected) {
      slot.roofMat.color.setHex(infColor.hex);
      slot.fiberMat.color.setHex(infColor.hex);
      slot.fiberMat.emissive.setHex(infColor.hex);
      slot.fiberMat.opacity = 0.82;
    } else if (wanCongested) {
      slot.roofMat.color.setHex(0x7c2d12);
      slot.fiberMat.color.setHex(0x38bdf8);
      slot.fiberMat.emissive.setHex(0x0284c7);
      slot.fiberMat.opacity = 0.35;
    } else {
      slot.roofMat.color.setHex(0x8b4513);
      slot.fiberMat.color.setHex(0x38bdf8);
      slot.fiberMat.emissive.setHex(0x0284c7);
      slot.fiberMat.opacity = 0.42;
    }
  });
}
