import * as THREE from 'three';

/**
 * Generates procedural CanvasTextures for the 3D GPON Simulator:
 * - Natural green grass terrain & paved asphalt roads with double yellow lines
 * - Pole-mounted ODB / caja NAP front cover stencil
 * - OLT GPON subrack front/top bezel & service board faceplates
 * - Interior room floor tiles (Kitchen, Bathroom, Studio) and exterior brick
 */

export function createSimsGroundTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Rich natural green lawn base matching the reference neighborhood screenshot
  const grad = ctx.createRadialGradient(256, 256, 40, 256, 256, 360);
  grad.addColorStop(0, '#5a9e36');
  grad.addColorStop(0.6, '#4d8c2c');
  grad.addColorStop(1, '#437c25');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Subtle organic lawn mottling (sunlit patches and deeper turf)
  for (let i = 0; i < 4500; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = 1 + Math.random() * 2.8;
    ctx.fillStyle =
      i % 3 === 0
        ? 'rgba(134, 204, 72, 0.22)'
        : i % 3 === 1
        ? 'rgba(46, 94, 24, 0.20)'
        : 'rgba(105, 168, 54, 0.18)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Fine grass blade strokes
  ctx.lineWidth = 1;
  for (let i = 0; i < 2800; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    ctx.strokeStyle = i % 2 === 0 ? 'rgba(158, 224, 92, 0.24)' : 'rgba(36, 76, 18, 0.22)';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random() - 0.5) * 3, y - 3 - Math.random() * 4);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(14, 14);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createAsphaltRoadTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Concrete sidewalks along top and bottom edges (0..68 and 444..512)
  ctx.fillStyle = '#c8cfd6';
  ctx.fillRect(0, 0, 512, 512);

  // Sidewalk expansion joints
  ctx.strokeStyle = '#9aa3ae';
  ctx.lineWidth = 2;
  for (let x = 0; x < 512; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 68);
    ctx.moveTo(x, 444);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }

  // Curb shadow borders
  ctx.fillStyle = '#8b95a1';
  ctx.fillRect(0, 62, 512, 8);
  ctx.fillRect(0, 442, 512, 8);

  // Dark gray paved asphalt roadway in the middle (70..442)
  ctx.fillStyle = '#48505a';
  ctx.fillRect(0, 70, 512, 372);

  // Subtle asphalt grain noise
  for (let i = 0; i < 3000; i++) {
    const x = Math.random() * 512;
    const y = 72 + Math.random() * 368;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)';
    ctx.fillRect(x, y, 2, 2);
  }

  // Double continuous yellow center lines (matching reference image!)
  ctx.fillStyle = '#facc15';
  ctx.fillRect(0, 246, 512, 7);
  ctx.fillRect(0, 259, 512, 7);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.repeat.set(8, 1);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createOdbNapFrontTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 640;
  const ctx = canvas.getContext('2d')!;

  // Dark charcoal rugged polycarbonate cover matching NAP.png
  ctx.fillStyle = '#23272c';
  ctx.fillRect(0, 0, 512, 640);

  // Outer molded recessed border
  ctx.strokeStyle = '#15181b';
  ctx.lineWidth = 14;
  ctx.strokeRect(22, 22, 468, 596);

  // Molded structural grid ribs on the upper and lower sections
  ctx.strokeStyle = '#2f343b';
  ctx.lineWidth = 6;
  for (let x = 86; x <= 426; x += 68) {
    ctx.beginPath();
    ctx.moveTo(x, 38);
    ctx.lineTo(x, 225);
    ctx.moveTo(x, 420);
    ctx.lineTo(x, 595);
    ctx.stroke();
  }
  [95, 165, 480, 545].forEach((y) => {
    ctx.beginPath();
    ctx.moveTo(45, y);
    ctx.lineTo(467, y);
    ctx.stroke();
  });

  // Top-center raised hexagonal ODB emblem
  ctx.fillStyle = '#1c2024';
  ctx.strokeStyle = '#3b4149';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(176, 68, 160, 74, 14);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#94a3b8';
  ctx.font = '900 26px Raleway, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ODB', 256, 104);
  ctx.font = '700 16px Raleway, Arial, sans-serif';
  ctx.fillText('GPON', 256, 126);

  // Central smooth nameplate panel
  ctx.fillStyle = '#1e2227';
  ctx.fillRect(42, 240, 428, 165);
  ctx.strokeStyle = '#343940';
  ctx.lineWidth = 4;
  ctx.strokeRect(42, 240, 428, 165);

  // Large bold white stenciled identifier "ODB-01" exactly like NAP.png
  ctx.fillStyle = '#f1f5f9';
  ctx.font = '900 104px Arial, Helvetica, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('ODB-01', 256, 326);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createOltTopBezelTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  // Dark slate OLT subrack top bezel matching olt.png
  ctx.fillStyle = '#25282e';
  ctx.fillRect(0, 0, 1024, 128);
  ctx.strokeStyle = '#3f444e';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, 1020, 124);

  // Left yellow warning label + blue ESD badge
  ctx.fillStyle = '#facc15';
  ctx.fillRect(28, 28, 86, 48);
  ctx.fillStyle = '#111827';
  ctx.font = '900 18px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('CAUTION', 71, 58);

  ctx.fillStyle = '#0284c7';
  ctx.fillRect(126, 28, 62, 48);
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 16px Arial, sans-serif';
  ctx.fillText('ESD', 157, 58);

  // Center-right green STATUS indicator pill
  ctx.fillStyle = '#94a3b8';
  ctx.font = '800 20px Arial, sans-serif';
  ctx.fillText('STATUS', 630, 52);
  ctx.fillStyle = '#10b981';
  ctx.beginPath();
  ctx.arc(630, 82, 11, 0, Math.PI * 2);
  ctx.fill();

  // Right OLT GPON model name
  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'italic 900 34px Arial, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('OLT GPON', 988, 72);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createKitchenGeometricTileTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#3b4248';
  ctx.fillRect(0, 0, 512, 512);

  const step = 64;
  for (let y = 0; y < 512 + step; y += step) {
    for (let x = 0; x < 512 + step; x += step) {
      const offset = (Math.floor(y / step) % 2) * (step / 2);
      const cx = x + offset;
      const cy = y;

      ctx.fillStyle = '#b84b39';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 28);
      ctx.lineTo(cx + 26, cy - 14);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx - 26, cy - 14);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#48636c';
      ctx.beginPath();
      ctx.moveTo(cx - 26, cy - 14);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx, cy + 28);
      ctx.lineTo(cx - 26, cy + 14);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#d6c3a5';
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + 26, cy - 14);
      ctx.lineTo(cx + 26, cy + 14);
      ctx.lineTo(cx, cy + 28);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#9ea3a8';
      ctx.lineWidth = 2;
      ctx.strokeRect(cx - 26, cy - 26, 52, 52);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2.5, 2.5);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createBathroomDiamondTileTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#d8d5c8';
  ctx.fillRect(0, 0, 512, 512);

  const step = 85;
  ctx.strokeStyle = '#9c9a8e';
  ctx.lineWidth = 3;

  for (let y = 0; y <= 512; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }
  for (let x = 0; x <= 512; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }

  ctx.fillStyle = '#1f2937';
  for (let y = 0; y <= 512; y += step) {
    for (let x = 0; x <= 512; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, y - 9);
      ctx.lineTo(x + 9, y);
      ctx.lineTo(x, y + 9);
      ctx.lineTo(x - 9, y);
      ctx.closePath();
      ctx.fill();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createStudioCarpetAndRugTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#6e2226';
  ctx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 2000; i++) {
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.06)';
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 3, 3);
  }

  const rx = 70;
  const ry = 60;
  const rw = 372;
  const rh = 392;

  ctx.fillStyle = '#262b30';
  ctx.fillRect(rx - 8, ry - 8, rw + 16, rh + 16);

  const bands = ['#637074', '#8e5146', '#c29b61', '#455a64', '#9e9d89', '#7b3e38'];
  const bandH = rh / bands.length;
  bands.forEach((col, idx) => {
    ctx.fillStyle = col;
    ctx.fillRect(rx, ry + idx * bandH, rw, bandH);

    ctx.fillStyle = 'rgba(255,255,255,0.16)';
    for (let tx = rx; tx < rx + rw - 40; tx += 62) {
      ctx.beginPath();
      ctx.moveTo(tx, ry + (idx + 1) * bandH);
      ctx.lineTo(tx + 31, ry + idx * bandH + 6);
      ctx.lineTo(tx + 62, ry + (idx + 1) * bandH);
      ctx.closePath();
      ctx.fill();
    }
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createExteriorBrickTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#b5a89a';
  ctx.fillRect(0, 0, 256, 256);

  const rows = 12;
  const cols = 6;
  const bh = 256 / rows;
  const bw = 256 / cols;

  for (let r = 0; r < rows; r++) {
    const off = (r % 2) * (bw / 2);
    for (let c = -1; c <= cols; c++) {
      ctx.fillStyle = (r + c) % 3 === 0 ? '#9c8d7e' : '#a89a8c';
      ctx.fillRect(c * bw + off + 2, r * bh + 2, bw - 4, bh - 4);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 1.5);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
