import { CommandLine } from "@/components/command-line";
import { Help } from "@/components/help";
import { ModeToggle } from "@/components/mode-toggle";
import { PipelinePanel } from "@/components/pipeline/pipeline-panel";
import { VarsPanel } from "@/components/pipeline/vars-panel";
import { PipelinesSidebar } from "@/components/pipelines-sidebar";
import { Toolbar } from "@/components/toolbar";
import { useUiStore } from "@/domain/stores/ui-store";
import { useRootShortcuts } from "@/lib/shortcuts/use-root-shortcuts";
import { NotesPanel } from "@/shared-lib/notes-panel";
import { useEffect, useState } from "react";

export const HomePage = () => {
  const [showVarsPanel, setShowVarsPanel] = useState(false);
  const focusedPipelineId = useUiStore((s) => s.focusedPipelineId);
  useRootShortcuts();

  useEffect(() => setShowVarsPanel(false), [focusedPipelineId]);

  return (
    <div className="relative h-screen">
      <CommandLine />
      <NotesPanel />
      <Help />
      <div className="flex justify-end gap-2 p-4">
        <Toolbar />
        <ModeToggle />
      </div>

      <div className="grid w-full grid-cols-[0.6fr_1.4fr] gap-8 p-4 pt-0 lg:grid-cols-[minmax(166px,290px)_1fr]">
        <PipelinesSidebar />

        <div key={focusedPipelineId} className="min-w-0">
          {showVarsPanel ? (
            <VarsPanel onSwitchBack={() => setShowVarsPanel(false)} />
          ) : (
            <PipelinePanel onSwitchToVars={() => setShowVarsPanel(true)} />
          )}
        </div>
      </div>
    </div>
  );
};
