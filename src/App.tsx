import "./App.css";
import { useEffect, useState } from "react";
import { PipelinePanel } from "./components/pipeline/pipeline-panel";
import { VarsPanel } from "./components/pipeline/vars-panel";
import { PipelinesSidebar } from "./components/pipelines-sidebar";
import { Toolbar } from "./components/toolbar";
import { useUiStore } from "./domain/stores/ui-store";
import { ThemeProvider } from "./components/theme-provider";
import { ModeToggle } from "./components/mode-toggle";

function App() {
  const [showVarsPanel, setShowVarsPanel] = useState(false);
  const focusedPipelineId = useUiStore((s) => s.focusedPipelineId);
  useEffect(() => setShowVarsPanel(false), [focusedPipelineId]);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="flex h-screen">
        <div className="flex-1 flex flex-col">
          <div className="flex gap-2 justify-end p-4">
            <Toolbar />
            <ModeToggle />
          </div>

          <div className="flex-1 flex justify-center">
            <div className="p-4 pt-0 grid grid-cols-6 gap-8 w-full">
              <PipelinesSidebar className="md:col-span-1 col-span-2" />

              <div key={focusedPipelineId} className="col-span-4 md:col-span-5">
                {showVarsPanel ? (
                  <VarsPanel onSwitchBack={() => setShowVarsPanel(false)} />
                ) : (
                  <PipelinePanel
                    onSwitchToVars={() => setShowVarsPanel(true)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
