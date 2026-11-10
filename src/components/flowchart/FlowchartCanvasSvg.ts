import { FLOWCHART_NODES, FLOWCHART_EDGES, FLOWCHART_STEPS } from '../../data/flowchartData';
import { FlowchartNodeData } from '../../types';

export function getBrandCategoryColors(cat: FlowchartNodeData['category']) {
  switch (cat) {
    case 'start-end':
      return { fill: '#050b16', stroke: '#38bdf8', text: '#ffffff' };
    case 'ops':
      return { fill: '#0f2747', stroke: '#38bdf8', text: '#ffffff' };
    case 'support':
      return { fill: '#0f2747', stroke: '#fbbf24', text: '#ffffff' };
    case 'decision':
      return { fill: '#081326', stroke: '#fbbf24', text: '#fbbf24' };
    case 'sla':
      return { fill: '#081326', stroke: '#fbbf24', text: '#fbbf24' };
    case 'block':
      return { fill: '#fb7185', stroke: '#ffffff', text: '#ffffff' };
    case 'close':
      return { fill: '#0f2747', stroke: '#38bdf8', text: '#38bdf8' };
  }
}

export function buildEdgePath(fromNode: FlowchartNodeData, toNode: FlowchartNodeData): {
  d: string;
  labelX: number;
  labelY: number;
} {
  const fCx = fromNode.x + fromNode.width / 2;
  const fCy = fromNode.y + fromNode.height / 2;
  const tCx = toNode.x + toNode.width / 2;
  const tCy = toNode.y + toNode.height / 2;

  if (Math.abs(fCx - tCx) > 120) {
    if (Math.abs(fCy - tCy) < 40) {
      const startX = tCx > fCx ? fromNode.x + fromNode.width : fromNode.x;
      const endX = tCx > fCx ? toNode.x : toNode.x + toNode.width;
      return {
        d: `M ${startX} ${fCy} L ${endX} ${tCy}`,
        labelX: (startX + endX) / 2,
        labelY: fCy - 12
      };
    }
    const exitX = tCx > fCx ? fromNode.x + fromNode.width : fromNode.x;
    const exitY = fCy;
    const entryX = tCx > fCx ? toNode.x : toNode.x + toNode.width;
    const entryY = tCy;
    return {
      d: `M ${exitX} ${exitY} L ${(exitX + entryX) / 2} ${exitY} L ${(exitX + entryX) / 2} ${entryY} L ${entryX} ${entryY}`,
      labelX: (exitX + entryX) / 2,
      labelY: exitY - 12
    };
  }

  const startY = fromNode.y + fromNode.height;
  const endY = toNode.y;
  return {
    d: `M ${fCx} ${startY} L ${tCx} ${endY}`,
    labelX: fCx + 24,
    labelY: (startY + endY) / 2
  };
}

export function renderFlowchartSvgLayers(
  svgEl: SVGSVGElement,
  stepIndex: number,
  selectedNodeId: string | null
): void {
  const step = FLOWCHART_STEPS[stepIndex];
  const activeNodes = new Set(step.activeNodeIds);
  const activeEdges = new Set(step.activeEdgeIds);

  const edgesLayer = svgEl.querySelector('.edges-layer') as SVGGElement;
  const nodesLayer = svgEl.querySelector('.nodes-layer') as SVGGElement;

  edgesLayer.innerHTML = FLOWCHART_EDGES.map((edge) => {
    const fromN = FLOWCHART_NODES.find((n) => n.id === edge.from)!;
    const toN = FLOWCHART_NODES.find((n) => n.id === edge.to)!;
    const isAct = activeEdges.has(edge.id);
    const { d, labelX, labelY } = buildEdgePath(fromN, toN);
    const isBlockEdge = toN.category === 'block' || toN.category === 'sla';
    const strokeColor = isAct ? (isBlockEdge ? '#fb7185' : '#38bdf8') : 'rgba(255,255,255,0.22)';
    const markerId = isAct ? (isBlockEdge ? 'url(#arrow-orange)' : 'url(#arrow-cyan)') : 'url(#arrow-dim)';
    const opacity = isAct ? '1' : '0.25';

    return `
      <g opacity="${opacity}">
        <path
          d="${d}"
          fill="none"
          stroke="${strokeColor}"
          stroke-width="${isAct ? '3.5' : '2'}"
          ${edge.dashed ? 'stroke-dasharray="8 5"' : ''}
          marker-end="${markerId}"
        />
        ${
          edge.label
            ? `<rect x="${labelX - 42}" y="${labelY - 12}" width="84" height="22" rx="6" fill="#0f2747" stroke="${strokeColor}" stroke-width="1.5"/>
               <text x="${labelX}" y="${labelY + 3}" text-anchor="middle" fill="#fbbf24" font-family="Raleway, sans-serif" font-size="11.5" font-weight="800">${edge.label}</text>`
            : ''
        }
      </g>
    `;
  }).join('');

  nodesLayer.innerHTML = FLOWCHART_NODES.map((node) => {
    const isAct = activeNodes.has(node.id);
    const isSel = selectedNodeId === node.id;
    const colors = getBrandCategoryColors(node.category);
    const opacity = isAct ? '1' : '0.22';
    const strokeW = isSel ? '4' : isAct ? '2.8' : '1.5';
    const strokeColor = isSel ? '#fbbf24' : colors.stroke;
    const cx = node.x + node.width / 2;
    const cy = node.y + node.height / 2;

    let shapeSvg = '';
    if (node.shape === 'ellipse') {
      shapeSvg = `<ellipse cx="${cx}" cy="${cy}" rx="${node.width / 2}" ry="${node.height / 2}" fill="${colors.fill}" stroke="${strokeColor}" stroke-width="${strokeW}" />`;
    } else if (node.shape === 'diamond') {
      const pts = `${cx},${node.y} ${node.x + node.width},${cy} ${cx},${node.y + node.height} ${node.x},${cy}`;
      shapeSvg = `<polygon points="${pts}" fill="${colors.fill}" stroke="${strokeColor}" stroke-width="${strokeW}" />`;
    } else {
      shapeSvg = `<rect x="${node.x}" y="${node.y}" width="${node.width}" height="${node.height}" rx="10" fill="${colors.fill}" stroke="${strokeColor}" stroke-width="${strokeW}" ${
        node.shape === 'dashed' ? 'stroke-dasharray="8 5"' : ''
      } />`;
    }

    return `
      <g class="flow-node-group" data-node-id="${node.id}" opacity="${opacity}" ${
        isAct ? 'filter="url(#node-glow)"' : ''
      }>
        ${shapeSvg}
        <text x="${cx}" y="${node.sublabel ? cy - 6 : cy + 6}" text-anchor="middle" fill="${colors.text}" font-family="Raleway, sans-serif" font-weight="800" font-size="18">
          ${node.label}
        </text>
        ${
          node.sublabel
            ? `<text x="${cx}" y="${cy + 18}" text-anchor="middle" fill="#e2e8f0" font-family="Raleway, sans-serif" font-weight="600" font-size="12.5">
                ${node.sublabel}
              </text>`
            : ''
        }
      </g>
    `;
  }).join('');
}
