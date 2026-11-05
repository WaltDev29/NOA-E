import React, { useState, useEffect, useRef } from 'react';
import { Header } from '../components/layout/Header';
import { WorkflowEditor } from '../components/editor/WorkflowEditor';
import { NodePalette } from '../components/panel/NodePalette';
import { PropertyPanel } from '../components/panel/PropertyPanel';
import { NodeResultPanel } from '../components/panel/NodeResultPanel';
import { ExecutionPanel } from '../components/execution/ExecutionPanel';
import { NodeInfoModal } from '../components/editor/NodeInfoModal';
import { OutputResultModal } from '../components/editor/OutputResultModal';
import { ExportModal } from '../components/panel/ExportModal';
import { StudioQuestGuide } from '../components/onboarding/StudioQuestGuide';
import { useOnboarding } from '../context/OnboardingContext';
import { useWorkflowStore } from '../store/useWorkflowStore';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { useLocation } from '../router/Router';
import { workflowApi } from '../services/workflowApi';
import { TEMPLATES_DATA, convertTemplateToReactFlow } from './TemplatesPage';

export const StudioPage: React.FC = () => {
  const { user } = useAuth();
  const { showAlert } = useModal();
  const { activeGuide } = useOnboarding();
  const { search } = useLocation();
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | undefined>(undefined);
  const [agentName, setAgentName] = useState('새로운 에이전트');
  const [isEditingName, setIsEditingName] = useState(false);
  const [showPalette, setShowPalette] = useState(true);
  const [isLogCollapsed, setIsLogCollapsed] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState<'properties' | 'results'>('properties');
  const [savedNotice, setSavedNotice] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveToast, setSaveToast] = useState<{ visible: boolean; fading: boolean; message: string }>({
    visible: false,
    fading: false,
    message: '',
  });
  const saveToastTimerRef = useRef<{ hold?: any; fade?: any }>({});

  const showSaveToast = (message: string) => {
    if (saveToastTimerRef.current.hold) clearTimeout(saveToastTimerRef.current.hold);
    if (saveToastTimerRef.current.fade) clearTimeout(saveToastTimerRef.current.fade);

    setSaveToast({ visible: true, fading: false, message });

    saveToastTimerRef.current.hold = setTimeout(() => {
      setSaveToast((prev) => ({ ...prev, fading: true }));
      saveToastTimerRef.current.fade = setTimeout(() => {
        setSaveToast({ visible: false, fading: false, message: '' });
      }, 500);
    }, 1000);
  };
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [rightSidebarWidth, setRightSidebarWidth] = useState(380);
  const [isResizing, setIsResizing] = useState(false);

  const nodes = useWorkflowStore((state) => state.nodes);
  const edges = useWorkflowStore((state) => state.edges);
  const setNodes = useWorkflowStore((state) => state.setNodes);
  const setEdges = useWorkflowStore((state) => state.setEdges);
  const selectedNode = useWorkflowStore((state) => state.selectedNode);
  const setSelectedNode = useWorkflowStore((state) => state.setSelectedNode);
  const isExecuting = useWorkflowStore((state) => state.isExecuting);
  const nodeResults = useWorkflowStore((state) => state.nodeResults);
  const clearMessages = useWorkflowStore((state) => state.clearMessages);
  const clearLogs = useWorkflowStore((state) => state.clearLogs);
  const clearNodeResults = useWorkflowStore((state) => state.clearNodeResults);
  const addLog = useWorkflowStore((state) => state.addLog);
  const saveToLocalStorage = useWorkflowStore((state) => state.saveToLocalStorage);
  const resetWorkflow = useWorkflowStore((state) => state.resetWorkflow);
  const [resetNotice, setResetNotice] = useState(false);

  // 컴포넌트 마운트 및 쿼리 파라미터 변경 시: URL 쿼리 파라미터(?id=... 또는 ?template=...)가 있으면 로드, 없으면 신규 에이전트 초기화
  useEffect(() => {
    const searchParams = new URLSearchParams(search || window.location.search);
    const workflowId = searchParams.get('id');
    const templateId = searchParams.get('template');

    if (workflowId) {
      setCurrentWorkflowId(workflowId);
      workflowApi
        .getById(workflowId)
        .then((data) => {
          setAgentName(data.title);
          if (data.graph_data?.nodes) {
            setNodes(data.graph_data.nodes);
          }
          if (data.graph_data?.edges) {
            setEdges(data.graph_data.edges);
          }
          showAlert(`에이전트 [${data.title}]을(를) 성공적으로 불러왔습니다.`, {
            type: 'success',
            title: '에이전트 불러오기',
          });
        })
        .catch((err) => {
          console.error('Failed to load workflow by id:', err);
          showAlert('에이전트를 불러오지 못했습니다.', {
            type: 'error',
            title: '불러오기 오류',
          });
        });
    } else if (templateId) {
      const matchedTemplate = TEMPLATES_DATA.find((t) => t.id === templateId);
      if (matchedTemplate) {
        // 템플릿 로드 시 기존 실행 상태 및 메모리를 먼저 초기화한 뒤 템플릿 그래프를 주입
        setCurrentWorkflowId(undefined);
        resetWorkflow();
        const { nodes: tplNodes, edges: tplEdges } = convertTemplateToReactFlow(matchedTemplate);
        setNodes(tplNodes);
        setEdges(tplEdges);
        setAgentName(matchedTemplate.name);
        showSaveToast(`템플릿 [${matchedTemplate.name}]을(를) 불러왔습니다.`);
      } else {
        setCurrentWorkflowId(undefined);
        resetWorkflow();
        setAgentName('새로운 에이전트');
      }
    } else {
      // 신규 에이전트 모드
      setCurrentWorkflowId(undefined);

      if (activeGuide === 'studio_quest') {
        // 에이전트 제작 가이드 진행 중에는 기본 노드를 자동 배치하지 않고 빈 캔버스 유지
        setNodes([]);
        setEdges([]);
        setSelectedNode(null);
        clearLogs();
        setAgentName('에이전트 제작 가이드');
      } else {
        // 이전 작업 중이던 캔버스 상태(노드/엣지/로그)를 기본값으로 초기화
        resetWorkflow();

        // 사용자의 기존 에이전트 목록을 조회하여 이름 중복 시 번호 부여
        if (user?.id) {
          workflowApi.getMyWorkflows(user.id).then((myList) => {
            const titles = new Set(myList.map((w) => w.title));
            const baseName = '새로운 에이전트';
            if (!titles.has(baseName)) {
              setAgentName(baseName);
            } else {
              let num = 1;
              while (titles.has(`${baseName} ${num}`)) {
                num++;
              }
              setAgentName(`${baseName} ${num}`);
            }
          }).catch(() => {
            setAgentName('새로운 에이전트');
          });
        } else {
          setAgentName('새로운 에이전트');
        }
      }
    }
  }, [search, user?.id, setNodes, setEdges, addLog, resetWorkflow, activeGuide, setSelectedNode, clearLogs]);

  // 스튜디오 퀘스트 가이드 시작 시 즉시 캔버스 비우기
  useEffect(() => {
    if (activeGuide === 'studio_quest') {
      setNodes([]);
      setEdges([]);
      setSelectedNode(null);
      clearLogs();
      setAgentName('에이전트 제작 가이드');
    }
  }, [activeGuide, setNodes, setEdges, setSelectedNode, clearLogs]);

  // 컴포넌트 마운트 시: 백엔드 환경 변수 기반 모델 기능(capabilities) 로드
  useEffect(() => {
    useWorkflowStore.getState().fetchModelCapabilities();
  }, []);

  // 컴포넌트 마운트 시: Nodes 페이지 등 외부에서 넘어온 노드 추가 요청(?addNode=...) 처리
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const addNodeType = searchParams.get('addNode');
    if (addNodeType) {
      const res = useWorkflowStore.getState().addNode(addNodeType);
      if (res.message) {
        showAlert(res.message, { type: res.success ? 'success' : 'info' });
      }
      // URL 쿼리 파라미터 정리 (뒤로가기/새로고침 시 중복 추가 방지)
      const url = new URL(window.location.href);
      url.searchParams.delete('addNode');
      window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
    }
  }, [showAlert]);

  const canShowResultsTab =
    selectedNode && selectedNode.type !== 'inputNode' && selectedNode.type !== 'outputNode';

  useEffect(() => {
    if (!canShowResultsTab && activeRightTab === 'results') {
      setActiveRightTab('properties');
    }
  }, [canShowResultsTab, activeRightTab]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      const minWidth = 280;
      const maxWidth = Math.max(minWidth, Math.min(800, window.innerWidth - 320));
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setRightSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  // 1. 현재 상태 저장 (DB 영속화 및 로컬 백업)
  const handleSave = async () => {
    saveToLocalStorage(agentName);

    if (user?.id) {
      try {
        setIsSaving(true);
        const result = await workflowApi.save({
          id: currentWorkflowId,
          user_id: user.id,
          title: agentName,
          graph_data: { nodes, edges },
        });
        setCurrentWorkflowId(result.id);
        setSavedNotice(true);
        showSaveToast(`에이전트 [${agentName}]가 성공적으로 저장되었습니다.`);
      } catch (err: any) {
        console.error('Failed to save workflow to DB:', err);
        const detail = err.response?.data?.detail || 'DB 저장에 실패했습니다.';
        showAlert(`저장 실패: ${detail}`, { type: 'error', title: '저장 오류' });
      } finally {
        setIsSaving(false);
        setTimeout(() => setSavedNotice(false), 2500);
      }
    } else {
      setSavedNotice(true);
      showSaveToast(`에이전트 [${agentName}]가 성공적으로 저장되었습니다.`);
      setTimeout(() => setSavedNotice(false), 2000);
    }
  };

  // 2. 다운로드 모달 열기 (현재 그래프 실시간 다운로드)
  const handleOpenDownloadModal = () => {
    setIsExportModalOpen(true);
  };

  const handleResetMemory = () => {
    clearMessages();
    clearLogs();
    clearNodeResults();
    addLog('에이전트 메모리 및 대화 세션이 초기화되었습니다.');
    setResetNotice(true);
    setTimeout(() => setResetNotice(false), 2000);
  };

  const triggerRun = () => {
    const runBtn = document.getElementById('studio-hidden-run-btn');
    if (runBtn) {
      runBtn.click();
    }
  };

  return (
    <div className="bg-background font-body-md text-on-surface antialiased w-screen h-screen flex flex-col overflow-hidden">
      {/* Top Global Header */}
      <Header />

      {/* Main Workspace Area (under fixed header) */}
      <main className="w-full pt-16 bg-background flex-1 flex flex-col overflow-hidden">
        <div className="w-full flex flex-col h-[calc(100vh-4rem)] max-w-full overflow-hidden bg-background">
          {/* Top Action Toolbar */}
          <section data-tour="studio-toolbar" className="w-full px-margin py-space-sm bg-surface-container-lowest/90 backdrop-blur-md flex items-center justify-between shadow-sm z-20 shrink-0 border-b border-outline-variant/30">
            <div className="flex items-center gap-space-sm">
              <div className="flex items-center gap-space-xs group cursor-pointer">
                {isEditingName ? (
                  <input
                    type="text"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    onBlur={() => setIsEditingName(false)}
                    onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                    autoFocus
                    className="bg-surface-container border border-primary px-2 py-0.5 rounded font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight focus:outline-none"
                  />
                ) : (
                  <div
                    onClick={() => setIsEditingName(true)}
                    className="flex items-center gap-space-xs"
                  >
                    <h1 className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">
                      {agentName}
                    </h1>
                    <span className="material-symbols-outlined text-outline group-hover:text-primary text-[18px] transition-colors">
                      edit
                    </span>
                  </div>
                )}
              </div>

              {/* 1. 현재 상태 저장 버튼 */}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${savedNotice
                  ? 'bg-tertiary-container/30 text-tertiary shadow-[0_0_10px_rgba(76,215,246,0.3)]'
                  : 'bg-transparent hover:bg-surface-container-high text-outline hover:text-primary active:scale-95 disabled:opacity-50'
                  }`}
                title={savedNotice ? '저장됨' : '현재 상태 저장'}
                type="button"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="material-symbols-outlined text-[18px]">
                    {savedNotice ? 'check' : 'save'}
                  </span>
                )}
              </button>

              {/* 2. 저장 버튼 우측에 배치된 다운로드 버튼 */}
              <button
                data-tour="studio-export-btn"
                onClick={handleOpenDownloadModal}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-transparent hover:bg-surface-container-high text-outline hover:text-secondary active:scale-95 transition-all cursor-pointer"
                title="에이전트 JSON 다운로드"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">
                  download
                </span>
              </button>

              {/* 저장 완료 알림 토스트 (다운로드 버튼 옆에 1초간 표시 후 서서히 페이드아웃) */}
              {saveToast.visible && (
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-tertiary-container/40 border border-tertiary/50 text-tertiary text-xs font-semibold shadow-sm transition-all duration-500 ease-out select-none ${
                    saveToast.fading ? 'opacity-0 -translate-x-1 scale-95' : 'opacity-100 translate-x-0 scale-100'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">check_circle</span>
                  <span>{saveToast.message}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-space-sm">
              {/* 에이전트 메모리 초기화 버튼 (붉은색) */}
              <button
                onClick={handleResetMemory}
                disabled={isExecuting}
                className={`px-3.5 py-space-xs h-9 rounded-lg border font-body-sm text-body-sm font-semibold flex items-center gap-1.5 transition-all transform active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${resetNotice
                  ? 'bg-[#ba1a1a] text-white border-[#ff5449] shadow-[0_0_16px_rgba(255,84,73,0.5)]'
                  : 'bg-[#ba1a1a]/15 hover:bg-[#ba1a1a]/30 text-[#ffb4ab] hover:text-white border-[#ff5449]/40 hover:border-[#ff5449]/80 shadow-[0_0_12px_rgba(255,84,73,0.15)]'
                  }`}
                title="에이전트 대화 기억 및 실행 메모리 초기화"
                type="button"
              >
                <span className="material-symbols-outlined text-[17px] text-[#ff897d]">
                  {resetNotice ? 'check' : 'restart_alt'}
                </span>
                <span>{resetNotice ? '초기화됨' : '메모리 초기화'}</span>
              </button>

              {/* 실행 / 정지 버튼 */}
              <button
                data-tour="studio-run-btn"
                onClick={triggerRun}
                className={`px-space-lg py-space-xs h-9 rounded-lg font-body-sm text-body-sm font-semibold flex items-center gap-space-xs transition-all transform active:scale-95 cursor-pointer ${isExecuting
                  ? 'bg-[#ba1a1a] hover:bg-[#cf2222] text-white border border-[#ff5449] shadow-[0_0_16px_rgba(255,84,73,0.5)]'
                  : 'bg-gradient-to-r from-inverse-primary via-primary-container to-secondary-container hover:brightness-110 text-on-surface shadow-[0_0_20px_rgba(77,142,255,0.4)]'
                  }`}
                id="run-pipeline-btn"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isExecuting ? 'stop' : 'play_arrow'}
                </span>
                <span>{isExecuting ? '정지' : '실행하기'}</span>
              </button>
            </div>
          </section>

          {/* Workspace: Sidebar + Canvas + Right Aside */}
          <div className="flex-1 flex flex-row overflow-hidden relative">
            {/* Left Node Library Palette */}
            {showPalette && <NodePalette onClose={() => setShowPalette(false)} />}

            {/* Center Flow Editor Canvas Area */}
            <div className="flex-1 flex flex-col relative overflow-hidden bg-background">
              {/* Floating Node Palette Toggle Button at Top-Left */}
              {!showPalette && (
                <button
                  onClick={() => setShowPalette(true)}
                  className="absolute top-4 left-4 z-20 px-3.5 py-2 rounded-xl bg-surface-container-lowest/90 hover:bg-surface-container border border-outline-variant/40 text-on-surface text-xs font-semibold shadow-[0_4px_16px_rgba(0,0,0,0.4)] backdrop-blur-md flex items-center gap-2 hover:border-primary/50 transition-all active:scale-95 group"
                  title="노드 목록 열기"
                  type="button"
                >
                  <span className="material-symbols-outlined text-primary text-[18px] group-hover:scale-110 transition-transform">
                    account_tree
                  </span>
                  <span>노드 목록</span>
                </button>
              )}

              {/* Pure Canvas Area for Guide Tour */}
              <div data-tour="studio-canvas" className="flex-1 w-full h-full relative overflow-hidden">
                <WorkflowEditor />
              </div>

              {/* Bottom Execution Shelf */}
              <div data-tour="studio-console">
                <ExecutionPanel
                  isCollapsed={isLogCollapsed}
                  onToggleCollapse={() => setIsLogCollapsed(!isLogCollapsed)}
                />
              </div>
            </div>

            {/* Right Aside: Property Panel or Execution Results */}
            <aside
              data-tour="studio-properties"
              style={{ width: `${rightSidebarWidth}px` }}
              className="shrink-0 bg-surface-container-lowest/95 backdrop-blur-xl border-l border-outline-variant/30 flex flex-col z-20 shadow-xl overflow-hidden relative"
            >
              {/* Drag Resize Handle */}
              <div
                onMouseDown={(e) => {
                  e.preventDefault();
                  setIsResizing(true);
                }}
                className={`absolute left-0 top-0 bottom-0 w-2 -ml-1 cursor-col-resize z-30 group flex items-center justify-center transition-colors ${isResizing ? 'bg-primary/40' : 'hover:bg-primary/30'
                  }`}
                title="드래그하여 너비 조절"
              >
                <div
                  className={`w-[2px] h-10 rounded-full transition-colors ${isResizing ? 'bg-primary' : 'bg-outline-variant/40 group-hover:bg-primary'
                    }`}
                />
              </div>

              {/* Right Panel Tab Switcher */}
              <div className="p-space-md flex items-center justify-between border-b border-outline-variant/20 shrink-0">
                <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg">
                  <button
                    onClick={() => setActiveRightTab('properties')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${activeRightTab === 'properties'
                      ? 'bg-surface-container-high text-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    type="button"
                  >
                    노드 속성
                  </button>
                  {canShowResultsTab && (
                    <button
                      onClick={() => setActiveRightTab('results')}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${activeRightTab === 'results'
                        ? 'bg-surface-container-high text-primary shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                      type="button"
                    >
                      <span>실행 결과</span>
                      {selectedNode && nodeResults[selectedNode.id] && (
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* View 1: Properties */}
              {activeRightTab === 'properties' && <PropertyPanel />}

              {/* View 2: Node Execution Results */}
              {activeRightTab === 'results' && canShowResultsTab && <NodeResultPanel />}
            </aside>
          </div>
        </div>
      </main>

      {/* Hidden button to bridge Toolbar run trigger */}
      <div className="hidden">
        <HiddenRunTrigger />
      </div>

      {/* Modals */}
      <NodeInfoModal />
      <OutputResultModal />
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        agentName={agentName}
      />
      <StudioQuestGuide />
    </div>
  );
};

const HiddenRunTrigger: React.FC = () => {
  const abortControllerRef = React.useRef<AbortController | null>(null);
  const { showAlert } = useModal();

  const {
    isExecuting,
    setIsExecuting,
    clearLogs,
    addLog,
    setActiveNodeId,
    setExecutionResult,
    setMessages,
    appendNodeStep,
  } = useWorkflowStore();

  const handleRun = async () => {
    // 1. 이미 실행 중이라면 중단(Abort)
    if (isExecuting) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      setIsExecuting(false);
      setActiveNodeId(null);
      addLog('[중단] 사용자에 의해 실행이 중단되었습니다.');
      return;
    }

    const { nodes, edges, messages } = useWorkflowStore.getState();

    const inputNodes = nodes.filter((n) => n.type === 'inputNode');
    const outputNodes = nodes.filter((n) => n.type === 'outputNode');

    if (inputNodes.length === 0 || outputNodes.length === 0) {
      addLog('Validation Error: Missing Input or Output node.');
      showAlert('경고: 워크플로우에는 반드시 최소 1개의 Input 노드와 Output 노드가 있어야 합니다.', {
        type: 'warning',
        title: '워크플로우 검증',
      });
      return;
    }

    if (outputNodes.length > 1) {
      addLog('Validation Error: Multiple Output nodes detected.');
      showAlert('경고: Output 노드는 반드시 하나만 있어야 합니다.', {
        type: 'warning',
        title: '워크플로우 검증',
      });
      return;
    }

    for (const input of inputNodes) {
      const hasOutgoing = edges.some((e) => e.source === input.id);
      if (!hasOutgoing) {
        addLog(`Validation Error: Input Node (${input.id}) is disconnected.`);
        showAlert('경고: 목적지가 연결되지 않은 Input 노드가 있습니다. 밖으로 나가는 선을 연결해주세요.', {
          type: 'warning',
          title: '워크플로우 검증',
        });
        return;
      }

      const inputText = (input.data as any)?.config?.input_text;
      if (!inputText || !inputText.trim()) {
        addLog(`Validation Error: Input Node (${input.id}) has no input text.`);
        showAlert('경고: Input 노드에 입력된 메시지가 없습니다. 에이전트에게 전달할 질문 또는 요청 메시지를 입력해주세요.', {
          type: 'warning',
          title: '워크플로우 검증',
        });
        return;
      }
    }

    for (const output of outputNodes) {
      const hasIncoming = edges.some((e) => e.target === output.id);
      if (!hasIncoming) {
        addLog(`Validation Error: Output Node (${output.id}) is disconnected.`);
        showAlert('경고: 아무것도 연결되지 않은 Output 노드가 있습니다. 결과를 받을 수 있게 선을 연결해주세요.', {
          type: 'warning',
          title: '워크플로우 검증',
        });
        return;
      }
    }

    const llmNodes = nodes.filter((n) => n.type === 'llmNode' || n.type === 'agentNode');
    for (const llm of llmNodes) {
      const hasIncoming = edges.some((e) => e.target === llm.id);
      const hasOutgoing = edges.some((e) => e.source === llm.id);
      if (!hasIncoming || !hasOutgoing) {
        addLog(`Validation Error: LLM Node (${llm.id}) must have both incoming and outgoing connections.`);
        showAlert('경고: LLM 노드는 질문을 받을 입력선과 결과를 내보낼 출력선이 모두 연결되어 있어야 합니다.', {
          type: 'warning',
          title: '워크플로우 검증',
        });
        return;
      }
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsExecuting(true);
    clearLogs();
    setActiveNodeId(inputNodes[0].id);
    addLog('파이프라인 시작');

    let previousOutput = (inputNodes[0]?.data as any)?.config?.input_text || '';

    try {
      const response = await fetch('/api/workflow/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges, messages }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      if (!response.body) throw new Error('ReadableStream not supported.');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.substring(6);
            if (dataStr.trim() === '[DONE]') {
              setIsExecuting(false);
              setActiveNodeId(null);
              addLog('파이프라인 종료');
              return;
            }

            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.error) {
                addLog(`❌ [시스템 오류] ${parsed.error}`);
                setIsExecuting(false);
                setActiveNodeId(null);
              } else {
                const nodeName = Object.keys(parsed)[0];
                const stateUpdates = parsed[nodeName];

                const targetNode = nodes.find((n) => n.id === nodeName);
                const nodeInput =
                  targetNode?.type === 'inputNode'
                    ? (targetNode.data as any)?.config?.input_text || stateUpdates.input_text || ''
                    : previousOutput;
                let nodeOutput = stateUpdates.current_output || '';
                if (targetNode?.type === 'routerNode') {
                  if (stateUpdates.routing_result) {
                    nodeOutput = stateUpdates.routing_result;
                  } else if (stateUpdates.next_worker) {
                    const nextNode = nodes.find((n) => n.id === stateUpdates.next_worker);
                    const nextLabel = (nextNode?.data as any)?.label || stateUpdates.next_worker;
                    nodeOutput = `'${nextLabel}' 노드로 분기합니다.`;
                  } else if (Array.isArray(stateUpdates.logs)) {
                    const branchLog = stateUpdates.logs.find((l: string) => l.includes('노드로 분기합니다'));
                    if (branchLog) {
                      nodeOutput = branchLog.replace(/^\[.*?\]\s*/, '');
                    }
                  }
                }

                const safeNodeInput = typeof nodeInput === 'string' ? nodeInput : JSON.stringify(nodeInput, null, 2);
                const safeNodeOutput = typeof nodeOutput === 'string' ? nodeOutput : JSON.stringify(nodeOutput, null, 2);

                appendNodeStep(
                  nodeName,
                  {
                    input: safeNodeInput,
                    output: safeNodeOutput,
                    logs: stateUpdates.logs,
                  },
                  {
                    nodeType: targetNode?.type,
                    nodeLabel: (targetNode?.data as any)?.label || '',
                    status: 'completed',
                  }
                );

                // Router 노드의 경우 다음 Worker 노드로 전달할 실제 작업 내용(current_output)을 유지
                previousOutput =
                  (targetNode?.type === 'routerNode' ? stateUpdates.current_output : nodeOutput) ||
                  previousOutput;

                const nodeLabel = (targetNode?.data as any)?.label || nodeName;

                // 도구 호출, 라우터 분기 등 세부 로그가 있을 경우 먼저 표시 (노드 라벨 적용)
                if (stateUpdates.logs && Array.isArray(stateUpdates.logs)) {
                  for (const logItem of stateUpdates.logs) {
                    if (
                      logItem.includes('도구 호출:') ||
                      logItem.includes('도구 실행 결과:') ||
                      logItem.includes('배정 작업:') ||
                      logItem.includes('노드로 분기합니다')
                    ) {
                      const formattedLog = logItem.replace(`[${nodeName}]`, `[${nodeLabel}]`);
                      addLog(formattedLog);
                    }
                  }
                }

                // 사용자가 지정한 노드 라벨([LLM] 등)을 붙여서 출력 결과 표시
                // 단, Router 노드는 제어 흐름 노드이므로 입력을 그대로 출력(current_output)하지 않음
                if (nodeOutput && targetNode?.type !== 'routerNode') {
                  addLog(`[${nodeLabel}] ${nodeOutput}`);
                }

                if (stateUpdates.current_output) {
                  const nodeType = targetNode?.type;
                  if (nodeType === 'outputNode') {
                    setExecutionResult(stateUpdates.current_output);
                  }
                }

                if (stateUpdates.messages) {
                  setMessages([...useWorkflowStore.getState().messages, ...stateUpdates.messages]);
                }

                // 다음 활성 노드(activeNodeId) 결정:
                // 1) Router 등에서 명시적으로 다음 Worker/타겟 노드를 지정한 경우 (next_worker)
                // 2) Worker 노드에서 Router로 돌아가는 루프 엣지
                // 3) 일반 단일 연결 엣지
                if (stateUpdates.next_worker) {
                  setActiveNodeId(stateUpdates.next_worker);
                } else {
                  const outgoingEdges = edges.filter((e) => e.source === nodeName);
                  if (outgoingEdges.length > 0) {
                    const loopEdge = outgoingEdges.find(
                      (e) =>
                        e.targetHandle === 'loop-return' ||
                        nodes.find((n) => n.id === e.target)?.type === 'routerNode'
                    );
                    setActiveNodeId(loopEdge ? loopEdge.target : outgoingEdges[0].target);
                  } else {
                    setActiveNodeId(null);
                  }
                }
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e, dataStr);
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        addLog('사용자에 의해 실행이 중단되었습니다.');
      } else {
        addLog(`요청 실패: ${error.message}`);
      }
      setActiveNodeId(null);
    } finally {
      abortControllerRef.current = null;
      setIsExecuting(false);
      setActiveNodeId(null);
    }
  };

  return <button id="studio-hidden-run-btn" onClick={handleRun} />;
};
