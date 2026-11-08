export interface TourStep {
  id: string;
  targetSelector: string; // 빈 문자열이거나 isIntro: true인 경우 화면 중앙 인트로 팝업으로 표시
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  isIntro?: boolean;
}

export type TourPageKey = 'main' | 'templates' | 'nodes' | 'learn';

export const PAGE_TOUR_STEPS: Record<TourPageKey, TourStep[]> = {
  main: [
    {
      id: 'main-intro',
      targetSelector: '',
      isIntro: true,
      title: '홈 페이지 가이드',
      description: 'NOA-E의 메인 화면입니다. 내 에이전트 프로젝트 관리, 추천 템플릿, 상단 주요 메뉴들의 구성과 사용 방법을 안내해 드립니다.',
    },
    {
      id: 'main-my-agents',
      targetSelector: '[data-tour="main-my-agents"]',
      title: '내 에이전트 프로젝트 목록',
      description: '내가 직접 설계하고 저장한 모든 에이전트들을 모아볼 수 있습니다. 카드를 클릭하면 스튜디오 에디터로 바로 이동하여 편집할 수 있습니다.',
      position: 'top',
    },
    {
      id: 'main-agent-menu',
      targetSelector: '[data-tour="main-agent-menu"]',
      title: '에이전트 복제 및 삭제 메뉴',
      description: '우측 상단의 더보기(...) 버튼을 누르면 기존 에이전트를 안전하게 복제(사본 생성)하거나 필요 없는 에이전트를 삭제할 수 있습니다.',
      position: 'left',
    },
    {
      id: 'main-templates',
      targetSelector: '[data-tour="main-templates"]',
      title: '추천 에이전트 템플릿',
      description: '검증된 인기 AI 에이전트 템플릿들을 확인하고, 마음에 드는 구조를 한 번의 클릭으로 내 스튜디오에 불러와 바로 시작할 수 있습니다.',
      position: 'bottom',
    },
    {
      id: 'gnb-header',
      targetSelector: '[data-tour="gnb-header"]',
      title: '상단 네비게이션 & 사용자 메뉴',
      description: 'Studio, Nodes, Templates, Learn 이동 메뉴와 함께, 우측의 알림 확인 및 마이페이지(내 정보 관리) 버튼으로 언제든 이동할 수 있습니다.',
      position: 'bottom',
    },
  ],
  templates: [
    {
      id: 'templates-intro',
      targetSelector: '',
      isIntro: true,
      title: 'Templates 페이지 가이드',
      description: '다양한 실전 비즈니스 케이스(챗봇, 데이터 분석, 문서 요약 등)에 맞춰 사전 제작된 에이전트 템플릿 라이브러리입니다.',
    },
    {
      id: 'templates-categories',
      targetSelector: '[data-tour="templates-categories"]',
      title: '템플릿 카테고리 네비게이션',
      description: '대화&챗봇, 검색&조사, 문서(RAG), 코딩, 미디어, 자동화 등 원하는 분야별 템플릿을 빠르게 분류하여 탐색할 수 있습니다.',
      position: 'right',
    },
    {
      id: 'templates-grid',
      targetSelector: '[data-tour="templates-grid"]',
      title: '템플릿 목록 & 본문 둘러보기',
      description: '검증된 템플릿 구조를 둘러보고, 원하는 템플릿 카드를 클릭해 내 스튜디오로 바로 복사하여 확장할 수 있습니다.',
      position: 'top',
    },
  ],
  nodes: [
    {
      id: 'nodes-intro',
      targetSelector: '',
      isIntro: true,
      title: 'Nodes 페이지 가이드',
      description: 'NOA-E 에이전트 워크플로우를 구성하는 모든 노드의 규격과 사용법을 안내하는 공식 사전 페이지입니다.',
    },
    {
      id: 'nodes-categories',
      targetSelector: '[data-tour="nodes-categories"]',
      title: '노드 탐색 네비게이션',
      description: 'Input, LLM, Agent, Tool, Database 등 사용 가능한 모든 노드 블록을 선택하여 명세를 확인할 수 있습니다.',
      position: 'right',
    },
    {
      id: 'nodes-detail',
      targetSelector: '[data-tour="nodes-detail"]',
      title: '노드 상세 규격 & 사용 가이드',
      description: '선택한 노드의 입출력 포트 규격, 지원 모델 및 파라미터 설정, 실제 활용 예시 JSON을 자세히 살펴볼 수 있습니다.',
      position: 'top',
    },
  ],
  learn: [
    {
      id: 'learn-intro',
      targetSelector: '',
      isIntro: true,
      title: 'Learn 페이지 가이드',
      description: '기초적인 노드 연결부터 고성능 프롬프트 엔지니어링까지 AI 에이전트 제작 역량을 키울 수 있는 학습 공간입니다.',
    },
    {
      id: 'learn-topics',
      targetSelector: '[data-tour="learn-topics"]',
      title: '학습 커리큘럼 네비게이션',
      description: 'LLM 원리, 프롬프트 엔지니어링, RAG 지식 검색, 에이전트 워크플로우 등 단계별 AI 학습 코스를 선택할 수 있습니다.',
      position: 'right',
    },
    {
      id: 'learn-content',
      targetSelector: '[data-tour="learn-content"]',
      title: '학습 상세 가이드 본문',
      description: '선택한 주제의 핵심 개념, 직관적인 비유, 실전 구성 예제와 팁을 꼼꼼하게 학습할 수 있습니다.',
      position: 'top',
    },
  ],
};
