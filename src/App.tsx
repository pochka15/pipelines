import "./App.css";
import { useEffect, useState } from "react";
import { PipelinePanel } from "./components/pipeline/pipeline-panel";
import { VarsPanel } from "./components/pipeline/vars-panel";
import { PipelinesSidebar } from "./components/pipelines-sidebar";
import { Toolbar } from "./components/toolbar";
import { useUiStore } from "./domain/stores/ui-store";

function App() {
  const [showVarsPanel, setShowVarsPanel] = useState(false);
  const focusedPipelineId = useUiStore((s) => s.focusedPipelineId);
  useEffect(() => setShowVarsPanel(false), [focusedPipelineId]);

  return (
    <div className="flex h-screen">
      <Toolbar />

      <div className="flex-1 flex justify-center">
        <div className="p-4 grid grid-cols-6 gap-8 w-full">
          <PipelinesSidebar className="md:col-span-1 col-span-2" />

          <div className="col-span-4 md:col-span-5">
            {showVarsPanel ? (
              <VarsPanel onSwitchBack={() => setShowVarsPanel(false)} />
            ) : (
              <PipelinePanel onSwitchToVars={() => setShowVarsPanel(true)} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
