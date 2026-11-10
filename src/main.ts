import { SLIDES } from './data/slidesData';
import { AppMode } from './types';
import { renderTopBar } from './components/layout/TopBar';
import { renderHubView } from './components/layout/HubView';
import {
  PresentationSubController,
  renderPresentationSlide
} from './components/presentation/PresentationView';
import { FlowchartController, mountFlowchartView } from './components/flowchart/FlowchartView';
import { Simulation3DController, mountSimulation3D } from './components/simulator/SimulatorView';

let currentMode: AppMode = 'hub';
let currentSlideIdx = 0;
let activePresSubController: PresentationSubController | null = null;
let standaloneFlowController: FlowchartController | null = null;
let standaloneSimController: Simulation3DController | null = null;
let isBlackout = false;
let isTopbarVisible = true;

const hashSlideMatch = location.hash.match(/^#slide=(\d+)$/);
if (hashSlideMatch) {
  const idx = Number(hashSlideMatch[1]);
  if (idx >= 0 && idx < SLIDES.length) {
    currentMode = 'presentation';
    currentSlideIdx = idx;
    isTopbarVisible = false;
  }
}

function getAppEl(): HTMLElement {
  let el = document.getElementById('app');
  if (!el) {
    el = document.createElement('div');
    el.id = 'app';
    document.body.appendChild(el);
  }
  return el;
}

function focusMainStage() {
  const stageEl = document.getElementById('main-stage-view');
  stageEl?.focus({ preventScroll: true });
}

/**
 * Directional View Transition with programmatic focus routing.
 */
function navigateWithTransition(updateDOM: () => void, direction: 'forward' | 'backward') {
  const docWithVT = document as Document & {
    startViewTransition?: (
      arg: { update: () => void; types?: string[] } | (() => void)
    ) => { finished: Promise<void> };
  };
  if (!docWithVT.startViewTransition) {
    updateDOM();
    focusMainStage();
    return;
  }
  try {
    const transition = docWithVT.startViewTransition({
      update: updateDOM,
      types: [direction]
    });
    transition.finished.finally(() => {
      focusMainStage();
    });
  } catch {
    updateDOM();
    focusMainStage();
  }
}

function cleanupControllers() {
  if (activePresSubController) {
    activePresSubController.destroy();
    activePresSubController = null;
  }
  if (standaloneFlowController) {
    standaloneFlowController.destroy();
    standaloneFlowController = null;
  }
  if (standaloneSimController) {
    standaloneSimController.destroy();
    standaloneSimController = null;
  }
}

function switchMode(nextMode: AppMode) {
  const dir = nextMode === 'hub' ? 'backward' : 'forward';
  if (nextMode === 'hub' || nextMode === 'simulation') {
    history.replaceState(null, '', location.pathname + location.search);
  }
  if (nextMode === 'presentation') {
    if (currentMode !== 'presentation') currentSlideIdx = 0;
    isTopbarVisible = false;
  } else {
    isTopbarVisible = true;
  }
  navigateWithTransition(() => {
    currentMode = nextMode;
    renderApp();
  }, dir);
}

function goToNextSlide() {
  if (currentSlideIdx < SLIDES.length - 1) {
    navigateWithTransition(() => {
      currentSlideIdx++;
      renderApp();
    }, 'forward');
  } else {
    switchMode('hub');
  }
}

function goToPrevSlide() {
  if (currentSlideIdx > 0) {
    navigateWithTransition(() => {
      currentSlideIdx--;
      renderApp();
    }, 'backward');
  }
}

function handleUnifiedNext() {
  if (currentMode === 'presentation') {
    if (activePresSubController?.flowController) {
      const consumed = activePresSubController.flowController.nextStepOrExit();
      if (consumed) return;
    }
    goToNextSlide();
  } else if (currentMode === 'flowchart') {
    if (standaloneFlowController) {
      const consumed = standaloneFlowController.nextStepOrExit();
      if (!consumed) standaloneFlowController.setStep(0);
    }
  } else if (currentMode === 'simulation') {
    if (standaloneSimController) {
      standaloneSimController.nextGuidedStepOrExit();
    }
  }
}

function handleUnifiedPrevious() {
  if (currentMode === 'presentation') {
    if (activePresSubController?.flowController) {
      const consumed = activePresSubController.flowController.prevStepOrExit();
      if (consumed) return;
    }
    goToPrevSlide();
  } else if (currentMode === 'flowchart') {
    standaloneFlowController?.prevStepOrExit();
  } else if (currentMode === 'simulation') {
    standaloneSimController?.prevGuidedStepOrExit();
  }
}

function renderApp() {
  cleanupControllers();
  const appEl = getAppEl();
  appEl.innerHTML = '';

  const topBar = renderTopBar(currentMode, {
    onSelectMode: (mode) => switchMode(mode)
  });
  appEl.appendChild(topBar);

  if (currentMode === 'presentation') {
    const reveal = document.createElement('button');
    reveal.type = 'button';
    reveal.className = 'topbar-reveal';
    reveal.setAttribute('aria-label', 'Mostrar u ocultar el menú');
    reveal.setAttribute('aria-expanded', String(isTopbarVisible));
    reveal.innerHTML = '<span class="topbar-reveal-icon">▾</span>';
    reveal.addEventListener('click', () => {
      isTopbarVisible = !isTopbarVisible;
      appEl.classList.toggle('topbar-hidden', !isTopbarVisible);
      reveal.setAttribute('aria-expanded', String(isTopbarVisible));
    });
    appEl.appendChild(reveal);
  }

  appEl.classList.toggle('topbar-hidden', currentMode === 'presentation' && !isTopbarVisible);

  const stage = document.createElement('main');
  stage.id = 'main-stage-view';
  stage.tabIndex = -1;
  stage.style.flex = '1';
  stage.style.display = 'flex';
  stage.style.flexDirection = 'column';
  stage.style.minHeight = '0';
  stage.style.outline = 'none';
  appEl.appendChild(stage);

  const blackoutEl = document.createElement('div');
  blackoutEl.className = `blackout-screen ${isBlackout ? 'visible' : ''}`;
  appEl.appendChild(blackoutEl);

  if (currentMode === 'hub') {
    renderHubView(stage, (mode) => switchMode(mode));
  } else if (currentMode === 'presentation') {
    activePresSubController = renderPresentationSlide(stage, currentSlideIdx, {
      onJumpToSlide: (targetIdx) => {
        if (targetIdx === currentSlideIdx) return;
        const dir = targetIdx > currentSlideIdx ? 'forward' : 'backward';
        navigateWithTransition(() => {
          currentSlideIdx = targetIdx;
          renderApp();
        }, dir);
      },
      onNextSlide: () => handleUnifiedNext(),
      onPrevSlide: () => handleUnifiedPrevious()
    });
  } else if (currentMode === 'flowchart') {
    const viewportWrap = document.createElement('div');
    viewportWrap.className = 'slide-viewport theme-dark';
    stage.appendChild(viewportWrap);

    const scaledBox = document.createElement('div');
    scaledBox.style.width = '1600px';
    scaledBox.style.height = '900px';
    scaledBox.style.flexShrink = '0';
    scaledBox.style.transformOrigin = 'center center';
    scaledBox.style.padding = '20px 32px';
    scaledBox.style.display = 'flex';
    viewportWrap.appendChild(scaledBox);

    const updateFlowScale = () => {
      const vw = viewportWrap.clientWidth;
      const vh = viewportWrap.clientHeight;
      if (vw > 0 && vh > 0) {
        const s = Math.min(vw / 1600, vh / 900);
        scaledBox.style.transform = `scale(${s.toFixed(4)})`;
      }
    };
    const ro = new ResizeObserver(updateFlowScale);
    ro.observe(viewportWrap);
    updateFlowScale();

    standaloneFlowController = mountFlowchartView(scaledBox, {
      isEmbedded: false,
      onBackToGuide: () => switchMode('hub')
    });
  } else if (currentMode === 'simulation') {
    standaloneSimController = mountSimulation3D(stage);
  }
}

window.addEventListener('keydown', (e) => {
  const activeTag = (document.activeElement as HTMLElement | null)?.tagName;
  if (activeTag === 'INPUT') return;

  if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
    e.preventDefault();
    if (currentMode !== 'hub') {
      handleUnifiedNext();
    }
  } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
    e.preventDefault();
    handleUnifiedPrevious();
  } else if (e.key === 'b' || e.key === 'B' || e.key === '.') {
    e.preventDefault();
    isBlackout = !isBlackout;
    document.querySelector('.blackout-screen')?.classList.toggle('visible', isBlackout);
  } else if (e.key === 'Home') {
    e.preventDefault();
    switchMode('hub');
  }
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => renderApp());
} else {
  renderApp();
}
