import { SlideDefinition } from '../../types';

export function renderSlideMonitoringCase(slide: SlideDefinition): string {
  return `
    <div>
      <header class="light-header-block" style="margin-bottom:14px;">
        <h1 class="light-main-title">${slide.title}</h1>
        <p class="light-main-lead">${slide.subtitle}</p>
      </header>

      <div class="light-cards-2col" style="align-items:center;">
        <article class="white-card border-orange" style="padding:22px 26px;">
          <h3>Qué mirar en el monitoreo</h3>
          <ul>
            <li><strong>Dónde se ve:</strong> Panel de consumo por red y por puerto PON.</li>
            <li><strong>Señal clara:</strong> Subida muy superior a la bajada (por ejemplo, asimetría 10:1 a 40:1).</li>
            <li><strong>Prueba de aislamiento:</strong> Al deshabilitar el puerto LAN del equipo, el tráfico cae a valores normales.</li>
            <li><strong>Dato de ejemplo:</strong> 300 MB/mes de bajada frente a 3 TB/mes de subida; cifras mensuales ilustrativas.</li>
          </ul>
        </article>

        <figure class="white-card monitor-mock" style="padding:18px;">
          <div class="monitor-mock-head">
            <span>Panel de monitoreo (ejemplo)</span>
            <span class="monitor-status-pill">Asimetría detectada</span>
          </div>
          <div class="monitor-bars" aria-hidden="true">
            <div class="monitor-bar-group">
              <div class="monitor-bar-wrap">
                <div class="monitor-bar monitor-bar-down" style="height:24%;"></div>
              </div>
              <span>Bajada</span>
              <strong>300 MB/mes</strong>
            </div>
            <div class="monitor-bar-group">
              <div class="monitor-bar-wrap">
                <div class="monitor-bar monitor-bar-up" style="height:94%;"></div>
              </div>
              <span>Subida</span>
              <strong>3 TB/mes</strong>
            </div>
          </div>
          <figcaption>Tráfico mensual · datos ilustrativos</figcaption>
        </figure>
      </div>
    </div>
  `;
}
