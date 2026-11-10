import * as THREE from 'three';
import {
  createAsphaltRoadTexture,
  createBathroomDiamondTileTexture,
  createExteriorBrickTexture,
  createKitchenGeometricTileTexture,
  createStudioCarpetAndRugTexture
} from './ProceduralTextures';

export interface SimsHouseRefs {
  houseGroup: THREE.Group;
}

/**
 * Helper to create a cutaway wall with an architectural top cap
 */
function createCutawayWall(
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  wallMat: THREE.Material,
  capMat: THREE.Material
): THREE.Group {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
  body.position.set(x, y, z);
  body.castShadow = true;
  body.receiveShadow = true;
  g.add(body);

  const cap = new THREE.Mesh(new THREE.BoxGeometry(w + 0.04, 0.09, d + 0.04), capMat);
  cap.position.set(x, y + h / 2 + 0.045, z);
  g.add(cap);
  return g;
}

/**
 * Helper to create a lush deciduous 3D tree matching the green neighborhood reference image
 */
export function createLushTree(x: number, z: number, scale = 1.0): THREE.Group {
  const tree = new THREE.Group();
  tree.position.set(x, 0, z);
  tree.scale.setScalar(scale);

  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 });
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.36, 2.3, 10), trunkMat);
  trunk.position.y = 1.15;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  tree.add(trunk);

  const leafColors = [0x2e6f1e, 0x3b8226, 0x4b9632, 0x357a22];
  const clusters = [
    { dx: 0, dy: 3.0, dz: 0, r: 1.35 },
    { dx: -0.75, dy: 2.65, dz: 0.45, r: 0.98 },
    { dx: 0.78, dy: 2.7, dz: -0.35, r: 1.02 },
    { dx: 0.25, dy: 2.55, dz: 0.75, r: 0.92 },
    { dx: -0.35, dy: 2.6, dz: -0.75, r: 0.95 },
    { dx: 0, dy: 3.65, dz: 0.1, r: 0.98 }
  ];

  clusters.forEach((c, idx) => {
    const mat = new THREE.MeshStandardMaterial({
      color: leafColors[idx % leafColors.length],
      roughness: 0.78
    });
    const puff = new THREE.Mesh(new THREE.SphereGeometry(c.r, 12, 10), mat);
    puff.position.set(c.dx, c.dy, c.dz);
    puff.castShadow = true;
    puff.receiveShadow = true;
    tree.add(puff);
  });

  return tree;
}

export function buildSimsCutawayHouse(scene: THREE.Scene): SimsHouseRefs {
  const houseGroup = new THREE.Group();
  houseGroup.position.set(0, 0, 0);
  scene.add(houseGroup);

  const brickTex = createExteriorBrickTexture();
  const kitchenTileTex = createKitchenGeometricTileTexture();
  const bathTileTex = createBathroomDiamondTileTexture();
  const studioRugTex = createStudioCarpetAndRugTexture();
  const roadTex = createAsphaltRoadTexture();

  const wallCapMat = new THREE.MeshStandardMaterial({ color: 0x57534e, roughness: 0.5 });
  const kitchenWallMat = new THREE.MeshStandardMaterial({ color: 0x4b4846, roughness: 0.75 });
  const bathWallMat = new THREE.MeshStandardMaterial({ color: 0x28354a, roughness: 0.55 });
  const studioWallMat = new THREE.MeshStandardMaterial({ color: 0x4a353b, roughness: 0.75 });
  const frontLowWallMat = new THREE.MeshStandardMaterial({ map: brickTex, roughness: 0.85 });

  // 0. PAVED STREET WITH DOUBLE YELLOW LINES & SIDEWALK IN FRONT OF THE HOUSE
  const frontRoad = new THREE.Mesh(
    new THREE.PlaneGeometry(110, 4.8),
    new THREE.MeshStandardMaterial({ map: roadTex, roughness: 0.85 })
  );
  frontRoad.rotation.x = -Math.PI / 2;
  frontRoad.position.set(6, 0.02, 8.6);
  frontRoad.receiveShadow = true;
  scene.add(frontRoad);

  // Concrete front walkway & driveway connecting the house to the street sidewalk
  const walkwayMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.8 });
  const frontWalkway = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.04, 2.2), walkwayMat);
  frontWalkway.position.set(-1.5, 0.02, 6.1);
  frontWalkway.receiveShadow = true;
  houseGroup.add(frontWalkway);

  const sideDriveway = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.04, 5.2), walkwayMat);
  sideDriveway.position.set(-9.1, 0.02, 3.6);
  sideDriveway.receiveShadow = true;
  houseGroup.add(sideDriveway);

  // Base foundation slab (13m wide x 10m deep)
  const foundation = new THREE.Mesh(
    new THREE.BoxGeometry(13.4, 0.28, 10.4),
    new THREE.MeshStandardMaterial({ color: 0xb94a38, roughness: 0.8 })
  );
  foundation.position.set(0, 0.14, 0);
  foundation.receiveShadow = true;
  foundation.castShadow = true;
  houseGroup.add(foundation);

  // 1. FLOOR ZONES
  // Left Room: Kitchen & Dining (x: -6.4 to -0.6, z: -1.0 to 4.9)
  const kitchenFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(5.8, 5.9),
    new THREE.MeshStandardMaterial({ map: kitchenTileTex, roughness: 0.45 })
  );
  kitchenFloor.rotation.x = -Math.PI / 2;
  kitchenFloor.position.set(-3.5, 0.29, 1.95);
  kitchenFloor.receiveShadow = true;
  houseGroup.add(kitchenFloor);

  // Top-Left/Center Room: Bathroom (x: -6.4 to -0.6, z: -4.9 to -1.0)
  const bathFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(5.8, 3.9),
    new THREE.MeshStandardMaterial({ map: bathTileTex, roughness: 0.35 })
  );
  bathFloor.rotation.x = -Math.PI / 2;
  bathFloor.position.set(-3.5, 0.35, -2.95);
  bathFloor.receiveShadow = true;
  houseGroup.add(bathFloor);

  // Right Room: Studio / Bedroom / Living (x: -0.6 to 6.4, z: -4.9 to 4.9)
  const studioFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(7.0, 9.8),
    new THREE.MeshStandardMaterial({ map: studioRugTex, roughness: 0.8 })
  );
  studioFloor.rotation.x = -Math.PI / 2;
  studioFloor.position.set(2.9, 0.29, 0);
  studioFloor.receiveShadow = true;
  houseGroup.add(studioFloor);

  // 2. HIGH BACK & SIDE WALLS + INTERIOR PARTITIONS (Cutaway Style)
  const wallH = 3.5;
  const wallY = 0.28 + wallH / 2;

  houseGroup.add(createCutawayWall(6.0, wallH, 0.28, -3.5, wallY, -5.0, bathWallMat, wallCapMat));
  houseGroup.add(createCutawayWall(7.0, wallH, 0.28, 3.0, wallY, -5.0, studioWallMat, wallCapMat));

  houseGroup.add(createCutawayWall(0.28, wallH, 4.0, -6.5, wallY, -3.0, bathWallMat, wallCapMat));
  houseGroup.add(createCutawayWall(0.28, wallH, 6.0, -6.5, wallY, 2.0, kitchenWallMat, wallCapMat));

  houseGroup.add(createCutawayWall(0.28, wallH, 6.2, 6.5, wallY, -1.9, studioWallMat, wallCapMat));
  houseGroup.add(createCutawayWall(0.28, 0.55, 3.8, 6.5, 0.28 + 0.275, 3.1, frontLowWallMat, wallCapMat));

  houseGroup.add(createCutawayWall(13.28, 0.42, 0.28, 0, 0.28 + 0.21, 5.0, frontLowWallMat, wallCapMat));

  houseGroup.add(createCutawayWall(0.24, wallH, 5.6, -0.6, wallY, -2.2, bathWallMat, wallCapMat));
  houseGroup.add(createCutawayWall(4.3, wallH, 0.24, -4.35, wallY, -1.0, kitchenWallMat, wallCapMat));

  // 3. KITCHEN FURNITURE (Left Room)
  const fridgeMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.45, roughness: 0.3 });
  const fridge = new THREE.Mesh(new THREE.BoxGeometry(1.15, 2.25, 1.05), fridgeMat);
  fridge.position.set(-4.35, 1.4, -0.25);
  fridge.castShadow = true;
  fridge.receiveShadow = true;
  houseGroup.add(fridge);

  const handleMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7, roughness: 0.2 });
  [-0.08, 0.08].forEach((hx) => {
    const hdl = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.85), handleMat);
    hdl.position.set(-4.35 + hx, 1.5, 0.3);
    houseGroup.add(hdl);
  });

  const counterMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.35 });
  const counterBase = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.95, 2.7), counterMat);
  counterBase.position.set(-5.85, 0.76, 1.55);
  counterBase.castShadow = true;
  counterBase.receiveShadow = true;
  houseGroup.add(counterBase);

  const sinkBasin = new THREE.Mesh(
    new THREE.BoxGeometry(0.68, 0.12, 0.9),
    new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6, roughness: 0.25 })
  );
  sinkBasin.position.set(-5.82, 1.25, 2.15);
  houseGroup.add(sinkBasin);

  const micro = new THREE.Mesh(
    new THREE.BoxGeometry(0.65, 0.46, 0.9),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.5, roughness: 0.3 })
  );
  micro.position.set(-5.85, 1.48, 0.95);
  micro.castShadow = true;
  houseGroup.add(micro);

  const upperCab = new THREE.Mesh(
    new THREE.BoxGeometry(0.62, 1.05, 1.5),
    new THREE.MeshStandardMaterial({ color: 0xd6d3d1, roughness: 0.4 })
  );
  upperCab.position.set(-6.02, 2.45, 1.15);
  upperCab.castShadow = true;
  houseGroup.add(upperCab);

  const clockRim = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.28, 0.08, 24),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.5, roughness: 0.2 })
  );
  clockRim.rotation.x = Math.PI / 2;
  clockRim.position.set(-4.35, 3.05, -0.84);
  houseGroup.add(clockRim);

  const tableTop = new THREE.Mesh(
    new THREE.BoxGeometry(1.3, 0.08, 1.3),
    new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.25 })
  );
  tableTop.position.set(-2.6, 0.98, 2.7);
  tableTop.castShadow = true;
  houseGroup.add(tableTop);

  const fruitBowl = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.16, 0.14, 20),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 })
  );
  fruitBowl.position.set(-2.6, 1.08, 2.7);
  houseGroup.add(fruitBowl);

  [
    { c: 0xfacc15, dx: -0.07, dz: 0.04 },
    { c: 0xef4444, dx: 0.08, dz: -0.04 },
    { c: 0xf97316, dx: 0, dz: 0.07 }
  ].forEach((fr) => {
    const fMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.085, 12, 12),
      new THREE.MeshStandardMaterial({ color: fr.c, roughness: 0.3 })
    );
    fMesh.position.set(-2.6 + fr.dx, 1.16, 2.7 + fr.dz);
    houseGroup.add(fMesh);
  });

  const slatMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.6 });
  for (let i = 0; i < 4; i++) {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(0.22, 2.45, 0.38), slatMat);
    slat.position.set(-1.35 + i * 0.28, 1.5, 2.65 - i * 0.25);
    slat.castShadow = true;
    houseGroup.add(slat);
  }

  // 4. BATHROOM FURNITURE (Top-Left Room)
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xcffafe,
    transparent: true,
    opacity: 0.34,
    roughness: 0.08,
    transmission: 0.55
  });
  const showerGlass1 = new THREE.Mesh(new THREE.BoxGeometry(1.55, 2.45, 0.05), glassMat);
  showerGlass1.position.set(-5.55, 1.58, -3.25);
  houseGroup.add(showerGlass1);

  const showerGlass2 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.45, 1.55), glassMat);
  showerGlass2.position.set(-4.8, 1.58, -4.05);
  houseGroup.add(showerGlass2);

  const vanityBox = new THREE.Mesh(
    new THREE.BoxGeometry(1.15, 0.78, 0.72),
    new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6 })
  );
  vanityBox.position.set(-3.3, 0.74, -4.42);
  vanityBox.castShadow = true;
  houseGroup.add(vanityBox);

  const tealDrawer = new THREE.Mesh(
    new THREE.BoxGeometry(0.95, 0.26, 0.05),
    new THREE.MeshStandardMaterial({ color: 0x0d9488, roughness: 0.4 })
  );
  tealDrawer.position.set(-3.3, 0.78, -4.04);
  houseGroup.add(tealDrawer);

  const vesselSink = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 0.22, 0.52),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.15 })
  );
  vesselSink.position.set(-3.3, 1.24, -4.42);
  houseGroup.add(vesselSink);

  const mirror = new THREE.Mesh(
    new THREE.BoxGeometry(0.85, 1.05, 0.05),
    new THREE.MeshStandardMaterial({ color: 0xbae6fd, metalness: 0.85, roughness: 0.1 })
  );
  mirror.position.set(-3.3, 2.15, -4.82);
  houseGroup.add(mirror);

  const toiletBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.58, 0.48, 0.72),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 })
  );
  toiletBase.position.set(-1.65, 0.58, -4.35);
  toiletBase.castShadow = true;
  houseGroup.add(toiletBase);

  const toiletTank = new THREE.Mesh(
    new THREE.BoxGeometry(0.56, 0.55, 0.28),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 })
  );
  toiletTank.position.set(-1.65, 1.05, -4.62);
  houseGroup.add(toiletTank);

  // 5. STUDIO / BEDROOM / LIVING FURNITURE (Right Room)
  const bedFrame = new THREE.Mesh(
    new THREE.BoxGeometry(1.75, 0.45, 3.3),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.5 })
  );
  bedFrame.position.set(1.6, 0.52, -1.55);
  bedFrame.castShadow = true;
  bedFrame.receiveShadow = true;
  houseGroup.add(bedFrame);

  const headboard = new THREE.Mesh(
    new THREE.BoxGeometry(1.75, 1.35, 0.18),
    new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.45 })
  );
  headboard.position.set(1.6, 1.15, -3.15);
  headboard.castShadow = true;
  houseGroup.add(headboard);

  const yellowPillow = new THREE.Mesh(
    new THREE.BoxGeometry(0.95, 0.22, 0.52),
    new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.6 })
  );
  yellowPillow.position.set(1.6, 0.84, -2.65);
  yellowPillow.castShadow = true;
  houseGroup.add(yellowPillow);

  const blueBlanket = new THREE.Mesh(
    new THREE.BoxGeometry(1.78, 0.48, 0.95),
    new THREE.MeshStandardMaterial({ color: 0x1e40af, roughness: 0.7 })
  );
  blueBlanket.position.set(1.6, 0.54, -0.45);
  houseGroup.add(blueBlanket);

  // Cylindrical drum ceiling lamp over the bed (no diamond/octahedron shapes)
  const drumLamp = new THREE.Mesh(
    new THREE.CylinderGeometry(0.38, 0.38, 0.28, 20),
    new THREE.MeshStandardMaterial({
      color: 0xfef3c7,
      emissive: 0xfde68a,
      emissiveIntensity: 0.35,
      roughness: 0.5
    })
  );
  drumLamp.position.set(1.3, 2.85, -1.35);
  houseGroup.add(drumLamp);

  // White L-Shaped Desk + Chair at bottom-right of Studio (x: 2.35, z: 2.85)
  const deskTop = new THREE.Mesh(
    new THREE.BoxGeometry(2.3, 0.1, 1.15),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 })
  );
  deskTop.position.set(2.35, 1.02, 2.85);
  deskTop.castShadow = true;
  deskTop.receiveShadow = true;
  houseGroup.add(deskTop);

  const deskLeg1 = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.75, 1.05),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4 })
  );
  deskLeg1.position.set(1.28, 0.64, 2.85);
  houseGroup.add(deskLeg1);

  const deskLeg2 = deskLeg1.clone();
  deskLeg2.position.set(3.42, 0.64, 2.85);
  houseGroup.add(deskLeg2);

  const chairSeat = new THREE.Mesh(
    new THREE.BoxGeometry(0.68, 0.1, 0.68),
    new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.4 })
  );
  chairSeat.position.set(1.95, 0.68, 1.85);
  chairSeat.castShadow = true;
  houseGroup.add(chairSeat);

  const chairBack = new THREE.Mesh(
    new THREE.BoxGeometry(0.68, 0.65, 0.1),
    new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.4 })
  );
  chairBack.position.set(1.95, 1.05, 1.55);
  chairBack.castShadow = true;
  houseGroup.add(chairBack);

  // 6. PERIMETER GREEN SHRUBS & LUSH TREES AROUND THE HOUSE LOT (matching reference image!)
  const bushMat1 = new THREE.MeshStandardMaterial({ color: 0x2f6f1e, roughness: 0.75 });
  const bushMat2 = new THREE.MeshStandardMaterial({ color: 0x418929, roughness: 0.68 });

  const shrubCoords: Array<[number, number]> = [];
  // Front-left & front-right perimeter shrubs
  for (let b = 0; b < 11; b++) {
    shrubCoords.push([-6.2 + b * 1.18, 5.45]);
  }
  // Right-side perimeter shrubs
  for (let b = 0; b < 7; b++) {
    shrubCoords.push([7.15, 4.6 - b * 1.45]);
  }

  shrubCoords.forEach(([bx, bz], idx) => {
    const bushGroup = new THREE.Group();
    bushGroup.position.set(bx, 0.32, bz);
    for (let s = 0; s < 4; s++) {
      const puff = new THREE.Mesh(
        new THREE.SphereGeometry(0.32 + (s % 2) * 0.08, 10, 8),
        (idx + s) % 2 === 0 ? bushMat1 : bushMat2
      );
      puff.position.set((s - 1.5) * 0.14, (s % 2) * 0.16, ((s * 3) % 2 - 0.5) * 0.14);
      puff.castShadow = true;
      bushGroup.add(puff);
    }
    houseGroup.add(bushGroup);
  });

  // Lush deciduous trees framing the property
  const heroTrees: Array<[number, number, number]> = [
    [-11.8, -2.5, 1.15],
    [-10.5, -7.2, 1.28],
    [-2.5, -8.0, 1.22],
    [6.8, -7.8, 1.18],
    [10.2, 2.8, 1.08],
    [-13.2, 4.8, 1.05]
  ];
  heroTrees.forEach(([tx, tz, sc]) => {
    scene.add(createLushTree(tx, tz, sc));
  });

  // Outdoor Trash Bin & Mailbox near driveway
  const trashBin = new THREE.Mesh(
    new THREE.BoxGeometry(0.62, 1.05, 0.62),
    new THREE.MeshStandardMaterial({ color: 0x3f4739, roughness: 0.7 })
  );
  trashBin.position.set(-7.15, 0.55, 5.4);
  trashBin.castShadow = true;
  houseGroup.add(trashBin);

  return {
    houseGroup
  };
}
