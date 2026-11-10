import { FlowchartNodeData, FlowchartEdgeData, FlowchartStepCluster } from '../types';

export const FLOWCHART_NODES: FlowchartNodeData[] = [
  {
    id: 'deteccion',
    label: 'Detección y registro',
    sublabel: 'Monitoreo y evidencia',
    shape: 'rect',
    category: 'ops',
    x: 100,
    y: 330,
    width: 340,
    height: 100,
    detailText:
      'Identificación de tráfico anómalo o consumo desbalanceado en el monitoreo. Registro del caso con la evidencia disponible.'
  },
  {
    id: 'acompanamiento',
    label: 'Acompañamiento CX',
    sublabel: 'Contacto y orientación',
    shape: 'rect',
    category: 'support',
    x: 620,
    y: 330,
    width: 340,
    height: 100,
    detailText:
      'Contacto con el cliente para explicar la situación, priorizar la privacidad y orientar las opciones de solución.'
  },
  {
    id: 'resolucion',
    label: 'Resolución',
    sublabel: 'Incidente mitigado',
    shape: 'rect',
    category: 'close',
    x: 1140,
    y: 330,
    width: 340,
    height: 100,
    detailText:
      'El cliente desconecta o reemplaza el equipo, o se aplica una medida de mitigación. Se verifica la normalización del servicio.'
  }
];

export const FLOWCHART_EDGES: FlowchartEdgeData[] = [
  { id: 'e-deteccion-acompanamiento', from: 'deteccion', to: 'acompanamiento' },
  { id: 'e-acompanamiento-resolucion', from: 'acompanamiento', to: 'resolucion' }
];

export const FLOWCHART_STEPS: FlowchartStepCluster[] = [
  {
    stepIndex: 0,
    title: 'Detección, acompañamiento y resolución',
    badge: 'FLUJO GENERAL',
    description:
      'Flujo general de mitigación de una red interna infectada: detectar, acompañar al cliente y resolver el incidente.',
    isOverview: true,
    activeNodeIds: FLOWCHART_NODES.map((n) => n.id),
    activeEdgeIds: FLOWCHART_EDGES.map((e) => e.id),
    cameraBox: { x: 60, y: 270, w: 1480, h: 300 }
  }
];
