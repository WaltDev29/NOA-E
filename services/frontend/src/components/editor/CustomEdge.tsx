import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, useReactFlow } from '@xyflow/react';

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: any) {
  const { setEdges } = useReactFlow();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgeClick = (evt: React.MouseEvent, id: string) => {
    evt.stopPropagation();
    setEdges((edges) => edges.filter((e) => e.id !== id));
  };

  const defaultStyle = {
    stroke: '#adc6ff',
    strokeWidth: 2.5,
    strokeDasharray: '6 4',
    filter: 'drop-shadow(0 0 6px rgba(77, 142, 255, 0.4))',
    ...style,
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={defaultStyle} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <button
            className="w-5 h-5 bg-surface-container-high border border-outline-variant rounded-full flex items-center justify-center text-outline hover:bg-error hover:text-on-error hover:border-error transition-all shadow-md cursor-pointer hover:scale-110"
            onClick={(event) => onEdgeClick(event, id)}
            title="연결선 삭제"
            type="button"
          >
            <span className="material-symbols-outlined text-[12px]">close</span>
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
