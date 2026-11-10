export type AppMode = 'hub' | 'presentation' | 'flowchart' | 'simulation';

export type SlideTheme = 'dark' | 'light';

export type SlideTemplateType =
  | 'dark-hero'
  | 'light-cards'
  | 'monitoring-case'
  | 'embedded-flowchart'
  | 'solutions-table'
  | 'closing-thanks';

export interface SlideCardBlock {
  title: string;
  accentColor: 'cyan' | 'navy' | 'orange' | 'yellow';
  items: Array<{ bold: string; text: string }>;
}

export interface SlideDefinition {
  id: string;
  index: number;
  theme: SlideTheme;
  template: SlideTemplateType;
  modulePill: string;
  yellowTag?: string;
  title: string;
  subtitle: string;
  footerLabel: string;
  heroBullets?: Array<{ bold: string; text: string }>;
  cards?: SlideCardBlock[];
  goldenRule?: { text: string; variant?: 'cyan' | 'orange' };
}

export interface FlowchartNodeData {
  id: string;
  label: string;
  sublabel?: string;
  shape: 'ellipse' | 'rect' | 'diamond' | 'dashed';
  category: 'start-end' | 'ops' | 'support' | 'decision' | 'sla' | 'block' | 'close';
  x: number;
  y: number;
  width: number;
  height: number;
  detailText: string;
}

export interface FlowchartEdgeData {
  id: string;
  from: string;
  to: string;
  label?: string;
  dashed?: boolean;
}

export interface FlowchartStepCluster {
  stepIndex: number;
  title: string;
  badge: string;
  description: string;
  isOverview: boolean;
  activeNodeIds: string[];
  activeEdgeIds: string[];
  cameraBox: { x: number; y: number; w: number; h: number };
}

export type CameraPreset =
  | 'sims-room'
  | 'devices-closeup'
  | 'onu-closeup'
  | 'neighborhood'
  | 'overview';

export interface SimEventState {
  stepBadge: string;
  headline: string;
  subtext: string;
  bannerTone: 'normal' | 'danger' | 'warning' | 'success';
}

export interface GuidedSimStep {
  index: number;
  stepBadge: string;
  headline: string;
  subtext: string;
  bannerTone: 'normal' | 'danger' | 'warning' | 'success';
  camera: CameraPreset;
  endCamera?: CameraPreset;
  endCameraDelaySec?: number;
  triggerResetOnEnter?: boolean;
  triggerSwapOnEnter?: boolean;
  ponDensity: number;
  infectedCount: number;
  guestVlanActive: boolean;
  lanPortDisabled: boolean;
  macBlacklistActive: boolean;
  tvBoxReplaced: boolean;
}

export interface SimulationState {
  ponDensity: number;
  infectedCount: number;
  guestVlanActive: boolean;
  lanPortDisabled: boolean;
  macBlacklistActive: boolean;
  tvBoxReplaced: boolean;
  hardResetCountdown: number;
  tvBoxSwapAnim: number;
  bannerCollapsed: boolean;
  guidedStepIdx: number;
  cameraPreset: CameraPreset;
  eventBanner: SimEventState;
}

export interface SimulationTelemetry {
  ponCapacityMbps: number;
  activeOnus: number;
  infectedHouses: number;
  totalUpstreamMbps: number;
  utilizationPct: number;
  neighborRttMs: number;
  packetLossPct: number;
  lanPrivacyCompromised: boolean;
  wanCongested: boolean;
  statusLevel: 'normal' | 'warning' | 'critical' | 'mitigated';
}
