import { useWorkflowStore } from '../../store/useWorkflowStore';

export const PropertyPanel = () => {
  const selectedNode = useWorkflowStore(state => state.selectedNode);
  const updateNodeConfig = useWorkflowStore(state => state.updateNodeConfig);
  const executionResult = useWorkflowStore(state => state.executionResult);

  if (!selectedNode) {
    return (
      <div className="w-80 h-full border-l bg-card/50 flex items-center justify-center text-muted-foreground p-6 text-center">
        Select a node on the canvas to configure its properties.
      </div>
    );
  }

  const { id, type, data } = selectedNode;
  const config = data.config || {};

  const handleChange = (key: string, value: any) => {
    updateNodeConfig(id, { [key]: value });
  };

  return (
    <div className="w-80 h-full border-l bg-card flex flex-col shadow-xl">
      <div className="p-4 border-b bg-muted/20">
        <h2 className="font-semibold text-lg">{data.label} Settings</h2>
        <p className="text-xs text-muted-foreground font-mono mt-1">ID: {id}</p>
      </div>

      <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-4">
        {type === 'inputNode' && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Input Text</label>
            <textarea
              className="w-full rounded-md border bg-background p-2 text-sm focus:ring-2 focus:ring-primary outline-none min-h-[100px]"
              placeholder="여기에 질문을 입력하세요..."
              value={config.input_text || ''}
              onChange={(e) => handleChange('input_text', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              캔버스의 노드 안에서도 동일하게 수정할 수 있습니다.
            </p>
          </div>
        )}

        {(type === 'llmNode' || type === 'agentNode') && (
          <>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Model</label>
              <input
                type="text"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                placeholder="gemma2:2b, gpt-4o-mini..."
                value={config.model || ''}
                onChange={(e) => handleChange('model', e.target.value)}
              />
            </div>
            
            {type === 'llmNode' && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">System Prompt</label>
                <textarea
                  className="w-full rounded-md border bg-background p-2 text-sm focus:ring-2 focus:ring-primary outline-none min-h-[100px]"
                  placeholder="You are a helpful assistant..."
                  value={config.system_prompt || ''}
                  onChange={(e) => handleChange('system_prompt', e.target.value)}
                />
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Custom API Key <span className="text-xs text-muted-foreground">(Optional)</span></label>
              <input
                type="password"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                placeholder="sk-..."
                value={config.api_key || ''}
                onChange={(e) => handleChange('api_key', e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Custom Base URL <span className="text-xs text-muted-foreground">(Optional)</span></label>
              <input
                type="text"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                placeholder="http://ollama:11434/v1"
                value={config.base_url || ''}
                onChange={(e) => handleChange('base_url', e.target.value)}
              />
            </div>
          </>
        )}

        {type === 'outputNode' && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Execution Result</label>
            <div className="w-full rounded-md border bg-background p-3 text-sm min-h-[200px] whitespace-pre-wrap overflow-y-auto">
              {executionResult ? executionResult : <span className="text-muted-foreground italic">실행 결과가 아직 없습니다.</span>}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t bg-muted/10">
        <button
          onClick={() => useWorkflowStore.getState().deleteNode(id)}
          className="w-full py-2 bg-destructive/10 text-destructive rounded-md text-sm font-medium hover:bg-destructive hover:text-destructive-foreground transition-colors"
        >
          Delete Node
        </button>
      </div>
    </div>
  );
};
