import { SimulationState, SimulationTelemetry } from '../../types';

/**
 * Interpolates the infection color from Yellow (#fbbf24) at 1 infected ONU,
 * through Orange (#fb7185) at ~5 infected ONUs, up to Red (#DC2626) at 10+ infected ONUs.
 */
export function getInfectionSeverityRgb(infectedCount: number): {
  r: number;
  g: number;
  b: number;
  hex: number;
  css: string;
} {
  const clamped = Math.max(1, Math.min(12, infectedCount));
  const t = (clamped - 1) / 9; // 0.0 at 1 ONU -> 1.0 at 10+ ONUs
  const ratio = Math.min(1, Math.max(0, t));

  // Stop 0: #fbbf24 (243, 208, 62) -> Stop 0.5: #FF6B2B (255, 107, 43) -> Stop 1.0: #DC1E1E (220, 30, 30)
  let r: number;
  let g: number;
  let b: number;
  if (ratio < 0.5) {
    const k = ratio * 2;
    r = Math.round(243 + (255 - 243) * k);
    g = Math.round(208 + (107 - 208) * k);
    b = Math.round(62 + (43 - 62) * k);
  } else {
    const k = (ratio - 0.5) * 2;
    r = Math.round(255 + (220 - 255) * k);
    g = Math.round(107 + (24 - 107) * k);
    b = Math.round(43 + (24 - 43) * k);
  }

  const hex = (r << 16) | (g << 8) | b;
  const css = `rgb(${r}, ${g}, ${b})`;
  return { r, g, b, hex, css };
}

export function computeSimTelemetry(state: SimulationState): SimulationTelemetry {
  const ponCapacityMbps = 1244;
  const activeOnus = Math.max(1, Math.min(128, state.ponDensity));
  const isLocalInfected =
    state.infectedCount > 0 && !state.tvBoxReplaced && !(state.hardResetCountdown > 0);
  const isWanMitigated =
    state.lanPortDisabled ||
    state.macBlacklistActive ||
    state.tvBoxReplaced ||
    state.hardResetCountdown > 0;

  const effectiveInfectedHouses = isWanMitigated ? 0 : state.infectedCount;
  const normalTrafficMbps = +(activeOnus * 0.85).toFixed(1);

  let botnetTrafficMbps = 0;
  if (effectiveInfectedHouses > 0) {
    botnetTrafficMbps = 165 * effectiveInfectedHouses;
  }

  const rawTotal = normalTrafficMbps + botnetTrafficMbps;
  const totalUpstreamMbps = +Math.min(ponCapacityMbps, rawTotal).toFixed(1);
  const utilizationPct = +Math.min(100, (rawTotal / ponCapacityMbps) * 100).toFixed(1);

  let neighborRttMs = +(2.8 + (activeOnus / 128) * 1.4).toFixed(1);
  let packetLossPct = 0;

  if (effectiveInfectedHouses > 0) {
    const loadFactor = Math.min(1.6, rawTotal / ponCapacityMbps);
    neighborRttMs = +(38 + loadFactor * 115 + (activeOnus / 128) * 28).toFixed(1);
    packetLossPct = +Math.min(28.5, Math.max(4.2, (loadFactor - 0.12) * 19.5)).toFixed(1);
  }

  const lanPrivacyCompromised =
    isLocalInfected &&
    !state.guestVlanActive &&
    !state.lanPortDisabled &&
    !state.macBlacklistActive;
  const wanCongested = effectiveInfectedHouses > 0;

  let statusLevel: SimulationTelemetry['statusLevel'] = 'normal';
  if (state.tvBoxReplaced || state.infectedCount === 0) {
    statusLevel = 'normal';
  } else if (state.lanPortDisabled || state.macBlacklistActive) {
    statusLevel = 'mitigated';
  } else if (state.guestVlanActive) {
    statusLevel = 'warning';
  } else {
    statusLevel = 'critical';
  }

  return {
    ponCapacityMbps,
    activeOnus,
    infectedHouses: effectiveInfectedHouses,
    totalUpstreamMbps,
    utilizationPct,
    neighborRttMs,
    packetLossPct,
    lanPrivacyCompromised,
    wanCongested,
    statusLevel
  };
}
