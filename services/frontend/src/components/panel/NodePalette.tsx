import React, { useState } from 'react';

interface NodePaletteProps {
  onClose?: () => void;
}

interface PaletteNodeItem {
  type: string;
  name: string;
  subtitle: string;
  badge?: string;
  icon: string;
  category: string;
  color: 'primary' | 'secondary' | 'tertiary' | 'error';
}

const PALETTE_ITEMS: PaletteNodeItem[] = [
  {
    type: 'inputNode',
    name: '사용자 입력',
    subtitle: '파이프라인 시작',
    badge: 'START',
    icon: 'login',
    category: '기본',
    color: 'tertiary',
  },
  {
    type: 'llmNode',
    name: 'LLM',
    subtitle: '대화형 AI 모델',
    badge: 'v4.0',
    icon: 'neurology',
    category: 'LLM',
    color: 'secondary',
  },
  {
    type: 'searchNode',
    name: '웹 검색',
    subtitle: '웹에서 정보 검색',
    badge: 'SERP',
    icon: 'travel_explore',
    category: '도구',
    color: 'primary',
  },
  {
    type: 'calculatorNode',
    name: '계산기 도구',
    subtitle: '정밀 수학 연산',
    badge: 'MATH',
    icon: 'calculate',
    category: '도구',
    color: 'tertiary',
  },
  {
    type: 'agentNode',
    name: 'Autonomous Agent',
    subtitle: '자율 에이전트',
    badge: 'AUTO',
    icon: 'smart_toy',
    category: 'LLM',
    color: 'secondary',
  },
  {
    type: 'outputNode',
    name: '결과 출력',
    subtitle: '최종 결과 렌더링',
    badge: 'EXIT',
    icon: 'output',
    category: '기본',
    color: 'error',
  },
];

const CATEGORIES = ['전체', '기본', 'LLM', '도구'];

export const NodePalette: React.FC<NodePaletteProps> = ({ onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const filteredItems = PALETTE_ITEMS.filter((item) => {
    const matchesCategory = selectedCategory === '전체' || item.category === selectedCategory;
    const matchesQuery =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <aside className="w-72 lg:w-80 shrink-0 bg-surface-container-lowest/95 backdrop-blur-xl border-r border-outline-variant/30 flex flex-col z-10 shadow-xl overflow-hidden">
      {/* Palette Header */}
      <div className="p-space-md flex items-center justify-between pb-space-sm">
        <div className="flex items-center gap-space-xs">
          <span className="material-symbols-outlined text-primary text-[20px]">account_tree</span>
          <span className="font-display text-sm font-bold text-on-surface">노드 라이브러리</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-surface-container text-on-surface-variant flex items-center justify-center transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        )}
      </div>

      {/* Palette Search Input */}
      <div className="px-space-md pb-space-xs">
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-2.5 text-outline text-[18px] pointer-events-none">
            search
          </span>
          <input
            type="text"
            placeholder="노드 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-3 bg-surface-container border border-outline-variant/30 rounded-lg text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Filter Chips */}
      <div className="px-space-md pb-space-sm flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-primary-container/25 text-primary border border-primary/40'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
              }`}
              type="button"
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Node List */}
      <div className="flex-1 overflow-y-auto px-space-md py-space-xs space-y-2">
        {filteredItems.map((item) => {
          return (
            <div
              key={item.type}
              onDragStart={(e) => onDragStart(e, item.type)}
              draggable
              className="group flex items-center gap-space-sm p-2.5 rounded-xl bg-surface-container-low/70 hover:bg-surface-container hover:translate-x-1 cursor-grab active:cursor-grabbing transition-all border border-outline-variant/20 hover:border-outline-variant/50 shadow-sm"
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 ${
                  item.color === 'secondary'
                    ? 'bg-secondary-container/30 text-secondary shadow-[0_0_12px_rgba(208,188,255,0.25)]'
                    : item.color === 'tertiary'
                    ? 'bg-tertiary-container/30 text-tertiary shadow-[0_0_12px_rgba(76,215,246,0.25)]'
                    : item.color === 'error'
                    ? 'bg-error-container/30 text-error shadow-[0_0_12px_rgba(255,180,171,0.25)]'
                    : 'bg-primary-container/20 text-primary shadow-[0_0_12px_rgba(77,142,255,0.25)]'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-display text-xs font-semibold text-on-surface truncate">
                    {item.name}
                  </p>
                  {item.badge && (
                    <span className="text-[10px] font-mono text-outline">{item.badge}</span>
                  )}
                </div>
                <p className="text-[11px] text-outline truncate">{item.subtitle}</p>
              </div>
              <span className="material-symbols-outlined text-outline group-hover:text-primary text-[18px]">
                drag_indicator
              </span>
            </div>
          );
        })}
      </div>

      {/* Node Helper Footnote */}
      <div className="p-space-sm bg-surface-container-lowest text-center border-t border-outline-variant/20">
        <span className="text-[11px] text-outline">캔버스로 드래그하여 노드를 추가하세요</span>
      </div>
    </aside>
  );
};
