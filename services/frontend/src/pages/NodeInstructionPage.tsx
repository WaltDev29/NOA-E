import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Link, useNavigate, useParams } from '../router/Router';
import { useOnboarding } from '../context/OnboardingContext';
import { SpotlightTour } from '../components/onboarding/SpotlightTour';

interface NodeDetail {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  badgeType: string;
  icon: string;
  accentColor: 'primary' | 'secondary' | 'tertiary' | 'error';
  tagList: string[];
  description: string;
  features: { title: string; desc: string }[];
  modelsOrConfigs: { name: string; org: string; badge: string; context: string }[];
  examples: { title: string; prompt: string; resultJson: string }[];
}

const NODE_CATALOG: Record<string, NodeDetail> = {
  input: {
    id: 'input',
    name: '사용자 입력 (Input)',
    subtitle: '에이전트 시작 질문 및 사용자 데이터 입력',
    category: '기본',
    badgeType: 'Trigger',
    icon: 'login',
    accentColor: 'tertiary',
    tagList: ['시작 노드', '필수', '사용자 질의', '파이프라인 시작점'],
    description:
      '사용자 입력 노드는 워크플로우의 출발점입니다. 에이전트에게 전달할 최초의 질문이나 프롬프트 데이터를 설정하여 다음 지능 노드로 전달합니다.',
    features: [
      {
        title: '사용자 질문 및 프롬프트 입력',
        desc: '에이전트 파이프라인이 처리할 기본 질문 또는 시작 텍스트를 실시간으로 입력',
      },
      {
        title: '단일 시작점 보장',
        desc: '정확하고 안전한 실행 순서 제어를 위해 캔버스당 1개의 Input 노드만 배치 가능',
      },
      {
        title: '동적 데이터 바인딩',
        desc: '사용자 입력을 연결된 LLM 지능 노드 또는 자율 에이전트 노드로 직관적으로 전달',
      },
    ],
    modelsOrConfigs: [
      { name: 'input_text', org: 'String', badge: '입력 텍스트', context: '시작 질문 내용' },
      { name: 'format', org: 'Text / Prompt', badge: '데이터 포맷', context: '텍스트 질의' },
    ],
    examples: [
      {
        title: '시작 질문 설정 예시',
        prompt: 'input_text: "인공지능 에이전트가 무엇인지 3문장으로 요약해줘."',
        resultJson: '{\n  "input_text": "인공지능 에이전트가 무엇인지 3문장으로 요약해줘."\n}',
      },
    ],
  },
  llm: {
    id: 'llm',
    name: 'LLM 지능 노드 (LLM)',
    subtitle: '로컬 경량 파운데이션 모델 기반 대화형 AI',
    category: 'LLM',
    badgeType: 'Generative',
    icon: 'neurology',
    accentColor: 'secondary',
    tagList: ['핵심 지능', 'Ollama 로컬 모델', '도구 결합 지원', '자연어 생성'],
    description:
      'LLM 노드는 로컬 파운데이션 모델(Ollama gemma2:2b 등)을 활용하여 입력받은 질문에 대해 고품질 지능형 답변을 생성합니다. 상단 도구 포트를 통해 웹 검색, 계산기 도구와 결합할 수 있습니다.',
    features: [
      {
        title: '로컬 LLM 지능 추론',
        desc: 'Ollama 엔진과 연동된 고성능 경량 AI 모델(gemma2:2b)을 통한 안정적인 답변 생성',
      },
      {
        title: '시스템 프롬프트 커스텀',
        desc: '에이전트의 역할(페르소나), 응답 어조, 행동 가이드라인을 자유롭게 지정',
      },
      {
        title: '상단 도구(Tools) 포트 결합',
        desc: '웹 검색, 계산기 등 특화 도구 노드를 상단에 결합하여 모델의 지식 한계 보완',
      },
    ],
    modelsOrConfigs: [
      { name: 'gemma2:2b', org: 'Google / Ollama', badge: '기본 탑재', context: '경량 고효율 로컬 AI' },
      { name: 'system_prompt', org: 'System Instruction', badge: '역할 지정', context: '페르소나 및 지침' },
    ],
    examples: [
      {
        title: '기본 사용 예시',
        prompt: 'System: 너는 학생들을 위한 친절한 AI 튜터야.\nUser: 인공지능 에이전트가 뭐야?',
        resultJson: '{\n  "role": "assistant",\n  "content": "인공지능 에이전트는 사용자의 질문이나 목표를 스스로 파악하여 여러 도구(계산, 검색 등)를 사용해 문제를 해결하는 지능형 프로그램이에요!"\n}',
      },
      {
        title: '도구 연계 예시',
        prompt: 'System: 필요한 경우 웹 검색 또는 계산기 도구를 결합하여 답변하세요.\nUser: 2026년 최신 기술 동향을 조사해줘.',
        resultJson: '{\n  "tool_used": "web_search",\n  "result": "최신 자율 에이전트 동향 검색 결과를 바탕으로 답변을 완성했습니다."\n}',
      },
    ],
  },
  planner: {
    id: 'planner',
    name: '플래너 (Planner)',
    subtitle: '다단계 작업 계획 수립',
    category: 'LLM',
    badgeType: 'Planning',
    icon: 'assignment',
    accentColor: 'primary',
    tagList: ['계획 수립', 'Task 분해', '전략 플래닝', '복합 질의'],
    description:
      '플래너 노드는 사용자 요청을 달성하기 위해, 어떤 순서로 어떤 작업(Task)들을 수행해야 하는지 구체적인 실행 계획 목록을 수립합니다.',
    features: [
      {
        title: '다단계 작업 분해',
        desc: '사용자 요청을 달성하기 위한 개별 태스크들을 순차 목록(Task List)으로 명확히 분할',
      },
      {
        title: '전략적 플래닝',
        desc: '어떤 도구나 지능이 필요한지 파악하여 후속 라우터 노드가 분배할 수 있도록 구조화',
      },
      {
        title: '유연한 파이프라인 연계',
        desc: '라우터 없이 LLM 노드나 Output에 바로 연결하여 단독 계획 수립기로도 활용 가능',
      },
    ],
    modelsOrConfigs: [
      { name: 'gemma2:2b', org: 'Google / Ollama', badge: '추론 모델', context: '로컬 계획 수립기' },
      { name: 'system_prompt', org: 'Planner Instructions', badge: '지침', context: '계획 수립 가이드' },
    ],
    examples: [
      {
        title: '복합 질의 계획 수립 예시',
        prompt: 'Input: "2026년 전기차 시장 트렌드를 조사하고 가격 변동성을 분석해줘."',
        resultJson: '{\n  "plan": [\n    "1. 2026년 전기차 시장 최신 동향 및 주요 모델 검색",\n    "2. 주요 제조사별 배터리 및 차량 가격 변동 데이터 수집",\n    "3. 수집된 데이터를 바탕으로 종합 분석 보고서 작성"\n  ]\n}',
      },
    ],
  },
  router: {
    id: 'router',
    name: '라우터 (Router)',
    subtitle: '지능형 작업 분기 및 루프 제어',
    category: 'LLM',
    badgeType: 'Routing',
    icon: 'alt_route',
    accentColor: 'secondary',
    tagList: ['작업 분기', '루프 제어', '시맨틱 라우팅', '시스템 프롬프트'],
    description:
      '라우터 노드는 시스템 지침(System Instructions)과 현재 작업 내용을 분석하여 연결된 Worker 노드 중 가장 알맞은 노드로 작업을 분배하고, 작업 완료 후 루프를 통제합니다.',
    features: [
      {
        title: '자연어 라우팅 지침 제어',
        desc: '시스템 프롬프트를 통해 자연어로 작업 분기 기준(조건)을 직관적으로 설정',
      },
      {
        title: '제어된 루프 (Controlled Loop)',
        desc: 'Worker의 작업 완료 후 복귀선(loop-return)을 받아 다음 작업을 순차적으로 배분',
      },
      {
        title: '최대 루프 상한 안전장치',
        desc: '설정된 최대 루프 횟수(기본 5회) 도달 시 무한 루프 없이 안전하게 종료 경로로 탈출',
      },
    ],
    modelsOrConfigs: [
      { name: 'max_loops', org: '1~10회 (기본: 5)', badge: '루프 한도', context: '무한 루프 방지 상한선' },
      { name: 'system_prompt', org: 'Routing Instructions', badge: '라우팅 지침', context: '자연어 분기 규칙' },
    ],
    examples: [
      {
        title: '자연어 기반 분기 예시',
        prompt: 'System: 수학 계산이면 계산기로, 최신 정보면 검색기로 보내세요.\nTask: "2026년 파이썬 출시일 조사하기"',
        resultJson: '{\n  "selected_worker": "search-1",\n  "reason": "최신 인터넷 정보 조사가 필요한 작업입니다."\n}',
      },
    ],
  },
  aggregator: {
    id: 'aggregator',
    name: '어그리게이터 (Aggregator)',
    subtitle: '중간 산출물 종합 및 최종 합성',
    category: 'LLM',
    badgeType: 'Synthesis',
    icon: 'auto_awesome',
    accentColor: 'tertiary',
    tagList: ['결과 종합', '보고서 합성', '중복 정리', '최종 완성'],
    description:
      '어그리게이터 노드는 여러 단계에서 Worker 노드들이 수집하고 처리한 중간 결과들을 취합하여, 논리적이고 깔끔한 단일 최종 답변으로 합성합니다.',
    features: [
      {
        title: '다중 산출물 자동 종합',
        desc: '여러 Worker 노드가 거쳐간 중간 실행 단계(intermediate_steps)를 한눈에 수집',
      },
      {
        title: '완성도 높은 답변 합성',
        desc: '중복 내용을 제거하고 핵심 통찰을 정리하여 마크다운 서식으로 최종 답변 작성',
      },
      {
        title: '독립 모듈러 지원',
        desc: '루프 파이프라인의 종결점뿐만 아니라 다중 노드의 병렬 취합기로도 유연하게 활용',
      },
    ],
    modelsOrConfigs: [
      { name: 'gemma2:2b', org: 'Google / Ollama', badge: '합성 모델', context: '최종 보고서 작성' },
      { name: 'system_prompt', org: 'Aggregator Instructions', badge: '지침', context: '종합 서식 가이드' },
    ],
    examples: [
      {
        title: '다단계 결과 종합 예시',
        prompt: 'Inputs: [검색 결과 요약, 수식 계산 결과]\nQuery: "기술 분석 및 비용 계산"',
        resultJson: '{\n  "final_answer": "## 2026년 기술 동향 분석 및 비용 산출 보고서\n\n1. 최신 기술 분석: ...\n2. 예상 비용 계산: 총 14,250원\n\n### 결론: ...",\n  "status": "completed"\n}',
      },
    ],
  },
  'web-search': {
    id: 'web-search',
    name: '검색 Tool',
    subtitle: '실시간 인터넷 정보 검색 및 요약 수집',
    category: '도구',
    badgeType: 'Tool',
    icon: 'travel_explore',
    accentColor: 'primary',
    tagList: ['도구 노드', '실시간 검색', '최신 정보', '도구 연동'],
    description:
      '웹 검색 노드는 LLM의 사전 학습 지식 한계를 보완하기 위해 인터넷에서 실시간 최신 정보나 뉴스 자료를 검색하여 지능 노드에 전달하는 도구 노드입니다.',
    features: [
      {
        title: '실시간 웹 정보 수집',
        desc: '신뢰성 높은 최신 웹 문서 검색을 통한 실시간 정보 조회',
      },
      {
        title: 'LLM 상단 도구 포트 연동',
        desc: 'LLM 노드의 상단 포트에 연결되어 모델이 검색 필요 시 자동으로 활용',
      },
      {
        title: '핵심 본문 요약 전달',
        desc: '검색된 사이트의 제목과 요약 정보를 정제하여 LLM 컨텍스트로 반환',
      },
    ],
    modelsOrConfigs: [
      { name: 'search_engine', org: 'DuckDuckGo', badge: '검색 엔진', context: '실시간 웹 쿼리' },
      { name: 'max_results', org: '3개 (기본)', badge: '결과 수량', context: '상위 검색 결과 제한' },
    ],
    examples: [
      {
        title: '최신 트렌드 검색 예시',
        prompt: 'Query: "2026 AI Agent framework trends"',
        resultJson: '{\n  "query": "2026 AI Agent framework trends",\n  "results": [\n    {"title": "Latest Autonomous AI Trends", "snippet": "자율 에이전트 프레임워크 최신 동향..."}\n  ]\n}',
      },
    ],
  },
  weather: {
    id: 'weather',
    name: '날씨 Tool',
    subtitle: 'Open-Meteo 기반 현재 날씨 및 일별 예보 조회',
    category: '도구',
    badgeType: 'Tool',
    icon: 'partly_cloudy_day',
    accentColor: 'tertiary',
    tagList: ['도구 노드', 'Open-Meteo', '실시간 기상', '일별 예보'],
    description:
      '날씨 Tool 노드는 별도의 API Key 없이 Open-Meteo 기상 데이터를 활용하여 전 세계 도시의 현재 기온, 체감 온도, 습도, 풍속 및 최대 7일간의 일별 예보를 조회하는 도구 노드입니다.',
    features: [
      {
        title: '전 세계 도시 자동 좌표 변환',
        desc: '한국어/영문 도시명을 입력하면 Geocoding API로 위·경도를 자동 탐색',
      },
      {
        title: '현재 기상 및 일별 예보 제공',
        desc: '현재 기온·습도·풍속과 함께 일별 최저/최고 기온 및 강수 확률 반환',
      },
      {
        title: 'API Key 불필요',
        desc: 'Open-Meteo 공개 API 기반으로 별도 인증 키 설정 없이 즉시 사용 가능',
      },
    ],
    modelsOrConfigs: [
      { name: 'provider', org: 'Open-Meteo', badge: '기상 API', context: '무료 실시간 기상 조회' },
      { name: 'forecast_days', org: '기본 3일 (최대 7일)', badge: '예보 범위', context: '일별 기상 예보' },
    ],
    examples: [
      {
        title: '도시 날씨 조회 예시',
        prompt: 'location: "서울", days: 3',
        resultJson: '{\n  "location": "서울, 대한민국",\n  "current": "맑음, 18.2°C (습도 45%)",\n  "daily": ["내일: 구름 조금 11~20°C (강수확률 10%)"]\n}',
      },
    ],
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube Tool',
    subtitle: 'YouTube Data API v3 기반 영상 검색',
    category: '도구',
    badgeType: 'Tool',
    icon: 'smart_display',
    accentColor: 'secondary',
    tagList: ['도구 노드', 'YouTube API', '영상 검색', '채널/링크 수집'],
    description:
      'YouTube Tool 노드는 YouTube Data API v3를 사용하여 검색어와 관련된 최신·인기 YouTube 영상의 제목, 채널명, 게시일, 시청 링크를 조회하여 LLM에 전달하는 도구 노드입니다.',
    features: [
      {
        title: '정확한 공식 API 검색',
        desc: 'YouTube Data API v3를 통해 영상 제목, 채널명, 게시일, 설명 및 직링크 추출',
      },
      {
        title: 'LLM 상단 도구 포트 연동',
        desc: 'LLM 노드의 상단 포트에 연결되어 영상 자료나 레퍼런스 요청 시 자동 호출',
      },
      {
        title: '환경변수 기반 안전한 키 관리',
        desc: '.env.backend의 YOUTUBE_API_KEY를 통해 API 키를 안전하게 주입 및 마스킹',
      },
    ],
    modelsOrConfigs: [
      { name: 'YOUTUBE_API_KEY', org: 'Google Cloud Console', badge: '필수 환경변수', context: '.env.backend에 설정' },
      { name: 'max_results', org: '기본 5개 (1~10개)', badge: '결과 수량', context: '반환 영상 개수' },
    ],
    examples: [
      {
        title: 'YouTube 영상 검색 예시',
        prompt: 'query: "파이썬 LangGraph 강의", max_results: 3',
        resultJson: '{\n  "query": "파이썬 LangGraph 강의",\n  "videos": [\n    {"title": "LangGraph 완벽 입문", "url": "https://www.youtube.com/watch?v=..."}\n  ]\n}',
      },
    ],
  },
  output: {
    id: 'output',
    name: '결과 출력 (Output)',
    subtitle: '에이전트 최종 결과 렌더링 및 완료',
    category: '기본',
    badgeType: 'Sink',
    icon: 'output',
    accentColor: 'error',
    tagList: ['종착 노드', '필수', '결과 표출', '파이프라인 종료'],
    description:
      '결과 출력 노드는 워크플로우의 최종 종착점입니다. LLM 또는 자율 에이전트가 처리한 최종 응답 결과를 화면에 렌더링하고 전체 실행을 완료합니다.',
    features: [
      {
        title: '최종 결과 텍스트 렌더링',
        desc: '생성된 최종 답변을 사용자 화면에 일목요연하게 표출',
      },
      {
        title: '단일 종료점 보장',
        desc: '파이프라인의 명확한 종료를 위해 캔버스당 1개의 Output 노드만 배치 가능',
      },
      {
        title: '실행 히스토리 및 결과 모달 연동',
        desc: '실행 로그 패널 및 노드별 단계별 실행 결과 확인 창과 직접 연계',
      },
    ],
    modelsOrConfigs: [
      { name: 'output_text', org: 'String', badge: '출력 텍스트', context: '최종 반환 내용' },
      { name: 'status', org: 'completed / idle', badge: '실행 상태', context: '작업 완료 여부' },
    ],
    examples: [
      {
        title: '최종 결과 출력 예시',
        prompt: 'Input: "AI 에이전트 요약 완료"',
        resultJson: '{\n  "final_output": "AI 에이전트는 목표를 스스로 파악하여 도구를 활용해 문제를 해결하는 지능형 프로그램입니다.",\n  "status": "completed"\n}',
      },
    ],
  },
};

export const NodeInstructionPage: React.FC = () => {
  const navigate = useNavigate();
  const { nodeId } = useParams();
  const { setTourPage, checkAndTriggerPageTour } = useOnboarding();

  const activeKey = nodeId && NODE_CATALOG[nodeId] ? nodeId : 'input';
  const current = NODE_CATALOG[activeKey];

  const [activeTab, setActiveTab] = useState<'basic' | 'advanced'>('basic');

  useEffect(() => {
    setTourPage('nodes');
    checkAndTriggerPageTour('nodes');
  }, [setTourPage, checkAndTriggerPageTour]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeKey]);

  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen flex flex-col">
      <Header />

      <main className="w-full pt-16 bg-background min-h-screen flex-1 flex flex-col">
        <div className="flex flex-col w-full">
          <div className="w-full px-6 py-space-lg">
            <div className="flex flex-col lg:flex-row items-start gap-8">
              {/* Left Sidebar Panel - Aligned to left */}
              <aside data-tour="nodes-categories" className="w-full lg:w-72 xl:w-80 shrink-0 flex flex-col gap-space-md">
                {/* Back Navigation */}
                <Link
                  to="/noa-e"
                  className="inline-flex items-center gap-space-xs text-on-surface-variant hover:text-primary transition-colors py-space-xs group"
                >
                  <span className="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-1">
                    arrow_back
                  </span>
                  <span className="font-body-md text-body-md font-medium">홈으로 돌아가기</span>
                </Link>

                {/* Node Catalog Container */}
                <div data-tour="nodes-list" className="flex flex-col gap-space-xs bg-surface-container-low/70 backdrop-blur-md p-space-md rounded-xl">
                  <div className="px-space-sm py-space-xs mb-space-xs flex items-center justify-between">
                    <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight font-bold">
                      노드 탐색
                    </span>
                    <span className="font-label-badge text-label-badge px-2 py-0.5 rounded-full bg-surface-container-high text-primary">
                      {Object.keys(NODE_CATALOG).length}개 이용 가능
                    </span>
                  </div>

                  {/* Catalog List */}
                  {Object.values(NODE_CATALOG).map((node) => {
                    const isSelected = node.id === activeKey;
                    return (
                      <button
                        key={node.id}
                        onClick={() => navigate(`/noa-e/nodes/${node.id}`)}
                        type="button"
                        className={`w-full text-left flex items-center gap-space-md p-space-md rounded-lg transition-all relative overflow-hidden group ${
                          isSelected
                            ? 'bg-surface-container-high text-secondary shadow-[0_0_18px_rgba(208,188,255,0.25)]'
                            : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary" />
                        )}
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-secondary/20 text-secondary shadow-[0_0_14px_rgba(208,188,255,0.4)]'
                              : 'bg-surface-container-high text-on-surface group-hover:shadow-[0_0_12px_rgba(77,142,255,0.3)]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[20px]">{node.icon}</span>
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span
                            className={`font-headline-sm text-body-md truncate ${
                              isSelected ? 'font-bold text-secondary' : 'font-semibold text-on-surface'
                            }`}
                          >
                            {node.name}
                          </span>
                          <span className="font-body-sm text-body-sm text-outline truncate">
                            {node.subtitle}
                          </span>
                        </div>
                        {isSelected && (
                          <span className="material-symbols-outlined text-[16px] ml-auto text-secondary">
                            arrow_forward_ios
                          </span>
                        )}
                      </button>
                    );
                  })}

                  {/* Helper hint box */}
                  <div className="mt-space-md p-space-md rounded-lg bg-surface-container-lowest/60 text-outline flex items-start gap-space-sm">
                    <span className="material-symbols-outlined text-[16px] text-tertiary mt-0.5">
                      info
                    </span>
                    <span className="font-body-sm text-body-sm leading-relaxed">
                      파이프라인 캔버스에서 드래그하여 에이전트에 직접 추가할 수 있습니다.
                    </span>
                  </div>
                </div>
              </aside>

              {/* Right Main Content Panel - Centered in remaining space */}
              <div data-tour="nodes-detail" className="flex-1 w-full min-w-0 flex justify-center">
                <div className="w-full max-w-4xl xl:max-w-5xl flex flex-col gap-space-lg">
                  {/* Hero Banner: Visual Node Feature Showcase */}
                  <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-surface-container-low via-surface-container to-surface-container-high p-space-lg lg:p-space-xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-space-xl">
                  {/* Ambient Glow Blobs */}
                  <div className="absolute -top-16 -left-16 w-64 h-64 bg-secondary-container/40 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-primary-container/30 rounded-full blur-3xl pointer-events-none" />

                  {/* Hero Left Content */}
                  <div className="relative z-10 flex flex-col gap-space-md max-w-xl">
                    <div className="flex flex-col gap-space-xs">
                      <div className="flex items-center gap-space-sm">
                        <h1 className="font-display-hero text-display-hero font-extrabold tracking-tight text-white leading-none">
                          {current.name}
                        </h1>
                        <span className="px-space-sm py-1 rounded-full bg-secondary-container/40 text-secondary font-label-badge text-label-badge tracking-wider uppercase">
                          {current.badgeType}
                        </span>
                      </div>
                      <p className="font-headline-sm text-headline-sm text-primary font-semibold">
                        {current.subtitle}
                      </p>
                    </div>
                    <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                      {current.description}
                    </p>

                    {/* Tags Badge Row */}
                    <div className="flex flex-wrap items-center gap-space-xs pt-space-xs">
                      {current.tagList.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-space-md py-1.5 rounded-full bg-surface-container-highest text-on-surface-variant font-label-badge text-label-badge font-semibold"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="pt-space-xs">
                      <button
                        onClick={() => {
                          const nodeTypeMap: Record<string, string> = {
                            input: 'inputNode',
                            planner: 'plannerNode',
                            router: 'routerNode',
                            llm: 'llmNode',
                            aggregator: 'aggregatorNode',
                            'web-search': 'searchNode',
                            weather: 'weatherNode',
                            youtube: 'youtubeNode',
                            output: 'outputNode',
                          };
                          const targetType = nodeTypeMap[current.id] || 'llmNode';
                          navigate(`/noa-e/studio?addNode=${targetType}`);
                        }}
                        type="button"
                        className="inline-flex items-center gap-2 px-space-lg py-2 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-on-primary font-headline-sm text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                        <span>스튜디오에서 바로 사용해보기</span>
                      </button>
                    </div>
                  </div>

                  {/* Hero Right 3D Visual Cube Indicator */}
                  <div className="relative z-10 shrink-0 w-44 h-44 sm:w-52 sm:h-52 rounded-2xl bg-surface-container-lowest/90 backdrop-blur-md p-space-md flex flex-col items-center justify-center shadow-[0_0_35px_rgba(139,92,246,0.3)]">
                    <div className="absolute inset-3 rounded-xl bg-gradient-to-tr from-secondary-container/30 via-primary/10 to-transparent animate-pulse pointer-events-none" />
                    <div className="relative w-28 h-28 rounded-2xl bg-gradient-to-br from-[#702ff6] via-[#4d2db7] to-[#1e1548] flex flex-col items-center justify-center shadow-[0_0_25px_rgba(112,47,246,0.6)]">
                      <span className="material-symbols-outlined text-white text-[38px] drop-shadow-[0_2px_10px_rgba(255,255,255,0.7)]">
                        {current.icon}
                      </span>
                      <span className="font-headline-sm text-headline-sm font-extrabold tracking-widest text-white mt-1 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
                        {current.id.toUpperCase()}
                      </span>
                    </div>
                    <div className="mt-space-sm flex items-center gap-1.5 px-space-sm py-0.5 rounded-full bg-surface-container-high/80 text-tertiary font-label-badge text-label-badge">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-ping" />
                      <span>온라인 엔진 활성</span>
                    </div>
                  </div>
                </section>

                {/* Section 1: 주요 특징 (Key Features) */}
                <section className="rounded-xl bg-surface-container-low p-space-lg shadow-md flex flex-col gap-space-md">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-2.5 h-5 rounded-full bg-primary" />
                    <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
                      주요 특징
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
                    {current.features.map((feat, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-space-sm p-space-md rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors"
                      >
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-primary text-[16px]">check</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-body-md text-body-md font-semibold text-on-surface">
                            {feat.title}
                          </span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                            {feat.desc}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Section 2: 지원 모델 / 파라미터 (Supported Models) */}
                <section className="rounded-xl bg-surface-container-low p-space-lg shadow-md flex flex-col gap-space-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-sm">
                      <div className="w-2.5 h-5 rounded-full bg-secondary" />
                      <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
                        지원 모델 및 파라미터
                      </h2>
                    </div>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      플러그인 방식으로 계속 확장 중
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
                    {current.modelsOrConfigs.map((item, idx) => (
                      <div
                        key={idx}
                        className="group relative rounded-xl bg-surface-container-lowest p-space-md shadow-md hover:bg-surface-container-high transition-all cursor-pointer flex flex-col justify-between"
                      >
                        <div className="flex items-center gap-space-sm">
                          <div className="w-10 h-10 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary shadow-[0_0_12px_rgba(77,142,255,0.3)]">
                            <span className="material-symbols-outlined text-[24px]">token</span>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="font-body-md text-body-md font-bold text-on-surface truncate">
                                {item.name}
                              </span>
                            </div>
                            <span className="font-body-sm text-body-sm text-outline">{item.org}</span>
                          </div>
                        </div>
                        <div className="mt-space-md pt-space-xs flex items-center justify-between text-on-surface-variant font-label-code text-label-code">
                          <span className="text-[11px]">{item.badge}</span>
                          <span className="text-tertiary text-[11px]">{item.context}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Section 3: 사용 예시 (Usage Examples) */}
                <section className="rounded-xl bg-surface-container-low p-space-lg shadow-md flex flex-col gap-space-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
                    <div className="flex items-center gap-space-sm">
                      <div className="w-2.5 h-5 rounded-full bg-tertiary" />
                      <h2 className="font-headline-md text-headline-md font-bold text-on-surface flex items-center gap-2">
                        사용 예시
                        <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-primary font-label-badge text-label-badge">
                          {current.examples.length}
                        </span>
                      </h2>
                    </div>
                    {/* Tab Pills */}
                    <div className="flex items-center p-1 bg-surface-container-lowest rounded-lg">
                      <button
                        onClick={() => setActiveTab('basic')}
                        className={`px-space-md py-1 rounded font-body-sm text-body-sm font-semibold transition-all ${
                          activeTab === 'basic'
                            ? 'bg-surface-container-high text-primary shadow-sm'
                            : 'font-medium text-on-surface-variant hover:text-on-surface'
                        }`}
                        type="button"
                      >
                        기본 사용
                      </button>
                      {current.examples.length > 1 && (
                        <button
                          onClick={() => setActiveTab('advanced')}
                          className={`px-space-md py-1 rounded font-body-sm text-body-sm font-semibold transition-all ${
                            activeTab === 'advanced'
                              ? 'bg-surface-container-high text-primary shadow-sm'
                              : 'font-medium text-on-surface-variant hover:text-on-surface'
                          }`}
                          type="button"
                        >
                          프롬프트 설정
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Example Content */}
                  {(() => {
                    const ex =
                      activeTab === 'advanced' && current.examples[1]
                        ? current.examples[1]
                        : current.examples[0];
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md mt-space-sm">
                        <div className="p-space-md rounded-xl bg-surface-container-lowest flex flex-col">
                          <span className="font-label-code text-label-code text-outline mb-2">
                            PROMPT / INPUT
                          </span>
                          <pre className="font-label-code text-label-code text-on-surface whitespace-pre-wrap leading-relaxed overflow-x-auto">
                            {ex.prompt}
                          </pre>
                        </div>
                        <div className="p-space-md rounded-xl bg-surface-container-lowest flex flex-col">
                          <span className="font-label-code text-label-code text-secondary mb-2">
                            OUTPUT STATE (JSON)
                          </span>
                          <pre className="font-label-code text-label-code text-secondary-fixed-dim whitespace-pre-wrap leading-relaxed overflow-x-auto">
                            {ex.resultJson}
                          </pre>
                        </div>
                      </div>
                    );
                  })()}
                </section>
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
