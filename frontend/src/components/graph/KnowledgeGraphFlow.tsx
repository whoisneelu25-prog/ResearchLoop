import React, { useState, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  MarkerType,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Network, Filter, Search, Info, X, ZoomIn, ZoomOut } from 'lucide-react';
import { KnowledgeGraph, GraphNode } from '../../types';

interface KnowledgeGraphFlowProps {
  graph: KnowledgeGraph;
}

export const KnowledgeGraphFlow: React.FC<KnowledgeGraphFlowProps> = ({ graph }) => {
  const [selectedType, setSelectedType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  // Filter nodes based on user selections
  const filteredGraphNodes = useMemo(() => {
    return graph.nodes.filter((node) => {
      const matchesType = selectedType === 'All' || node.type === selectedType;
      const matchesSearch =
        !searchQuery || node.label.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [graph.nodes, selectedType, searchQuery]);

  const activeNodeIds = useMemo(() => {
    return new Set(filteredGraphNodes.map((n) => n.id));
  }, [filteredGraphNodes]);

  // Convert to React Flow Nodes with circular/layered layout coordinates
  const flowNodes: Node[] = useMemo(() => {
    const total = filteredGraphNodes.length;
    const radius = Math.max(260, total * 35);
    const centerX = 400;
    const centerY = 320;

    return filteredGraphNodes.map((gn, idx) => {
      let bgColor = '#F1F5F9';
      let textColor = '#0F172A';
      let borderColor = '#CBD5E1';

      if (gn.type === 'Disease') {
        bgColor = '#0F172A';
        textColor = '#FFFFFF';
        borderColor = '#334155';
      } else if (gn.type === 'Drug') {
        bgColor = '#155EEF';
        textColor = '#FFFFFF';
        borderColor = '#0F48BD';
      } else if (gn.type === 'Biomarker') {
        bgColor = '#0F766E';
        textColor = '#FFFFFF';
        borderColor = '#115E59';
      } else if (gn.type === 'Gap') {
        bgColor = '#FEF3C7';
        textColor = '#92400E';
        borderColor = '#F59E0B';
      } else if (gn.type === 'Hypothesis') {
        bgColor = '#EEF2FF';
        textColor = '#3730A3';
        borderColor = '#6366F1';
      } else if (gn.type === 'Study') {
        const resType = gn.properties?.result_type;
        if (resType === 'positive') {
          bgColor = '#DCFCE7';
          textColor = '#166534';
          borderColor = '#22C55E';
        } else if (resType === 'negative' || resType === 'null') {
          bgColor = '#FEE2E2';
          textColor = '#991B1B';
          borderColor = '#EF4444';
        } else {
          bgColor = '#FEF9C3';
          textColor = '#854D0E';
          borderColor = '#EAB308';
        }
      }

      // Calculate position
      let x = centerX;
      let y = centerY;
      if (gn.type === 'Disease') {
        x = centerX;
        y = centerY;
      } else {
        const angle = (idx / (total || 1)) * 2 * Math.PI;
        x = centerX + radius * Math.cos(angle);
        y = centerY + radius * Math.sin(angle);
      }

      return {
        id: gn.id,
        data: {
          label: (
            <div className="text-center select-none py-0.5">
              <div className="text-[9px] uppercase font-bold tracking-wider opacity-75">{gn.type}</div>
              <div className="font-semibold text-xs leading-tight line-clamp-2 mt-0.5">{gn.label}</div>
            </div>
          ),
          rawNode: gn,
        },
        position: { x, y },
        style: {
          background: bgColor,
          color: textColor,
          border: `1.5px solid ${borderColor}`,
          borderRadius: gn.type === 'Disease' ? '24px' : '8px',
          padding: '8px 12px',
          fontSize: '11px',
          minWidth: '110px',
          maxWidth: '180px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        },
      };
    });
  }, [filteredGraphNodes]);

  // Convert to React Flow Edges
  const flowEdges: Edge[] = useMemo(() => {
    return graph.edges
      .filter((e) => activeNodeIds.has(e.source) && activeNodeIds.has(e.target))
      .map((ge) => {
        let stroke = '#94A3B8';
        let animated = false;

        if (ge.relationship === 'CONTRADICTS') {
          stroke = '#EF4444';
          animated = true;
        } else if (ge.relationship === 'SUGGESTS') {
          stroke = '#6366F1';
          animated = true;
        } else if (ge.relationship === 'TARGETS') {
          stroke = '#155EEF';
        }

        return {
          id: ge.id,
          source: ge.source,
          target: ge.target,
          label: ge.label || ge.relationship,
          type: 'smoothstep',
          animated,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: stroke,
            width: 14,
            height: 14,
          },
          style: {
            stroke,
            strokeWidth: ge.relationship === 'CONTRADICTS' ? 2 : 1.5,
          },
          labelStyle: {
            fontSize: '9px',
            fill: '#475569',
            fontWeight: 500,
          },
          labelBgStyle: {
            fill: '#FFFFFF',
            fillOpacity: 0.9,
            rx: 2,
            ry: 2,
          },
        };
      });
  }, [graph.edges, activeNodeIds]);

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNode(node.data.rawNode);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs relative flex flex-col h-[650px]">
      {/* Top Filter Bar */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-brand-600" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Research Knowledge Graph</span>
          <span className="text-xs text-slate-500">({filteredGraphNodes.length} nodes, {flowEdges.length} edges)</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search graph nodes..."
              className="pl-8 pr-2.5 py-1 bg-white border border-slate-200 rounded text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="All">All Entities</option>
            <option value="Disease">Disease</option>
            <option value="Drug">Drug / Intervention</option>
            <option value="Biomarker">Biomarkers</option>
            <option value="Study">Clinical Studies</option>
            <option value="Gap">Research Gaps</option>
            <option value="Hypothesis">Research Directions</option>
          </select>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 relative bg-slate-50/50">
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          onNodeClick={onNodeClick}
          fitView
          attributionPosition="bottom-left"
        >
          <Background color="#CBD5E1" gap={16} size={1} />
          <Controls position="top-right" className="bg-white border border-slate-200 shadow-xs" />
          <MiniMap
            nodeColor={(n) => {
              if (n.style?.background) return n.style.background as string;
              return '#94A3B8';
            }}
            maskColor="rgba(240, 244, 248, 0.7)"
            className="bg-white border border-slate-200 rounded shadow-xs"
          />
        </ReactFlow>

        {/* Legend Overlay */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs border border-slate-200 rounded-lg p-2.5 text-[11px] shadow-sm z-10 space-y-1">
          <span className="font-bold text-slate-700 block uppercase text-[9px] mb-1">Entity Legend</span>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-900" /><span>Disease</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-600" /><span>Drug</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-teal-600" /><span>Biomarker</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span>Positive Study</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /><span>Negative Study</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /><span>Research Gap</span></div>
          </div>
        </div>

        {/* Node Inspector Drawer */}
        {selectedNode && (
          <div className="absolute top-3 right-3 w-80 bg-white border border-slate-200 rounded-lg shadow-lg p-4 z-20 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">{selectedNode.type}</span>
                <h4 className="text-sm font-bold text-slate-900 leading-snug mt-0.5">{selectedNode.label}</h4>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedNode.properties && Object.keys(selectedNode.properties).length > 0 && (
              <div className="space-y-1.5 text-xs border-t border-slate-100 pt-2">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Extracted Properties</span>
                {Object.entries(selectedNode.properties).map(([k, v]) => (
                  <div key={k} className="flex justify-between py-0.5 text-slate-700">
                    <span className="text-slate-500 font-medium capitalize">{k.replace('_', ' ')}:</span>
                    <span className="font-semibold text-right truncate max-w-[150px]">{String(v)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
