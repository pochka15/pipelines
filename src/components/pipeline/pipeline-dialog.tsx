import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  usePipelinesStore,
  type NewPipeline,
  type Pipeline,
} from "@/domain/stores/pipelines-store";
import type { FC } from "react";
import { PipelineForm } from "./pipeline-form";

export const PipelineDialog: FC<{
  open: boolean;
  onClose: () => void;
  pipeline?: Pipeline;
}> = ({ open, onClose, pipeline }) => {
  const addPipeline = usePipelinesStore((s) => s.addPipeline);
  const updatePipeline = usePipelinesStore((s) => s.updatePipeline);

  const edit = (p: NewPipeline) => {
    if (pipeline) updatePipeline({ ...p, id: pipeline.id });
    else addPipeline(p);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {pipeline ? "Edit pipeline" : "New pipeline"}
          </DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          <PipelineForm onSubmit={edit} initialPipeline={pipeline} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
