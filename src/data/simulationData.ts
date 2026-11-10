import { GuidedSimStep } from '../types';

export const GUIDED_SIM_STEPS: GuidedSimStep[] = [
  {
    index: 0,
    stepBadge: 'ESCENA 1 DE 7 • ESTADO NORMAL',
    headline: 'Hogar del cliente — Todo funciona normal',
    subtext:
      'La casa navega con baja latencia y comparte la fibra sin problemas con sus vecinos.',
    bannerTone: 'normal',
    camera: 'sims-room',
    ponDensity: 32,
    infectedCount: 0,
    guestVlanActive: false,
    lanPortDisabled: false,
    macBlacklistActive: false,
    tvBoxReplaced: false
  },
  {
    index: 1,
    stepBadge: 'ESCENA 2 DE 7 • CAUSA EN EL LIVING',
    headline: '¡El TV Box genérico activa el malware de fábrica!',
    subtext:
      'Envía y recibe paquetes mientras espía la PC y el celular del hogar e inunda la salida hacia la ONU.',
    bannerTone: 'danger',
    camera: 'devices-closeup',
    ponDensity: 32,
    infectedCount: 1,
    guestVlanActive: false,
    lanPortDisabled: false,
    macBlacklistActive: false,
    tvBoxReplaced: false
  },
  {
    index: 2,
    stepBadge: 'ESCENA 3 DE 7 • EFECTO EN EL BARRIO',
    headline: '¡El tráfico de las casas satura la red compartida!',
    subtext:
      'El tráfico de los equipos infectados colapsa el canal compartido y eleva la latencia del vecindario.',
    bannerTone: 'danger',
    camera: 'neighborhood',
    ponDensity: 48,
    infectedCount: 6,
    guestVlanActive: false,
    lanPortDisabled: false,
    macBlacklistActive: false,
    tvBoxReplaced: false
  },
  {
    index: 3,
    stepBadge: 'ESCENA 4 DE 7 • PRUEBA DE RED DE INVITADOS',
    headline: 'Red de invitados: protege la casa, pero no la fibra',
    subtext:
      'El aislamiento protege la PC y el celular en la red local, pero el TV Box sigue enviando tráfico hacia la red.',
    bannerTone: 'warning',
    camera: 'devices-closeup',
    ponDensity: 32,
    infectedCount: 1,
    guestVlanActive: true,
    lanPortDisabled: false,
    macBlacklistActive: false,
    tvBoxReplaced: false
  },
  {
    index: 4,
    stepBadge: 'ESCENA 5 DE 7 • PRUEBA DE RESET DE FÁBRICA',
    headline: 'Probando reset de fábrica en el TV Box...',
    subtext:
      'El equipo se reinicia, pero al encender el malware vuelve a atacar porque está grabado en la memoria del sistema.',
    bannerTone: 'warning',
    camera: 'devices-closeup',
    triggerResetOnEnter: true,
    ponDensity: 32,
    infectedCount: 1,
    guestVlanActive: false,
    lanPortDisabled: false,
    macBlacklistActive: false,
    tvBoxReplaced: false
  },
  {
    index: 5,
    stepBadge: 'ESCENA 6 DE 7 • ACCIÓN DE RED',
    headline: '¡Operaciones de red bloquea el puerto en la ONU y libera al barrio!',
    subtext:
      'Al cortar el puerto LAN o la MAC del equipo, todas las casas del barrio recuperan su velocidad.',
    bannerTone: 'success',
    camera: 'onu-closeup',
    endCamera: 'neighborhood',
    endCameraDelaySec: 2.3,
    ponDensity: 32,
    infectedCount: 3,
    guestVlanActive: true,
    lanPortDisabled: true,
    macBlacklistActive: true,
    tvBoxReplaced: false
  },
  {
    index: 6,
    stepBadge: 'ESCENA 7 DE 7 • SOLUCIÓN DEFINITIVA',
    headline: '¡Reemplazo del TV Box por un equipo certificado!',
    subtext:
      'Se retira el equipo infectado y se instala un equipo con certificación oficial: la red GPON vuelve a operar sana.',
    bannerTone: 'success',
    camera: 'devices-closeup',
    endCamera: 'overview',
    endCameraDelaySec: 2.8,
    triggerSwapOnEnter: true,
    ponDensity: 32,
    infectedCount: 0,
    guestVlanActive: false,
    lanPortDisabled: false,
    macBlacklistActive: false,
    tvBoxReplaced: true
  }
];
