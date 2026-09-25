import { useWorkflowStore } from '../../store/useWorkflowStore';
import { Play, Square, Terminal } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useState, useCallback, useEffect } from 'react';

export const ExecutionPanel = () => {
  const { logs, executionResult, isExecuting, setIsExecuting, clearLogs, clearMessages, addLog, setExecutionResult, setMessages, setActiveNodeId } = useWorkflowStore();
  
  const [panelHeight, setPanelHeight] = useState(256);
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newHeight = window.innerHeight - e.clientY;
      if (newHeight > 100 && newHeight < window.innerHeight - 100) {
        setPanelHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handleRun = async () => {
    const { nodes, edges, messages } = useWorkflowStore.getState();
    
    // --- Frontend Validation ---
    const inputNodes = nodes.filter(n => n.type === 'inputNode');
    const outputNodes = nodes.filter(n => n.type === 'outputNode');
    
    if (inputNodes.length === 0 || outputNodes.length === 0) {
      addLog('Validation Error: Missing Input or Output node.');
      alert('경고: 워크플로우에는 반드시 최소 1개의 Input 노드와 Output 노드가 있어야 합니다.');
      return;
    }
    
    if (outputNodes.length > 1) {
      addLog('Validation Error: Multiple Output nodes detected.');
      alert('경고: Output 노드는 반드시 하나만 있어야 합니다.');
      return;
    }

    // 1. 모든 Input 노드는 밖으로 나가는 선(outgoing edge)이 있어야 함
    for (const input of inputNodes) {
      const hasOutgoing = edges.some(e => e.source === input.id);
      if (!hasOutgoing) {
        addLog(`Validation Error: Input Node (${input.id}) is disconnected.`);
        alert('경고: 목적지가 연결되지 않은 Input 노드가 있습니다. 밖으로 나가는 선을 연결해주세요.');
        return;
      }
    }

    // 2. 모든 Output 노드는 들어오는 선(incoming edge)이 있어야 함
    for (const output of outputNodes) {
      const hasIncoming = edges.some(e => e.target === output.id);
      if (!hasIncoming) {
        addLog(`Validation Error: Output Node (${output.id}) is disconnected.`);
        alert('경고: 아무것도 연결되지 않은 Output 노드가 있습니다. 결과를 받을 수 있게 선을 연결해주세요.');
        return;
      }
    }

    const llmNodes = nodes.filter(n => n.type === 'llmNode');
    for (const llm of llmNodes) {
      const hasIncoming = edges.some(e => e.target === llm.id);
      const hasOutgoing = edges.some(e => e.source === llm.id);
      
      // 3. LLM 노드는 들어오는 선과 나가는 선이 모두 있어야 함
      if (!hasIncoming || !hasOutgoing) {
        addLog(`Validation Error: LLM Node (${llm.id}) must have both incoming and outgoing connections.`);
        alert('경고: LLM 노드는 질문을 받을 입력선과 결과를 내보낼 출력선이 모두 연결되어 있어야 합니다.');
        return;
      }

      // 4. 하나의 LLM 노드에 너무 많은 Input이 직접 꽂히는 것을 방지
      const incomingInputEdges = edges.filter(e => e.target === llm.id && nodes.find(n => n.id === e.source)?.type === 'inputNode');
      if (incomingInputEdges.length > 1) {
        addLog(`Validation Error: Multiple Input nodes connected to LLM Node (${llm.id}).`);
        alert('경고: 하나의 LLM 노드에 여러 개의 Input 노드를 동시에 직접 연결할 수 없습니다.');
        return;
      }
    }
    // ---------------------------

    setIsExecuting(true);
    clearLogs();
    setActiveNodeId(inputNodes[0].id);
    
    addLog('Starting agent execution...');
    
    try {
      const response = await fetch('/api/workflow/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges, messages })
      });
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      if (!response.body) throw new Error('ReadableStream not supported in this browser.');
      
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
              addLog('Execution completed.');
              return;
            }
            
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.error) {
                addLog(`Error: ${parsed.error}`);
              } else {
                // Determine node name that just executed
                const nodeName = Object.keys(parsed)[0];
                const stateUpdates = parsed[nodeName];
                
                addLog(`[${nodeName}] Node executed.`);
                
                // If there are new logs in the state updates, add them
                if (stateUpdates.logs && Array.isArray(stateUpdates.logs)) {
                  // We only add the last log since the state aggregates them, or we could diff them.
                  // For MVP, just print the latest log appended
                  addLog(`  -> ${stateUpdates.logs[stateUpdates.logs.length - 1]}`);
                }
                
                if (stateUpdates.current_output) {
                   const nodeType = nodes.find(n => n.id === nodeName)?.type;
                   if (nodeType === 'outputNode') {
                     setExecutionResult(stateUpdates.current_output);
                   }
                }
                
                if (stateUpdates.messages) {
                   setMessages([...useWorkflowStore.getState().messages, ...stateUpdates.messages]);
                }
                
                // Set next active node
                const nextEdge = edges.find(e => e.source === nodeName);
                if (nextEdge) {
                  setActiveNodeId(nextEdge.target);
                } else {
                  setActiveNodeId(null);
                }
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e, dataStr);
            }
          }
        }
      }
    } catch (error: any) {
      addLog(`Request failed: ${error.message}`);
      setActiveNodeId(null);
    } finally {
      setIsExecuting(false);
      // Don't set activeNodeId to null here because [DONE] handles successful completion.
      // If we do it here, it might clear it prematurely if finally runs before reader finishes?
      // Actually finally runs after the while loop, so it's safe to put it here too just in case.
      setActiveNodeId(null);
    }
  };

  return (
    <div 
      className="relative border-t bg-card flex flex-col shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]"
      style={{ height: `${panelHeight}px` }}
    >
      <div 
        className="absolute top-0 left-0 right-0 h-1.5 cursor-row-resize bg-transparent hover:bg-primary/50 z-10 transition-colors"
        onMouseDown={startResizing}
      />
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/10 shrink-0">
        <div className="flex items-center gap-2 text-muted-foreground font-semibold">
          <Terminal size={18} />
          <span>Execution Console</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { clearMessages(); addLog('Memory cleared.'); }}
            disabled={isExecuting}
            className="px-3 py-1.5 bg-destructive/10 text-destructive rounded-md text-sm font-medium hover:bg-destructive/20 transition-colors disabled:opacity-50"
          >
            Clear Memory
          </button>
          <button
            onClick={handleRun}
            disabled={isExecuting}
            className="flex items-center gap-2 px-4 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isExecuting ? <Square size={14} className="fill-current" /> : <Play size={14} className="fill-current" />}
            {isExecuting ? 'Running...' : 'Run Agent'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Logs */}
        <div className="w-full p-4 bg-[#1e1e1e] text-[#d4d4d4] font-mono text-xs overflow-y-auto">
          {logs.length === 0 && !isExecuting && (
            <span className="text-gray-500">Ready to execute. Hit Run Agent...</span>
          )}
          {logs.map((log, i) => (
            <div key={i} className="mb-1 leading-relaxed">
              <span className="text-green-400 mr-2">➜</span>{log}
            </div>
          ))}
          {isExecuting && (
            <div className="animate-pulse text-yellow-400 mt-2">Processing...</div>
          )}
        </div>
      </div>
    </div>
  );
};
