import { WorkflowEditor } from './components/editor/WorkflowEditor';
import { PropertyPanel } from './components/panel/PropertyPanel';
import { ExecutionPanel } from './components/execution/ExecutionPanel';
import { NodeInfoModal } from './components/editor/NodeInfoModal';
import { OutputResultModal } from './components/editor/OutputResultModal';

function App() {
  return (
    <div className="w-screen h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Top Header */}
      <header className="h-14 border-b flex items-center px-6 bg-card shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm tracking-tighter">
            N
          </div>
          <div className="flex items-baseline gap-2">
            <h1 className="font-bold tracking-tight text-lg">NOA-E</h1>
            <span className="text-xs text-muted-foreground hidden sm:inline">Node Oriented Agent - Education</span>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Area */}
        <div className="flex-1 flex flex-col relative">
          <WorkflowEditor />
        </div>

        {/* Right Sidebar - Property Panel */}
        <PropertyPanel />
      </div>

      {/* Bottom Panel - Execution Console */}
      <ExecutionPanel />
      
      {/* Modals */}
      <NodeInfoModal />
      <OutputResultModal />
    </div>
  );
}

export default App;
