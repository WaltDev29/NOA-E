import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Link, useNavigate, useParams } from '../router/Router';

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
  llm: {
    id: 'llm',
    name: 'LLM',
    subtitle: '대화형 AI 모델',
    category: '기본 / 지능',
    badgeType: 'Generative',
    icon: 'smart_toy',
    accentColor: 'secondary',
    tagList: ['필수 노드', 'AI', '자연어 처리', '다국어 지원'],
    description:
      'LLM 노드는 OpenAI, Anthropic, Ollama 등 다양한 대규모 언어 모델을 활용하여 사용자의 입력에 대한 응답을 생성하는 핵심 지능 노드입니다.',
    features: [
      {
        title: '다양한 LLM 모델 지원',
        desc: 'GPT-4o, Claude 3.5, Gemini 등 글로벌 파운데이션 모델 선택 탑재',
      },
      {
        title: '정교한 프롬프트 제어',
        desc: '시스템 프롬프트, 역할 부여 및 Temperature 파라미터 미세 조정',
      },
      {
        title: '유연한 노드 파이프라인',
        desc: '웹 검색, 문서 요약, DB 노드와 실시간 양방향 데이터 연동',
      },
    ],
    modelsOrConfigs: [
      { name: 'GPT-4o', org: 'OpenAI', badge: 'Fast', context: '128k Context (추천 모델)' },
      { name: 'Claude 3.5 Sonnet', org: 'Anthropic', badge: '심층 추론', context: '200k Context' },
      { name: 'Gemini 1.5 Pro', org: 'Google', badge: '멀티모달', context: '1M Context' },
      { name: 'Llama 3 70B', org: 'Meta', badge: '오픈소스', context: '로컬 배포 지원' },
    ],
    examples: [
      {
        title: '기본 사용 예시',
        prompt: 'System: 너는 학생들을 위한 친절한 AI 튜터야.\nUser: 인공지능 에이전트가 뭐야?',
        resultJson: '{\n  "role": "assistant",\n  "content": "인공지능 에이전트는 사용자의 질문이나 목표를 스스로 파악하여 여러 도구(계산, 검색 등)를 사용해 문제를 해결하는 지능형 프로그램이에요!"\n}',
      },
      {
        title: '프롬프트 설정 예시',
        prompt: 'System: 필요한 경우 Search Tool 또는 Calculator Tool을 실행해 답을 구하세요.\nUser: 2026년 AI 최신 트렌드를 조사하고 계산해줘.',
        resultJson: '{\n  "tool_calls": [\n    {"name": "search_web", "query": "2026 AI Agent framework trends"},\n    {"name": "calculator", "expression": "2026 - 2022"}\n  ]\n}',
      },
    ],
  },
  'web-search': {
    id: 'web-search',
    name: '웹 검색',
    subtitle: '웹에서 정보 검색',
    category: '도구',
    badgeType: 'SERP API',
    icon: 'travel_explore',
    accentColor: 'primary',
    tagList: ['도구 노드', 'SERP API', '실시간 정보', '최신 뉴스'],
    description:
      '웹 검색 노드는 LLM의 지식 한계를 보완하기 위해 인터넷에서 최신 정보나 뉴스, 학술 자료를 실시간으로 검색하여 컨텍스트를 제공합니다.',
    features: [
      {
        title: '실시간 SERP 쿼리',
        desc: 'DuckDuckGo, Google 검색 등을 통한 신뢰성 높은 최신 데이터 스크래핑',
      },
      {
        title: 'LLM 도구 호출 연동',
        desc: 'LLM 노드가 필요 시 자율적으로 검색 키워드를 추출하여 호출',
      },
      {
        title: '자동 링크 및 출처 인용',
        desc: '검색된 사이트 제목과 URL 요약본을 자동으로 포맷팅하여 전달',
      },
    ],
    modelsOrConfigs: [
      { name: 'max_results', org: 'Integer (기본: 3)', badge: '파라미터', context: '검색 상위 결과 수량' },
      { name: 'search_engine', org: 'DuckDuckGo / Google', badge: '엔진', context: '검색 프로바이더 설정' },
      { name: 'timeout_seconds', org: '5초', badge: '안정성', context: '응답 지연 방지 타임아웃' },
      { name: 'format', org: 'JSON / Markdown', badge: '포맷', context: '결과 전달 형식' },
    ],
    examples: [
      {
        title: '최신 트렌드 검색',
        prompt: 'Query: "2026 AI Agent framework trends"',
        resultJson: '{\n  "query": "2026 AI Agent framework trends",\n  "results": [\n    {"title": "Autonomous AI Agent State 2026", "url": "https://example.com/ai-2026"},\n    {"title": "Visual Graph Orchestration Guide", "url": "https://example.com/graph"}\n  ]\n}',
      },
    ],
  },
  document: {
    id: 'document',
    name: '문서 처리',
    subtitle: '문서 요약/분석',
    category: '데이터',
    badgeType: 'RAG Parser',
    icon: 'description',
    accentColor: 'tertiary',
    tagList: ['RAG', '문서 요약', 'PDF/TXT 파싱', '지식 베이스'],
    description:
      '문서 처리 노드는 PDF, 텍스트 파일 등 방대한 문서를 청크(Chunk) 단위로 분할하고 분석하여 필요한 지식을 정확히 검색·요약합니다.',
    features: [
      {
        title: '자동 청킹 및 임베딩',
        desc: '긴 텍스트를 최적 길이로 분할하고 의미적 유사도 검색 지원',
      },
      {
        title: '다양한 포맷 지원',
        desc: 'Markdown, TXT, PDF, Word 문서를 텍스트로 고속 파싱',
      },
      {
        title: '문맥 주입 (Context Injection)',
        desc: '검색된 관련 문단을 LLM 프롬프트에 자동으로 주입하여 환각 최소화',
      },
    ],
    modelsOrConfigs: [
      { name: 'chunk_size', org: '500 tokens', badge: '분할 크기', context: '한 번에 읽는 문단 길이' },
      { name: 'overlap', org: '50 tokens', badge: '중첩', context: '문맥 연속성 유지를 위한 오버랩' },
      { name: 'parser_type', org: 'PDF / Text / Markdown', badge: '지원 포맷', context: '자동 감지' },
      { name: 'embedding', org: 'text-embedding-3-small', badge: '벡터', context: '1536차원 벡터 변환' },
    ],
    examples: [
      {
        title: '보고서 핵심 요약',
        prompt: 'Input Doc: "AI 교육 플랫폼 2026 계획서 (15페이지)"',
        resultJson: '{\n  "summary": "본 보고서는 중·고등학생을 대상으로 노드 기반 시각적 AI Agent를 제작할 수 있는 교육 환경 구축 방안을 제시함.",\n  "key_points": ["직관적 UI", "LangGraph 연동", "실시간 스트리밍"]\n}',
      },
    ],
  },
  image: {
    id: 'image',
    name: '이미지 생성',
    subtitle: '이미지 생성/분석',
    category: '도구',
    badgeType: 'Diffusion',
    icon: 'image',
    accentColor: 'secondary',
    tagList: ['DALL-E 3', 'Stable Diffusion', '이미지 생성', '멀티모달'],
    description:
      '이미지 생성 노드는 사용자의 텍스트 프롬프트를 바탕으로 고품질의 비주얼 이미지를 생성하고 변환합니다.',
    features: [
      {
        title: '고화질 텍스트 투 이미지',
        desc: '프롬프트의 디테일을 정밀하게 살린 일러스트 및 포토 생성',
      },
      {
        title: '스타일 프리셋 제공',
        desc: '애니메이션, 3D 렌더, 사이버네틱, 픽셀아트 등 다양한 화풍 지원',
      },
      {
        title: '파이프라인 연계',
        desc: 'LLM이 작성한 시나리오에 맞는 이미지를 자동으로 연이어 제작',
      },
    ],
    modelsOrConfigs: [
      { name: 'DALL-E 3', org: 'OpenAI', badge: 'HD', context: '1024x1024 고해상도 생성' },
      { name: 'FLUX.1', org: 'Black Forest Labs', badge: 'Fast', context: '초고속 정밀 렌더' },
      { name: 'aspect_ratio', org: '1:1, 16:9, 9:16', badge: '비율', context: '가로세로 비율 선택' },
      { name: 'style', org: 'Cyberpunk, Flat, 3D', badge: '스타일', context: '화풍 프리셋' },
    ],
    examples: [
      {
        title: '로봇 일러스트 생성',
        prompt: 'Prompt: "A cute friendly neon robot assisting a student with AI coding, 3D render style"',
        resultJson: '{\n  "image_url": "https://example.com/assets/robot.png",\n  "width": 1024,\n  "height": 1024,\n  "status": "generated"\n}',
      },
    ],
  },
  database: {
    id: 'database',
    name: '데이터베이스',
    subtitle: '데이터 조회/저장',
    category: '데이터',
    badgeType: 'Storage',
    icon: 'database',
    accentColor: 'primary',
    tagList: ['PostgreSQL', '데이터 저장', '실행 로그', '세션 기록'],
    description:
      '데이터베이스 노드는 에이전트의 대화 내역, 실행 결과, 사용자 정의 상태를 영구 저장소에 안전하게 기록하고 필요 시 조회합니다.',
    features: [
      {
        title: 'PostgreSQL 15 연동',
        desc: '구조화된 테이블 스키마에 안전한 트랜잭션 단위로 데이터 저장',
      },
      {
        title: '실행 로그 아카이빙',
        desc: '파이프라인 실행 이력과 토큰 사용량을 자동으로 기록하여 분석 가능',
      },
      {
        title: '고속 인덱싱 쿼리',
        desc: '세션 ID 기반으로 이전 대화 컨텍스트를 밀리초 단위로 조회',
      },
    ],
    modelsOrConfigs: [
      { name: 'table_name', org: 'String', badge: '테이블', context: '기록할 대상 DB 테이블명' },
      { name: 'operation', org: 'SELECT / INSERT', badge: '작업', context: '수행할 쿼리 동작' },
      { name: 'host', org: 'postgres:5432', badge: '호스트', context: 'Docker 내부 연결망' },
      { name: 'pool_size', org: '10 connections', badge: '커넥션', context: '동시성 제어' },
    ],
    examples: [
      {
        title: '결과 저장 쿼리',
        prompt: 'Insert into execution_logs (workflow_id, status, result)',
        resultJson: '{\n  "status": "success",\n  "inserted_id": 1042,\n  "created_at": "2026-09-26T14:00:00Z"\n}',
      },
    ],
  },
  code: {
    id: 'code',
    name: '코드 실행',
    subtitle: '코드 실행 및 결과 변환',
    category: '도구',
    badgeType: 'Interpreter',
    icon: 'code',
    accentColor: 'tertiary',
    tagList: ['Python', '수학 연산', '데이터 가공', '커스텀 로직'],
    description:
      '코드 실행 노드는 복잡한 수학 연산, 데이터 포맷 변환, 정규표현식 파싱 등의 작업을 정확한 프로그래밍 코드로 처리합니다.',
    features: [
      {
        title: '안전한 샌드박스 실행',
        desc: '격리된 환경에서 안전하게 연산 및 스크립트 실행',
      },
      {
        title: '정밀한 계산 결과 보장',
        desc: 'LLM의 계산 취약점을 보완하여 정확한 수식 계산 결과 도출',
      },
      {
        title: 'JSON 구조화 변환',
        desc: '비정형 텍스트 출력을 구조화된 JSON 데이터로 깔끔하게 파싱',
      },
    ],
    modelsOrConfigs: [
      { name: 'runtime', org: 'Python 3.11', badge: '런타임', context: '실행 인터프리터' },
      { name: 'timeout', org: '3초', badge: '제한', context: '무한 루프 방지' },
      { name: 'libraries', org: 'math, json, re, datetime', badge: '모듈', context: '기본 탑재 모듈' },
      { name: 'memory_limit', org: '128MB', badge: '자원', context: '메모리 한도 제어' },
    ],
    examples: [
      {
        title: '계산기 수식 계산',
        prompt: 'Expression: "(4500 * 1.15) - 250"',
        resultJson: '{\n  "expression": "(4500 * 1.15) - 250",\n  "result": 4925.0,\n  "status": "computed"\n}',
      },
    ],
  },
  condition: {
    id: 'condition',
    name: '조건 분기',
    subtitle: '조건에 따른 분기 처리',
    category: '기본',
    badgeType: 'Router',
    icon: 'alt_route',
    accentColor: 'error',
    tagList: ['IF / ELSE', '조건 분기', '라우팅', '흐름 제어'],
    description:
      '조건 분기 노드는 입력값이나 이전 노드의 처리 결과에 따라 실행 경로를 서로 다른 노드로 분기시키는 흐름 제어 노드입니다.',
    features: [
      {
        title: '조건식 기반 라우팅',
        desc: '정규표현식, 키워드 포함 여부, 점수 임계값에 따라 경로 분기',
      },
      {
        title: '멀티 브랜치 지원',
        desc: '2개 이상의 다중 조건 분기(Case)를 구성하여 유연한 대응',
      },
      {
        title: '폴백(Default) 경로',
        desc: '어떤 조건도 만족하지 않을 때의 기본 안전 경로 지정',
      },
    ],
    modelsOrConfigs: [
      { name: 'condition_type', org: 'Regex / Contains / Value', badge: '조건 유형', context: '판단 기준' },
      { name: 'branches', org: 'True / False (2-way)', badge: '분기 수', context: '경로 개수' },
      { name: 'fallback', org: 'Default Route', badge: '예외', context: '기본 경로 지정' },
      { name: 'eval_mode', org: 'Strict / Fuzzy', badge: '정밀도', context: '일치 검사 강도' },
    ],
    examples: [
      {
        title: '키워드 기반 분기',
        prompt: 'If input contains "날씨" -> WebSearch\nElse -> LLM Chat',
        resultJson: '{\n  "selected_branch": "WebSearch",\n  "matched_condition": "contains(\'날씨\')",\n  "routed_to": "node_web_search"\n}',
      },
    ],
  },
};

export const NodeInstructionPage: React.FC = () => {
  const navigate = useNavigate();
  const { nodeId } = useParams();

  const activeKey = nodeId && NODE_CATALOG[nodeId] ? nodeId : 'llm';
  const current = NODE_CATALOG[activeKey];

  const [activeTab, setActiveTab] = useState<'basic' | 'advanced'>('basic');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeKey]);

  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen flex flex-col">
      <Header />

      <main className="w-full pt-16 bg-background min-h-screen flex-1 flex flex-col">
        <div className="flex flex-col w-full">
          <div className="w-full max-w-7xl mx-auto px-margin py-space-lg">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
              {/* Left Sidebar Panel */}
              <aside className="lg:col-span-3 flex flex-col gap-space-md">
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
                <div className="flex flex-col gap-space-xs bg-surface-container-low/70 backdrop-blur-md p-space-md rounded-xl">
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

              {/* Right Main Content Panel */}
              <div className="lg:col-span-9 flex flex-col gap-space-lg">
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
                      <Link
                        to="/noa-e/studio"
                        className="inline-flex items-center gap-2 px-space-lg py-2 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-on-primary font-headline-sm text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition-all"
                      >
                        <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                        <span>스튜디오에서 바로 사용해보기</span>
                      </Link>
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
      </main>

      <Footer />
    </div>
  );
};
