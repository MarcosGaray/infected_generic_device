import { SlideDefinition } from '../types';

export const SLIDES: SlideDefinition[] = [
  {
    id: 'slide-1-portada',
    index: 0,
    theme: 'dark',
    template: 'dark-hero',
    modulePill: 'GUÍA EDUCATIVA • REDES GPON',
    yellowTag: 'CONTENIDO ILUSTRATIVO',
    title: 'Red interna infectada: cuando un dispositivo del hogar afecta a todo el barrio',
    subtitle:
      'Simulación interactiva de una botnet en una red de fibra GPON y guía genérica de mitigación.',
    footerLabel: 'Recurso educativo — datos y procedimientos ilustrativos',
    heroBullets: [
      {
        bold: 'El problema:',
        text: 'TV Boxes, Smart TVs y proyectores genéricos pueden traer malware preinstalado.'
      },
      {
        bold: 'El impacto:',
        text: 'El tráfico de subida satura el puerto PON compartido y afecta a los vecinos.'
      },
      {
        bold: 'El objetivo:',
        text: 'Detectar la anomalía, acompañar al cliente y mitigar el incidente.'
      }
    ]
  },
  {
    id: 'slide-2-gpon',
    index: 1,
    theme: 'light',
    template: 'light-cards',
    modulePill: 'EJE 1 • LA RED GPON',
    title: '1. ¿Qué ocurre en una red de fibra GPON?',
    subtitle:
      'El canal de subida es compartido: lo que genera un hogar puede afectar a muchos vecinos.',
    footerLabel: 'Eje 1: Topología GPON y canal de subida',
    cards: [
      {
        title: 'Canal de subida compartido',
        accentColor: 'cyan',
        items: [
          {
            bold: 'Hasta 128 ONUs por puerto:',
            text: 'Un puerto PON puede atender desde pocos hasta más de un centenar de hogares, según el diseño de la red.'
          },
          {
            bold: 'Un solo equipo puede saturar:',
            text: 'Un dispositivo comprometido puede generar ráfagas sostenidas de subida y consumir la capacidad disponible.'
          },
          {
            bold: 'Efecto en el barrio:',
            text: 'Aumenta la latencia, aparecen pérdidas de paquetes y se degradan videollamadas y streaming.'
          }
        ]
      }
    ],
    goldenRule: {
      text: 'Idea clave: en GPON, el tráfico de subida de un hogar compite con el de sus vecinos.',
      variant: 'cyan'
    }
  },
  {
    id: 'slide-3-origen',
    index: 2,
    theme: 'dark',
    template: 'dark-hero',
    modulePill: 'EJE 2 • ORIGEN DEL PROBLEMA',
    yellowTag: 'FIRMWARE Y DISPOSITIVOS GENÉRICOS',
    title: '2. ¿De dónde sale la infección?',
    subtitle:
      'Dispositivos de bajo costo con sistemas sin certificar y firmware modificado de fábrica.',
    footerLabel: 'Eje 2: Origen del malware en firmware',
    heroBullets: [
      {
        bold: 'Sistema sin certificar:',
        text: 'TV Boxes, Smart TVs y proyectores genéricos pueden no contar con certificación oficial ni actualizaciones de seguridad.'
      },
      {
        bold: 'Malware preinstalado:',
        text: 'El software malicioso puede venir grabado en la memoria del equipo y activarse al conectarlo.'
      },
      {
        bold: 'El reset no siempre alcanza:',
        text: 'Si el malware está en la partición del sistema, un reinicio de fábrica puede no eliminarlo.'
      }
    ]
  },
  {
    id: 'slide-4-atencion',
    index: 3,
    theme: 'light',
    template: 'light-cards',
    modulePill: 'EJE 3 • ATENCIÓN AL CLIENTE',
    title: '3. ¿Cómo explicarlo al cliente de forma simple?',
    subtitle: 'Priorizar la privacidad y la seguridad del hogar antes que el detalle técnico.',
    footerLabel: 'Eje 3: Argumentación empática para atención al cliente',
    cards: [
      {
        title: '1° Privacidad: "La cerradura forzada"',
        accentColor: 'orange',
        items: [
          {
            bold: 'Puerta abierta:',
            text: 'Un equipo comprometido puede permitir que terceros usen la red interna del hogar.'
          },
          {
            bold: 'Riesgo familiar:',
            text: 'Expone computadoras, celulares, fotos y contraseñas.'
          },
          {
            bold: 'Aclaración clave:',
            text: 'El origen suele ser el dispositivo no certificado, no la red del proveedor.'
          }
        ]
      },
      {
        title: '2° Velocidad: "La autopista compartida"',
        accentColor: 'navy',
        items: [
          {
            bold: 'Carril ocupado:',
            text: 'El equipo infectado satura la subida y frena a los vecinos del mismo puerto.'
          },
          {
            bold: 'Saturación continua:',
            text: 'Envía datos sin pausa y puede provocar cortes y lentitud.'
          },
          {
            bold: 'Acción recomendada:',
            text: 'Desconectar el equipo o reemplazarlo por uno certificado.'
          }
        ]
      }
    ],
    goldenRule: {
      text: 'Regla de oro: el cliente coopera más cuando entiende que su privacidad y la de su familia están en juego.',
      variant: 'orange'
    }
  },
  {
    id: 'slide-5-deteccion',
    index: 4,
    theme: 'light',
    template: 'monitoring-case',
    modulePill: 'EJE 4 • DETECCIÓN Y ACOMPAÑAMIENTO',
    title: '4. Detección de la anomalía y acompañamiento',
    subtitle:
      'La asimetría de tráfico se detecta en el monitoreo y se aborda con acompañamiento al cliente.',
    footerLabel: 'Eje 4: Detección y acompañamiento'
  },
  {
    id: 'slide-6-flujo',
    index: 5,
    theme: 'light',
    template: 'embedded-flowchart',
    modulePill: 'EJE 5 • FLUJO GENERAL',
    title: '5. Flujo general de mitigación',
    subtitle:
      'Detección, acompañamiento al cliente y resolución del incidente.',
    footerLabel: 'Eje 5: Flujo general de mitigación'
  },
  {
    id: 'slide-7-soluciones',
    index: 6,
    theme: 'light',
    template: 'solutions-table',
    modulePill: 'EJE 6 • MITIGACIÓN',
    title: '6. ¿Qué medidas funcionan y cuáles no?',
    subtitle: 'Comparativa de acciones en el hogar y controles desde la red.',
    footerLabel: 'Eje 6: Evaluación de medidas de mitigación'
  },
  {
    id: 'slide-8-concientizacion',
    index: 7,
    theme: 'light',
    template: 'light-cards',
    modulePill: 'EJE 7 • CONCIENTIZACIÓN',
    title: '7. Concientización: una necesidad compartida',
    subtitle:
      'La seguridad de la red también depende de quienes la operan y de quienes la usan.',
    footerLabel: 'Eje 7: Concientización y cultura de seguridad',
    cards: [
      {
        title: 'Trabajadores del sector y sociedad',
        accentColor: 'navy',
        items: [
          {
            bold: 'Trabajadores del sector:',
            text: 'Comprender el riesgo de los dispositivos no certificados y el impacto del tráfico anómalo en la red compartida.'
          },
          {
            bold: 'Sociedad:',
            text: 'Promover el uso responsable de la tecnología, la privacidad y la elección de equipos con certificación oficial.'
          },
          {
            bold: 'Recomendación general:',
            text: 'La concientización debe ser una prioridad compartida: el conocimiento del riesgo protege tanto a los usuarios como a la red.'
          }
        ]
      }
    ],
    goldenRule: {
      text: 'La concientización no es un procedimiento: es una cultura que protege a los usuarios y a la red.',
      variant: 'cyan'
    }
  },
  {
    id: 'slide-9-fin',
    index: 8,
    theme: 'dark',
    template: 'closing-thanks',
    modulePill: '',
    yellowTag: 'CONTENIDO ILUSTRATIVO',
    title: 'FIN — ¡GRACIAS!',
    subtitle:
      'Proteger la privacidad de los hogares y la calidad de la red es un trabajo conjunto.',
    footerLabel: 'Recurso educativo — sin datos reales de empresas o clientes',
    heroBullets: [
      {
        bold: 'Detección proactiva:',
        text: 'Monitoreo de asimetría y registro del incidente.'
      },
      {
        bold: 'Gestión colaborativa:',
        text: 'Contacto empático y acompañamiento hasta la resolución.'
      },
      {
        bold: 'Protección de la red:',
        text: 'Bloqueo temporal y reemplazo por equipos certificados.'
      }
    ]
  }
];
