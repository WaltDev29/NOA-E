import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../../context/OnboardingContext';

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
    name: 'Input',
    subtitle: '사용자 입력',
    icon: 'login',
    category: '기본',
    color: 'tertiary',
  },
  {
    type: 'outputNode',
    name: 'Output',
    subtitle: '최종 결과 렌더링',
    icon: 'output',
    category: '기본',
    color: 'error',
  },
  {
    type: 'plannerNode',
    name: 'Planner',
    subtitle: '다단계 계획 수립',
    icon: 'assignment',
    category: 'LLM',
    color: 'primary',
  },
  {
    type: 'routerNode',
    name: 'Router',
    subtitle: '작업 분기 및 루프 제어',
    icon: 'alt_route',
    category: 'LLM',
    color: 'secondary',
  },
  {
    type: 'llmNode',
    name: 'LLM (Worker)',
    subtitle: '대화 및 작업 수행',
    icon: 'neurology',
    category: 'LLM',
    color: 'secondary',
  },
  {
    type: 'aggregatorNode',
    name: 'Aggregator',
    subtitle: '결과 종합 및 최종 합성',
    icon: 'auto_awesome',
    category: 'LLM',
    color: 'tertiary',
  },
  {
    type: 'searchNode',
    name: '검색 Tool',
    subtitle: '웹에서 정보 검색',
    icon: 'travel_explore',
    category: '도구',
    color: 'primary',
  },
  {
    type: 'weatherNode',
    name: '날씨 Tool',
    subtitle: '현재 날씨 및 일별 예보 조회',
    icon: 'partly_cloudy_day',
    category: '도구',
    color: 'tertiary',
  },
  {
    type: 'youtubeNode',
    name: 'YouTube Tool',
    subtitle: 'YouTube 영상 검색',
    icon: 'smart_display',
    category: '도구',
    color: 'secondary',
  },
];

const CATEGORIES = ['전체', '기본', 'LLM', '도구'];

export const NodePalette: React.FC<NodePaletteProps> = ({ onClose }) => {
  const { activeGuide, studioQuestStep } = useOnboarding();
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');

  // 에이전트 제작 가이드 실습 단계(Step 3: Input, Step 5: LLM, Step 7: Output) 진입 시 대상 노드가 잘 보이도록 카테고리/검색어 초기화
  useEffect(() => {
    if (activeGuide === 'studio_quest' && (studioQuestStep === 3 || studioQuestStep === 5 || studioQuestStep === 7)) {
      setSelectedCategory('전체');
      setSearchQuery('');
    }
  }, [activeGuide, studioQuestStep]);

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
    <aside data-tour="studio-palette" className="w-72 lg:w-80 shrink-0 bg-surface-container-lowest/95 backdrop-blur-xl border-r border-outline-variant/30 flex flex-col z-10 shadow-xl overflow-hidden">
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
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="px-space-md py-space-xs flex items-center gap-1 border-b border-outline-variant/20 overflow-x-auto no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-primary/20 text-primary shadow-[0_0_12px_rgba(77,142,255,0.3)]'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
            type="button"
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="p-space-md pb-space-xs">
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-2.5 text-outline text-[18px] pointer-events-none">
            search
          </span>
          <input
            type="text"
            placeholder="노드 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container/60 border border-outline-variant/40 rounded-lg pl-8 pr-3 py-1.5 text-xs text-on-surface placeholder:text-outline/70 focus:outline-none focus:border-primary/60 transition-colors"
          />
        </div>
      </div>

      {/* Node List Items */}
      <div className="flex-1 overflow-y-auto p-space-md flex flex-col gap-2">
        {filteredItems.map((item) => {
          const dataTourAttr =
            item.type === 'inputNode'
              ? 'palette-input-node'
              : item.type === 'llmNode'
              ? 'palette-llm-node'
              : item.type === 'outputNode'
              ? 'palette-output-node'
              : undefined;

          return (
            <div
              key={item.type}
              data-tour={dataTourAttr}
              draggable
              onDragStart={(e) => onDragStart(e, item.type)}
              className="group p-2.5 rounded-xl bg-surface-container/40 hover:bg-surface-container border border-outline-variant/30 hover:border-outline-variant/60 cursor-grab active:cursor-grabbing transition-all hover:shadow-[0_4px_16px_rgba(0,0,0,0.3)] flex items-center gap-3 select-none"
            >
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                item.color === 'primary'
                  ? 'bg-primary-container/20 text-primary'
                  : item.color === 'secondary'
                  ? 'bg-secondary-container/40 text-secondary'
                  : item.color === 'tertiary'
                  ? 'bg-tertiary-container/30 text-tertiary'
                  : 'bg-error-container/40 text-error'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-display text-xs font-bold text-on-surface group-hover:text-primary transition-colors truncate">
                {item.name}
              </span>
              <span className="text-[11px] text-outline truncate">{item.subtitle}</span>
            </div>
            <span className="material-symbols-outlined text-[16px] text-outline/50 group-hover:text-primary transition-colors">
              drag_indicator
            </span>
          </div>
          );
        })}
      </div>
    </aside>
  );
};
