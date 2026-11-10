import { SlideDefinition } from '../../types';

export function renderSlideSolutionsTable(slide: SlideDefinition): string {
  return `
    <div>
      <header class="light-header-block">
        <h1 class="light-main-title">${slide.title}</h1>
        <p class="light-main-lead">${slide.subtitle}</p>
      </header>

      <table class="clean-table">
        <thead>
          <tr>
            <th>Medida evaluada</th>
            <th>¿Protege la casa (LAN)?</th>
            <th>¿Protege la fibra (GPON)?</th>
            <th>Conclusión operativa</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td data-label="Medida evaluada"><strong>Reinicio de fábrica (reset)</strong></td>
            <td data-label="¿Protege la casa (LAN)?" class="text-danger">NO</td>
            <td data-label="¿Protege la fibra (GPON)?" class="text-danger">NO</td>
            <td data-label="Conclusión operativa">Si el malware está en la partición del sistema, puede reaparecer al encender.</td>
          </tr>
          <tr>
            <td data-label="Medida evaluada"><strong>Red de invitados (Guest Wi-Fi)</strong></td>
            <td data-label="¿Protege la casa (LAN)?" class="text-navy">SÍ (aísla equipos)</td>
            <td data-label="¿Protege la fibra (GPON)?" class="text-danger">NO (sigue saturando)</td>
            <td data-label="Conclusión operativa">Protege la LAN, pero el equipo sigue enviando tráfico hacia la red.</td>
          </tr>
          <tr>
            <td data-label="Medida evaluada"><strong>Bloqueo por MAC/puerto en la ONU</strong></td>
            <td data-label="¿Protege la casa (LAN)?" class="text-ok">SÍ</td>
            <td data-label="¿Protege la fibra (GPON)?" class="text-ok">SÍ (inmediato)</td>
            <td data-label="Conclusión operativa">Se aplica tras el plazo sin respuesta o ante reincidencia.</td>
          </tr>
          <tr>
            <td data-label="Medida evaluada"><strong>Reemplazo por equipo certificado</strong></td>
            <td data-label="¿Protege la casa (LAN)?" class="text-ok">SÍ (100% seguro)</td>
            <td data-label="¿Protege la fibra (GPON)?" class="text-ok">SÍ (definitivo)</td>
            <td data-label="Conclusión operativa">Recomendado: equipo con certificación oficial y actualizaciones de seguridad.</td>
          </tr>
        </tbody>
      </table>

      <div class="golden-rule-banner">
        <span>Autogestión: al cerrar el caso, el cliente puede solicitar el desbloqueo desde el canal de atención.</span>
      </div>
    </div>
  `;
}
