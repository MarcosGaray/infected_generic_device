import { SLIDES } from '../../data/slidesData';
import { FlowchartController, mountFlowchartView } from '../flowchart/FlowchartView';
import { renderSlideDarkHero } from './SlideDarkHero';
import { renderSlideLightCards } from './SlideLightCards';
import { renderSlideMonitoringCase } from './SlideMonitoringCase';
import { renderSlideSolutionsTable } from './SlideSolutionsTable';

export interface PresentationSubController {
  flowController?: FlowchartController;
  destroy: () => void;
}

const SLIDE_DESIGN_WIDTH = 1600;
const SLIDE_DESIGN_HEIGHT = 900;

export function renderPresentationSlide(
  stage: HTMLElement,
  currentSlideIdx: number,
  callbacks: {
    onJumpToSlide: (idx: number) => void;
    onNextSlide: () => void;
    onPrevSlide: () => void;
  }
): PresentationSubController {
  const slide = SLIDES[currentSlideIdx];
  const isFullBleed = slide.template === 'embedded-flowchart';

  stage.innerHTML = `
    <div class="presentation-shell">
      <div class="slide-viewport theme-${slide.theme}" id="slide-viewport-box">
        <div class="slide-canvas theme-${slide.theme} ${isFullBleed ? 'full-bleed' : ''}" id="slide-scaled-canvas">
          ${
            isFullBleed
              ? ''
              : `<header class="slide-top-strip">
                   <div class="slide-brand-mark">
                     <span class="slide-brand-text">LABORATORIO GPON</span>
                   </div>
                   ${
                     slide.modulePill
                       ? `<span class="slide-module-pill">${slide.modulePill}</span>`
                       : ''
                   }
                 </header>`
          }

          <main class="slide-main-area" id="slide-main-mount"></main>

          ${
            isFullBleed
              ? ''
              : `<footer class="slide-bottom-strip">
                   <span>${slide.footerLabel}</span>
                   <span class="footer-slogan">CONTENIDO ILUSTRATIVO</span>
                 </footer>`
          }
        </div>
      </div>

      <footer class="presenter-bar">
        <div style="display:flex; align-items:center; gap:10px;">
          <button class="nav-btn" id="btn-prev-slide" ${
            currentSlideIdx === 0 ? 'disabled style="opacity:0.4;"' : ''
          }>
            ◂ Anterior (PageUp)
          </button>
          <button class="nav-btn accent-yellow" id="btn-next-slide">
            ${
              currentSlideIdx === SLIDES.length - 1
                ? 'Volver a la guía ▸'
                : 'Siguiente (PageDown) ▸'
            }
          </button>
        </div>

        <div class="slide-dots">
          ${SLIDES.map(
            (s, idx) => `
            <button
              class="slide-dot ${idx === currentSlideIdx ? 'active' : ''}"
              data-jump-slide="${idx}"
              title="Diapositiva ${idx + 1}: ${s.title}"
            ></button>
          `
          ).join('')}
        </div>

        <div style="font-size:12px; font-weight:700; color:#cbd5e1;">
          DIAPOSITIVA ${currentSlideIdx + 1} DE ${SLIDES.length}
        </div>
      </footer>
    </div>
  `;

  const viewportEl = stage.querySelector('#slide-viewport-box') as HTMLElement;
  const canvasEl = stage.querySelector('#slide-scaled-canvas') as HTMLElement;

  const updateSlideScale = () => {
    const vw = viewportEl.clientWidth;
    const vh = viewportEl.clientHeight;
    if (vw > 0 && vh > 0) {
      const scale = Math.min(vw / SLIDE_DESIGN_WIDTH, vh / SLIDE_DESIGN_HEIGHT);
      canvasEl.style.transform = `scale(${scale.toFixed(4)})`;
    }
  };

  const resizeObserver = new ResizeObserver(() => {
    updateSlideScale();
  });
  resizeObserver.observe(viewportEl);
  updateSlideScale();

  const mountEl = stage.querySelector('#slide-main-mount') as HTMLElement;
  let flowController: FlowchartController | undefined;

  if (slide.template === 'dark-hero' || slide.template === 'closing-thanks') {
    mountEl.innerHTML = renderSlideDarkHero(slide);
  } else if (slide.template === 'light-cards') {
    mountEl.innerHTML = renderSlideLightCards(slide);
  } else if (slide.template === 'monitoring-case') {
    mountEl.innerHTML = renderSlideMonitoringCase(slide);
  } else if (slide.template === 'solutions-table') {
    mountEl.innerHTML = renderSlideSolutionsTable(slide);
  } else if (slide.template === 'embedded-flowchart') {
    mountEl.innerHTML = `<div id="embedded-flow-host" style="flex:1; min-height:0; display:flex; width:100%;"></div>`;
    const flowHost = mountEl.querySelector('#embedded-flow-host') as HTMLElement;
    flowController = mountFlowchartView(flowHost, {
      isEmbedded: true
    });
  }

  stage.querySelector('#btn-prev-slide')?.addEventListener('click', callbacks.onPrevSlide);
  stage.querySelector('#btn-next-slide')?.addEventListener('click', callbacks.onNextSlide);

  stage.querySelectorAll('[data-jump-slide]').forEach((dot) => {
    dot.addEventListener('click', () => {
      const idx = Number(dot.getAttribute('data-jump-slide'));
      callbacks.onJumpToSlide(idx);
    });
  });

  return {
    flowController,
    destroy() {
      resizeObserver.disconnect();
      flowController?.destroy();
    }
  };
}
