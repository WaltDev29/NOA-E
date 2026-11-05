import React, { useState, useMemo, useEffect } from 'react';
import type { Node, Edge } from '@xyflow/react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Link, useNavigate, useParams } from '../router/Router';
import { useOnboarding } from '../context/OnboardingContext';
import { SpotlightTour } from '../components/onboarding/SpotlightTour';

export interface TemplateWorkflowNode {
  id: string;
  type: string;
  label: string;
  position: { x: number; y: number };
  config: Record<string, any>;
}

export interface TemplateWorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface AgentTemplate {
  id: string;
  name: string;
  category: 'chat' | 'search' | 'document' | 'coding' | 'media' | 'automation';
  categoryLabel: string;
  difficulty: '기초' | '중급' | '고급';
  difficultyColor: string;
  description: string;
  tags: string[];
  nodeCount: number;
  themeColor: string;
  dotColor: string;
  graphSvg: React.ReactNode;
  workflow: {
    schema_version: string;
    metadata: {
      agent_id: string;
      agent_name: string;
      description: string;
      exported_at: string;
    };
    nodes: TemplateWorkflowNode[];
    edges: TemplateWorkflowEdge[];
  };
}

// 내보내기된 템플릿 JSON의 백엔드 노드 타입을 스튜디오(ReactFlow) 노드 타입으로 매핑하기 위한 변환 테이블
const BACKEND_TO_REACTFLOW_NODE_TYPE: Record<string, string> = {
  input: 'inputNode',
  output: 'outputNode',
  llm: 'llmNode',
  planner: 'plannerNode',
  router: 'routerNode',
  aggregator: 'aggregatorNode',
  search: 'searchNode',
  weather: 'weatherNode',
  youtube: 'youtubeNode',
  agent: 'agentNode',
};

// 템플릿 선택 시 스튜디오 캔버스에 즉시 렌더링할 수 있도록 ReactFlow 규격의 Node/Edge 배열로 변환
export const convertTemplateToReactFlow = (
  template: AgentTemplate
): { nodes: Node[]; edges: Edge[] } => {
  const nodes: Node[] = template.workflow.nodes.map((n) => ({
    id: n.id,
    type: BACKEND_TO_REACTFLOW_NODE_TYPE[n.type] || n.type,
    position: { x: n.position.x, y: n.position.y },
    data: {
      label: n.label,
      config: { ...n.config },
    },
  }));

  const edges: Edge[] = template.workflow.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    ...(e.sourceHandle ? { sourceHandle: e.sourceHandle } : {}),
    ...(e.targetHandle ? { targetHandle: e.targetHandle } : {}),
    type: 'custom',
    animated: true,
  }));

  return { nodes, edges };
};

export interface CategoryInfo {
  id: string;
  name: string;
  icon: string;
  description: string;
  accentColor: string;
}

const CATEGORIES: CategoryInfo[] = [
  {
    id: 'chat',
    name: '대화 & 챗봇',
    icon: 'forum',
    description: '역할극 튜터, 고객 응대, 성격 기반 대화형 AI 어시스턴트',
    accentColor: 'text-primary',
  },
  {
    id: 'search',
    name: '리서치 & 검색',
    icon: 'travel_explore',
    description: '실시간 웹 검색, 뉴스 수집, 시장 트렌드 조사 에이전트',
    accentColor: 'text-tertiary',
  },
  {
    id: 'document',
    name: '문서 & 지식 (RAG)',
    icon: 'description',
    description: 'PDF 및 긴 문서 분석, 교재 Q&A, 회의록 자동 요약',
    accentColor: 'text-secondary',
  },
  {
    id: 'coding',
    name: '코딩 & 개발 도구',
    icon: 'code_blocks',
    description: '코드 오류 디버깅, SQL 생성, API 테스트 자동화',
    accentColor: 'text-primary',
  },
  {
    id: 'media',
    name: '멀티모달 & 미디어',
    icon: 'image',
    description: 'AI 이미지 생성 프롬프트 확장, 유튜브 스크립트 기획',
    accentColor: 'text-secondary',
  },
  {
    id: 'automation',
    name: '자동화 & 워크플로우',
    icon: 'account_tree',
    description: '이메일 자동 답장, 날씨/일정 브리핑, 조건부 라우팅',
    accentColor: 'text-tertiary',
  },
];

export const TEMPLATES_DATA: AgentTemplate[] = [
  {
    id: 'agent-1793841708633',
    name: '날씨 조회 에이전트',
    category: 'search',
    categoryLabel: '리서치 & 검색',
    difficulty: '기초',
    difficultyColor: 'bg-primary/20 text-primary border-primary/30',
    description: '날씨 Tool을 활용하여 날씨 조회가 가능한 에이전트입니다.',
    tags: ['Input', 'LLM', '날씨 Tool', 'Output'],
    nodeCount: 4,
    themeColor: 'border-tertiary/40 hover:border-tertiary',
    dotColor: '#4cd7f6',
    graphSvg: (
      <svg className="w-full h-full p-4 relative z-10" viewBox="0 0 260 120" fill="none">
        <path d="M 52 76 L 104 76" stroke="#4d8eff" strokeWidth="2" />
        <path d="M 130 40 L 130 60" stroke="#4cd7f6" strokeWidth="2" strokeDasharray="3 3" />
        <path d="M 156 76 L 204 76" stroke="#c4abff" strokeWidth="2" />
        <rect x="14" y="60" width="38" height="32" rx="8" fill="#171f33" stroke="#4cd7f6" strokeWidth="1.5" />
        <text x="33" y="80" fill="#4cd7f6" fontSize="8.5" fontWeight="bold" textAnchor="middle" fontFamily="monospace">INPUT</text>
        <rect x="98" y="10" width="64" height="28" rx="8" fill="#171f33" stroke="#4cd7f6" strokeWidth="1.5" />
        <text x="130" y="28" fill="#4cd7f6" fontSize="8" fontWeight="bold" textAnchor="middle">날씨 TOOL</text>
        <rect x="104" y="60" width="52" height="32" rx="8" fill="#222a3d" stroke="#c4abff" strokeWidth="1.5" />
        <text x="130" y="80" fill="#d0bcff" fontSize="9.5" fontWeight="bold" textAnchor="middle">LLM</text>
        <rect x="204" y="60" width="42" height="32" rx="8" fill="#171f33" stroke="#ff5449" strokeWidth="1.5" />
        <text x="225" y="80" fill="#ffb4ab" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">OUTPUT</text>
      </svg>
    ),
    workflow: {
      schema_version: '1.0',
      metadata: {
        agent_id: 'agent-1793841708633',
        agent_name: '날씨 조회 에이전트',
        description: '날씨 Tool을 활용하여 날씨 조회가 가능한 에이전트입니다.',
        exported_at: '2026-11-05T01:21:48.633Z',
      },
      nodes: [
        {
          id: 'input-1',
          type: 'input',
          label: 'Input',
          position: {
            x: -208.23529411764707,
            y: 69.41176470588238,
          },
          config: {
            input_text: '내일 서울 날씨 알려줘',
          },
        },
        {
          id: 'output-1',
          type: 'output',
          label: 'Output',
          position: {
            x: 405.8923654568209,
            y: 86.17759699624534,
          },
          config: {},
        },
        {
          id: 'llm-1',
          type: 'llm',
          label: 'LLM',
          position: {
            x: 98.8285356695869,
            y: 69.42866082603254,
          },
          config: {
            model: 'gpt-6-luna',
            temperature: 0.7,
            system_prompt: '당신은 사용자의 요청에 정확하고 친절하게 답변하는 유능한 AI 어시스턴트입니다.',
            react_loop: true,
            max_tool_iterations: 3,
            tool_instruction: '',
          },
        },
        {
          id: 'weather-1',
          type: 'weather',
          label: '날씨 Tool',
          position: {
            x: 98.82853566958693,
            y: -141.32878598247805,
          },
          config: {},
        },
      ],
      edges: [
        {
          id: 'xy-edge__llm-1right-output-1',
          source: 'llm-1',
          target: 'output-1',
          sourceHandle: 'right',
        },
        {
          id: 'xy-edge__input-1-llm-1left',
          source: 'input-1',
          target: 'llm-1',
          targetHandle: 'left',
        },
        {
          id: 'xy-edge__weather-1-llm-1tools',
          source: 'weather-1',
          target: 'llm-1',
          targetHandle: 'tools',
        },
      ],
    },
  },
  {
    id: 'agent-1793842038153',
    name: '검색 에이전트',
    category: 'search',
    categoryLabel: '리서치 & 검색',
    difficulty: '기초',
    difficultyColor: 'bg-primary/20 text-primary border-primary/30',
    description: '검색 Tool을 활용하여 검색이 가능한 에이전트입니다.',
    tags: ['Input', 'LLM', '검색 Tool', 'Output'],
    nodeCount: 4,
    themeColor: 'border-primary/40 hover:border-primary',
    dotColor: '#4d8eff',
    graphSvg: (
      <svg className="w-full h-full p-4 relative z-10" viewBox="0 0 260 120" fill="none">
        <path d="M 52 76 L 104 76" stroke="#4d8eff" strokeWidth="2" />
        <path d="M 130 40 L 130 60" stroke="#4d8eff" strokeWidth="2" strokeDasharray="3 3" />
        <path d="M 156 76 L 204 76" stroke="#c4abff" strokeWidth="2" />
        <rect x="14" y="60" width="38" height="32" rx="8" fill="#171f33" stroke="#4cd7f6" strokeWidth="1.5" />
        <text x="33" y="80" fill="#4cd7f6" fontSize="8.5" fontWeight="bold" textAnchor="middle" fontFamily="monospace">INPUT</text>
        <rect x="98" y="10" width="64" height="28" rx="8" fill="#171f33" stroke="#4d8eff" strokeWidth="1.5" />
        <text x="130" y="28" fill="#adc6ff" fontSize="8" fontWeight="bold" textAnchor="middle">검색 TOOL</text>
        <rect x="104" y="60" width="52" height="32" rx="8" fill="#222a3d" stroke="#c4abff" strokeWidth="1.5" />
        <text x="130" y="80" fill="#d0bcff" fontSize="9.5" fontWeight="bold" textAnchor="middle">LLM</text>
        <rect x="204" y="60" width="42" height="32" rx="8" fill="#171f33" stroke="#ff5449" strokeWidth="1.5" />
        <text x="225" y="80" fill="#ffb4ab" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">OUTPUT</text>
      </svg>
    ),
    workflow: {
      schema_version: '1.0',
      metadata: {
        agent_id: 'agent-1793842038153',
        agent_name: '검색 에이전트',
        description: '검색 Tool을 활용하여 검색이 가능한 에이전트입니다.',
        exported_at: '2026-11-05T01:27:18.153Z',
      },
      nodes: [
        {
          id: 'input-1',
          type: 'input',
          label: 'Input',
          position: {
            x: 100,
            y: 100,
          },
          config: {
            input_text: '부캉이에 대해 조사해줘',
          },
        },
        {
          id: 'llm-1',
          type: 'llm',
          label: 'LLM',
          position: {
            x: 400,
            y: 100,
          },
          config: {
            model: 'gpt-6-luna',
            temperature: 0.7,
            system_prompt:
              '당신은 사용자의 요청에 정확하고 친절하게 답변하는 유능한 AI 어시스턴트입니다.\n모르는 지식은 검색 Tool을 사용하여 답변하시오.\n모르는 내용을 임의로 대답하지 마시오.',
            react_loop: true,
            max_tool_iterations: 3,
            tool_instruction: '',
          },
        },
        {
          id: 'output-1',
          type: 'output',
          label: 'Output',
          position: {
            x: 701.1764705882352,
            y: 117.64705882352942,
          },
          config: {},
        },
        {
          id: 'search-1',
          type: 'search',
          label: '검색 Tool',
          position: {
            x: 399.5294117647058,
            y: -111,
          },
          config: {},
        },
      ],
      edges: [
        {
          id: 'e1-2',
          source: 'input-1',
          target: 'llm-1',
          targetHandle: 'left',
        },
        {
          id: 'e2-3',
          source: 'llm-1',
          target: 'output-1',
          sourceHandle: 'right',
        },
        {
          id: 'xy-edge__search-1-llm-1tools',
          source: 'search-1',
          target: 'llm-1',
          targetHandle: 'tools',
        },
      ],
    },
  },
  {
    id: 'agent-1793843600225',
    name: '검색 + YouTube 에이전트',
    category: 'search',
    categoryLabel: '리서치 & 검색',
    difficulty: '고급',
    difficultyColor: 'bg-error/20 text-error border-error/30',
    description: 'Planner-Router-Worker-Aggregator 구조로 구성된 유튜브 및 웹 검색 에이전트',
    tags: ['Planner', 'Router', 'Aggregator', '검색 Tool', 'YouTube Tool'],
    nodeCount: 9,
    themeColor: 'border-secondary/40 hover:border-secondary',
    dotColor: '#c4abff',
    graphSvg: (
      <svg className="w-full h-full p-4 relative z-10" viewBox="0 0 260 120" fill="none">
        <path d="M 34 60 L 56 60" stroke="#4cd7f6" strokeWidth="1.8" />
        <path d="M 96 60 L 116 60" stroke="#4d8eff" strokeWidth="1.8" />
        <path d="M 152 60 L 172 26" stroke="#c4abff" strokeWidth="1.6" />
        <path d="M 152 60 L 172 60" stroke="#4cd7f6" strokeWidth="1.8" />
        <path d="M 152 60 L 172 94" stroke="#c4abff" strokeWidth="1.6" />
        <path d="M 212 60 L 226 60" stroke="#4cd7f6" strokeWidth="1.8" />
        <rect x="6" y="46" width="28" height="28" rx="6" fill="#171f33" stroke="#4cd7f6" strokeWidth="1.4" />
        <text x="20" y="63" fill="#4cd7f6" fontSize="6.5" fontWeight="bold" textAnchor="middle">IN</text>
        <rect x="56" y="46" width="40" height="28" rx="6" fill="#171f33" stroke="#4d8eff" strokeWidth="1.4" />
        <text x="76" y="63" fill="#adc6ff" fontSize="7" fontWeight="bold" textAnchor="middle">PLAN</text>
        <rect x="116" y="46" width="36" height="28" rx="6" fill="#222a3d" stroke="#c4abff" strokeWidth="1.4" />
        <text x="134" y="63" fill="#d0bcff" fontSize="6.5" fontWeight="bold" textAnchor="middle">ROUTE</text>
        <rect x="172" y="12" width="40" height="26" rx="6" fill="#171f33" stroke="#4d8eff" strokeWidth="1.4" />
        <text x="192" y="28" fill="#adc6ff" fontSize="6.5" fontWeight="bold" textAnchor="middle">검색</text>
        <rect x="172" y="46" width="40" height="28" rx="6" fill="#171f33" stroke="#4cd7f6" strokeWidth="1.4" />
        <text x="192" y="63" fill="#4cd7f6" fontSize="6.5" fontWeight="bold" textAnchor="middle">AGG</text>
        <rect x="172" y="82" width="40" height="26" rx="6" fill="#222a3d" stroke="#c4abff" strokeWidth="1.4" />
        <text x="192" y="98" fill="#d0bcff" fontSize="6.5" fontWeight="bold" textAnchor="middle">YT</text>
        <rect x="226" y="46" width="28" height="28" rx="6" fill="#171f33" stroke="#ff5449" strokeWidth="1.4" />
        <text x="240" y="63" fill="#ffb4ab" fontSize="6.5" fontWeight="bold" textAnchor="middle">OUT</text>
      </svg>
    ),
    workflow: {
      schema_version: '1.0',
      metadata: {
        agent_id: 'agent-1793843600225',
        agent_name: '검색 + YouTube 에이전트',
        description: 'Planner-Router-Worker-Aggregator 구조로 구성된 유튜브 및 웹 검색 에이전트',
        exported_at: '2026-11-05T01:53:20.225Z',
      },
      nodes: [
        {
          id: 'input-1',
          type: 'input',
          label: 'Input',
          position: {
            x: -208.23529411764707,
            y: 69.41176470588238,
          },
          config: {
            input_text: 'OpenAI 최신 소식 검색해줘.\n그리고 해당 소식 관련 유튜브 영상을 찾아줘.',
          },
        },
        {
          id: 'llm-1',
          type: 'llm',
          label: 'YouTube LLM',
          position: {
            x: 568.235294117647,
            y: 450.5882352941176,
          },
          config: {
            model: 'gpt-6-luna',
            temperature: 0.7,
            system_prompt: '랜덤 숫자를 출력해야 하는 경우 4를 출력하시오. 별도의 설명, 텍스트 없이 숫자 4만 출력합니다.',
            react_loop: true,
            max_tool_iterations: 3,
            tool_instruction: '',
          },
        },
        {
          id: 'output-1',
          type: 'output',
          label: 'Output',
          position: {
            x: 911.7647058823528,
            y: 98.8235294117647,
          },
          config: {},
        },
        {
          id: 'llm-2',
          type: 'llm',
          label: '검색 LLM',
          position: {
            x: 573.6470588235294,
            y: -140.41176470588232,
          },
          config: {
            model: 'gpt-6-luna',
            temperature: 0.7,
            system_prompt: '사용자의 수학 질문의 정답과 풀이 과정을 간단하게 설명하시오.\n',
            react_loop: true,
            max_tool_iterations: 3,
            tool_instruction: '',
          },
        },
        {
          id: 'planner-1',
          type: 'planner',
          label: 'Planner',
          position: {
            x: 51.29411764705878,
            y: 76.05882352941178,
          },
          config: {
            model: 'gpt-6-luna',
            temperature: 0.7,
            system_prompt:
              '당신은 전략적 AI 플래너입니다. 사용자의 복합 질문을 분석하여 목표를 달성하기 위한 구체적인 단계별 실행 계획을 세우세요.',
          },
        },
        {
          id: 'aggregator-1',
          type: 'aggregator',
          label: 'Aggregator',
          position: {
            x: 572.4705882352943,
            y: 77.23529411764704,
          },
          config: {
            model: 'gpt-6-luna',
            temperature: 0.7,
            system_prompt:
              '당신은 분석 종합 전문가입니다. 다양한 단계에서 수집되고 처리된 정보들을 바탕으로 논리적이고 친절한 최종 답변을 작성하세요.',
          },
        },
        {
          id: 'router-1',
          type: 'router',
          label: 'Router',
          position: {
            x: 304.235294117647,
            y: 77.23529411764707,
          },
          config: {
            model: 'gpt-6-luna',
            temperature: 0.7,
            system_prompt:
              '당신은 지능형 작업 분배 관리자입니다. 주어진 지침과 작업 내용을 바탕으로 가장 적절한 노드로 분기하세요.',
            max_loops: 5,
          },
        },
        {
          id: 'search-1',
          type: 'search',
          label: '검색 Tool',
          position: {
            x: 574.828535669587,
            y: -339.89968710888604,
          },
          config: {},
        },
        {
          id: 'youtube-1',
          type: 'youtube',
          label: 'YouTube Tool',
          position: {
            x: 568.9461827284106,
            y: 278.92384230287865,
          },
          config: {},
        },
      ],
      edges: [
        {
          id: 'xy-edge__aggregator-1right-output-1',
          source: 'aggregator-1',
          target: 'output-1',
          sourceHandle: 'right',
        },
        {
          id: 'xy-edge__router-1right-aggregator-1left',
          source: 'router-1',
          target: 'aggregator-1',
          sourceHandle: 'right',
          targetHandle: 'left',
        },
        {
          id: 'e-router-1-llm-1',
          source: 'router-1',
          target: 'llm-1',
          sourceHandle: 'right',
          targetHandle: 'left',
        },
        {
          id: 'e-llm-1-router-1-loop',
          source: 'llm-1',
          target: 'router-1',
          sourceHandle: 'right',
          targetHandle: 'loop-return',
        },
        {
          id: 'e-router-1-llm-2',
          source: 'router-1',
          target: 'llm-2',
          sourceHandle: 'right',
          targetHandle: 'left',
        },
        {
          id: 'e-llm-2-router-1-loop',
          source: 'llm-2',
          target: 'router-1',
          sourceHandle: 'right',
          targetHandle: 'loop-return',
        },
        {
          id: 'xy-edge__planner-1right-router-1left',
          source: 'planner-1',
          target: 'router-1',
          sourceHandle: 'right',
          targetHandle: 'left',
        },
        {
          id: 'xy-edge__input-1-planner-1left',
          source: 'input-1',
          target: 'planner-1',
          targetHandle: 'left',
        },
        {
          id: 'xy-edge__search-1-llm-2tools',
          source: 'search-1',
          target: 'llm-2',
          targetHandle: 'tools',
        },
        {
          id: 'xy-edge__youtube-1-llm-1tools',
          source: 'youtube-1',
          target: 'llm-1',
          targetHandle: 'tools',
        },
      ],
    },
  },
];

export const TemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const { setTourPage, checkAndTriggerPageTour } = useOnboarding();

  const [selectedCategory, setSelectedCategory] = useState<string>(categoryId || 'all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    setTourPage('templates');
    checkAndTriggerPageTour('templates');
  }, [setTourPage, checkAndTriggerPageTour]);

  useEffect(() => {
    if (categoryId) {
      setSelectedCategory(categoryId);
    } else {
      setSelectedCategory('all');
    }
  }, [categoryId]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: TEMPLATES_DATA.length };
    CATEGORIES.forEach((cat) => {
      counts[cat.id] = TEMPLATES_DATA.filter((t) => t.category === cat.id).length;
    });
    return counts;
  }, []);

  // Filtered templates based on selected category and search query
  const filteredTemplates = useMemo(() => {
    return TEMPLATES_DATA.filter((item) => {
      // Category filter
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;

      // Search query filter (matches name, description, category label, or tags)
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query === '' ||
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.categoryLabel.toLowerCase().includes(query) ||
        item.tags.some((t) => t.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleSelectCategory = (catId: string) => {
    setSelectedCategory(catId);
    if (catId === 'all') {
      navigate('/noa-e/templates');
    } else {
      navigate(`/noa-e/templates/${catId}`);
    }
  };

  const handleUseTemplate = (template: AgentTemplate) => {
    // Navigate to studio with template indicator
    navigate(`/noa-e/studio?template=${template.id}`);
  };

  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen flex flex-col">
      <Header />

      <main className="w-full pt-16 bg-background min-h-screen flex-1 flex flex-col">
        <div className="flex flex-col w-full">
          <div className="w-full px-4 sm:px-6 py-space-lg">
            <div className="flex flex-col lg:flex-row items-start gap-8">
              {/* 1. Left Sidebar Navigation Bar */}
              <aside data-tour="templates-categories" className="w-full lg:w-72 xl:w-80 shrink-0 flex flex-col gap-space-md lg:sticky lg:top-20">
                {/* Back to Home Link */}
                <Link
                  to="/noa-e"
                  className="inline-flex items-center gap-space-xs text-on-surface-variant hover:text-primary transition-colors py-space-xs group"
                >
                  <span className="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-1">
                    arrow_back
                  </span>
                  <span className="font-body-md text-body-md font-medium">홈으로 돌아가기</span>
                </Link>

                {/* Categories Navigation Container */}
                <div className="flex flex-col gap-2 bg-surface-container-low/70 backdrop-blur-md p-space-md rounded-2xl border border-outline-variant/30">
                  <div className="px-space-sm py-space-xs mb-1 flex items-center justify-between">
                    <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight font-bold flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-primary text-[20px]">category</span>
                      <span>에이전트 종류</span>
                    </span>
                    <span className="font-label-badge text-label-badge px-2 py-0.5 rounded-full bg-surface-container-high text-primary font-mono font-bold">
                      {TEMPLATES_DATA.length}개 템플릿
                    </span>
                  </div>

                  {/* Top: '전체' (All) Button */}
                  <button
                    type="button"
                    onClick={() => handleSelectCategory('all')}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between cursor-pointer border ${
                      selectedCategory === 'all'
                        ? 'bg-surface-container-high/80 text-primary border-primary/40 shadow-sm font-bold'
                        : 'bg-surface-container-lowest/40 border-outline-variant/20 hover:border-outline-variant/40 text-on-surface hover:text-primary'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="material-symbols-outlined text-[20px] shrink-0">
                        apps
                      </span>
                      <span className="text-sm font-semibold truncate">전체 템플릿</span>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-surface-container text-outline font-mono">
                      {categoryCounts.all}
                    </span>
                  </button>

                  <div className="my-1 border-t border-outline-variant/20" />

                  {/* Categories List */}
                  <div className="flex flex-col gap-1.5">
                    {CATEGORIES.map((cat) => {
                      const isSelected = selectedCategory === cat.id;
                      const count = categoryCounts[cat.id] || 0;

                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handleSelectCategory(cat.id)}
                          className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer border ${
                            isSelected
                              ? 'bg-surface-container-high/80 text-primary border-primary/40 shadow-sm font-bold'
                              : 'bg-surface-container-lowest/40 border-outline-variant/15 hover:border-outline-variant/30 text-on-surface-variant hover:text-on-surface'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="material-symbols-outlined text-[20px] shrink-0 text-primary/80">
                              {cat.icon}
                            </span>
                            <span className="text-xs sm:text-sm font-medium truncate">{cat.name}</span>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container text-outline font-mono">
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Helper Hint Box */}
                  <div className="mt-2 p-3 rounded-xl bg-surface-container-lowest/70 border border-outline-variant/20 text-outline flex items-start gap-2 text-xs">
                    <span className="material-symbols-outlined text-[16px] text-tertiary mt-0.5 shrink-0">
                      lightbulb
                    </span>
                    <span className="text-[11px] leading-relaxed">
                      원하는 템플릿을 선택하면 스튜디오에 즉시 노드가 로드되어 바로 실행할 수 있습니다.
                    </span>
                  </div>
                </div>
              </aside>

              {/* 2. Main Content Area (Centered in remaining space) */}
              <div data-tour="templates-grid" className="flex-1 w-full min-w-0 flex justify-center">
                <div className="w-full max-w-4xl xl:max-w-5xl flex flex-col gap-6">
                  {/* Top Header & Search Box Card */}
                  <div className="p-6 sm:p-7 rounded-2xl bg-surface-container-low/80 backdrop-blur-md border border-outline-variant/30 relative overflow-hidden shadow-sm">
                    <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                      <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-primary text-[28px]">dashboard_customize</span>
                        <span>
                          {selectedCategory === 'all'
                            ? '전체 에이전트 템플릿'
                            : CATEGORIES.find((c) => c.id === selectedCategory)?.name || '에이전트 템플릿'}
                        </span>
                      </h1>
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high border border-outline-variant/30 text-xs text-outline font-mono shrink-0 self-start sm:self-auto">
                        <span className="material-symbols-outlined text-[15px] text-primary">auto_awesome</span>
                        <span>{filteredTemplates.length}개 템플릿</span>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed max-w-2xl mb-5">
                      {selectedCategory === 'all'
                        ? '다양한 실전 파이프라인으로 구성된 템플릿을 골라 나만의 AI 에이전트를 몇 초 만에 완성해보세요.'
                        : CATEGORIES.find((c) => c.id === selectedCategory)?.description}
                    </p>

                    {/* Real-time Search Input Box */}
                    <div className="relative w-full">
                      <div className="flex items-center w-full px-3.5 py-2.5 rounded-xl bg-surface-container-lowest/90 border border-outline-variant/30 focus-within:border-primary/60 focus-within:shadow-[0_0_15px_rgba(77,142,255,0.2)] transition-all">
                        <span className="material-symbols-outlined text-[20px] text-outline mr-2 shrink-0">
                          search
                        </span>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="템플릿 이름, 종류, 키워드(예: 챗봇, 뉴스, 파이썬, RAG, 요약)를 검색하세요..."
                          className="w-full bg-transparent text-xs sm:text-sm text-on-surface placeholder:text-outline/70 focus:outline-none"
                        />
                        {searchQuery && (
                          <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="p-1 rounded-full hover:bg-surface-container text-outline hover:text-on-surface transition-colors shrink-0"
                            aria-label="검색어 지우기"
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 3. Templates Cards Grid */}
                  {filteredTemplates.length > 0 ? (
                    <div data-tour="templates-grid" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                      {filteredTemplates.map((template) => (
                        <div
                          key={template.id}
                          onClick={() => handleUseTemplate(template)}
                          className={`rounded-2xl bg-surface-container-low/70 border border-outline-variant/30 hover:${template.themeColor} overflow-hidden flex flex-col group transition-all duration-200 hover:shadow-xl hover:-translate-y-1 backdrop-blur-sm select-none cursor-pointer`}
                        >
                          {/* 1. 에이전트 그래프 (스크린샷 스냅샷 뷰) */}
                          <div className="w-full h-36 bg-[#060e20] relative flex items-center justify-center border-b border-outline-variant/20 overflow-hidden">
                            <div
                              className="absolute inset-0 opacity-20"
                              style={{
                                backgroundImage: `radial-gradient(${template.dotColor} 1px, transparent 1px)`,
                                backgroundSize: '14px 14px',
                              }}
                            />
                            {template.graphSvg}

                            {/* Top Badges Overlay */}
                            <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                              <span className="px-2 py-0.5 rounded-full bg-surface-container-lowest/80 backdrop-blur-md border border-outline-variant/30 text-[10px] text-on-surface font-medium">
                                {template.categoryLabel}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${template.difficultyColor}`}
                              >
                                {template.difficulty}
                              </span>
                            </div>
                          </div>

                          {/* 2. 템플릿 본문 내용 */}
                          <div className="p-4 flex flex-col justify-between flex-1 gap-3">
                            <div>
                              <h3 className="font-bold text-sm sm:text-base text-on-surface group-hover:text-primary transition-colors truncate">
                                {template.name}
                              </h3>
                              <p className="text-xs text-on-surface-variant line-clamp-2 mt-1.5 leading-relaxed">
                                {template.description}
                              </p>
                            </div>

                            {/* Tags List */}
                            <div className="flex flex-wrap gap-1 pt-1">
                              {template.tags.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded-md bg-surface-container-high/80 text-[10px] text-outline font-medium"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>

                            {/* Bottom Action Footer */}
                            <div className="flex items-center justify-between pt-2.5 border-t border-outline-variant/15 text-xs">
                              <span className="text-[11px] text-outline font-mono flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px] text-primary">hub</span>
                                <span>노드 {template.nodeCount}개 구성</span>
                              </span>
                              <div className="flex items-center gap-1 text-primary font-bold text-xs group-hover:translate-x-0.5 transition-transform">
                                <span>스튜디오에서 열기</span>
                                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Empty Search State */
                    <div className="p-12 rounded-2xl bg-surface-container-low/60 border border-outline-variant/20 flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-outline mb-4">
                        <span className="material-symbols-outlined text-[32px]">search_off</span>
                      </div>
                      <h3 className="font-bold text-base text-on-surface mb-1">
                        검색 결과가 없습니다
                      </h3>
                      <p className="text-xs text-outline max-w-sm mb-5">
                        '{searchQuery}'에 해당하는 템플릿을 찾을 수 없습니다. 다른 검색어를 입력하거나 카테고리를 변경해보세요.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedCategory('all');
                        }}
                        className="px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-md hover:brightness-110 transition-all"
                      >
                        전체 템플릿 보기
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <SpotlightTour />
    </div>
  );
};
