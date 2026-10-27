import type { WorkflowDetail } from '../../services/workflowApi';

export const DUMMY_ONBOARDING_WORKFLOWS: WorkflowDetail[] = [
  {
    id: 'mock-agent-1',
    user_id: 'mock-user',
    title: '고객 문의 자동 응답 에이전트',
    description: '고객 질문을 분석하여 FAQ 데이터베이스를 조회하고 친절하게 답변을 생성하는 에이전트입니다.',
    graph_data: {
      nodes: [
        { id: '1', type: 'inputNode', position: { x: 100, y: 150 }, data: { label: '고객 질문 입력' } },
        { id: '2', type: 'llmNode', position: { x: 400, y: 150 }, data: { label: '의도 분석 & 답변 생성' } },
        { id: '3', type: 'outputNode', position: { x: 700, y: 150 }, data: { label: '최종 답변 전송' } },
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e2-3', source: '2', target: '3' },
      ],
    },
    created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'mock-agent-2',
    user_id: 'mock-user',
    title: '기술 블로그 요약 & 번역 에이전트',
    description: '최신 해외 기술 아티클 URL을 받아 핵심 요점을 한국어로 깔끔하게 번역/요약해주는 워크플로우입니다.',
    graph_data: {
      nodes: [
        { id: '1', type: 'inputNode', position: { x: 100, y: 150 }, data: { label: '블로그 본문 입력' } },
        { id: '2', type: 'searchNode', position: { x: 350, y: 100 }, data: { label: '용어 검색' } },
        { id: '3', type: 'llmNode', position: { x: 600, y: 150 }, data: { label: '한국어 요약' } },
        { id: '4', type: 'outputNode', position: { x: 850, y: 150 }, data: { label: '요약 결과' } },
      ],
      edges: [
        { id: 'e1-3', source: '1', target: '3' },
        { id: 'e2-3', source: '2', target: '3' },
        { id: 'e3-4', source: '3', target: '4' },
      ],
    },
    created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
];
