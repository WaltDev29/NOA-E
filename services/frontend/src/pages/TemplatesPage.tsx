import React, { useState, useMemo, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Link, useNavigate, useParams } from '../router/Router';

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
}

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
    id: 'template-chat-tutor',
    name: '스마트 영어 회화 튜터',
    category: 'chat',
    categoryLabel: '대화 & 챗봇',
    difficulty: '기초',
    difficultyColor: 'bg-primary/20 text-primary border-primary/30',
    description: '사용자의 영어 문장을 교정해주고 상황별 자연스러운 회화를 이끌어주는 1:1 AI 튜터 템플릿입니다.',
    tags: ['사용자 입력', 'LLM', '시스템 프롬프트', '출력'],
    nodeCount: 3,
    themeColor: 'border-primary/40 hover:border-primary',
    dotColor: '#4d8eff',
    graphSvg: (
      <svg className="w-full h-full p-4 relative z-10" viewBox="0 0 260 120" fill="none">
        <path d="M 45 60 C 85 60, 95 40, 130 40" stroke="#4d8eff" strokeWidth="2" strokeDasharray="3 3" />
        <path d="M 130 40 C 165 40, 175 60, 215 60" stroke="#4d8eff" strokeWidth="2" />
        <rect x="15" y="44" width="38" height="32" rx="8" fill="#171f33" stroke="#4d8eff" strokeWidth="1.5" />
        <text x="34" y="64" fill="#adc6ff" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">USER</text>
        <rect x="108" y="24" width="52" height="32" rx="8" fill="#222a3d" stroke="#c4abff" strokeWidth="1.5" />
        <text x="134" y="44" fill="#d0bcff" fontSize="10" fontWeight="bold" textAnchor="middle">TUTOR</text>
        <rect x="202" y="44" width="42" height="32" rx="8" fill="#171f33" stroke="#4cd7f6" strokeWidth="1.5" />
        <text x="223" y="64" fill="#4cd7f6" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">FEEDBACK</text>
      </svg>
    ),
  },
  {
    id: 'template-chat-support',
    name: '고객 문의 24/7 자동 응답봇',
    category: 'chat',
    categoryLabel: '대화 & 챗봇',
    difficulty: '중급',
    difficultyColor: 'bg-secondary/20 text-secondary border-secondary/30',
    description: 'FAQ 데이터와 시스템 규칙을 기반으로 고객 문의를 정중하고 정확하게 처리하는 챗봇입니다.',
    tags: ['사용자 입력', 'LLM', '조건 분기', '출력'],
    nodeCount: 4,
    themeColor: 'border-secondary/40 hover:border-secondary',
    dotColor: '#c4abff',
    graphSvg: (
      <svg className="w-full h-full p-4 relative z-10" viewBox="0 0 260 120" fill="none">
        <path d="M 40 60 L 85 60" stroke="#4d8eff" strokeWidth="2" />
        <path d="M 125 45 L 175 30" stroke="#c4abff" strokeWidth="2" />
        <path d="M 125 75 L 175 90" stroke="#4cd7f6" strokeWidth="2" />
        <rect x="10" y="44" width="34" height="32" rx="8" fill="#171f33" stroke="#4d8eff" strokeWidth="1.5" />
        <rect x="85" y="44" width="44" height="32" rx="8" fill="#222a3d" stroke="#c4abff" strokeWidth="1.5" />
        <text x="107" y="64" fill="#d0bcff" fontSize="9" fontWeight="bold" textAnchor="middle">ROUTER</text>
        <rect x="175" y="14" width="48" height="30" rx="8" fill="#171f33" stroke="#c4abff" strokeWidth="1.5" />
        <text x="199" y="33" fill="#adc6ff" fontSize="8" textAnchor="middle">FAQ BOT</text>
        <rect x="175" y="76" width="48" height="30" rx="8" fill="#171f33" stroke="#4cd7f6" strokeWidth="1.5" />
        <text x="199" y="95" fill="#4cd7f6" fontSize="8" textAnchor="middle">HUMAN</text>
      </svg>
    ),
  },
  {
    id: 'template-chat-mentor',
    name: '친절한 청소년 코딩 멘토',
    category: 'chat',
    categoryLabel: '대화 & 챗봇',
    difficulty: '기초',
    difficultyColor: 'bg-primary/20 text-primary border-primary/30',
    description: '정답을 바로 주지 않고 알기 쉬운 일상 비유와 힌트로 코딩 개념을 가르쳐주는 맞춤형 멘토입니다.',
    tags: ['사용자 입력', 'LLM', '페르소나', '출력'],
    nodeCount: 3,
    themeColor: 'border-primary/40 hover:border-primary',
    dotColor: '#4d8eff',
    graphSvg: (
      <svg className="w-full h-full p-4 relative z-10" viewBox="0 0 260 120" fill="none">
        <path d="M 45 60 C 85 60, 95 60, 125 60" stroke="#4d8eff" strokeWidth="2" />
        <path d="M 165 60 C 185 60, 195 60, 215 60" stroke="#4d8eff" strokeWidth="2" />
        <rect x="15" y="44" width="36" height="32" rx="8" fill="#171f33" stroke="#4d8eff" strokeWidth="1.5" />
        <text x="33" y="64" fill="#adc6ff" fontSize="9" textAnchor="middle">STUDENT</text>
        <rect x="125" y="44" width="46" height="32" rx="8" fill="#222a3d" stroke="#c4abff" strokeWidth="1.5" />
        <text x="148" y="64" fill="#d0bcff" fontSize="10" fontWeight="bold" textAnchor="middle">MENTOR</text>
        <rect x="215" y="44" width="34" height="32" rx="8" fill="#171f33" stroke="#4cd7f6" strokeWidth="1.5" />
        <text x="232" y="64" fill="#4cd7f6" fontSize="9" textAnchor="middle">HINT</text>
      </svg>
    ),
  },
  {
    id: 'template-search-news',
    name: '실시간 뉴스 심층 리서처',
    category: 'search',
    categoryLabel: '리서치 & 검색',
    difficulty: '중급',
    difficultyColor: 'bg-tertiary/20 text-tertiary border-tertiary/30',
    description: '구글/네이버에서 최신 이슈를 검색하고 다양한 언론사 기사를 교차 검증하여 3줄로 요약합니다.',
    tags: ['사용자 입력', '웹 검색 도구', 'LLM 요약', '출력'],
    nodeCount: 4,
    themeColor: 'border-tertiary/40 hover:border-tertiary',
    dotColor: '#4cd7f6',
    graphSvg: (
      <svg className="w-full h-full p-4 relative z-10" viewBox="0 0 260 120" fill="none">
        <path d="M 40 60 L 85 60" stroke="#4d8eff" strokeWidth="2" />
        <path d="M 135 60 L 175 60" stroke="#4cd7f6" strokeWidth="2" />
        <path d="M 220 60 L 235 60" stroke="#c4abff" strokeWidth="2" />
        <rect x="10" y="44" width="34" height="32" rx="8" fill="#171f33" stroke="#4d8eff" strokeWidth="1.5" />
        <rect x="85" y="44" width="50" height="32" rx="8" fill="#171f33" stroke="#4cd7f6" strokeWidth="1.5" />
        <text x="110" y="64" fill="#4cd7f6" fontSize="8" fontWeight="bold" textAnchor="middle">WEB SEARCH</text>
        <rect x="175" y="44" width="46" height="32" rx="8" fill="#222a3d" stroke="#c4abff" strokeWidth="1.5" />
        <text x="198" y="64" fill="#d0bcff" fontSize="9" fontWeight="bold" textAnchor="middle">LLM</text>
      </svg>
    ),
  },
  {
    id: 'template-search-market',
    name: '시장 트렌드 & 경쟁사 분석봇',
    category: 'search',
    categoryLabel: '리서치 & 검색',
    difficulty: '고급',
    difficultyColor: 'bg-error/20 text-error border-error/30',
    description: '특정 산업 분야의 최신 동향과 경쟁사 발표 자료를 자동으로 수집하여 종합 분석 보고서를 만듭니다.',
    tags: ['입력', '검색 도구', '파이썬 코드', 'LLM'],
    nodeCount: 5,
    themeColor: 'border-error/40 hover:border-error',
    dotColor: '#ff5449',
    graphSvg: (
      <svg className="w-full h-full p-4 relative z-10" viewBox="0 0 260 120" fill="none">
        <path d="M 35 60 L 75 40" stroke="#4d8eff" strokeWidth="2" />
        <path d="M 35 60 L 75 80" stroke="#4d8eff" strokeWidth="2" />
        <path d="M 125 40 L 165 60" stroke="#4cd7f6" strokeWidth="2" />
        <path d="M 125 80 L 165 60" stroke="#ff5449" strokeWidth="2" />
        <path d="M 210 60 L 235 60" stroke="#c4abff" strokeWidth="2" />
        <rect x="75" y="24" width="50" height="32" rx="8" fill="#171f33" stroke="#4cd7f6" strokeWidth="1.5" />
        <text x="100" y="44" fill="#4cd7f6" fontSize="8" textAnchor="middle">SEARCH A</text>
        <rect x="75" y="64" width="50" height="32" rx="8" fill="#171f33" stroke="#ff5449" strokeWidth="1.5" />
        <text x="100" y="84" fill="#ff5449" fontSize="8" textAnchor="middle">SEARCH B</text>
        <rect x="165" y="44" width="46" height="32" rx="8" fill="#222a3d" stroke="#c4abff" strokeWidth="1.5" />
        <text x="188" y="64" fill="#d0bcff" fontSize="9" fontWeight="bold" textAnchor="middle">SYNTH</text>
      </svg>
    ),
  },
  {
    id: 'template-doc-rag',
    name: 'PDF 교재 & 매뉴얼 Q&A 봇 (RAG)',
    category: 'document',
    categoryLabel: '문서 & 지식 (RAG)',
    difficulty: '고급',
    difficultyColor: 'bg-error/20 text-error border-error/30',
    description: '업로드한 PDF 문서나 학교 교재를 벡터 DB에 저장하여 출처와 함께 정확한 답변을 제공합니다.',
    tags: ['문서 입력', '벡터 임베딩', 'Vector DB', 'LLM'],
    nodeCount: 5,
    themeColor: 'border-secondary/40 hover:border-secondary',
    dotColor: '#c4abff',
    graphSvg: (
      <svg className="w-full h-full p-4 relative z-10" viewBox="0 0 260 120" fill="none">
        <path d="M 40 40 L 90 40" stroke="#4d8eff" strokeWidth="2" />
        <path d="M 40 80 L 90 80" stroke="#c4abff" strokeWidth="2" />
        <path d="M 140 40 C 160 40, 160 60, 180 60" stroke="#4cd7f6" strokeWidth="2" />
        <path d="M 140 80 C 160 80, 160 60, 180 60" stroke="#4cd7f6" strokeWidth="2" />
        <rect x="10" y="24" width="34" height="32" rx="8" fill="#171f33" stroke="#4d8eff" strokeWidth="1.5" />
        <text x="27" y="44" fill="#adc6ff" fontSize="8" textAnchor="middle">QUERY</text>
        <rect x="10" y="64" width="34" height="32" rx="8" fill="#171f33" stroke="#c4abff" strokeWidth="1.5" />
        <text x="27" y="84" fill="#d0bcff" fontSize="8" textAnchor="middle">PDF</text>
        <rect x="90" y="24" width="50" height="32" rx="8" fill="#171f33" stroke="#4cd7f6" strokeWidth="1.5" />
        <text x="115" y="44" fill="#4cd7f6" fontSize="8" fontWeight="bold" textAnchor="middle">VECTOR DB</text>
        <rect x="180" y="44" width="46" height="32" rx="8" fill="#222a3d" stroke="#c4abff" strokeWidth="1.5" />
        <text x="203" y="64" fill="#d0bcff" fontSize="9" fontWeight="bold" textAnchor="middle">RAG LLM</text>
      </svg>
    ),
  },
  {
    id: 'template-doc-summary',
    name: '긴 회의록 & 보고서 3줄 핵심 요약기',
    category: 'document',
    categoryLabel: '문서 & 지식 (RAG)',
    difficulty: '기초',
    difficultyColor: 'bg-primary/20 text-primary border-primary/30',
    description: '수십 장 분량의 긴 회의록에서 결정 사항과 액션 아이템(To-Do)만 쏙쏙 뽑아 정리합니다.',
    tags: ['텍스트 입력', '청킹', 'LLM 요약', 'JSON 출력'],
    nodeCount: 3,
    themeColor: 'border-secondary/40 hover:border-secondary',
    dotColor: '#c4abff',
    graphSvg: (
      <svg className="w-full h-full p-4 relative z-10" viewBox="0 0 260 120" fill="none">
        <path d="M 45 60 L 95 60" stroke="#4d8eff" strokeWidth="2" />
        <path d="M 145 60 L 185 60" stroke="#c4abff" strokeWidth="2" />
        <rect x="15" y="44" width="36" height="32" rx="8" fill="#171f33" stroke="#4d8eff" strokeWidth="1.5" />
        <text x="33" y="64" fill="#adc6ff" fontSize="9" textAnchor="middle">DOC</text>
        <rect x="95" y="44" width="50" height="32" rx="8" fill="#222a3d" stroke="#c4abff" strokeWidth="1.5" />
        <text x="120" y="64" fill="#d0bcff" fontSize="9" fontWeight="bold" textAnchor="middle">SUMMARY</text>
        <rect x="185" y="44" width="42" height="32" rx="8" fill="#171f33" stroke="#4cd7f6" strokeWidth="1.5" />
        <text x="206" y="64" fill="#4cd7f6" fontSize="9" textAnchor="middle">BULLETS</text>
      </svg>
    ),
  },
  {
    id: 'template-coding-debugger',
    name: '파이썬 코드 오류 분석 & 디버깅 봇',
    category: 'coding',
    categoryLabel: '코딩 & 개발 도구',
    difficulty: '중급',
    difficultyColor: 'bg-primary/20 text-primary border-primary/30',
    description: '에러 로그와 소스 코드를 입력하면 원인을 분석하고 수정된 코드와 해결 설명을 함께 제시합니다.',
    tags: ['코드 입력', 'LLM 추론', '파이썬 실행', '출력'],
    nodeCount: 4,
    themeColor: 'border-primary/40 hover:border-primary',
    dotColor: '#4d8eff',
    graphSvg: (
      <svg className="w-full h-full p-4 relative z-10" viewBox="0 0 260 120" fill="none">
        <path d="M 45 60 L 90 60" stroke="#4d8eff" strokeWidth="2" />
        <path d="M 135 60 L 175 60" stroke="#4cd7f6" strokeWidth="2" />
        <rect x="15" y="44" width="34" height="32" rx="8" fill="#171f33" stroke="#4d8eff" strokeWidth="1.5" />
        <text x="32" y="64" fill="#adc6ff" fontSize="9" fontFamily="monospace" textAnchor="middle">&lt;BUG&gt;</text>
        <rect x="90" y="44" width="46" height="32" rx="8" fill="#222a3d" stroke="#c4abff" strokeWidth="1.5" />
        <text x="113" y="64" fill="#d0bcff" fontSize="9" fontWeight="bold" textAnchor="middle">DEBUG</text>
        <rect x="175" y="44" width="48" height="32" rx="8" fill="#171f33" stroke="#4cd7f6" strokeWidth="1.5" />
        <text x="199" y="64" fill="#4cd7f6" fontSize="9" fontFamily="monospace" textAnchor="middle">FIXED</text>
      </svg>
    ),
  },
  {
    id: 'template-coding-sql',
    name: '자연어 to SQL 쿼리 생성기',
    category: 'coding',
    categoryLabel: '코딩 & 개발 도구',
    difficulty: '중급',
    difficultyColor: 'bg-primary/20 text-primary border-primary/30',
    description: '"지난달 구매액 10만원 이상 회원 찾아줘"라고 말하면 완벽한 SQL 쿼리문을 작성해줍니다.',
    tags: ['자연어 질문', '테이블 스키마', 'LLM', 'SQL 출력'],
    nodeCount: 3,
    themeColor: 'border-primary/40 hover:border-primary',
    dotColor: '#4d8eff',
    graphSvg: (
      <svg className="w-full h-full p-4 relative z-10" viewBox="0 0 260 120" fill="none">
        <path d="M 45 60 L 95 60" stroke="#4d8eff" strokeWidth="2" />
        <path d="M 140 60 L 185 60" stroke="#4d8eff" strokeWidth="2" />
        <rect x="15" y="44" width="34" height="32" rx="8" fill="#171f33" stroke="#4d8eff" strokeWidth="1.5" />
        <text x="32" y="64" fill="#adc6ff" fontSize="9" textAnchor="middle">KOR</text>
        <rect x="95" y="44" width="46" height="32" rx="8" fill="#222a3d" stroke="#c4abff" strokeWidth="1.5" />
        <text x="118" y="64" fill="#d0bcff" fontSize="9" fontWeight="bold" textAnchor="middle">SQL GEN</text>
        <rect x="185" y="44" width="44" height="32" rx="8" fill="#171f33" stroke="#4cd7f6" strokeWidth="1.5" />
        <text x="207" y="64" fill="#4cd7f6" fontSize="9" fontFamily="monospace" textAnchor="middle">SELECT</text>
      </svg>
    ),
  },
  {
    id: 'template-media-image',
    name: 'AI 아트 프롬프트 인핸서 & 생성기',
    category: 'media',
    categoryLabel: '멀티모달 & 미디어',
    difficulty: '기초',
    difficultyColor: 'bg-secondary/20 text-secondary border-secondary/30',
    description: '단순한 단어를 입력하면 화풍, 조명, 구도가 포함된 고화질 이미지 생성 프롬프트로 확장합니다.',
    tags: ['키워드 입력', '프롬프트 확장', '이미지 모델', '갤러리'],
    nodeCount: 3,
    themeColor: 'border-secondary/40 hover:border-secondary',
    dotColor: '#c4abff',
    graphSvg: (
      <svg className="w-full h-full p-4 relative z-10" viewBox="0 0 260 120" fill="none">
        <path d="M 45 60 L 95 60" stroke="#4d8eff" strokeWidth="2" />
        <path d="M 145 60 L 185 60" stroke="#c4abff" strokeWidth="2" />
        <rect x="15" y="44" width="34" height="32" rx="8" fill="#171f33" stroke="#4d8eff" strokeWidth="1.5" />
        <text x="32" y="64" fill="#adc6ff" fontSize="9" textAnchor="middle">IDEA</text>
        <rect x="95" y="44" width="50" height="32" rx="8" fill="#222a3d" stroke="#c4abff" strokeWidth="1.5" />
        <text x="120" y="64" fill="#d0bcff" fontSize="9" fontWeight="bold" textAnchor="middle">PROMPT+</text>
        <rect x="185" y="44" width="44" height="32" rx="8" fill="#171f33" stroke="#4cd7f6" strokeWidth="1.5" />
        <text x="207" y="64" fill="#4cd7f6" fontSize="9" textAnchor="middle">IMAGE</text>
      </svg>
    ),
  },
  {
    id: 'template-auto-email',
    name: '비즈니스 이메일 자동 분류 & 답장 초안',
    category: 'automation',
    categoryLabel: '자동화 & 워크플로우',
    difficulty: '중급',
    difficultyColor: 'bg-tertiary/20 text-tertiary border-tertiary/30',
    description: '수신된 이메일의 긴급도와 주제를 판단하여 카테고리별로 분류하고 맞춤형 답장 초안을 작성합니다.',
    tags: ['웹훅 트리거', '조건 분기', 'LLM 작성', 'HITL 승인'],
    nodeCount: 4,
    themeColor: 'border-tertiary/40 hover:border-tertiary',
    dotColor: '#4cd7f6',
    graphSvg: (
      <svg className="w-full h-full p-4 relative z-10" viewBox="0 0 260 120" fill="none">
        <path d="M 40 60 L 85 60" stroke="#4d8eff" strokeWidth="2" />
        <path d="M 125 45 L 170 30" stroke="#4cd7f6" strokeWidth="2" />
        <path d="M 125 75 L 170 90" stroke="#c4abff" strokeWidth="2" />
        <rect x="10" y="44" width="34" height="32" rx="8" fill="#171f33" stroke="#4d8eff" strokeWidth="1.5" />
        <text x="27" y="64" fill="#adc6ff" fontSize="8" textAnchor="middle">MAIL</text>
        <rect x="85" y="44" width="42" height="32" rx="8" fill="#171f33" stroke="#4cd7f6" strokeWidth="1.5" />
        <text x="106" y="64" fill="#4cd7f6" fontSize="8" textAnchor="middle">CLASSIFY</text>
        <rect x="170" y="14" width="50" height="30" rx="8" fill="#222a3d" stroke="#c4abff" strokeWidth="1.5" />
        <text x="195" y="33" fill="#d0bcff" fontSize="8" fontWeight="bold" textAnchor="middle">URGENT</text>
        <rect x="170" y="76" width="50" height="30" rx="8" fill="#171f33" stroke="#adc6ff" strokeWidth="1.5" />
        <text x="195" y="95" fill="#adc6ff" fontSize="8" textAnchor="middle">NORMAL</text>
      </svg>
    ),
  },
  {
    id: 'template-auto-weather',
    name: '매일 아침 날씨 & 캘린더 브리핑 봇',
    category: 'automation',
    categoryLabel: '자동화 & 워크플로우',
    difficulty: '기초',
    difficultyColor: 'bg-primary/20 text-primary border-primary/30',
    description: '매일 아침 오늘 날씨와 구글 캘린더 일정을 조회하여 읽기 쉬운 카드 뉴스로 텔레그램에 전송합니다.',
    tags: ['스케줄 트리거', '날씨 API', '캘린더 도구', '메시지 전송'],
    nodeCount: 4,
    themeColor: 'border-tertiary/40 hover:border-tertiary',
    dotColor: '#4cd7f6',
    graphSvg: (
      <svg className="w-full h-full p-4 relative z-10" viewBox="0 0 260 120" fill="none">
        <path d="M 40 40 L 90 60" stroke="#4d8eff" strokeWidth="2" />
        <path d="M 40 80 L 90 60" stroke="#4cd7f6" strokeWidth="2" />
        <path d="M 140 60 L 180 60" stroke="#c4abff" strokeWidth="2" />
        <rect x="10" y="24" width="34" height="32" rx="8" fill="#171f33" stroke="#4d8eff" strokeWidth="1.5" />
        <text x="27" y="44" fill="#adc6ff" fontSize="8" textAnchor="middle">TIME</text>
        <rect x="10" y="64" width="34" height="32" rx="8" fill="#171f33" stroke="#4cd7f6" strokeWidth="1.5" />
        <text x="27" y="84" fill="#4cd7f6" fontSize="8" textAnchor="middle">WEATHER</text>
        <rect x="90" y="44" width="50" height="32" rx="8" fill="#222a3d" stroke="#c4abff" strokeWidth="1.5" />
        <text x="115" y="64" fill="#d0bcff" fontSize="9" fontWeight="bold" textAnchor="middle">BRIEFING</text>
        <rect x="180" y="44" width="46" height="32" rx="8" fill="#171f33" stroke="#4cd7f6" strokeWidth="1.5" />
        <text x="203" y="64" fill="#4cd7f6" fontSize="9" textAnchor="middle">TELEGRAM</text>
      </svg>
    ),
  },
];

export const TemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams();

  const [selectedCategory, setSelectedCategory] = useState<string>(categoryId || 'all');
  const [searchQuery, setSearchQuery] = useState<string>('');

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
              <aside className="w-full lg:w-72 xl:w-80 shrink-0 flex flex-col gap-space-md lg:sticky lg:top-20">
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
              <div className="flex-1 w-full min-w-0 flex justify-center">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
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
    </div>
  );
};
