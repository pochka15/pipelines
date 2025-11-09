import "./App.css";
import { PipelinePanel } from "./components/pipeline/pipeline-panel";
import { PipelinesSidebar } from "./components/pipelines-sidebar";
import { Toolbar } from "./components/toolbar";

function App() {
  return (
    <div className="flex h-screen">
      <Toolbar />

      <div className="flex-1 flex justify-center">
        <div className="p-4 grid grid-cols-6 gap-8 w-full">
          <PipelinesSidebar className="md:col-span-1 col-span-2" />

          <div className="col-span-4 md:col-span-5">
            <PipelinePanel />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
