import { FLOWCHART_STEPS } from '../../data/flowchartData';
import { renderFlowchartSvgLayers } from './FlowchartCanvasSvg';

export interface FlowchartController {
  nextStepOrExit: () => boolean;
  prevStepOrExit: () => boolean;
  setStep: (idx: number) => void;
  getStepIndex: () => number;
  getTotalSteps: () => number;
  destroy: () => void;
}

export function mountFlowchartView(
  container: HTMLElement,
  options: {
    isEmbedded: boolean;
    onBackToGuide?: () => void;
    initialStep?: number;
  }
): FlowchartController {
  let currentStepIdx = options.initialStep ?? 0;
  let animFrameId: number | null = null;
  const currentVB = { ...FLOWCHART_STEPS[currentStepIdx].cameraBox };

  const wrapper = document.createElement('div');
  wrapper.className = 'flowchart-layout';
  container.innerHTML = '';
  container.appendChild(wrapper);

  const canvasBox = document.createElement('div');
  canvasBox.className = 'flowchart-canvas-box';
  wrapper.appendChild(canvasBox);

  function animateViewBoxTo(target: { x: number; y: number; w: number; h: number }, svgEl: SVGSVGElement) {
    if (animFrameId !== null) cancelAnimationFrame(animFrameId);
    const start = { ...currentVB };
    const startTime = performance.now();
    const duration = 420;

    function tick(now: number) {
      const t = Math.min(1, (now - startTime) / duration);
      const ease = 1 - Math.pow(1 - t, 3);
      currentVB.x = start.x + (target.x - start.x) * ease;
      currentVB.y = start.y + (target.y - start.y) * ease;
      currentVB.w = start.w + (target.w - start.w) * ease;
      currentVB.h = start.h + (target.h - start.h) * ease;
      svgEl.setAttribute(
        'viewBox',
        `${currentVB.x.toFixed(1)} ${currentVB.y.toFixed(1)} ${currentVB.w.toFixed(1)} ${currentVB.h.toFixed(1)}`
      );
      if (t < 1) animFrameId = requestAnimationFrame(tick);
    }
    animFrameId = requestAnimationFrame(tick);
  }

  function render() {
    const step = FLOWCHART_STEPS[currentStepIdx];
    let svgEl = canvasBox.querySelector('svg.flowchart-svg') as SVGSVGElement | null;

    if (!svgEl) {
      canvasBox.innerHTML = `
        <svg class="flowchart-svg" viewBox="${currentVB.x} ${currentVB.y} ${currentVB.w} ${currentVB.h}" preserveAspectRatio="xMidYMid meet">
          <defs>
            <marker id="arrow-cyan" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
            </marker>
            <marker id="arrow-dim" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="rgba(255,255,255,0.28)" />
            </marker>
            <filter id="node-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#38bdf8" flood-opacity="0.35" />
            </filter>
          </defs>
          <g class="edges-layer"></g>
          <g class="nodes-layer"></g>
        </svg>
        <div id="flow-top-pill" style="position:absolute; top:14px; left:16px; display:flex; gap:10px; align-items:center; pointer-events:none;"></div>
        ${
          options.isEmbedded
            ? ''
            : `<button class="nav-btn" id="flow-back-guide-btn" style="position:absolute; bottom:14px; left:16px;">◂ Volver a la guía</button>`
        }
      `;
      svgEl = canvasBox.querySelector('svg.flowchart-svg') as SVGSVGElement;
    }

    const topOverlay = canvasBox.querySelector('#flow-top-pill') as HTMLDivElement | null;
    if (topOverlay) {
      topOverlay.innerHTML = `
        <span style="background:#fbbf24; color:#081326; font-weight:900; font-size:11.5px; padding:5px 12px; border-radius:6px;">
          ${step.badge}
        </span>
        <span style="font-size:13.5px; font-weight:800; color:#ffffff; background:rgba(15,39,71,0.9); padding:5px 14px; border-radius:6px; border:1px solid #38bdf8;">
          ${step.title}
        </span>
      `;
    }

    animateViewBoxTo(step.cameraBox, svgEl);
    renderFlowchartSvgLayers(svgEl, currentStepIdx, null);

    const backBtn = canvasBox.querySelector('#flow-back-guide-btn') as HTMLButtonElement | null;
    if (backBtn) {
      backBtn.onclick = () => {
        options.onBackToGuide?.();
      };
    }
  }

  render();

  return {
    nextStepOrExit() {
      return false;
    },
    prevStepOrExit() {
      return false;
    },
    setStep(idx: number) {
      if (idx >= 0 && idx < FLOWCHART_STEPS.length) {
        currentStepIdx = idx;
        render();
      }
    },
    getStepIndex: () => currentStepIdx,
    getTotalSteps: () => FLOWCHART_STEPS.length,
    destroy() {
      if (animFrameId !== null) cancelAnimationFrame(animFrameId);
    }
  };
}
