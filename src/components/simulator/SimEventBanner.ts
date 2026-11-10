import { SimEventState, SimulationTelemetry } from '../../types';
import { getInfectionSeverityRgb } from './SimTelemetryEngine';

export function updateSimEventBanner(
  bannerEl: HTMLElement,
  metersEl: HTMLElement,
  event: SimEventState,
  telemetry: SimulationTelemetry,
  animateTransition: boolean,
  bannerCollapsed: boolean,
  onToggleCollapse: () => void
): void {
  const toneClass =
    event.bannerTone === 'danger'
      ? 'status-danger'
      : event.bannerTone === 'warning'
      ? 'status-warning'
      : event.bannerTone === 'success'
      ? 'status-success'
      : '';

  const collapsedClass = bannerCollapsed ? 'is-collapsed' : '';

  const sevColor = getInfectionSeverityRgb(Math.max(1, telemetry.infectedHouses)).css;
  const barColor = telemetry.wanCongested
    ? sevColor
    : telemetry.statusLevel === 'mitigated'
    ? '#10b981'
    : '#38bdf8';

  const renderBannerContent = () => {
    bannerEl.className = `sims-event-banner ${toneClass} ${collapsedClass}`.trim();
    bannerEl.innerHTML = `
      <div class="sims-event-header-row">
        <span class="sims-event-step-pill">${event.stepBadge}</span>
        <button type="button" class="sims-banner-toggle-btn" id="btn-toggle-sim-banner" title="${
          bannerCollapsed ? 'Desplegar cartel de escena' : 'Plegar cartel de escena'
        }">
          ${bannerCollapsed ? '▾ Desplegar alerta' : '▴ Plegar alerta'}
        </button>
      </div>
      <div class="sims-event-body">
        <div class="sims-event-headline">${event.headline}</div>
        <div class="sims-event-subtext">${event.subtext}</div>
        <div class="sims-event-metrics">
          <span>↑ ${telemetry.totalUpstreamMbps} Mbps</span>
          <span>Ping vecinos ${telemetry.neighborRttMs} ms</span>
          <span>${telemetry.activeOnus} casas PON</span>
          <span>Datos ilustrativos</span>
        </div>
      </div>
    `;
    bannerEl
      .querySelector('#btn-toggle-sim-banner')
      ?.addEventListener('click', (e: Event) => {
        e.stopPropagation();
        onToggleCollapse();
      });
  };

  if (animateTransition && !bannerCollapsed) {
    bannerEl.classList.add('animating');
    window.setTimeout(() => {
      renderBannerContent();
    }, 150);
  } else {
    renderBannerContent();
  }

  metersEl.className = `sims-mini-meters ${telemetry.wanCongested ? 'danger' : ''}`;
  metersEl.style.borderLeftColor = barColor;
  metersEl.innerHTML = `
    <div class="sims-meter-row">
      <span>Subida Fibra PON</span>
      <span style="color:${barColor};">${telemetry.totalUpstreamMbps} Mbps</span>
    </div>
    <div class="sims-meter-bar">
      <div class="sims-meter-fill" style="width:${Math.max(6, telemetry.utilizationPct)}%; background:${barColor};"></div>
    </div>
    <div class="sims-meter-row" style="margin-top:4px;">
      <span>Ping Vecinos (${telemetry.activeOnus} casas)</span>
      <span style="color:${telemetry.wanCongested ? barColor : '#059669'};">${telemetry.neighborRttMs} ms</span>
    </div>
  `;
}
