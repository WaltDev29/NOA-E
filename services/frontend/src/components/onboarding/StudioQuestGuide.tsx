import React, { useEffect, useState, useRef } from 'react';
import { useOnboarding } from '../../context/OnboardingContext';
import { useWorkflowStore } from '../../store/useWorkflowStore';

interface QuestStepInfo {
  step: number;
  badge: string;
  targetSelector: string;
  title: string;
  description: string;
  guideAction?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'top-right';
  interactiveType?: 'info' | 'drag-node' | 'connect-wire' | 'execute' | 'executing-wait' | 'click-export';
}

const QUEST_STEPS: QuestStepInfo[] = [
  {
    step: 1,
    badge: '1단계: 중앙 캔버스',
    targetSelector: '[data-tour="studio-canvas"]',
    title: '에이전트 캔버스 (Workspace Canvas)',
    description:
      '이곳은 AI 에이전트의 노드들을 자유롭게 배치하고 연결선을 이어 워크플로우를 만드는 시각적 캔버스입니다. 마우스 휠로 확대/축소하고 드래그하여 이동할 수 있습니다.',
    position: 'bottom',
    interactiveType: 'info',
  },
  {
    step: 2,
    badge: '2단계: 노드 팔레트',
    targetSelector: '[data-tour="studio-palette"]',
    title: '노드 팔레트 (Node Palette)',
    description:
      '좌측 팔레트에는 에이전트에 추가할 수 있는 다양한 노드 블록(입력, LLM 모델, 검색/계산 도구, 출력)이 준비되어 있습니다. 원하는 노드를 캔버스로 드래그하여 추가합니다.',
    position: 'right',
    interactiveType: 'info',
  },
  {
    step: 3,
    badge: '3단계: Input 노드 배치',
    targetSelector: '[data-tour="palette-input-node"]',
    title: 'Input 노드 끌어다 놓기',
    description:
      '좌측 팔레트의 [Input (사용자 입력)] 노드를 마우스로 꾹 누른 채 캔버스 좌측 영역으로 드래그 앤 드롭해보세요!\n노드를 캔버스에 올려놓으면 자동으로 다음 단계로 진행됩니다.',
    guideAction: 'Input 노드를 캔버스 좌측으로 드래그 앤 드롭하세요.',
    position: 'top-right',
    interactiveType: 'drag-node',
  },
  {
    step: 4,
    badge: '4단계: Input 설정 패널',
    targetSelector: '[data-tour="studio-properties"]',
    title: 'Input 노드 설정 패널',
    description:
      '캔버스에서 Input 노드를 선택하면 우측 패널에서 사용자 질문 텍스트를 입력할 수 있습니다. 에이전트가 처리할 최초의 질의 내용을 미리 지정해둡니다.',
    position: 'left',
    interactiveType: 'info',
  },
  {
    step: 5,
    badge: '5단계: LLM 노드 배치',
    targetSelector: '[data-tour="palette-llm-node"]',
    title: 'LLM 노드 끌어다 놓기',
    description:
      '잘하셨습니다! 이제 질문을 읽고 답변을 추론할 AI 두뇌인 [LLM (언어 모델)] 노드를 캔버스 중앙으로 드래그 앤 드롭하세요.',
    guideAction: 'LLM 노드를 캔버스 중앙으로 드래그 앤 드롭하세요.',
    position: 'top-right',
    interactiveType: 'drag-node',
  },
  {
    step: 6,
    badge: '6단계: LLM 설정 패널',
    targetSelector: '[data-tour="studio-properties"]',
    title: 'LLM 노드 파라미터 설정',
    description:
      '우측 패널에서 사용할 AI 모델(gemma2, gpt-4o 등)과 에이전트의 성격 및 역할을 지정하는 시스템 프롬프트(System Prompt), Temperature를 설정합니다.',
    position: 'left',
    interactiveType: 'info',
  },
  {
    step: 7,
    badge: '7단계: Output 노드 배치',
    targetSelector: '[data-tour="palette-output-node"]',
    title: 'Output 노드 끌어다 놓기',
    description:
      '멋집니다! 마지막으로 LLM이 만든 최종 답변을 사용자에게 표출해줄 [Output (결과 출력)] 노드를 캔버스 우측으로 드래그 앤 드롭하세요.',
    guideAction: 'Output 노드를 캔버스 우측으로 드래그 앤 드롭하세요.',
    position: 'top-right',
    interactiveType: 'drag-node',
  },
  {
    step: 8,
    badge: '8단계: Output 설정 패널',
    targetSelector: '[data-tour="studio-properties"]',
    title: 'Output 노드 출력 옵션',
    description:
      'Output 노드는 LLM의 최종 생성물을 마크다운 또는 텍스트 서식으로 깔끔하게 표출하도록 돕는 최종 종착점 역할을 합니다.',
    position: 'left',
    interactiveType: 'info',
  },
  {
    step: 9,
    badge: '9단계: 노드 선 연결',
    targetSelector: '[data-tour="studio-canvas"]',
    title: '노드 간 연결선 잇기 (Wire)',
    description:
      '화면에 강조 표시된 연결 지점(포트)을 이어 파이프라인을 완성하세요!\n1️⃣ Input 우측 점 ➔ LLM 좌측 점\n2️⃣ LLM 우측 점 ➔ Output 좌측 점\n올바르게 두 선을 모두 연결하면 자동으로 다음 단계로 넘어갑니다.',
    guideAction: 'Input ➔ LLM ➔ Output 순서대로 선을 이어주세요.',
    position: 'top-right',
    interactiveType: 'connect-wire',
  },
  {
    step: 10,
    badge: '10단계: 에이전트 실행',
    targetSelector: '[data-tour="studio-run-btn"]',
    title: '상단 [실행하기] 버튼 클릭',
    description:
      '모든 연결이 완료되었습니다!\n상단 툴바의 [실행하기] 버튼을 직접 클릭하여 AI 파이프라인을 동작시켜보세요.',
    guideAction: '상단의 [실행하기] 버튼을 클릭하세요.',
    position: 'bottom',
    interactiveType: 'execute',
  },
  {
    step: 11,
    badge: '11단계: 실행 진행 중',
    targetSelector: '.react-flow__node[data-id*="llm"]',
    title: 'AI 에이전트 추론 실행 중',
    description:
      '현재 LLM 노드가 실행 중입니다!\n실행 중인 노드에는 회전하는 로딩 표시가 나타납니다. 에이전트 답변 생성을 잠시 대기하겠습니다...',
    guideAction: '답변 생성이 완료될 때까지 잠시 기다려주세요.',
    position: 'top-right',
    interactiveType: 'executing-wait',
  },
  {
    step: 12,
    badge: '12단계: 실행 콘솔 확인',
    targetSelector: '[data-tour="studio-console"]',
    title: '하단 실행 콘솔 (Execution Logs)',
    description:
      '파이프라인 실행이 완료되었습니다!\n하단 콘솔에서 각 노드의 실행 상태, SSE 실시간 토큰 스트리밍 로그, 그리고 최종 AI 응답 결과를 확인할 수 있습니다.',
    position: 'top',
    interactiveType: 'info',
  },
  {
    step: 13,
    badge: '13단계: JSON 다운로드 버튼',
    targetSelector: '[data-tour="studio-export-btn"]',
    title: '에이전트 JSON 다운로드 버튼 클릭',
    description:
      '에이전트 제작과 실행이 완료되었습니다!\n상단 툴바의 [다운로드] 버튼을 직접 클릭하여 에이전트 내보내기 모달을 열어보세요.',
    guideAction: '상단의 [다운로드] 버튼을 클릭하세요.',
    position: 'bottom',
    interactiveType: 'click-export',
  },
  {
    step: 14,
    badge: '14단계: 저장 및 실행기 모달',
    targetSelector: '[data-tour="export-modal"]',
    title: '에이전트 저장 및 실행기 (Export Modal)',
    description:
      '제작한 에이전트 워크플로우를 표준 JSON 파일로 다운로드할 수 있는 모달입니다.\n다운로드한 JSON은 로컬 파이썬 실행기(Runtime)에서 오프라인으로 즉시 구동하거나 다른 프로젝트로 손쉽게 내보낼 수 있습니다.\n축하합니다! 에이전트 제작 가이드를 모두 마쳤습니다.',
    position: 'top-right',
    interactiveType: 'info',
  },
];

interface PortHighlight {
  id: string;
  label: string;
  x: number;
  y: number;
  stepOrder: number;
}

export const StudioQuestGuide: React.FC = () => {
  const { activeGuide, studioQuestStep, setStudioQuestStep, endGuide } = useOnboarding();

  // Workflow Store
  const nodes = useWorkflowStore((state) => state.nodes);
  const edges = useWorkflowStore((state) => state.edges);
  const isExecuting = useWorkflowStore((state) => state.isExecuting);
  const setNodes = useWorkflowStore((state) => state.setNodes);
  const setEdges = useWorkflowStore((state) => state.setEdges);
  const setSelectedNode = useWorkflowStore((state) => state.setSelectedNode);
  const updateNodeConfig = useWorkflowStore((state) => state.updateNodeConfig);
  const clearLogs = useWorkflowStore((state) => state.clearLogs);

  const [targetRect, setTargetRect] = useState<{ top: number; left: number; width: number; height: number } | null>(
    null
  );
  const [canvasRect, setCanvasRect] = useState<{ top: number; left: number; width: number; height: number } | null>(
    null
  );
  const [portHighlights, setPortHighlights] = useState<PortHighlight[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const currentStep = QUEST_STEPS[studioQuestStep - 1] || QUEST_STEPS[0];
  const interactiveType = currentStep.interactiveType || 'info';
  const isDragNode = interactiveType === 'drag-node';

  // 캔버스 영역 위치 추적 (노드 드래그 실습 시 동시 하이라이트용)
  useEffect(() => {
    if (activeGuide !== 'studio_quest') {
      setCanvasRect(null);
      return;
    }

    const updateCanvas = () => {
      const el = document.querySelector('[data-tour="studio-canvas"]');
      if (el) {
        const rect = el.getBoundingClientRect();
        setCanvasRect({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        });
      }
    };

    updateCanvas();
    const interval = setInterval(updateCanvas, 400);
    window.addEventListener('resize', updateCanvas);
    window.addEventListener('scroll', updateCanvas);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', updateCanvas);
      window.removeEventListener('scroll', updateCanvas);
    };
  }, [activeGuide]);

  // 1. 에이전트 제작 가이드 진입 시 캔버스 빈 상태로 초기화
  const hasInitializedCanvas = useRef(false);
  useEffect(() => {
    if (activeGuide === 'studio_quest' && studioQuestStep === 1 && !hasInitializedCanvas.current) {
      hasInitializedCanvas.current = true;
      setNodes([]);
      setEdges([]);
      setSelectedNode(null);
      clearLogs();
    }
    if (activeGuide !== 'studio_quest') {
      hasInitializedCanvas.current = false;
    }
  }, [activeGuide, studioQuestStep, setNodes, setEdges, setSelectedNode, clearLogs]);

  // 2. 노드 드래그 앤 드롭 감지 및 해당 노드 설정창(Step 4, 6, 8)으로 자동 이동
  useEffect(() => {
    if (activeGuide !== 'studio_quest') return;

    if (studioQuestStep === 3) {
      // Step 3 (Input 드래그): 캔버스에 추가되면 Input 노드 선택 & Step 4 (Input 설정 패널)로 자동 이동
      const inputNode = nodes.find((n) => n.type === 'inputNode');
      if (inputNode) {
        // 테스트 질문 기본값 설정
        const currentText = (inputNode.data as any)?.config?.input_text;
        if (!currentText) {
          updateNodeConfig(inputNode.id, {
            input_text: '인공지능 에이전트의 역할과 장점을 한 줄로 요약해줘.',
          });
        }
        setSelectedNode(inputNode);
        const timer = setTimeout(() => {
          setStudioQuestStep(4);
        }, 300);
        return () => clearTimeout(timer);
      }
    } else if (studioQuestStep === 5) {
      // Step 5 (LLM 드래그): 캔버스에 추가되면 LLM 노드 선택 & Step 6 (LLM 설정 패널)로 자동 이동
      const llmNode = nodes.find((n) => n.type === 'llmNode');
      if (llmNode) {
        setSelectedNode(llmNode);
        const timer = setTimeout(() => {
          setStudioQuestStep(6);
        }, 300);
        return () => clearTimeout(timer);
      }
    } else if (studioQuestStep === 7) {
      // Step 7 (Output 드래그): 캔버스에 추가되면 Output 노드 선택 & Step 8 (Output 설정 패널)로 자동 이동
      const outputNode = nodes.find((n) => n.type === 'outputNode');
      if (outputNode) {
        setSelectedNode(outputNode);
        const timer = setTimeout(() => {
          setStudioQuestStep(8);
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [nodes, activeGuide, studioQuestStep, setStudioQuestStep, setSelectedNode, updateNodeConfig]);

  // 3. 노드 선 연결 유효성 검사 및 자동 진행 (Step 9)
  useEffect(() => {
    if (activeGuide !== 'studio_quest' || studioQuestStep !== 9) {
      setConnectionError(null);
      return;
    }

    const inputNode = nodes.find((n) => n.type === 'inputNode');
    const llmNode = nodes.find((n) => n.type === 'llmNode');
    const outputNode = nodes.find((n) => n.type === 'outputNode');

    if (!inputNode || !llmNode || !outputNode) return;

    // 잘못된 연결 검출: Input에서 바로 Output으로 연결된 경우
    const directInputToOutput = edges.find(
      (e) => e.source === inputNode.id && e.target === outputNode.id
    );
    // 역방향 연결 검출
    const reverseConnection = edges.find(
      (e) =>
        (e.source === outputNode.id) ||
        (e.target === inputNode.id) ||
        (e.source === llmNode.id && e.target === inputNode.id)
    );

    if (directInputToOutput || reverseConnection) {
      setConnectionError(
        '⚠️ 잘못된 연결입니다! Input에서 LLM으로, 그리고 LLM에서 Output으로 연결해야 합니다.'
      );
      // 잘못된 엣지 자동 제거
      const badId = (directInputToOutput || reverseConnection)?.id;
      if (badId) {
        setEdges(edges.filter((e) => e.id !== badId));
      }
      return;
    }

    // 올바른 연결 확인
    const hasInputToLlm = edges.some(
      (e) => e.source === inputNode.id && e.target === llmNode.id
    );
    const hasLlmToOutput = edges.some(
      (e) => e.source === llmNode.id && e.target === outputNode.id
    );

    if (hasInputToLlm && hasLlmToOutput) {
      setConnectionError(null);
      const timer = setTimeout(() => {
        setStudioQuestStep(10); // 실행 단계로 자동 진행
      }, 400);
      return () => clearTimeout(timer);
    } else {
      setConnectionError(null);
    }
  }, [edges, nodes, activeGuide, studioQuestStep, setEdges, setStudioQuestStep]);

  // 4. 선 연결 단계(Step 9)에서 대상 연결 지점(Port) 위치 추적
  useEffect(() => {
    if (activeGuide !== 'studio_quest' || studioQuestStep !== 9) {
      setPortHighlights([]);
      return;
    }

    const updatePorts = () => {
      const inputNode = nodes.find((n) => n.type === 'inputNode');
      const llmNode = nodes.find((n) => n.type === 'llmNode');
      const outputNode = nodes.find((n) => n.type === 'outputNode');

      const highlights: PortHighlight[] = [];

      // 1) Input 노드 우측 핸들
      if (inputNode) {
        const handle = document.querySelector(
          `.react-flow__node[data-id="${inputNode.id}"] .react-flow__handle-right`
        ) as HTMLElement | null;
        if (handle) {
          const rect = handle.getBoundingClientRect();
          highlights.push({
            id: 'input-source',
            label: '1️⃣ 출발',
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
            stepOrder: 1,
          });
        }
      }

      // 2) LLM 노드 좌측 핸들 & 우측 핸들
      if (llmNode) {
        const leftHandle = document.querySelector(
          `.react-flow__node[data-id="${llmNode.id}"] .react-flow__handle-left`
        ) as HTMLElement | null;
        if (leftHandle) {
          const rect = leftHandle.getBoundingClientRect();
          highlights.push({
            id: 'llm-target',
            label: '2️⃣ 연결',
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
            stepOrder: 2,
          });
        }

        const rightHandle = document.querySelector(
          `.react-flow__node[data-id="${llmNode.id}"] .react-flow__handle-right`
        ) as HTMLElement | null;
        if (rightHandle) {
          const rect = rightHandle.getBoundingClientRect();
          highlights.push({
            id: 'llm-source',
            label: '3️⃣ 출발',
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
            stepOrder: 3,
          });
        }
      }

      // 3) Output 노드 좌측 핸들
      if (outputNode) {
        const handle = document.querySelector(
          `.react-flow__node[data-id="${outputNode.id}"] .react-flow__handle-left`
        ) as HTMLElement | null;
        if (handle) {
          const rect = handle.getBoundingClientRect();
          highlights.push({
            id: 'output-target',
            label: '4️⃣ 도착',
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
            stepOrder: 4,
          });
        }
      }

      setPortHighlights(highlights);
    };

    updatePorts();
    const interval = setInterval(updatePorts, 200);
    return () => clearInterval(interval);
  }, [activeGuide, studioQuestStep, nodes]);

  // 5. 실행 버튼 클릭 감지 (Step 10)
  useEffect(() => {
    if (activeGuide !== 'studio_quest' || studioQuestStep !== 10) return;

    if (isExecuting) {
      setStudioQuestStep(11); // 실행 중 안내로 즉시 이동
    }
  }, [isExecuting, activeGuide, studioQuestStep, setStudioQuestStep]);

  // 6. 실행 완료 감지 (Step 11 -> Step 12 콘솔 로그 안내로 이동)
  const prevExecutingRef = useRef(isExecuting);
  useEffect(() => {
    if (activeGuide !== 'studio_quest' || studioQuestStep !== 11) {
      prevExecutingRef.current = isExecuting;
      return;
    }

    if (prevExecutingRef.current && !isExecuting) {
      const timer = setTimeout(() => {
        setStudioQuestStep(12); // 로그 콘솔 안내 단계로 이동
      }, 500);
      return () => clearTimeout(timer);
    }
    prevExecutingRef.current = isExecuting;
  }, [isExecuting, activeGuide, studioQuestStep, setStudioQuestStep]);

  // 7. Step 13: JSON 내보내기 버튼 클릭 시 ExportModal 열림 감지 ➔ Step 14로 전진
  useEffect(() => {
    if (activeGuide !== 'studio_quest' || studioQuestStep !== 13) return;

    const checkModal = () => {
      const modalEl = document.querySelector('[data-tour="export-modal"]');
      if (modalEl) {
        setStudioQuestStep(14); // 모달 안내 단계로 자동 이동
      }
    };

    checkModal();
    const interval = setInterval(checkModal, 200);
    return () => clearInterval(interval);
  }, [activeGuide, studioQuestStep, setStudioQuestStep]);

  // 8. 실습 가이드 조작 차단 가드 (직접 조작해야 하는 영역 외에는 클릭/드래그/키보드 삭제 완전 차단)
  useEffect(() => {
    if (activeGuide !== 'studio_quest') return;

    const handleMouseCapture = (e: MouseEvent) => {
      // 1) 툴팁 카드 내의 클릭은 항상 허용
      const tooltip = document.querySelector('[data-tour-tooltip="true"]');
      if (tooltip && tooltip.contains(e.target as Node)) {
        return;
      }

      // 2) 숨겨진 실행 트리거 버튼(#studio-hidden-run-btn)은 실행 처리를 위해 무조건 통과 허용!
      const targetEl = e.target as HTMLElement | null;
      if (
        targetEl &&
        (targetEl.id === 'studio-hidden-run-btn' || targetEl.closest('#studio-hidden-run-btn'))
      ) {
        return;
      }

      let isAllowed = false;

      // 3) 단계별 직접 조작 허용 영역 판정
      if (studioQuestStep === 3) {
        // Step 3: Input 노드 드래그 시작 및 캔버스 영역 드롭만 허용
        const inputEl = document.querySelector('[data-tour="palette-input-node"]');
        const canvasEl = document.querySelector('[data-tour="studio-canvas"]');
        if (
          (inputEl && inputEl.contains(e.target as Node)) ||
          (canvasEl && canvasEl.contains(e.target as Node))
        ) {
          isAllowed = true;
        }
      } else if (studioQuestStep === 5) {
        // Step 5: LLM 노드 드래그 시작 및 캔버스 영역 드롭만 허용
        const llmEl = document.querySelector('[data-tour="palette-llm-node"]');
        const canvasEl = document.querySelector('[data-tour="studio-canvas"]');
        if (
          (llmEl && llmEl.contains(e.target as Node)) ||
          (canvasEl && canvasEl.contains(e.target as Node))
        ) {
          isAllowed = true;
        }
      } else if (studioQuestStep === 7) {
        // Step 7: Output 노드 드래그 시작 및 캔버스 영역 드롭만 허용
        const outputEl = document.querySelector('[data-tour="palette-output-node"]');
        const canvasEl = document.querySelector('[data-tour="studio-canvas"]');
        if (
          (outputEl && outputEl.contains(e.target as Node)) ||
          (canvasEl && canvasEl.contains(e.target as Node))
        ) {
          isAllowed = true;
        }
      } else if (studioQuestStep === 9) {
        // Step 9: 캔버스 내부에서의 선 연결 및 노드 이동만 허용 (우측 패널 조작/노드 삭제 차단)
        const canvasEl = document.querySelector('[data-tour="studio-canvas"]');
        if (canvasEl && canvasEl.contains(e.target as Node)) {
          isAllowed = true;
        }
      } else if (studioQuestStep === 10) {
        // Step 10: 상단 [실행하기] 버튼 클릭 허용
        const runBtn = document.querySelector('[data-tour="studio-run-btn"]');
        if (runBtn && (runBtn === targetEl || runBtn.contains(targetEl))) {
          isAllowed = true;
        }
      } else if (studioQuestStep === 13) {
        // Step 13: 상단 [다운로드(JSON)] 버튼 클릭 허용
        const exportBtn = document.querySelector('[data-tour="studio-export-btn"]');
        if (exportBtn && (exportBtn === targetEl || exportBtn.contains(targetEl))) {
          isAllowed = true;
        }
      } else if (studioQuestStep === 14) {
        // Step 14: 열린 ExportModal 내부 클릭 및 탭 전환, 닫기 등 조작 허용
        const modalEl = document.querySelector('[data-tour="export-modal"]');
        if (modalEl && modalEl.contains(e.target as Node)) {
          isAllowed = true;
        }
      }
      // 그 외의 설명/안내 단계(Step 1, 2, 4, 6, 8, 11, 12 등)는 isAllowed = false 유지 -> 설정창 노드 삭제/수정 차단!

      if (!isAllowed) {
        e.stopPropagation();
        e.preventDefault();
      }
    };

    // 키보드로 인한 노드 삭제(Delete / Backspace) 방지
    const handleKeyDownCapture = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const activeEl = document.activeElement;
        const isInputField =
          activeEl &&
          (activeEl.tagName === 'INPUT' ||
            activeEl.tagName === 'TEXTAREA' ||
            (activeEl as HTMLElement).isContentEditable);
        if (!isInputField) {
          e.stopPropagation();
          e.preventDefault();
        }
      }
    };

    // 캡처링 단계에서 이벤트 가로채기
    window.addEventListener('mousedown', handleMouseCapture, true);
    window.addEventListener('mouseup', handleMouseCapture, true);
    window.addEventListener('click', handleMouseCapture, true);
    window.addEventListener('dblclick', handleMouseCapture, true);
    window.addEventListener('dragstart', handleMouseCapture, true);
    window.addEventListener('keydown', handleKeyDownCapture, true);

    return () => {
      window.removeEventListener('mousedown', handleMouseCapture, true);
      window.removeEventListener('mouseup', handleMouseCapture, true);
      window.removeEventListener('click', handleMouseCapture, true);
      window.removeEventListener('dblclick', handleMouseCapture, true);
      window.removeEventListener('dragstart', handleMouseCapture, true);
      window.removeEventListener('keydown', handleKeyDownCapture, true);
    };
  }, [activeGuide, studioQuestStep]);

  // 9. DOM 타겟 요소 위치 추적
  useEffect(() => {
    if (activeGuide !== 'studio_quest' || !currentStep) {
      setTargetRect(null);
      return;
    }

    const updateRect = () => {
      let el = document.querySelector(currentStep.targetSelector) as HTMLElement | null;

      // LLM 노드 셀렉터의 대체 처리
      if (!el && studioQuestStep === 11) {
        const llm = nodes.find((n) => n.type === 'llmNode');
        if (llm) {
          el = document.querySelector(`.react-flow__node[data-id="${llm.id}"]`);
        }
      }

      if (el) {
        const rect = el.getBoundingClientRect();
        setTargetRect({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        });
      } else {
        setTargetRect(null);
      }
    };

    updateRect();
    const timer = setTimeout(updateRect, 150);
    const interval = setInterval(updateRect, 400);

    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
    };
  }, [activeGuide, currentStep, studioQuestStep, nodes]);

  if (activeGuide !== 'studio_quest') {
    return null;
  }

  const handleNext = () => {
    if (studioQuestStep >= QUEST_STEPS.length) {
      endGuide();
    } else {
      setStudioQuestStep(studioQuestStep + 1);
    }
  };

  const handlePrev = () => {
    if (studioQuestStep > 1) {
      setStudioQuestStep(studioQuestStep - 1);
    }
  };

  // 툴팁 위치 계산
  const getTooltipStyle = (): React.CSSProperties => {
    const width = 360;

    // Step 14 (ExportModal 안내): 모달 카드 우측 공간이 충분하면 우측에 배치, 부족하면 화면 우측 상단 안전 배치
    if (studioQuestStep === 14 && targetRect) {
      const modalRight = targetRect.left - window.scrollX + targetRect.width;
      const rightSpace = window.innerWidth - modalRight;
      if (rightSpace >= width + 24) {
        return {
          position: 'fixed',
          top: `${Math.max(84, targetRect.top - window.scrollY)}px`,
          left: `${modalRight + 16}px`,
          width: `${width}px`,
        };
      }
      return {
        position: 'fixed',
        top: '84px',
        right: '24px',
        width: `${width}px`,
      };
    }

    // Step 4, 6, 8 (우측 설정창 설명): 설정창의 왼쪽 캔버스 위에 배치
    if ((studioQuestStep === 4 || studioQuestStep === 6 || studioQuestStep === 8) && targetRect) {
      return {
        position: 'fixed',
        top: '90px',
        left: `${Math.max(16, targetRect.left - window.scrollX - width - 16)}px`,
        width: `${width}px`,
      };
    }

    // 노드 드래그(3, 5, 7), 선 연결(9), 실행 중(11) 단계는 우측 상단에 안전하게 고정
    if (
      currentStep.position === 'top-right' ||
      interactiveType === 'drag-node' ||
      interactiveType === 'connect-wire' ||
      interactiveType === 'executing-wait'
    ) {
      return {
        position: 'fixed',
        top: '84px',
        right: '24px',
        width: `${width}px`,
      };
    }

    if (!targetRect) {
      return {
        position: 'fixed',
        top: '84px',
        right: '24px',
        width: `${width}px`,
      };
    }

    const padding = 12;
    let top = targetRect.top - window.scrollY;
    let left = targetRect.left - window.scrollX;

    if (currentStep.position === 'right') {
      left = left + targetRect.width + padding;
      top = Math.max(84, top);
    } else if (currentStep.position === 'left') {
      left = left - width - padding;
      top = Math.max(84, top);
    } else if (currentStep.position === 'top') {
      top = top - 230;
      left = Math.max(16, left + targetRect.width / 2 - width / 2);
    } else {
      // bottom
      top = top + targetRect.height + padding;
      left = Math.max(16, left + targetRect.width / 2 - width / 2);
    }

    // 화면 밖 경계 보정
    if (left < 16) left = 16;
    if (left + width > window.innerWidth - 16) {
      left = window.innerWidth - width - 16;
    }
    if (top < 84) top = 84;
    if (top > window.innerHeight - 250) top = window.innerHeight - 250;

    return {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      width: `${width}px`,
    };
  };

  const isFirst = studioQuestStep === 1;
  const isLast = studioQuestStep === QUEST_STEPS.length;

  // 인터랙티브 단계별 버튼 제어
  const isInteractiveQuest =
    interactiveType === 'drag-node' ||
    interactiveType === 'connect-wire' ||
    interactiveType === 'execute' ||
    interactiveType === 'executing-wait' ||
    interactiveType === 'click-export';

  return (
    <div className="fixed inset-0 z-[9990] pointer-events-none select-none">
      {/* Dimmed Overlay: SVG Mask로 targetRect 및 드래그 실습 시 canvasRect를 동시 컷아웃하여 환하게 비춤 */}
      {targetRect && (
        <svg className="fixed inset-0 w-full h-full pointer-events-none z-[9991]">
          <defs>
            <mask id="quest-spotlight-mask">
              {/* 기본 전체 흰색 = 어두움 적용 */}
              <rect width="100%" height="100%" fill="white" />

              {/* 메인 타겟 컷아웃 (검은색 = 투명) */}
              <rect
                x={targetRect.left - window.scrollX - 6}
                y={targetRect.top - window.scrollY - 6}
                width={targetRect.width + 12}
                height={targetRect.height + 12}
                rx={isDragNode ? '12' : '16'}
                fill="black"
              />

              {/* 노드 드래그 실습 단계(Step 3, 5, 7): 캔버스 영역도 함께 컷아웃하여 환하게 노출 */}
              {isDragNode && canvasRect && (
                <rect
                  x={canvasRect.left - window.scrollX}
                  y={canvasRect.top - window.scrollY}
                  width={canvasRect.width}
                  height={canvasRect.height}
                  rx="16"
                  fill="black"
                />
              )}
            </mask>
          </defs>

          <rect
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.65)"
            mask="url(#quest-spotlight-mask)"
          />
        </svg>
      )}

      {/* Target Focus Ring */}
      {targetRect && (
        <div
          className="fixed rounded-2xl border-2 border-primary shadow-[0_0_24px_rgba(77,142,255,0.7)] pointer-events-none transition-all duration-300 ease-out animate-pulse z-[9995]"
          style={{
            top: `${targetRect.top - window.scrollY - 6}px`,
            left: `${targetRect.left - window.scrollX - 6}px`,
            width: `${targetRect.width + 12}px`,
            height: `${targetRect.height + 12}px`,
          }}
        />
      )}

      {/* 노드 드래그 실습 단계(Step 3, 5, 7): 캔버스 영역에 대시 펄스 링 및 드롭 안내 배지 표시 */}
      {isDragNode && canvasRect && (
        <div
          className="fixed rounded-2xl border-2 border-dashed border-primary shadow-[0_0_28px_rgba(77,142,255,0.45)] pointer-events-none transition-all duration-300 ease-out animate-pulse z-[9995]"
          style={{
            top: `${canvasRect.top - window.scrollY}px`,
            left: `${canvasRect.left - window.scrollX}px`,
            width: `${canvasRect.width}px`,
            height: `${canvasRect.height}px`,
          }}
        >
          {/* Canvas Drop Guide Badge */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-surface-container-low/95 border border-primary text-primary text-xs font-bold shadow-xl backdrop-blur-md flex items-center gap-2 animate-bounce">
            <span className="material-symbols-outlined text-[18px]">drive_file_move</span>
            <span>여기에 노드를 끌어다 놓으세요!</span>
          </div>
        </div>
      )}

      {/* 선 연결 단계(Step 9): 강조해야 할 포트 핸들 위에 펄스 핀(Pin) 렌더링 */}
      {interactiveType === 'connect-wire' &&
        portHighlights.map((port) => (
          <div
            key={port.id}
            className="fixed pointer-events-none z-[9996] flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${port.x}px`, top: `${port.y}px` }}
          >
            {/* Ping Effect Ring */}
            <span className="absolute w-8 h-8 rounded-full bg-primary/40 border-2 border-primary animate-ping" />
            {/* Center Core Dot */}
            <span className="w-3.5 h-3.5 rounded-full bg-primary shadow-[0_0_12px_rgba(77,142,255,1)] border border-white" />
            {/* Port Label Badge */}
            <span className="absolute -top-7 px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold tracking-tight shadow-md whitespace-nowrap animate-bounce">
              {port.label}
            </span>
          </div>
        ))}

      {/* Interactive Guide Card */}
      <div
        data-tour-tooltip="true"
        style={getTooltipStyle()}
        className="pointer-events-auto rounded-3xl bg-surface-container-low/95 border border-outline-variant/50 p-5 shadow-2xl backdrop-blur-2xl z-[9999] flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {currentStep.badge}
            </span>
          </div>
          <button
            type="button"
            onClick={endGuide}
            className="text-xs text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
          >
            가이드 종료
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-1">
          <h3 className="font-bold text-base text-on-surface leading-tight">
            {currentStep.title}
          </h3>
          <p className="text-xs text-on-surface-variant leading-relaxed mt-1 whitespace-pre-line">
            {currentStep.description}
          </p>
        </div>

        {/* Connection Error Alert Callout */}
        {connectionError && (
          <div className="p-3 rounded-xl bg-error/15 border border-error/40 flex items-start gap-2 text-error text-xs font-semibold animate-in shake duration-300">
            <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
            <span className="leading-snug">{connectionError}</span>
          </div>
        )}

        {/* Guide Action Callout */}
        {currentStep.guideAction && !connectionError && (
          <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/25 flex items-center gap-2 text-primary text-xs font-semibold">
            {interactiveType === 'executing-wait' ? (
              <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
            ) : (
              <span className="material-symbols-outlined text-[18px]">
                {interactiveType === 'execute'
                  ? 'play_circle'
                  : interactiveType === 'click-export'
                  ? 'download'
                  : 'touch_app'}
              </span>
            )}
            <span>{currentStep.guideAction}</span>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-2.5 border-t border-outline-variant/20 mt-1">
          <span className="text-[11px] text-outline font-mono">
            {studioQuestStep} / {QUEST_STEPS.length}
          </span>

          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-on-surface hover:bg-surface-container border border-outline-variant/30 transition-all active:scale-95 cursor-pointer"
              >
                이전
              </button>
            )}

            {/* 실습 퀘스트 단계(드래그, 선 연결, 실행 클릭, 실행 중 대기, 다운로드 버튼 클릭)에서는 다음 버튼을 숨기고 실제 행동으로만 진행되게 함 */}
            {!isInteractiveQuest && (
              <button
                type="button"
                onClick={handleNext}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 flex items-center gap-1 shadow-sm cursor-pointer ${
                  isLast
                    ? 'bg-gradient-to-r from-primary to-secondary text-white hover:brightness-110 shadow-primary/30'
                    : 'bg-primary text-on-primary hover:brightness-110 shadow-primary/20'
                }`}
              >
                <span>{isLast ? '실습 가이드 완료' : '다음 단계'}</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
