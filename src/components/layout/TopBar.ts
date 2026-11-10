import { AppMode } from '../../types';
import { SLIDES } from '../../data/slidesData';

export interface TopBarCallbacks {
  onSelectMode: (mode: AppMode) => void;
}

export function renderTopBar(currentMode: AppMode, callbacks: TopBarCallbacks): HTMLElement {
  const bar = document.createElement('header');
  bar.className = 'topbar';
  bar.innerHTML = `
    <div class="topbar-brand" id="brand-home-btn" title="Ir a la guía">
      <span class="topbar-brand-mark">GPON</span>
      <span class="topbar-brand-text">Laboratorio GPON</span>
    </div>
    <nav class="topbar-nav" aria-label="Módulos">
      <button class="nav-btn ${currentMode === 'hub' ? 'active' : ''}" data-mode="hub">
        Guía
      </button>
      <button class="nav-btn ${currentMode === 'simulation' ? 'active' : ''}" data-mode="simulation">
        1. Simulador 3D
      </button>
      <button class="nav-btn ${currentMode === 'presentation' ? 'active' : ''}" data-mode="presentation">
        2. Presentación (${SLIDES.length})
      </button>
      <button class="nav-btn ${currentMode === 'flowchart' ? 'active' : ''}" data-mode="flowchart">
        3. Diagrama de flujo
      </button>
    </nav>
  `;

  bar.querySelector('#brand-home-btn')?.addEventListener('click', () => {
    callbacks.onSelectMode('hub');
  });

  bar.querySelectorAll('[data-mode]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const m = btn.getAttribute('data-mode') as AppMode;
      callbacks.onSelectMode(m);
    });
  });

  return bar;
}
