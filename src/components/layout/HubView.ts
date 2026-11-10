import { AppMode } from '../../types';
import { SLIDES } from '../../data/slidesData';
import { renderNetworkVisualSvg } from '../visuals/NetworkVisual';

export function renderHubView(stage: HTMLElement, onSelectMode: (mode: AppMode) => void): void {
  stage.innerHTML = `
    <div class="hub-viewport" id="hub-viewport-box">
      <div class="hub-wrapper" id="hub-scaled-canvas">
        <section class="hub-hero">
          <div>
            <span class="hub-pill">GUÍA EDUCATIVA • REDES GPON</span>
            <h1 class="hub-title">Red interna infectada: simulación y guía de mitigación</h1>
            <p class="hub-subtitle">
              Un recorrido visual por el impacto de un dispositivo comprometido en una red de fibra compartida.
            </p>
            <p class="hub-note">
              Contenido ilustrativo y educativo. No contiene datos reales de empresas, clientes ni redes.
            </p>
          </div>
          ${renderNetworkVisualSvg('hub-hero-visual')}
        </section>

        <section class="hub-cards-grid">
          <article class="hub-card card-sim" id="card-launch-sim">
            <div>
              <span class="hub-card-tag">MÓDULO 1 • INTERACTIVO 3D</span>
              <h3>Simulador 3D</h3>
              <p>
                Explora el hogar, el barrio y la red GPON. Activa el malware, prueba mitigaciones y observa la telemetría.
              </p>
              <ul class="hub-card-list">
                <li>7 escenas guiadas</li>
                <li>Controles de cámara y densidad PON</li>
                <li>Pruebas: reset, red de invitados, bloqueo y reemplazo</li>
              </ul>
            </div>
            <div class="hub-card-btn">
              <span>Abrir simulador</span>
              <span>▸</span>
            </div>
          </article>

          <article class="hub-card" id="card-launch-pres">
            <div>
              <span class="hub-card-tag">MÓDULO 2 • ${SLIDES.length} DIAPOSITIVAS</span>
              <h3>Presentación guiada</h3>
              <p>
                Resumen visual por ejes: problema, impacto, detección, mitigación y comunicación.
              </p>
              <ul class="hub-card-list">
                <li>Síntesis visual en títulos y sub-ítems</li>
                <li>Detección y acompañamiento del cliente</li>
                <li>Incluye diagrama de flujo y cierre</li>
              </ul>
            </div>
            <div class="hub-card-btn">
              <span>Iniciar presentación</span>
              <span>▸</span>
            </div>
          </article>

          <article class="hub-card card-flow" id="card-launch-flow">
            <div>
              <span class="hub-card-tag">MÓDULO 3 • INTERACTIVO</span>
              <h3>Diagrama de flujo</h3>
              <p>
                Flujo general de mitigación, sin procedimientos internos ni herramientas específicas.
              </p>
              <ul class="hub-card-list">
                <li>Detección y registro</li>
                <li>Acompañamiento CX</li>
                <li>Resolución del incidente</li>
              </ul>
            </div>
            <div class="hub-card-btn">
              <span>Abrir diagrama</span>
              <span>▸</span>
            </div>
          </article>
        </section>

        <footer class="hub-footer">
          <span><strong>Laboratorio GPON</strong> — recurso educativo</span>
          <span>Contenido ilustrativo · Sin datos reales</span>
          <span>Atajos: <strong>Flechas / PageDown</strong> avanzar · <strong>F11</strong> pantalla completa · <strong>Home</strong> guía</span>
        </footer>
      </div>
    </div>
  `;

  const viewportEl = stage.querySelector('#hub-viewport-box') as HTMLElement | null;
  const canvasEl = stage.querySelector('#hub-scaled-canvas') as HTMLElement | null;
  if (viewportEl && canvasEl) {
    const updateScale = () => {
      const vw = viewportEl.clientWidth;
      const vh = viewportEl.clientHeight;
      if (vw > 0 && vh > 0) {
        const scale = Math.min(vw / 1600, vh / 900);
        canvasEl.style.transform = `scale(${scale.toFixed(4)})`;
      }
    };
    const ro = new ResizeObserver(updateScale);
    ro.observe(viewportEl);
    updateScale();
  }

  stage.querySelector('#card-launch-sim')?.addEventListener('click', () => onSelectMode('simulation'));
  stage.querySelector('#card-launch-pres')?.addEventListener('click', () => onSelectMode('presentation'));
  stage.querySelector('#card-launch-flow')?.addEventListener('click', () => onSelectMode('flowchart'));
}
