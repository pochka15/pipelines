import "./App.css";
import { PipelinePanel } from "./components/pipeline/pipeline-panel";
import { PipelinesSidebar } from "./components/pipelines-sidebar";

function App() {
  return (
    <div className="flex justify-center">
      <div className="p-4 grid grid-cols-6 gap-8">
        <PipelinesSidebar />

        <div className="col-span-5">
          <PipelinePanel />
        </div>
      </div>
    </div>
  );
}

export default App;
