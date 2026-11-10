import { FLOWCHART_NODES, FLOWCHART_EDGES, FLOWCHART_STEPS } from '../../data/flowchartData';
import { FlowchartNodeData, FlowchartStepCluster } from '../../types';
import { renderFlowchartSvgLayers } from './FlowchartCanvasSvg';

export interface FlowchartController {
  nextStepOrExit: () => boolean;
  prevStepOrExit: () => boolean;
  setStep: (idx: number) => void;
  getStepIndex: () => number;
  getTotalSteps: () => number;
  destroy: () => void;
}

/**
 * Ancho a partir del cual el diagrama horizontal se lee bien.
 * Por debajo se usa una versión apilada en HTML, pensada para tablets y celulares.
 */
const COMPACT_BREAKPOINT = 1100;

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
  let compactMode: boolean | null = null;

  const wrapper = document.createElement('div');
  wrapper.className = 'flowchart-layout';
  container.innerHTML = '';
  container.appendChild(wrapper);

  const canvasBox = document.createElement('div');
  canvasBox.className = 'flowchart-canvas-box';
  wrapper.appendChild(canvasBox);

  const isCompactWidth = () => {
    const width = container.clientWidth || window.innerWidth;
    return width < COMPACT_BREAKPOINT;
  };

  function stopAnimation() {
    if (animFrameId !== null) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
  }

  function animateViewBoxTo(target: { x: number; y: number; w: number; h: number }, svgEl: SVGSVGElement) {
    stopAnimation();
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

  function renderDesktopDiagram(step: FlowchartStepCluster) {
    canvasBox.classList.remove('is-compact');
    canvasBox.innerHTML = `
      <svg class="flowchart-svg" viewBox="${currentVB.x} ${currentVB.y} ${currentVB.w} ${currentVB.h}" preserveAspectRatio="xMidYMid meet">
        <defs>
          <marker id="arrow-cyan" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
          </marker>
          <marker id="arrow-orange" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#fb7185" />
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
      <div class="flow-top-pill">
        <span class="flow-badge">${step.badge}</span>
        <span class="flow-title-pill">${step.title}</span>
      </div>
      <div class="flow-description-pill">${step.description}</div>
      ${
        options.isEmbedded
          ? ''
          : `<button type="button" class="nav-btn flow-back-guide-btn">◂ Volver a la guía</button>`
      }
    `;

    const svgEl = canvasBox.querySelector('svg.flowchart-svg') as SVGSVGElement;
    animateViewBoxTo(step.cameraBox, svgEl);
    renderFlowchartSvgLayers(svgEl, currentStepIdx, null);

    const backBtn = canvasBox.querySelector('.flow-back-guide-btn') as HTMLButtonElement | null;
    if (backBtn) {
      backBtn.onclick = () => options.onBackToGuide?.();
    }
  }

  function renderCompactDiagram(step: FlowchartStepCluster) {
    stopAnimation();
    canvasBox.classList.add('is-compact');

    const nodesHtml = FLOWCHART_NODES.map((node: FlowchartNodeData, index) => {
      const active = step.activeNodeIds.includes(node.id);
      return `
        <article class="flow-compact-node cat-${node.category} ${active ? 'is-active' : ''}">
          <span class="flow-compact-step">Paso ${index + 1}</span>
          <h3>${node.label}</h3>
          ${node.sublabel ? `<p class="flow-compact-sub">${node.sublabel}</p>` : ''}
          <p class="flow-compact-detail">${node.detailText}</p>
        </article>
        ${
          index < FLOWCHART_NODES.length - 1
            ? '<div class="flow-compact-arrow" aria-hidden="true"></div>'
            : ''
        }
      `;
    }).join('');

    canvasBox.innerHTML = `
      <div class="flow-compact">
        <header class="flow-compact-header">
          <span class="flow-badge">${step.badge}</span>
          <h2>${step.title}</h2>
          <p>${step.description}</p>
        </header>
        <div class="flow-compact-track">${nodesHtml}</div>
        ${
          options.isEmbedded
            ? ''
            : `<button type="button" class="nav-btn flow-compact-back">◂ Volver a la guía</button>`
        }
      </div>
    `;

    const backBtn = canvasBox.querySelector('.flow-compact-back') as HTMLButtonElement | null;
    if (backBtn) {
      backBtn.onclick = () => options.onBackToGuide?.();
    }
  }

  function render() {
    const step = FLOWCHART_STEPS[currentStepIdx];
    compactMode = isCompactWidth();
    if (compactMode) {
      renderCompactDiagram(step);
    } else {
      renderDesktopDiagram(step);
    }
  }

  render();

  const resizeObserver = new ResizeObserver(() => {
    const nextCompact = isCompactWidth();
    if (nextCompact !== compactMode) {
      render();
    }
  });
  resizeObserver.observe(container);

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
      stopAnimation();
      resizeObserver.disconnect();
    }
  };
}
