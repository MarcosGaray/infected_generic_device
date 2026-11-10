import { CameraPreset, SimulationState } from '../../types';
import { GUIDED_SIM_STEPS } from '../../data/simulationData';

export interface SimControlDockCallbacks {
  onPrevStep: () => void;
  onNextStep: () => void;
  onSelectCamera: (cam: CameraPreset) => void;
  onToggleInfect: () => void;
  onTriggerHardReset: () => void;
  onToggleGuestWifi: () => void;
  onTogglePortBlock: () => void;
  onToggleCertifiedBox: () => void;
  onChangePonDensity: (val: number) => void;
  onChangeInfectedCount: (val: number) => void;
}

export function renderSimControlDock(
  dockEl: HTMLElement,
  state: SimulationState,
  callbacks: SimControlDockCallbacks
): void {
  const isInfectedActive = state.infectedCount > 0 && !state.tvBoxReplaced;
  const isPortBlocked = state.lanPortDisabled || state.macBlacklistActive;

  dockEl.innerHTML = `
    <div class="sims-dock-scene-row">
      <div class="sims-scene-controls">
        <button type="button" class="sims-btn sims-step-btn" id="sim-prev-step" title="Escena anterior" aria-label="Escena anterior">◂</button>
        <span class="sims-step-counter">Escena ${state.guidedStepIdx + 1}/${GUIDED_SIM_STEPS.length}</span>
        <button type="button" class="sims-btn primary" id="sim-next-step" title="Siguiente escena">Siguiente ▸</button>
      </div>

      <div class="sims-camera-pills" aria-label="Vistas de cámara">
        <button type="button" class="sims-cam-btn ${state.cameraPreset === 'sims-room' ? 'active' : ''}" data-cam="sims-room">
          Casa
        </button>
        <button type="button" class="sims-cam-btn ${state.cameraPreset === 'devices-closeup' ? 'active' : ''}" data-cam="devices-closeup">
          Dispositivos
        </button>
        <button type="button" class="sims-cam-btn ${state.cameraPreset === 'onu-closeup' ? 'active' : ''}" data-cam="onu-closeup">
          ONU
        </button>
        <button type="button" class="sims-cam-btn ${state.cameraPreset === 'neighborhood' ? 'active' : ''}" data-cam="neighborhood">
          Barrio GPON
        </button>
        <button type="button" class="sims-cam-btn ${state.cameraPreset === 'overview' ? 'active' : ''}" data-cam="overview">
          Red total
        </button>
      </div>
    </div>

    <div class="sims-dock-actions">
      <div class="sims-actions-row">
        <button type="button" class="sims-btn ${isInfectedActive && !isPortBlocked ? 'active-danger' : ''}" id="act-infect">
          ${isInfectedActive ? 'Malware activo' : 'Activar malware'}
        </button>

        <button type="button" class="sims-btn ${state.hardResetCountdown > 0 ? 'active-warning' : ''}" id="act-reset">
          ${state.hardResetCountdown > 0 ? 'Reiniciando…' : 'Reset de fábrica'}
        </button>

        <button type="button" class="sims-btn ${state.guestVlanActive ? 'active-warning' : ''}" id="act-guest">
          Red de invitados
        </button>

        <button type="button" class="sims-btn ${isPortBlocked ? 'active-success' : ''}" id="act-port-block">
          Bloquear en ONU
        </button>

        <button type="button" class="sims-btn ${state.tvBoxReplaced ? 'active-success' : ''}" id="act-certified">
          Equipo certificado
        </button>
      </div>
    </div>

    <div class="sims-sliders-compact">
      <div class="sims-slider-item" id="wrap-pon-density" title="Arrastre para cambiar la cantidad de casas PON">
        <label>
          <span>Casas PON</span>
          <strong id="lbl-pon-density">${state.ponDensity}</strong>
        </label>
        <input type="range" id="rng-pon-density" min="1" max="128" value="${state.ponDensity}" />
      </div>
      <div class="sims-slider-item" id="wrap-infected-count" title="Arrastre para cambiar la cantidad de equipos infectados">
        <label>
          <span>Infectadas</span>
          <strong id="lbl-infected-count">${state.infectedCount}</strong>
        </label>
        <input type="range" id="rng-infected-count" min="0" max="12" value="${state.infectedCount}" />
      </div>
    </div>
  `;

  dockEl.querySelector('#sim-prev-step')?.addEventListener('click', callbacks.onPrevStep);
  dockEl.querySelector('#sim-next-step')?.addEventListener('click', callbacks.onNextStep);

  dockEl.querySelectorAll('[data-cam]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const cam = btn.getAttribute('data-cam') as CameraPreset;
      callbacks.onSelectCamera(cam);
    });
  });

  dockEl.querySelector('#act-infect')?.addEventListener('click', callbacks.onToggleInfect);
  dockEl.querySelector('#act-reset')?.addEventListener('click', callbacks.onTriggerHardReset);
  dockEl.querySelector('#act-guest')?.addEventListener('click', callbacks.onToggleGuestWifi);
  dockEl.querySelector('#act-port-block')?.addEventListener('click', callbacks.onTogglePortBlock);
  dockEl.querySelector('#act-certified')?.addEventListener('click', callbacks.onToggleCertifiedBox);

  const ponSlider = dockEl.querySelector('#rng-pon-density') as HTMLInputElement | null;
  const ponWrap = dockEl.querySelector('#wrap-pon-density') as HTMLElement | null;
  if (ponSlider) {
    ponSlider.addEventListener('input', () => {
      const val = Number(ponSlider.value);
      const lbl = dockEl.querySelector('#lbl-pon-density');
      if (lbl) lbl.textContent = String(val);
      callbacks.onChangePonDensity(val);
    });
  }
  if (ponWrap && ponSlider) {
    ponWrap.addEventListener(
      'wheel',
      (e: WheelEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const delta = e.deltaY < 0 ? 1 : -1;
        const nextVal = Math.max(1, Math.min(128, Number(ponSlider.value) + delta));
        ponSlider.value = String(nextVal);
        const lbl = dockEl.querySelector('#lbl-pon-density');
        if (lbl) lbl.textContent = String(nextVal);
        callbacks.onChangePonDensity(nextVal);
      },
      { passive: false }
    );
  }

  const infSlider = dockEl.querySelector('#rng-infected-count') as HTMLInputElement | null;
  const infWrap = dockEl.querySelector('#wrap-infected-count') as HTMLElement | null;
  if (infSlider) {
    infSlider.addEventListener('input', () => {
      const val = Number(infSlider.value);
      const lbl = dockEl.querySelector('#lbl-infected-count');
      if (lbl) lbl.textContent = String(val);
      callbacks.onChangeInfectedCount(val);
    });
  }
  if (infWrap && infSlider) {
    infWrap.addEventListener(
      'wheel',
      (e: WheelEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const delta = e.deltaY < 0 ? 1 : -1;
        const nextVal = Math.max(0, Math.min(12, Number(infSlider.value) + delta));
        infSlider.value = String(nextVal);
        const lbl = dockEl.querySelector('#lbl-infected-count');
        if (lbl) lbl.textContent = String(nextVal);
        callbacks.onChangeInfectedCount(nextVal);
      },
      { passive: false }
    );
  }
}
